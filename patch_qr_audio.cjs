const fs = require('fs');

let content = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf-8');

const oldScanner = `const RealQRScanner = ({ onScan }: { onScan: (data: string) => void }) => {
  const webcamRef = useRef<Webcam>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);`;

const newScanner = `
const playChirp = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch(e) {}
};

const RealQRScanner = ({ onScan }: { onScan: (data: string) => void }) => {
  const webcamRef = useRef<Webcam>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [resetKey, setResetKey] = useState(0);
`;

content = content.replace(oldScanner, newScanner);

// Add haptics, chirp, and retry logic
const oldCapture = `          if (code) {
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
          }`;

const newCapture = `          if (code) {
            setIsProcessing(true);
            setTimeout(() => {
              const isValid = code.data && code.data.length > 2;
              if (isValid) {
                playChirp();
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
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
                setResetKey(prev => prev + 1); // Reset camera state
              }
            }, 600);
          }`;

content = content.replace(oldCapture, newCapture);

// Add reset logic for timeout
const oldEffect = `  useEffect(() => {
    const interval = setInterval(capture, 500);
    return () => clearInterval(interval);
  }, [capture]);`;

const newEffect = `  useEffect(() => {
    let timeoutCounter = 0;
    const interval = setInterval(() => {
      capture();
      timeoutCounter += 500;
      if (timeoutCounter >= 5000 && !isProcessing && !scanSuccess) {
        // Auto reset if nothing found for 5s
        setResetKey(prev => prev + 1);
        timeoutCounter = 0;
      }
    }, 500);
    return () => clearInterval(interval);
  }, [capture, isProcessing, scanSuccess]);`;

content = content.replace(oldEffect, newEffect);

const oldWebcam = `<Webcam
            ref={webcamRef}
            audio={false}`;
const newWebcam = `<Webcam
            key={resetKey}
            ref={webcamRef}
            audio={false}`;

content = content.replace(oldWebcam, newWebcam);

fs.writeFileSync('src/components/pay/RapidPay.tsx', content);
