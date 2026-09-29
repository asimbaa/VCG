const fs = require('fs');

let content = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf-8');

// Add imports
if (!content.includes('import Webcam from "react-webcam"')) {
    content = content.replace(
        'import React, { useState, useEffect } from "react";',
        'import React, { useState, useEffect, useRef, useCallback } from "react";\nimport Webcam from "react-webcam";\nimport jsQR from "jsqr";'
    );
}

// Add the scanner component just before the main RapidPay component
if (!content.includes('const RealQRScanner =')) {
    const scannerComponent = `
const RealQRScanner = ({ onScan }: { onScan: (data: string) => void }) => {
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const video = webcamRef.current.video;
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          if (code) {
            onScan(code.data);
          }
        }
      }
    }
  }, [onScan]);

  useEffect(() => {
    const interval = setInterval(capture, 500);
    return () => clearInterval(interval);
  }, [capture]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode: "environment" }}
        className="object-cover w-full h-full"
      />
      <div className="absolute inset-0 border-2 border-dashed border-emerald-500/50 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent to-emerald-500/20 border-b border-emerald-500 animate-[scan_2s_ease-in-out_infinite_alternate] pointer-events-none"></div>
    </div>
  );
};
`;
    content = content.replace('export const RapidPay =', scannerComponent + '\nexport const RapidPay =');
}

// Replace the mock scan UI
const mockUI = `              <div className="relative mx-auto w-full max-w-sm aspect-square bg-slate-800 rounded-2xl border-2 border-dashed border-emerald-500/50 overflow-hidden flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent to-emerald-500/20 border-b border-emerald-500 animate-[scan_2s_ease-in-out_infinite_alternate]"></div>
                <QrCode className="w-20 h-20 text-slate-600 mb-4" />
                <span className="text-slate-400 text-sm font-bold tracking-widest uppercase">Align QR Code</span>
              </div>
              
              <div className="mt-8 flex gap-4 justify-center">
                <button 
                  onClick={() => {
                    toast.success("Mock Scan: Detected Merchant Payment Code.");
                    setRecipient("MERCHANT: TOKYO DINING CLUB");
                    setAmount("185.00");
                    setTransferType("standard");
                  }}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors text-sm"
                >
                  Simulate Merchant Scan
                </button>
                <button 
                  onClick={() => {
                    toast.success("Mock Scan: Detected Crypto Wallet.");
                    setCryptoAddress("0x71C...976F");
                    setTransferType("digital_assets");
                  }}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                >
                  Simulate Crypto Scan
                </button>
              </div>`;

const newUI = `              <div className="relative mx-auto w-full max-w-sm aspect-square bg-slate-800 rounded-2xl overflow-hidden flex flex-col items-center justify-center">
                <RealQRScanner onScan={(data) => {
                  toast.success("QR Code Detected!");
                  if (data.toLowerCase().includes('0x') || data.toLowerCase().includes('bitcoin:') || data.toLowerCase().includes('ethereum:')) {
                    setCryptoAddress(data);
                    setTransferType("digital_assets");
                  } else {
                    setRecipient(data);
                    setAmount("");
                    setTransferType("standard");
                  }
                }} />
              </div>`;

content = content.replace(mockUI, newUI);

fs.writeFileSync('src/components/pay/RapidPay.tsx', content);
