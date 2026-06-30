import { GeneratedDocument } from '../services/gemini';

export const generateMarkdown = (doc: GeneratedDocument): string => {
  if (doc.type === 'REPORT') {
    return `# ${doc.data.title}\n\n**Author:** ${doc.data.author}\n**Date:** ${doc.data.date}\n\n${doc.data.content}`;
  }
  
  if (doc.type === 'MEMO') {
    return `# MEMORANDUM\n\n**To:** ${doc.data.to}\n**From:** ${doc.data.from}\n**Date:** ${doc.data.date}\n**Subject:** ${doc.data.subject}\n\n---\n\n${doc.data.body}`;
  }
  
  if (doc.type === 'RESUME') {
    let md = `# ${doc.data.fullName}\n## ${doc.data.title}\n`;
    md += `${doc.data.contact?.email || ''} | ${doc.data.contact?.phone || ''} | ${doc.data.contact?.location || ''}\n\n`;
    
    if (doc.data.summary) {
      md += `### Professional Summary\n${doc.data.summary}\n\n`;
    }
    
    md += `### Experience\n`;
    doc.data.experience?.forEach((exp: any) => {
      md += `**${exp.position}** at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})\n`;
      exp.description?.forEach((desc: string) => {
        md += `- ${desc}\n`;
      });
      md += '\n';
    });
    
    md += `### Education\n`;
    doc.data.education?.forEach((edu: any) => {
      md += `**${edu.degree}**, ${edu.institution} (${edu.year})\n`;
    });
    
    if (doc.data.skills && doc.data.skills.length > 0) {
      md += `\n### Skills\n${doc.data.skills.join(', ')}\n`;
    }
    
    return md;
  }
  
  if (doc.type === 'INVOICE') {
    const currency = doc.data.currency || '$';
    let md = `# INVOICE ${doc.data.invoiceNumber || ''}\n\n`;
    
    md += `**From:** ${doc.data.companyName}\n`;
    if (doc.data.companyTaxId) md += `Tax ID: ${doc.data.companyTaxId}\n`;
    md += `${doc.data.companyAddress}\n\n`;
    
    md += `**To:** ${doc.data.clientName}\n`;
    if (doc.data.clientTaxId) md += `Tax ID: ${doc.data.clientTaxId}\n`;
    md += `${doc.data.clientAddress}\n\n`;
    
    md += `**Date Issued:** ${doc.data.date}\n**Due Date:** ${doc.data.dueDate}\n\n`;
    
    md += `| Description | Qty | Price | Amount |\n|---|---|---|---|\n`;
    doc.data.items?.forEach((item: any) => {
      md += `| ${item.description} | ${item.quantity} | ${currency}${item.unitPrice} | ${currency}${item.amount} |\n`;
    });
    
    md += `\n**Subtotal:** ${currency}${doc.data.subtotal}\n`;
    if (doc.data.taxRate) {
      md += `**${doc.data.taxName || 'Tax'} (${doc.data.taxRate}%):** ${currency}${doc.data.taxAmount}\n`;
    }
    md += `**Total:** ${currency}${doc.data.total}\n`;
    
    if (doc.data.notes) {
      md += `\n**Notes:**\n${doc.data.notes}\n`;
    }
    
    return md;
  }
  
  return '';
};

