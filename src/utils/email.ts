import {
  auth,
  db,
  getWorkspaceAccessToken,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getVerifiedCloudUid } from '../services/cloudSessionGuard';
import { toast } from 'sonner';

export interface EmailDispatchAttachment {
  name: string;
  size?: string;
  content?: string;
}

export interface UnifiedEmailPayload {
  to: string | string[];
  subject: string;
  htmlBody: string;
  textBody?: string;
  senderName?: string;
  attachments?: EmailDispatchAttachment[];
  customSmtp?: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from?: string;
  } | null;
  silentToast?: boolean;
}

export interface EmailDispatchLogEntry {
  logId: string;
  ownerUid: string;
  to: string;
  subject: string;
  channel: 'gmail_api' | 'smtp' | 'ethereal_sandbox' | 'local_relay' | 'failed';
  status: 'delivered' | 'sandbox_preview' | 'queued_retry' | 'failed';
  previewUrl?: string | null;
  messageId?: string | null;
  errorMessage?: string | null;
  createdAtIso: string;
}

const EMAIL_LOG_STORAGE_KEY = 'valourian_email_dispatch_logs_v1';
export const EMAIL_DISPATCH_EVENT = 'valourian_email_dispatched';

function encodeBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sendViaGmailApi(
  accessToken: string,
  to: string,
  subject: string,
  htmlBody: string,
  senderName: string
): Promise<{ success: boolean; messageId?: string }> {
  const mime = [
    `To: ${to}`,
    `From: "${senderName}" <asim.nsw@gmail.com>`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset="UTF-8"',
    '',
    htmlBody,
  ].join('\r\n');

  const raw = encodeBase64Url(mime);
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    return { success: false };
  }
  const data = await res.json();
  return { success: true, messageId: data?.id };
}

