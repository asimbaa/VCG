import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';

export const QRScanner = ({ onScan }) => {
  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          onScan(code.data);
        }
      };
    }
  }, [onScan]);

  // normally we'd set an interval to capture
  return <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />;
};