export const generateRTF = (doc: GeneratedDocument): string => {
  let content = '';
  
  if (doc.type === 'REPORT') {
    content = `{\\b\\fs32 ${doc.data.title}}\\par\\par {\\b Author:} ${doc.data.author}\\par {\\b Date:} ${doc.data.date}\\par\\par ${doc.data.content.replace(/\n/g, '\\par ')}`;
  } else if (doc.type === 'MEMO') {
    content = `{\\b\\fs36 MEMORANDUM}\\par\\par {\\b To:} ${doc.data.to}\\par {\\b From:} ${doc.data.from}\\par {\\b Date:} ${doc.data.date}\\par {\\b Subject:} ${doc.data.subject}\\par\\par \\line\\par ${doc.data.body.replace(/\n/g, '\\par ')}`;
  } else if (doc.type === 'RESUME') {
    content = `{\\b\\fs40 ${doc.data.fullName}}\\par {\\fs28 ${doc.data.title}}\\par ${doc.data.contact?.email || ''} | ${doc.data.contact?.phone || ''} | ${doc.data.contact?.location || ''}\\par\\par {\\b\\fs28 Professional Summary}\\par ${doc.data.summary || ''}\\par\\par {\\b\\fs28 Experience}\\par `;
    doc.data.experience?.forEach((exp: any) => {
      content += `{\\b ${exp.position}} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})\\par `;
      exp.description?.forEach((desc: string) => {
        content += `- ${desc}\\par `;
      });
      content += '\\par ';
    });
    content += `{\\b\\fs28 Education}\\par `;
    doc.data.education?.forEach((edu: any) => {
      content += `{\\b ${edu.degree}}, ${edu.institution} (${edu.year})\\par `;
    });
    if (doc.data.skills && doc.data.skills.length > 0) {
      content += `\\par {\\b\\fs28 Skills}\\par ${doc.data.skills.join(', ')}\\par `;
    }
  } else if (doc.type === 'INVOICE') {
    const currency = doc.data.currency || '$';
    content = `{\\b\\fs36 INVOICE ${doc.data.invoiceNumber || ''}}\\par\\par {\\b From:}\\par ${doc.data.companyName}\\par ${doc.data.companyAddress}\\par\\par {\\b To:}\\par ${doc.data.clientName}\\par ${doc.data.clientAddress}\\par\\par {\\b Date Issued:} ${doc.data.date}\\par {\\b Due Date:} ${doc.data.dueDate}\\par\\par {\\b Items:}\\par `;
    doc.data.items?.forEach((item: any) => {
      content += `${item.description} | Qty: ${item.quantity} | Price: ${currency}${item.unitPrice} | Total: ${currency}${item.amount}\\par `;
    });
    content += `\\par {\\b Subtotal:} ${currency}${doc.data.subtotal}\\par {\\b Total:} ${currency}${doc.data.total}\\par `;
    if (doc.data.notes) {
      content += `\\par {\\b Notes:}\\par ${doc.data.notes}\\par `;
    }
  }

  return `{\\rtf1\\ansi\\deff0 {\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}}\\viewkind4\\uc1\\pard\\f0\\fs24 ${content}}`;
};

