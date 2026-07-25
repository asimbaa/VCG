const fs = require('fs');

const path = './src/components/docucraft/DocuCraft.tsx';
let content = fs.readFileSync(path, 'utf8');

const stateInjection = `  const [activeAgent, setActiveAgent] = useState<AgentType>("strategist");
  const [isCollaborationMode, setIsCollaborationMode] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(SUGGESTIONS);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = React.useRef<any>(null);

  React.useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setPrompt(currentTranscript);
      };
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        toast.error("Microphone error: " + event.error);
      };
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      toast.success("Voice dictation paused. Neural Link disengaged.");
    } else {
      if (recognitionRef.current) {
        setPrompt(""); // Clear previous on new start
        try {
          recognitionRef.current.start();
          setIsListening(true);
          toast.success("Neural Link Microphone active. Speak your instructions.");
        } catch (e) {
          console.error(e);
        }
      } else {
        toast.error("Speech recognition is not supported in this browser.");
      }
    }
  };
`;

content = content.replace(/  const \[activeAgent.*?useState\(SUGGESTIONS\);/s, stateInjection);

fs.writeFileSync(path, content);
console.log("States added.");
