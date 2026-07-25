import re

with open('src/components/messagecenter/MessageCenter.tsx', 'r') as f:
    content = f.read()

import_str = "import { VoiceInputButton } from '../shared/VoiceInputButton';\n"
if "VoiceInputButton" not in content:
    content = content.replace('import { Send, FileText, Bot, MoreVertical, Archive, Trash2, Mail, Users, CheckCircle2 } from "lucide-react";', 
                             'import { Send, FileText, Bot, MoreVertical, Archive, Trash2, Mail, Users, CheckCircle2 } from "lucide-react";\n' + import_str)

state_str = """  const [isDraftListening, setIsDraftListening] = useState(false);
"""
if "isDraftListening" not in content:
    content = content.replace("  const [draftMessage, setDraftMessage] = useState(\"\");", "  const [draftMessage, setDraftMessage] = useState(\"\");\n" + state_str)

target = """                <textarea
                  value={draftMessage}
                  onChange={(e) => setDraftMessage(e.target.value)}"""

replace = """                <div className="absolute right-4 bottom-4">
                  <VoiceInputButton 
                    isListening={isDraftListening}
                    setIsListening={setIsDraftListening}
                    onTranscript={(text) => setDraftMessage((prev) => prev ? prev + ' ' + text : text)}
                  />
                </div>
                <textarea
                  value={draftMessage}
                  onChange={(e) => setDraftMessage(e.target.value)}"""

if "isDraftListening" not in content or "VoiceInputButton" in content:
    content = content.replace(target, replace)

with open('src/components/messagecenter/MessageCenter.tsx', 'w') as f:
    f.write(content)