export const generateFODT = (doc: GeneratedDocument): string => {
  let bodyContent = '';
  
  const escapeXml = (unsafe: string) => {
    return unsafe.replace(/[<>&"']/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '"': return '&quot;';
        case "'": return '&apos;';
        default: return c;
      }
    });
  };

  if (doc.type === 'REPORT') {
    bodyContent = `<text:h text:outline-level="1">${escapeXml(doc.data.title)}</text:h>
      <text:p text:style-name="Standard"><text:span text:style-name="Bold">Author:</text:span> ${escapeXml(doc.data.author)}</text:p>
      <text:p text:style-name="Standard"><text:span text:style-name="Bold">Date:</text:span> ${escapeXml(doc.data.date)}</text:p>
      <text:p text:style-name="Standard">${escapeXml(doc.data.content).replace(/\n/g, '</text:p><text:p text:style-name="Standard">')}</text:p>`;
  } else if (doc.type === 'MEMO') {
    bodyContent = `<text:h text:outline-level="1">MEMORANDUM</text:h>
      <text:p text:style-name="Standard"><text:span text:style-name="Bold">To:</text:span> ${escapeXml(doc.data.to)}</text:p>
      <text:p text:style-name="Standard"><text:span text:style-name="Bold">From:</text:span> ${escapeXml(doc.data.from)}</text:p>
      <text:p text:style-name="Standard"><text:span text:style-name="Bold">Date:</text:span> ${escapeXml(doc.data.date)}</text:p>
      <text:p text:style-name="Standard"><text:span text:style-name="Bold">Subject:</text:span> ${escapeXml(doc.data.subject)}</text:p>
      <text:p text:style-name="Standard">--------------------------------------------------</text:p>
      <text:p text:style-name="Standard">${escapeXml(doc.data.body).replace(/\n/g, '</text:p><text:p text:style-name="Standard">')}</text:p>`;
  } else if (doc.type === 'RESUME') {
    bodyContent = `<text:h text:outline-level="1">${escapeXml(doc.data.fullName)}</text:h>
      <text:h text:outline-level="2">${escapeXml(doc.data.title)}</text:h>
      <text:p text:style-name="Standard">${escapeXml(doc.data.contact?.email || '')} | ${escapeXml(doc.data.contact?.phone || '')} | ${escapeXml(doc.data.contact?.location || '')}</text:p>
      <text:h text:outline-level="3">Professional Summary</text:h>
      <text:p text:style-name="Standard">${escapeXml(doc.data.summary || '')}</text:p>
      <text:h text:outline-level="3">Experience</text:h>`;
    doc.data.experience?.forEach((exp: any) => {
      bodyContent += `<text:p text:style-name="Standard"><text:span text:style-name="Bold">${escapeXml(exp.position)}</text:span> at ${escapeXml(exp.company)} (${escapeXml(exp.startDate)} - ${escapeXml(exp.endDate || 'Present')})</text:p>`;
      exp.description?.forEach((desc: string) => {
        bodyContent += `<text:p text:style-name="Standard">- ${escapeXml(desc)}</text:p>`;
      });
    });
    bodyContent += `<text:h text:outline-level="3">Education</text:h>`;
    doc.data.education?.forEach((edu: any) => {
      bodyContent += `<text:p text:style-name="Standard"><text:span text:style-name="Bold">${escapeXml(edu.degree)}</text:span>, ${escapeXml(edu.institution)} (${escapeXml(edu.year)})</text:p>`;
    });
    if (doc.data.skills && doc.data.skills.length > 0) {
      bodyContent += `<text:h text:outline-level="3">Skills</text:h><text:p text:style-name="Standard">${escapeXml(doc.data.skills.join(', '))}</text:p>`;
    }
  } else if (doc.type === 'INVOICE') {
    const currency = doc.data.currency || '$';
    bodyContent = `<text:h text:outline-level="1">INVOICE ${escapeXml(doc.data.invoiceNumber || '')}</text:h>
      <text:p text:style-name="Standard"><text:span text:style-name="Bold">From:</text:span></text:p>
      <text:p text:style-name="Standard">${escapeXml(doc.data.companyName)}</text:p>
      <text:p text:style-name="Standard">${escapeXml(doc.data.companyAddress)}</text:p>
      <text:p text:style-name="Standard"><text:span text:style-name="Bold">To:</text:span></text:p>
      <text:p text:style-name="Standard">${escapeXml(doc.data.clientName)}</text:p>
      <text:p text:style-name="Standard">${escapeXml(doc.data.clientAddress)}</text:p>
      <text:p text:style-name="Standard"><text:span text:style-name="Bold">Date Issued:</text:span> ${escapeXml(doc.data.date)}</text:p>
      <text:p text:style-name="Standard"><text:span text:style-name="Bold">Due Date:</text:span> ${escapeXml(doc.data.dueDate)}</text:p>
      <text:h text:outline-level="3">Items</text:h>`;
    doc.data.items?.forEach((item: any) => {
      bodyContent += `<text:p text:style-name="Standard">${escapeXml(item.description)} | Qty: ${item.quantity} | Price: ${currency}${item.unitPrice} | Total: ${currency}${item.amount}</text:p>`;
    });
    bodyContent += `<text:p text:style-name="Standard"><text:span text:style-name="Bold">Subtotal:</text:span> ${currency}${doc.data.subtotal}</text:p>
      <text:p text:style-name="Standard"><text:span text:style-name="Bold">Total:</text:span> ${currency}${doc.data.total}</text:p>`;
    if (doc.data.notes) {
      bodyContent += `<text:h text:outline-level="3">Notes</text:h><text:p text:style-name="Standard">${escapeXml(doc.data.notes)}</text:p>`;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<office:document xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" office:version="1.2" office:mimetype="application/vnd.oasis.opendocument.text">
  <office:font-face-decls>
    <style:font-face style:name="Arial" svg:font-family="Arial"/>
  </office:font-face-decls>
  <office:styles>
    <style:style style:name="Standard" style:family="paragraph" style:class="text"/>
    <style:style style:name="Bold" style:family="text">
      <style:text-properties fo:font-weight="bold" style:font-weight-asian="bold" style:font-weight-complex="bold"/>
    </style:style>
  </office:styles>
  <office:body>
    <office:text>
      ${bodyContent}
    </office:text>
  </office:body>
</office:document>`;
};
