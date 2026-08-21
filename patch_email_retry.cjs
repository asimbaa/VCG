const fs = require('fs');
let file = fs.readFileSync('src/utils/email.ts', 'utf8');

if (!file.includes('export const getEmailQueueStatus')) {
    file += `
export const getEmailQueueStatus = () => {
    return {
        length: emailQueue.length,
        isProcessing: isProcessingQueue
    };
};

export const retryFailedEmails = () => {
    if (!isProcessingQueue && emailQueue.length > 0) {
        processQueue();
        return true;
    }
    return false;
};
`;
    fs.writeFileSync('src/utils/email.ts', file);
    console.log("Email retry functions added.");
}
