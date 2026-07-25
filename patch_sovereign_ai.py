import re

with open('src/components/bank/SovereignAI.tsx', 'r') as f:
    content = f.read()

# Import
import_str = "import { VoiceInputButton } from '../shared/VoiceInputButton';\n"
if "VoiceInputButton" not in content:
    content = content.replace("import { toast } from 'sonner';", "import { toast } from 'sonner';\n" + import_str)

# State
state_str = "  const [isListening, setIsListening] = useState(false);\n"
if "isListening" not in content:
    content = content.replace("  const [input, setInput] = useState('');", "  const [input, setInput] = useState('');\n" + state_str)

# Insert the button before the submit button
target = """              <button 
                type="submit"
                disabled={!input.trim()}"""

btn_str = """              <VoiceInputButton 
                isListening={isListening} 
                setIsListening={setIsListening} 
                onTranscript={(text) => setInput((prev) => prev ? prev + ' ' + text : text)} 
                className="mr-3 h-12 w-12 rounded-full"
              />
"""
if "VoiceInputButton " not in content:
    content = content.replace(target, btn_str + target)

with open('src/components/bank/SovereignAI.tsx', 'w') as f:
    f.write(content)
