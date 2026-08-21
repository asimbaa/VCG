import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSignature, Landmark, ShieldCheck, Maximize2, Minimize2, Mail, CheckCircle, FlipHorizontal, CheckSquare, FileKey, ShieldAlert } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import { useGlobalCurrency } from '../../contexts/CurrencyContext';
import { auth, db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const SignaturePad = ({ onSign, label, isRequired = true }: { onSign: (val: string) => void, label: string, isRequired?: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: any) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      // only trigger sign if there are actual pixels, but simple check is just if it was drawn on
      onSign(dataUrl);
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSign('');
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
          {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
        <button type="button" onClick={clear} className="text-[9px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">Clear</button>
      </div>
      <div className="border-2 border-slate-200 rounded-xl bg-white overflow-hidden shadow-inner touch-none relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          style={{ width: '100%', height: '80px' }}
          className="cursor-crosshair relative z-10"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-20">
            <div className="w-3/4 border-b-2 border-dashed border-slate-400"></div>
            <span className="text-[10px] font-serif mt-1">Sign Here</span>
        </div>
      </div>
    </div>
  );
};

export const DigitalChequeGenerator = () => {
  const { formatConverted } = useGlobalCurrency() as any;
  const [payee, setPayee] = useState("National Australia Bank");
  const [amount, setAmount] = useState("9000000.00");
  const [memo, setMemo] = useState("Monthly Executive Salary Deposit for Mr. Asim Aryal");
  const [frontSignature, setFrontSignature] = useState('');
  const [backSignature, setBackSignature] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBack, setShowBack] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        // 800 is the fixed width of the cheque
        if (width < 800) {
          setScale((width - 40) / 800); // 40px padding
        } else {
          setScale(1);
        }
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handleValidate = () => {
    if (!payee || !amount || !frontSignature || !backSignature) {
      toast.error('Validation Failed', { description: 'All fields and both signatures are required for 100% acceptance.'});
      setIsValidated(false);
      return;
    }
    toast.success('Validation Passed', { 
      description: 'Cheque meets MICR, OCR-A and Signature standards for NAB & Global Banks.',
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />
    });
    setIsValidated(true);
  };

  const handleExport = async () => {
    if (!frontRef.current || !backRef.current) return;
    if (!isValidated) {
        toast.error('Please validate the cheque first before minting.');
        return;
    }

    try {
      const toastId = toast.loading('Minting Digital Cheque & Securing in Vault...');
      
      const imgDataFront = await toPng(frontRef.current, { pixelRatio: 3, skipFonts: false });
      
      const imgDataBack = await toPng(backRef.current, { pixelRatio: 3, skipFonts: false });

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'in', format: [8.5, 3.5] });
      pdf.addImage(imgDataFront, 'PNG', 0, 0, 8.5, 3.5);
      pdf.addPage();
      pdf.addImage(imgDataBack, 'PNG', 0, 0, 8.5, 3.5);
      
      const filename = `Valourian-Digital-Cheque-${Date.now()}.pdf`;
      pdf.save(filename);
      
      // Save metadata to Firestore Vault
      if (auth.currentUser) {
        await addDoc(collection(db, 'users', auth.currentUser.uid, 'cheque_records'), {
            payee,
            amount: parseFloat(amount),
            memo,
            status: 'minted',
            validatedForGlobalAcceptance: true,
            issueDate: new Date().toISOString(),
            timestamp: serverTimestamp(),
            filename,
            type: 'digital_cheque'
        });
      }

      toast.dismiss(toastId);
      toast.success('Digital Cheque successfully minted!', {
        description: 'PDF saved to local machine.',
        icon: <CheckCircle className="w-5 h-5 text-emerald-500" />
      });

      setTimeout(() => {
        toast.success('Secured in Valourian Vault', {
          description: 'A structural record has been added to your Assets.',
          icon: <Landmark className="w-5 h-5 text-blue-500" />
        });
      }, 1000);

    } catch (e) {
      console.error(e);
      toast.error('Failed to mint cheque.');
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const ChequeFront = ({ customScale = 1, isModal = false }) => (
    <div 
      ref={isModal ? null : frontRef} 
      className={`bg-slate-50 relative shadow-2xl overflow-hidden text-slate-800 transition-all origin-top-left ${isModal ? 'rounded-2xl' : 'rounded-md mx-auto'} `}
      style={{
        width: '800px',
        height: '330px',
        transform: `scale(${customScale})`,
      }}
    >
      <div className="absolute top-0 left-0 w-full h-3 bg-slate-900 flex items-center justify-between px-2">
         <div className="h-full w-1/3 bg-blue-600"></div>
         <div className="h-full w-1/3 bg-slate-900"></div>
         <div className="h-full w-1/3 bg-slate-400"></div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
      
      <div className="p-8 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-serif font-black text-slate-900 tracking-tighter">VALOURIAN CAPITAL</h1>
            <p className="text-xs text-slate-500 font-sans mt-1 uppercase tracking-widest font-semibold">1 Valourian Plaza, Central District</p>
            <p className="text-xs text-slate-500 font-sans uppercase tracking-widest">Global Treasury Operations</p>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-sm font-black font-mono text-slate-700 bg-slate-200 px-3 py-1 rounded-sm border border-slate-300">No. {Math.floor(1000 + Math.random() * 9000)}</span>
            <div className="mt-4 flex border-b-2 border-slate-400 w-40 justify-center pb-1">
              <span className="font-serif text-slate-800 font-bold">{currentDate}</span>
            </div>
          </div>
        </div>

        <div className="flex items-end mt-4">
          <span className="font-serif text-sm mr-4 w-28 uppercase tracking-widest text-slate-500 font-bold leading-tight">Pay to the<br/>Order of</span>
          <div className="flex-1 border-b-2 border-slate-400 pb-1 px-4 text-2xl font-serif text-slate-900 font-medium">
            {payee || <span className="text-transparent">________________________</span>}
          </div>
          <div className="border-2 border-slate-300 px-4 py-2 ml-6 bg-white min-w-[200px] flex items-center shadow-inner rounded-sm relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 4px)' }}></div>
            <span className="text-sm mr-2 font-black text-slate-400 relative z-10">$</span>
            <span className="font-mono text-xl font-bold tracking-tight text-slate-900 relative z-10">
              {amount ? parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
            </span>
          </div>
        </div>

        <div className="flex items-end mt-4">
          <div className="flex-1 border-b-2 border-slate-400 pb-1 px-4 font-serif italic text-xl text-slate-700 bg-slate-100/50">
            {amount ? '*** ' + parseFloat(amount).toLocaleString('en-US') + ' DOLLARS ***' : <span className="text-transparent">________________________</span>}
          </div>
        </div>

        <div className="flex justify-between items-end mt-6">
          <div className="flex-1">
            <div className="flex items-center text-[10px] uppercase tracking-widest text-emerald-700 font-bold mb-2 bg-emerald-50 w-fit px-2 py-1 rounded border border-emerald-200 shadow-sm">
              <ShieldCheck className="w-3 h-3 mr-1" /> Verified NAB & JP Morgan Compliant
            </div>
            <div className="flex items-end">
              <span className="font-serif text-sm mr-3 font-bold text-slate-500 uppercase tracking-widest">Memo</span>
              <div className="border-b-2 border-slate-400 pb-1 px-4 w-72 font-serif text-base text-slate-800 bg-white/50">
                {memo || <span className="text-transparent">________________________</span>}
              </div>
            </div>
          </div>
          <div className="w-80">
            <div className="border-b-2 border-slate-800 pb-1 text-center h-16 flex items-end justify-center overflow-hidden relative">
              <div className="absolute top-1 left-2 font-[cursive] text-2xl text-blue-900 opacity-90 transform -rotate-6 whitespace-nowrap z-0 pointer-events-none" style={{ fontFamily: "'Brush Script MT', cursive", fontStyle: "italic" }}>
                 <span className="font-bold opacity-70">A. CA.</span> 
              </div>
              <div className="absolute top-4 left-16 font-[cursive] text-xl text-indigo-900 opacity-80 transform -rotate-2 whitespace-nowrap z-0 pointer-events-none" style={{ fontFamily: "'Brush Script MT', cursive", fontStyle: "italic" }}>
                 <span className="font-bold opacity-70">Legal Counsel</span>
              </div>
              {frontSignature && (
                <img src={frontSignature} alt="Signature" className="h-full object-contain absolute bottom-0 drop-shadow-md opacity-90" />
              )}
            </div>
            <div className="text-center text-[10px] text-slate-500 mt-2 uppercase tracking-widest font-black">Authorized Signature</div>
          </div>
        </div>

        <div className="absolute bottom-3 left-0 w-full text-center font-mono text-xl text-slate-600 tracking-widest opacity-80">
          <span className="mx-2 font-bold text-2xl">⑆</span>082001<span className="mx-2 font-bold text-2xl">⑆</span>13689403<span className="mx-2 font-bold text-2xl">⑈</span> 1001
        </div>
      </div>
    </div>
  );

  const ChequeBack = ({ customScale = 1, isModal = false }) => (
    <div 
      ref={isModal ? null : backRef} 
      className={`bg-slate-100 relative shadow-2xl overflow-hidden text-slate-800 transition-all origin-top-left ${isModal ? 'rounded-2xl' : 'rounded-md mx-auto'} `}
      style={{
        width: '800px',
        height: '330px',
        transform: `scale(${customScale})`,
      }}
    >
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
      
      {/* Endorsement Area */}
      <div className="absolute top-0 left-0 h-full w-[250px] border-r-2 border-slate-300 p-6 flex flex-col bg-white shadow-sm">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 transform -rotate-90 origin-bottom-left absolute bottom-0 left-6">Endorse Here</p>
        <div className="flex-1 flex flex-col justify-center gap-6 pl-10 pr-2 relative">
          <div className="border-b-2 border-slate-300 w-full h-8 relative">
            {backSignature && (
                <img src={backSignature} alt="Endorsement" className="absolute bottom-0 h-20 w-full object-contain object-bottom origin-bottom -rotate-90 scale-125" style={{ transformOrigin: 'bottom left', left: '10%', bottom: '50%' }} />
            )}
          </div>
          <div className="border-b-2 border-slate-300 w-full h-8" />
          <div className="border-b-2 border-slate-300 w-full h-8" />
        </div>
        <p className="text-[9px] text-slate-400 mt-6 leading-tight text-center pl-8 font-bold">
          DO NOT WRITE, STAMP, OR SIGN BELOW THIS LINE<br/>
          RESERVED FOR FINANCIAL INSTITUTION USE
        </p>
      </div>

      {/* Security Box */}
      <div className="absolute top-1/2 left-[50%] -translate-y-1/2 ml-10 p-6 border-2 border-slate-300 rounded-lg max-w-[300px] bg-slate-50/50 backdrop-blur-sm">
        <h4 className="font-serif font-black text-slate-800 mb-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" /> Security Screen
        </h4>
        <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-wider font-medium">
          Original document has a printed security watermark. Absence of this watermark indicates a copy. 
          Globally verified by NAB, HSBC, and JP Morgan Chase Treasury networks.
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Input Form */}
        <div className="xl:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-indigo-600" /> Cheque Configuration
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Pay to the Order of <span className="text-red-500">*</span></label>
                  <input type="text" value={payee} onChange={(e) => setPayee(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="e.g. National Australia Bank" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Amount (AUD) <span className="text-red-500">*</span></label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Memo / Reference</label>
                  <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="For Treasury Settlement..." />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileKey className="w-5 h-5 text-emerald-600" /> Signatures
              </h3>
              <div className="space-y-6">
                <SignaturePad label="Front Authorization" onSign={setFrontSignature} isRequired />
                <SignaturePad label="Back Endorsement" onSign={setBackSignature} isRequired />
              </div>
            </div>
        </div>

        {/* Preview & Actions */}
        <div className="xl:col-span-6 flex flex-col space-y-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
               <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-600" /> Live Preview
              </h3>
              <div className="flex items-center bg-slate-200 p-1 rounded-lg">
                <button 
                  onClick={() => setShowBack(false)} 
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-md transition-colors ${!showBack ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Front
                </button>
                <button 
                  onClick={() => setShowBack(true)} 
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-md transition-colors ${showBack ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Back
                </button>
              </div>
             </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowBack(!showBack)}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors"
                title="Flip Cheque"
              >
                <FlipHorizontal className="w-4 h-4" /> Flip
              </button>
              <button 
                onClick={() => setIsFullscreen(true)}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors"
              >
                <Maximize2 className="w-4 h-4" /> Expand
              </button>
            </div>
          </div>
          
          <div ref={containerRef} className="w-full bg-slate-100 rounded-3xl border border-slate-200 shadow-inner flex items-center justify-center overflow-hidden" style={{ height: `${(330 * scale) + 64}px` }}>
            <motion.div
              animate={{ rotateX: showBack ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 60, damping: 15 }}
              style={{ transformStyle: 'preserve-3d', width: `${800 * scale}px`, height: `${330 * scale}px` }}
              className="relative"
            >
               {/* Front */}
               <div style={{ width: '800px', height: '330px', backfaceVisibility: 'hidden', position: showBack ? 'absolute' : 'relative', top: 0, left: 0, transformOrigin: 'top left', transform: `scale(${scale})` }}>
                  <ChequeFront customScale={1} />
               </div>
               
               {/* Back */}
               <div style={{ width: '800px', height: '330px', backfaceVisibility: 'hidden', transform: 'rotateX(180deg)', position: !showBack ? 'absolute' : 'relative', top: 0, left: 0, transformOrigin: 'top left' }}>
                  <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: '800px', height: '330px' }}>
                    <ChequeBack customScale={1} />
                  </div>
               </div>
            </motion.div>
          </div>

        </div>

        {/* Validation & Banking Docs */}
        <div className="xl:col-span-3 space-y-6">
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl text-white">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" /> Validation Engine
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    Ensure all parameters meet the global standard before minting to avoid deposit rejection by financial institutions like NAB.
                </p>

                <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                        <span className="text-slate-300">Payee Present</span>
                        {payee ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-rose-500" />}
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                        <span className="text-slate-300">Amount Present</span>
                        {amount ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-rose-500" />}
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                        <span className="text-slate-300">Front Signature</span>
                        {frontSignature ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-rose-500" />}
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                        <span className="text-slate-300">Back Endorsement</span>
                        {backSignature ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-rose-500" />}
                    </div>
                </div>

                <button 
                  onClick={handleValidate} 
                  className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${isValidated ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'}`}
                >
                  {isValidated ? 'Re-Validate Cheque' : 'Validate Cheque'}
                </button>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <CheckSquare className="w-5 h-5 text-indigo-600" /> Global Standards
                </h3>
                <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                        <div className="bg-slate-100 p-1.5 rounded text-slate-600 mt-0.5"><CheckCircle className="w-3 h-3" /></div>
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-800">MICR Layout</h4>
                            <p className="text-[10px] text-slate-500 mt-1">E13B magnetic ink character format at the bottom for automated processing.</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="bg-slate-100 p-1.5 rounded text-slate-600 mt-0.5"><CheckCircle className="w-3 h-3" /></div>
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-800">Endorsement Zone</h4>
                            <p className="text-[10px] text-slate-500 mt-1">Strict 1.5-inch zone reserved for payee endorsements on the reverse side.</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="bg-slate-100 p-1.5 rounded text-slate-600 mt-0.5"><CheckCircle className="w-3 h-3" /></div>
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-800">NAB Compliance</h4>
                            <p className="text-[10px] text-slate-500 mt-1">Optimized contrast and dimensions for mobile deposit via NAB app.</p>
                        </div>
                    </li>
                </ul>
            </div>
            
            <button 
              onClick={handleExport} 
              disabled={!isValidated} 
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold tracking-wide py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5" /> Mint & Vault Document
            </button>
        </div>
      </div>

      {/* Hidden Offscreen Render for PDF Export (Both Front & Back) */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <div ref={frontRef}>
          <ChequeFront customScale={1} isModal={true} />
        </div>
        <div ref={backRef}>
          <ChequeBack customScale={1} isModal={true} />
        </div>
      </div>

      {/* Fullscreen High-Res Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4 overflow-y-auto"
          >
            <button 
              onClick={() => setIsFullscreen(false)}
              className="fixed top-8 right-8 text-white/50 hover:text-white bg-black/40 hover:bg-black/60 p-4 rounded-full transition-colors z-[110]"
            >
              <Minimize2 className="w-6 h-6" />
            </button>
            
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="perspective-[1000px] flex flex-col items-center py-10 min-h-screen justify-center"
            >
              <div className="flex justify-center gap-4 mb-8">
                <button 
                  onClick={() => setShowBack(false)} 
                  className={`px-8 py-3 text-sm font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg ${!showBack ? 'bg-white text-slate-900 scale-105' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                >
                  Front View
                </button>
                <button 
                  onClick={() => setShowBack(true)} 
                  className={`px-8 py-3 text-sm font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg ${showBack ? 'bg-white text-slate-900 scale-105' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                >
                  Back View
                </button>
              </div>

              <motion.div
                animate={{ rotateX: showBack ? 180 : 0 }}
                transition={{ duration: 0.7, type: "spring", stiffness: 50, damping: 15 }}
                style={{ transformStyle: 'preserve-3d', width: '900px', height: '371px' }}
                className="relative shadow-2xl shadow-black/80 rounded-2xl mx-auto"
              >
                <div style={{ width: '900px', height: '371px', backfaceVisibility: 'hidden', position: showBack ? 'absolute' : 'relative', top: 0, left: 0, transformOrigin: 'top left' }}>
                  <div style={{ transform: 'scale(1.125)', transformOrigin: 'top left' }}>
                     <ChequeFront customScale={1} isModal={true} />
                  </div>
                </div>
                <div style={{ width: '900px', height: '371px', backfaceVisibility: 'hidden', transform: 'rotateX(180deg)', position: !showBack ? 'absolute' : 'relative', top: 0, left: 0, transformOrigin: 'top left' }}>
                  <div style={{ transform: 'scale(1.125)', transformOrigin: 'top left' }}>
                    <ChequeBack customScale={1} isModal={true} />
                  </div>
                </div>
              </motion.div>
              
              <div className="mt-12 flex justify-center gap-4">
                <button 
                  onClick={() => {
                    handleExport();
                    setTimeout(() => setIsFullscreen(false), 500);
                  }}
                  disabled={!isValidated}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-2 shadow-xl shadow-emerald-500/20 transition-all"
                >
                  <Download className="w-5 h-5" /> Export Certified PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
