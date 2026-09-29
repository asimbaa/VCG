const fs = require('fs');

let content = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf-8');

const oldScanner = `const RealQRScanner = ({ onScan }: { onScan: (data: string) => void }) => {
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
};`;

const newScanner = `const RealQRScanner = ({ onScan }: { onScan: (data: string) => void }) => {
  const webcamRef = useRef<Webcam>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  const capture = useCallback(() => {
    if (isProcessing || scanSuccess) return;
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
            setIsProcessing(true);
            setTimeout(() => {
              // Basic validation to ensure it's not complete noise
              const isValid = code.data && code.data.length > 2;
              if (isValid) {
                setScanSuccess(true);
                setTimeout(() => {
                  onScan(code.data);
                  setIsProcessing(false);
                  setScanSuccess(false);
                }, 1000);
              } else {
                import("sonner").then(({ toast }) => {
                  toast.error("Invalid or Unsupported QR Code Format");
                });
                setIsProcessing(false);
              }
            }, 600);
          }
        }
      }
    }
  }, [onScan, isProcessing, scanSuccess]);

  useEffect(() => {
    const interval = setInterval(capture, 500);
    return () => clearInterval(interval);
  }, [capture]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl bg-slate-900 flex flex-col items-center justify-center">
      {cameraError ? (
        <div className="p-6 flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
          <h4 className="text-white font-bold mb-2">Camera Access Denied</h4>
          <p className="text-sm text-slate-400">Please enable camera permissions in your browser settings to scan QR codes.</p>
        </div>
      ) : (
        <>
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "environment" }}
            onUserMediaError={(err) => setCameraError(typeof err === 'string' ? err : err.message || "Failed to access camera")}
            className={\`object-cover w-full h-full transition-opacity duration-300 \${isProcessing || scanSuccess ? 'opacity-30 blur-sm' : 'opacity-100'}\`}
          />
          {!isProcessing && !scanSuccess && (
            <>
              <div className="absolute inset-0 border-2 border-dashed border-emerald-500/50 pointer-events-none"></div>
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent to-emerald-500/20 border-b border-emerald-500 animate-[scan_2s_ease-in-out_infinite_alternate] pointer-events-none"></div>
            </>
          )}

          {isProcessing && !scanSuccess && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm z-10 pointer-events-none">
              <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
              <span className="text-emerald-400 font-bold tracking-widest uppercase text-sm">Processing...</span>
            </div>
          )}

          {scanSuccess && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-900/80 backdrop-blur-md z-10 pointer-events-none">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4 animate-bounce" />
              <span className="text-white font-bold tracking-widest uppercase text-lg">Code Secured</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};`;

content = content.replace(oldScanner, newScanner);
fs.writeFileSync('src/components/pay/RapidPay.tsx', content);