export function getEmailDispatchLogs(): EmailDispatchLogEntry[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = window.localStorage.getItem(EMAIL_LOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function persistEmailLog(entry: EmailDispatchLogEntry): Promise<void> {
  try {
    if (typeof window !== 'undefined') {
      const existing = getEmailDispatchLogs();
      const next = [entry, ...existing].slice(0, 40);
      window.localStorage.setItem(EMAIL_LOG_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(EMAIL_DISPATCH_EVENT, { detail: entry }));
    }
  } catch {}

  try {
    const cloudUid = getVerifiedCloudUid();
    if (db && cloudUid) {
      const path = `email_dispatch_logs/${entry.logId}`;
      try {
        await setDoc(doc(collection(db, 'email_dispatch_logs'), entry.logId), {
          logId: entry.logId.slice(0, 128),
          ownerUid: cloudUid,
          to: entry.to.slice(0, 250),
          subject: entry.subject.slice(0, 250),
          channel: entry.channel,
          status: entry.status,
          previewUrl: entry.previewUrl || '',
          messageId: entry.messageId || '',
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  } catch {}
}

export async function getBackendEmailStatus(): Promise<{
  smtpConfigured: boolean;
  smtpHost: string;
  mode: string;
  fromAddress: string;
}> {
  try {
    const res = await fetch('/api/email/status');
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return {
    smtpConfigured: false,
    smtpHost: 'smtp.ethereal.email',
    mode: 'ethereal_sandbox',
    fromAddress: 'treasury@valourian.capital',
  };
}

export async function sendUnifiedEmail(payload: UnifiedEmailPayload): Promise<{
  success: boolean;
  channel: EmailDispatchLogEntry['channel'];
  previewUrl?: string | null;
  messageId?: string | null;
  logEntry: EmailDispatchLogEntry;
}> {
  const recipientStr = Array.isArray(payload.to)
    ? payload.to.map((e) => e.trim()).filter(Boolean).join(', ')
    : String(payload.to || '').trim();

  const logId = `em_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const senderName = payload.senderName || 'Valourian Sovereign Banking';
  const ownerUid = getVerifiedCloudUid() || 'local-session';

  if (!recipientStr) {
    const failedLog: EmailDispatchLogEntry = {
      logId,
      ownerUid,
      to: '(empty)',
      subject: payload.subject,
      channel: 'failed',
      status: 'failed',
      errorMessage: 'Missing recipient email address',
      createdAtIso: new Date().toISOString(),
    };
    await persistEmailLog(failedLog);
    return { success: false, channel: 'failed', logEntry: failedLog };
  }

  // 1. Try Gmail API first if user signed in with Gmail Workspace scope and no custom SMTP override
  const workspaceToken = !payload.customSmtp ? getWorkspaceAccessToken() : null;
  if (workspaceToken) {
    try {
      const gmailResult = await sendViaGmailApi(
        workspaceToken,
        recipientStr,
        payload.subject,
        payload.htmlBody,
        senderName
      );
      if (gmailResult.success) {
        const logEntry: EmailDispatchLogEntry = {
          logId,
          ownerUid,
          to: recipientStr,
          subject: payload.subject,
          channel: 'gmail_api',
          status: 'delivered',
          messageId: gmailResult.messageId || null,
          createdAtIso: new Date().toISOString(),
        };
        await persistEmailLog(logEntry);
        if (!payload.silentToast) {
          toast.success(`Email sent via Gmail API to ${recipientStr}`);
        }
        return {
          success: true,
          channel: 'gmail_api',
          messageId: gmailResult.messageId,
          logEntry,
        };
      }
    } catch {}
  }

  // 2. Dispatch via Express Nodemailer Pipeline (/api/send-email)
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: recipientStr,
        subject: payload.subject,
        htmlBody: payload.htmlBody,
        body: payload.textBody,
        sender: senderName,
        attachments: payload.attachments || [],
        customSmtp: payload.customSmtp || null,
      }),
    });

    const data = await response.json();
    if (response.ok && data?.success) {
      const previewUrl = data.previewUrl || data.testUrl || null;
      const channel: EmailDispatchLogEntry['channel'] =
        data.channel || (previewUrl ? 'ethereal_sandbox' : 'smtp');
      const status: EmailDispatchLogEntry['status'] = previewUrl ? 'sandbox_preview' : 'delivered';

      const logEntry: EmailDispatchLogEntry = {
        logId,
        ownerUid,
        to: recipientStr,
        subject: payload.subject,
        channel,
        status,
        previewUrl,
        messageId: data.messageId || null,
        createdAtIso: new Date().toISOString(),
      };
      await persistEmailLog(logEntry);

      if (!payload.silentToast) {
        if (previewUrl) {
          toast.success(`Email relayed (Sandbox Preview ready) to ${recipientStr}`, { duration: 5000 });
        } else {
          toast.success(`Email delivered to ${recipientStr}`);
        }
      }

      return {
        success: true,
        channel,
        previewUrl,
        messageId: data.messageId || null,
        logEntry,
      };
    }
  } catch (err) {
    console.warn('Unified email backend fallback error:', err);
  }

  const fallbackEntry: EmailDispatchLogEntry = {
    logId,
    ownerUid,
    to: recipientStr,
    subject: payload.subject,
    channel: 'local_relay',
    status: 'queued_retry',
    errorMessage: 'Backend relay unreachable; saved to local dispatch queue',
    createdAtIso: new Date().toISOString(),
  };
  await persistEmailLog(fallbackEntry);
  return { success: false, channel: 'local_relay', logEntry: fallbackEntry };
}

// Legacy Queue Compatibility
const emailQueue: Array<{
  to: string;
  subject: string;
  htmlBody: string;
  resolve: (val: boolean) => void;
}> = [];
let isProcessingQueue = false;

const processQueue = async () => {
  if (isProcessingQueue || emailQueue.length === 0) return;
  isProcessingQueue = true;

  while (emailQueue.length > 0) {
    const email = emailQueue.shift();
    if (!email) continue;
    const res = await sendUnifiedEmail({
      to: email.to,
      subject: email.subject,
      htmlBody: email.htmlBody,
    });
    email.resolve(res.success);
    await new Promise((r) => setTimeout(r, 250));
  }

  isProcessingQueue = false;
};

export const sendWorkspaceEmail = async (
  to: string,
  subject: string,
  htmlBody: string
): Promise<boolean> => {
  return new Promise((resolve) => {
    emailQueue.push({ to, subject, htmlBody, resolve });
    processQueue();
  });
};

export const generateProfessionalReceipt = (details: any) => {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: auto; padding: 28px; border: 1px solid #1e293b; border-radius: 16px; background-color: #020617; color: #f8fafc;">
      <div style="border-bottom: 1px solid #1e293b; padding-bottom: 18px; margin-bottom: 20px;">
        <h1 style="color: #10b981; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.3px;">Valourian Sovereign Banking</h1>
        <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 12px; letter-spacing: 0.5px;">Official Transaction Record · ${details.id || Math.random().toString(36).substring(2, 9).toUpperCase()}</p>
      </div>
      <div style="background-color: #0f172a; padding: 20px; border-radius: 12px; border: 1px solid #1e293b; margin-bottom: 20px;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #cbd5e1;"><strong>Merchant / Recipient:</strong> ${details.merchant || details.recipient || 'Valourian Partner'}</p>
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #10b981;"><strong>Status:</strong> Cleared &amp; Approved</p>
        <p style="margin: 14px 0 0 0; padding-top: 12px; border-top: 1px dashed #334155; font-size: 20px; font-weight: 800; color: #ffffff;">${details.amount}</p>
      </div>
      <p style="text-align: center; color: #64748b; font-size: 11px; margin: 0;">Automated encrypted receipt · Valourian Sovereign Treasury</p>
    </div>
  `;
};

export const getEmailQueueStatus = () => ({
  length: emailQueue.length,
  isProcessing: isProcessingQueue,
});

export const retryFailedEmails = () => {
  if (!isProcessingQueue && emailQueue.length > 0) {
    processQueue();
    return true;
  }
  return false;
};
