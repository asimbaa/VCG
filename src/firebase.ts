import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { getFirestore, initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { toast } from 'sonner';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true }, (firebaseConfig as any).firestoreDatabaseId);

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  // Request Workspace scopes
  provider.addScope('https://www.googleapis.com/auth/gmail.send');
  
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('workspace_google_access_token', credential.accessToken);
      }
    }
    return true;
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user') {
      console.warn('Sign-in popup was closed by the user.');
      toast.error('Sign in cancelled. Please try again.');
    } else if (error?.code === 'auth/popup-blocked') {
      console.warn('Sign-in popup was blocked by the browser.');
      toast.error('Popup blocked. Please allow popups for this site to sign in.');
    } else {
      console.error("Error signing in with Google", error);
      toast.error('An error occurred during sign in.');
    }
    return false;
  }
};

let cachedAccessToken: string | null = null;

export const getWorkspaceAccessToken = () => {
  if (!cachedAccessToken && typeof window !== 'undefined') {
    cachedAccessToken = window.localStorage.getItem('workspace_google_access_token');
  }
  return cachedAccessToken;
};

export const setWorkspaceAccessToken = (token: string | null) => {
  cachedAccessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      window.localStorage.setItem('workspace_google_access_token', token);
    } else {
      window.localStorage.removeItem('workspace_google_access_token');
    }
  }
};

export const sendLoginEmail = async (email: string) => {
  const actionCodeSettings = {
    url: window.location.href, // Redirect back to this page
    handleCodeInApp: true,
  };
  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
    return true;
  } catch (error) {
    console.error("Error sending login email", error);
    return false;
  }
};

export const completeEmailLogin = async () => {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      email = window.prompt('Please provide your email for confirmation');
    }
    if (email) {
      try {
        await signInWithEmailLink(auth, email, window.location.href);
        window.localStorage.removeItem('emailForSignIn');
      } catch (error) {
        console.error("Error signing in with email link", error);
      }
    }
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

const recentFirestoreDiagnostics: FirestoreErrorInfo[] = [];
const permissionToastCooldowns = new Map<string, number>();

export function getRecentFirestoreDiagnostics(): FirestoreErrorInfo[] {
  return [...recentFirestoreDiagnostics];
}

export function isSignedInCloudUser(): boolean {
  return Boolean(auth.currentUser);
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };

  recentFirestoreDiagnostics.unshift(errInfo);
  if (recentFirestoreDiagnostics.length > 25) {
    recentFirestoreDiagnostics.length = 25;
  }

  // Log via debug channel so handled fallbacks never hijack the UI with App Warning overlays
  console.debug('[Valourian Capital OS] Firestore handled fallback:', errInfo);

  // Only surface helpful recovery guidance when a real signed-in session hits a permission/rule denial
  const lowerMsg = errorMessage.toLowerCase();
  const isPermissionOrAuthIssue =
    lowerMsg.includes('permission-denied') ||
    lowerMsg.includes('missing or insufficient permissions') ||
    lowerMsg.includes('unauthenticated');

  if (auth.currentUser && isPermissionOrAuthIssue && typeof window !== 'undefined') {
    const cooldownKey = `${operationType}:${path || 'root'}`;
    const now = Date.now();
    const lastShown = permissionToastCooldowns.get(cooldownKey) || 0;
    if (now - lastShown > 45000) {
      permissionToastCooldowns.set(cooldownKey, now);
      const needsVerification = auth.currentUser.emailVerified === false;
      const collectionLabel = (path || 'cloud ledger').split('/')[0].replace(/_/g, ' ');

      toast.info(
        needsVerification
          ? `Cloud verification needed for ${collectionLabel}`
          : `Cloud sync paused for ${collectionLabel} — saved safely on this device`,
        {
          description: needsVerification
            ? 'Verify your email or sign in with Google to sync records across devices.'
            : `Signed in as ${auth.currentUser.email || 'user'}. Reconnect Google auth if your session refreshed or switch to an authorized account.`,
          duration: 7000,
          action: {
            label: 'Reconnect Google',
            onClick: () => {
              void signInWithGoogle();
            },
          },
        }
      );
    }
  }

  // Return the error instead of throwing to prevent unhandled rejection floods in async listeners
  return new Error(JSON.stringify(errInfo));
}

export const withRetry = async <T>(operation: () => Promise<T>, maxRetries = 3, delayMs = 1000): Promise<T> => {
  let retries = maxRetries;
  while (retries > 0) {
    try {
      return await operation();
    } catch (err: any) {
      retries--;
      if (retries === 0) {
        throw err;
      }
      // Wait before retrying, maybe with exponential backoff
      const backoff = delayMs * Math.pow(2, maxRetries - retries - 1);
      await new Promise(r => setTimeout(r, backoff));
    }
  }
  throw new Error("Retry failed");
};

import { addDoc as firestoreAddDoc, setDoc as firestoreSetDoc, updateDoc as firestoreUpdateDoc, deleteDoc as firestoreDeleteDoc, collection, serverTimestamp } from "firebase/firestore";

export const createPaymentEvent = async (db, auth, amount, merchant, description) => {
  try {
    if (!auth.currentUser) return null;
    const docRef = (await addDoc(collection(db, 'users', auth.currentUser.uid, 'payment_events'), {
      amount,
      merchant,
      description,
      status: 'pending',
      timestamp: serverTimestamp()
    })) as any;
    
    // Simulate processing delay then confirm
    setTimeout(async () => {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid, 'payment_events', docRef.id), {
          status: 'confirmed'
        });
      } catch(e) {}
    }, 2500);
    
    return docRef.id;
  } catch(e) {
    console.error("Failed to create payment event", e);
    return null;
  }
};










export const createEmailPasswordAccount = async (email: string, pass: string) => {
  return await createUserWithEmailAndPassword(auth, email, pass);
};

export const loginEmailPassword = async (email: string, pass: string) => {
  return await signInWithEmailAndPassword(auth, email, pass);
};

export const addDoc = async (...args: any[]) => {
  return withRetry(() => (firestoreAddDoc as any)(...args));
};

export const setDoc = async (...args: any[]) => {
  return withRetry(() => (firestoreSetDoc as any)(...args));
};

export const updateDoc = async (...args: any[]) => {
  return withRetry(() => (firestoreUpdateDoc as any)(...args));
};

export const deleteDoc = async (...args: any[]) => {
  return withRetry(() => (firestoreDeleteDoc as any)(...args));
};
