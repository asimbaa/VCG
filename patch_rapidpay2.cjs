const fs = require('fs');
let content = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf-8');

const scannerComponent = `
const RealQRScanner = ({ onScan }: { onScan: (data: string) => void }) => {
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const video = (webcamRef.current as any).video;
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

if (!content.includes('const RealQRScanner =')) {
    content = content.replace('export function RapidPay(', scannerComponent + '\nexport function RapidPay(');
}

fs.writeFileSync('src/components/pay/RapidPay.tsx', content);
