import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TranslatorPhrase } from '../types';
import { INDIAN_LANGUAGE_PHRASES } from '../data/mockData';
import {
  Globe,
  Volume2,
  VolumeX,
  Mic,
  Camera,
  BookOpen,
  Copy,
  Check,
  Sparkles,
  Loader2,
  Upload,
  ShieldAlert,
  ArrowRightLeft,
  Search,
  Send,
  RefreshCw,
  Zap,
  RotateCw,
  Share2,
  Sliders,
  Compass,
  Car,
  Utensils,
  ShoppingBag,
  HeartPulse,
  Smartphone,
  ChevronDown,
  MapPin,
  X,
} from 'lucide-react';

export interface LanguageOption {
  code: string;
  speechCode: string;
  name: string;
  native: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'auto', speechCode: 'en-US', name: 'Auto Detect', native: 'Detect' },
  { code: 'en', speechCode: 'en-US', name: 'English', native: 'English' },
  { code: 'hi', speechCode: 'hi-IN', name: 'Hindi (हिंदी)', native: 'हिंदी' },
  { code: 'ta', speechCode: 'ta-IN', name: 'Tamil (தமிழ்)', native: 'தமிழ்' },
  { code: 'te', speechCode: 'te-IN', name: 'Telugu (తెలుగు)', native: 'తెలుగు' },
  { code: 'kn', speechCode: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)', native: 'ಕನ್ನಡ' },
  { code: 'ml', speechCode: 'ml-IN', name: 'Malayalam (മലയാളം)', native: 'മലയാളം' },
  { code: 'mr', speechCode: 'mr-IN', name: 'Marathi (मराठी)', native: 'मराठी' },
  { code: 'bn', speechCode: 'bn-IN', name: 'Bengali (বাংলা)', native: 'বাংলা' },
  { code: 'gu', speechCode: 'gu-IN', name: 'Gujarati (ગુજરાતી)', native: 'ગુજરાતી' },
  { code: 'es', speechCode: 'es-ES', name: 'Spanish (Español)', native: 'Español' },
  { code: 'fr', speechCode: 'fr-FR', name: 'French (Français)', native: 'Français' },
  { code: 'ja', speechCode: 'ja-JP', name: 'Japanese (日本語)', native: '日本語' },
  { code: 'de', speechCode: 'de-DE', name: 'German (Deutsch)', native: 'Deutsch' },
];

const CULTURAL_ETIQUETTE_TIPS: Record<string, { etiquette: string; gesture: string }> = {
  hi: { etiquette: "Add 'Ji' at the end of sentences for polite respect (e.g. 'Aap kaise hain Ji').", gesture: "Fold hands ('Namaste') when greeting elders or service providers." },
  ta: { etiquette: "Use 'Vanakkam' with a polite nod when speaking to locals.", gesture: "Hand over money, tickets, or cards using your right hand." },
  te: { etiquette: "Say 'Namaskaram' with a warm smile before asking questions.", gesture: "Polite head nod for agreement." },
  kn: { etiquette: "Say 'Namaskara' for greetings and 'Dhanyavadhagalu' for thank you.", gesture: "Use right hand for passing items." },
  fr: { etiquette: "Always begin conversation with 'Bonjour, S'il vous plaît' before asking questions.", gesture: "Maintain calm tone and polite eye contact." },
  es: { etiquette: "Greet with 'Hola, por favor' or 'Buenas tardes'.", gesture: "Warm handshake or friendly nod." },
  ja: { etiquette: "Slight bow when saying 'Arigatou' or 'Konnichiwa'.", gesture: "Use both hands to receive receipts, change, or business cards." },
};

const QUICK_VOICE_CATEGORIES = [
  {
    id: 'taxi',
    name: '🚕 Taxi / Auto Bargain',
    icon: Car,
    phrases: [
      { tourist: 'How much to go to the main city center?', local: 'सौ रुपये लगेंगे। (100 Rupees)' },
      { tourist: 'Please turn on the taxi meter.', local: 'मीटर चालू है। (Meter is running)' },
      { tourist: 'Please drop me right near the entrance gate.', local: 'गेट के सामने ही रोक दूंगा। (Will stop right at gate)' },
    ],
  },
  {
    id: 'food',
    name: '🍲 Food & Dietary Requirements',
    icon: Utensils,
    phrases: [
      { tourist: 'Is this food spicy or mild?', local: 'कम तीखा है। (Mild spicy)' },
      { tourist: 'I am pure vegetarian. Is this 100% veg?', local: 'हां, यह शुद्ध शाकाहारी है। (Yes, 100% vegetarian)' },
      { tourist: 'Can I get sealed bottled drinking water?', local: 'हां, पानी की बोतल उपलब्ध है। (Yes, bottled water available)' },
    ],
  },
  {
    id: 'bargain',
    name: '🛍️ Bargain & Payments',
    icon: ShoppingBag,
    phrases: [
      { tourist: 'What is the final best price you can offer?', local: 'पांच सौ रुपये अंतिम मूल्य। (500 final price)' },
      { tourist: 'Do you accept UPI, Google Pay, or QR code payment?', local: 'हां, क्यूआर कोड स्कैन करें। (Yes, scan QR code)' },
      { tourist: 'Can you please give me a printed receipt or bill?', local: 'पक्का बिल मिलेगा। (You will get receipt)' },
    ],
  },
  {
    id: 'help',
    name: '🚨 Medical & Emergency Help',
    icon: HeartPulse,
    phrases: [
      { tourist: 'Where is the nearest pharmacy or medical clinic?', local: 'सामने मेडिकल स्टोर है। (Pharmacy right ahead)' },
      { tourist: 'I need urgent medical assistance.', local: 'मैं आपकी मदद करता हूं। (I will help you)' },
      { tourist: 'Can you please help me call an ambulance or doctor?', local: 'अभी एम्बुलेंस बुलाते हैं। (Calling ambulance now)' },
    ],
  },
];

interface SearchableLanguageSelectProps {
  value: string;
  onChange: (code: string) => void;
  options: LanguageOption[];
  label: string;
  color?: 'cyan' | 'emerald';
  allowAuto?: boolean;
}

const SearchableLanguageSelect: React.FC<SearchableLanguageSelectProps> = ({
  value,
  onChange,
  options,
  label,
  color = 'emerald',
  allowAuto = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((l) => l.code === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((l) => {
    if (!allowAuto && l.code === 'auto') return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      l.name.toLowerCase().includes(q) ||
      l.native.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q)
    );
  });

  const activeColorClasses =
    color === 'cyan'
      ? 'border-cyan-500/60 bg-slate-900 text-cyan-300 ring-1 ring-cyan-500/30'
      : 'border-emerald-500/60 bg-slate-900 text-emerald-300 ring-1 ring-emerald-500/30';

  const badgeColorClasses =
    color === 'cyan'
      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

  return (
    <div className="relative flex-1 min-w-[210px]" ref={dropdownRef}>
      <label className="text-[11px] font-bold text-slate-400 mb-1 flex items-center justify-between">
        <span>{label}</span>
        {selectedOption && (
          <span className="text-[10px] text-slate-500 font-mono uppercase">
            {selectedOption.code}
          </span>
        )}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 border ${
          isOpen
            ? activeColorClasses
            : 'border-slate-800 text-slate-200 hover:border-slate-700'
        } text-xs font-bold transition-all shadow-inner`}
      >
        <div className="flex items-center space-x-2 truncate mr-2">
          <Globe className={`w-3.5 h-3.5 shrink-0 ${color === 'cyan' ? 'text-cyan-400' : 'text-emerald-400'}`} />
          <span className="truncate">{selectedOption?.name || 'Select Language'}</span>
          {selectedOption?.native && selectedOption.code !== 'auto' && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded border font-normal shrink-0 ${badgeColorClasses}`}>
              {selectedOption.native}
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-emerald-400' : 'text-slate-500'}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 space-y-2 min-w-[250px]"
          >
            {/* Search Input Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search language or script (e.g. Hindi, தமிழ், fr)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Language Options List */}
            <div className="max-h-56 overflow-y-auto space-y-1 custom-scrollbar pr-1">
              {filteredOptions.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500">
                  No matching language found for "{searchQuery}"
                </div>
              ) : (
                filteredOptions.map((lang) => {
                  const isSelected = lang.code === value;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        onChange(lang.code);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? color === 'cyan'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="truncate">{lang.name}</span>
                        {lang.native && lang.code !== 'auto' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400 font-normal">
                            {lang.native}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <Check className={`w-3.5 h-3.5 shrink-0 ${color === 'cyan' ? 'text-cyan-400' : 'text-emerald-400'}`} />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const MultilingualTranslatorHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'text' | 'voice' | 'camera' | 'phrasebook'>('text');

  // Text Translator State
  const [sourceLang, setSourceLang] = useState<string>('en');
  const [targetLang, setTargetLang] = useState<string>('hi');
  const [sourceText, setSourceText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [phoneticText, setPhoneticText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Translation Tone Style & Travel Setting Context State
  const [translationStyle, setTranslationStyle] = useState<'standard' | 'conversational'>('standard');
  const [destinationContext, setDestinationContext] = useState<string>('General Tourist');
  const [customDestination, setCustomDestination] = useState<string>('');

  // Two-way Conversation / Voice State
  const [touristMic, setTouristMic] = useState<boolean>(false);
  const [localMic, setLocalMic] = useState<boolean>(false);
  const [touristInputText, setTouristInputText] = useState<string>('');
  const [localInputText, setLocalInputText] = useState<string>('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [convoHistory, setConvoHistory] = useState<
    { speaker: 'tourist' | 'local'; text: string; translation: string; phonetic?: string; speechCode: string }[]
  >([]);

  // Camera OCR Menu State
  const [ocrImage, setOcrImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<{
    detectedLanguage: string;
    extractedText: string;
    englishTranslation: string;
    foodSafetyNote?: string;
  } | null>(null);
  const [isProcessingOcr, setIsProcessingOcr] = useState<boolean>(false);

  // Phrasebook State
  const [phraseSearch, setPhraseSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Voice Recording & Audio Capture State
  const [activeMediaRecorder, setActiveMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingSpeaker, setRecordingSpeaker] = useState<'tourist' | 'local' | null>(null);
  const [isProcessingAudio, setIsProcessingAudio] = useState<boolean>(false);
  const [isSpeakingOutLoud, setIsSpeakingOutLoud] = useState<boolean>(false);

  // Futuristic Voice Features State
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isFlipMode, setIsFlipMode] = useState<boolean>(false);
  const [isAutoHandsFree, setIsAutoHandsFree] = useState<boolean>(false);
  const [activeVoiceCategory, setActiveVoiceCategory] = useState<string>('taxi');
  const [copiedTranscript, setCopiedTranscript] = useState<boolean>(false);

  // Web Speech API Native Voice-to-Text State
  const [isListeningTextMic, setIsListeningTextMic] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isWebSpeechSupported, setIsWebSpeechSupported] = useState<boolean>(false);
  const [detectedSourceLang, setDetectedSourceLang] = useState<string | null>(null);

  // Tourist Communication Card Modal State
  const [showLocalCardModal, setShowLocalCardModal] = useState<boolean>(false);
  const [localReplyMessage, setLocalReplyMessage] = useState<string | null>(null);

  // Script & Unicode Language Detector Helper
  const detectLanguageFromScript = (text: string): string | null => {
    if (!text || !text.trim()) return null;
    if (/[\u0900-\u097F]/.test(text)) return 'Hindi (हिंदी)';
    if (/[\u0B80-\u0BFF]/.test(text)) return 'Tamil (தமிழ்)';
    if (/[\u0C00-\u0C7F]/.test(text)) return 'Telugu (తెలుగు)';
    if (/[\u0C80-\u0CFF]/.test(text)) return 'Kannada (ಕನ್ನಡ)';
    if (/[\u0D00-\u0D7F]/.test(text)) return 'Malayalam (മലയാളം)';
    if (/[\u0980-\u09FF]/.test(text)) return 'Bengali (বাংলা)';
    if (/[\u0A80-\u0AFF]/.test(text)) return 'Gujarati (ગુજરાતી)';
    if (/[\u3040-\u30FF\u4E00-\u9FAF]/.test(text)) return 'Japanese (日本語)';
    if (/[\u0400-\u04FF]/.test(text)) return 'Russian';
    if (/[\u0600-\u06FF]/.test(text)) return 'Urdu / Arabic';
    if (/^[a-zA-Z0-9\s.,!?'"-]+$/.test(text.trim())) return 'English / Latin Script';
    return null;
  };

  // Load browser voices & check Web Speech support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
      }
      const supported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      setIsWebSpeechSupported(supported);
    }
  }, []);

  // Update translation when language, style, or destination changes if text exists
  useEffect(() => {
    if (sourceText && sourceText.trim() && translatedText) {
      handleTranslateText();
    }
  }, [sourceLang, targetLang, translationStyle, destinationContext, customDestination]);

  // Text Translation Execution
  const handleTranslateText = async (customText?: string, overrideSrc?: string, overrideTgt?: string) => {
    const textToTranslate = customText !== undefined ? customText : sourceText;
    const sLang = overrideSrc || sourceLang;
    const tLang = overrideTgt || targetLang;

    if (!textToTranslate.trim()) return;

    setIsTranslating(true);
    setTranslatedText('');
    setPhoneticText('');

    if (sLang === 'auto') {
      const scriptDetected = detectLanguageFromScript(textToTranslate);
      if (scriptDetected) setDetectedSourceLang(scriptDetected);
    } else {
      setDetectedSourceLang(null);
    }

    try {
      const srcLangObj = LANGUAGES.find((l) => l.code === sLang);
      const tgtLangObj = LANGUAGES.find((l) => l.code === tLang);

      const activeDestination = customDestination.trim() || destinationContext;

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToTranslate,
          sourceLang: sLang,
          sourceLangName: sLang === 'auto' ? 'Auto Detect' : (srcLangObj?.name || 'English'),
          targetLang: tLang,
          targetLangName: tgtLangObj?.name || 'Hindi',
          mode: 'text',
          style: translationStyle,
          destination: activeDestination,
        }),
      });

      const data = await response.json();
      if (data && data.translation) {
        setTranslatedText(data.translation);
        setPhoneticText(data.phonetic || '');
        if (data.sourceDetected) {
          setDetectedSourceLang(data.sourceDetected);
        }
        return data.translation;
      }
    } catch (err) {
      console.warn('Translation API error:', err);
      setTranslatedText(`[Offline Mode]: ${textToTranslate}`);
    } finally {
      setIsTranslating(false);
    }
  };

  // Swap Languages
  const handleSwapLanguages = () => {
    const prevSource = sourceLang;
    const prevTarget = targetLang;
    const prevSourceText = sourceText;
    const prevTranslatedText = translatedText;

    const newSource = prevTarget === 'auto' ? 'en' : prevTarget;
    const newTarget = prevSource === 'auto' ? 'hi' : prevSource;

    setSourceLang(newSource);
    setTargetLang(newTarget);
    setSourceText(prevTranslatedText || '');
    setTranslatedText(prevSourceText || '');
    setPhoneticText('');

    if (prevTranslatedText && prevTranslatedText.trim()) {
      handleTranslateText(prevTranslatedText, newSource, newTarget);
    }
  };

  // Quick Switch Target Language
  const handleQuickSwitchTarget = (targetCode: string) => {
    setTargetLang(targetCode);
    if (sourceText && sourceText.trim()) {
      handleTranslateText(sourceText, sourceLang, targetCode);
    }
  };

  // Stop active speech playback
  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeakingOutLoud(false);
    }
  };

  // Text to Speech Synth via Native Web Speech API
  const speakText = (text: string, langCode?: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    if (!text || !text.trim()) return;

    try {
      // Toggle off active speech if already speaking
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      // Resume paused audio engine if stalled (Chrome / Safari bugfix)
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const targetCode = langCode || LANGUAGES.find((l) => l.code === targetLang)?.speechCode || 'hi-IN';
      // Clean bracketed labels if present
      const cleanText = text.replace(/^\[.*?\]:\s*/, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText || text);
      utterance.lang = targetCode;
      utterance.rate = speechRate || 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeakingOutLoud(true);
      utterance.onend = () => {
        setIsSpeakingOutLoud(false);
        if (isAutoHandsFree) {
          const lastSpeaker = convoHistory[convoHistory.length - 1]?.speaker || 'tourist';
          const nextSpeaker = lastSpeaker === 'tourist' ? 'local' : 'tourist';
          setTimeout(() => {
            startSpeechRecognition(nextSpeaker);
          }, 1200);
        }
      };
      utterance.onerror = (err) => {
        console.warn('SpeechSynthesis error:', err);
        setIsSpeakingOutLoud(false);
      };

      const doSpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const langPrefix = targetCode.split('-')[0].toLowerCase();
          const targetLower = targetCode.toLowerCase().replace('_', '-');

          // Multi-layer Voice Selection: Exact Code -> Language Prefix -> Voice Name Contains Language -> Fallback
          const bestVoice =
            voices.find((v) => v.lang.toLowerCase().replace('_', '-') === targetLower) ||
            voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix)) ||
            voices.find((v) => v.name.toLowerCase().includes(langPrefix)) ||
            voices.find((v) => v.default) ||
            voices[0];

          if (bestVoice) {
            utterance.voice = bestVoice;
          }
        }

        // Brief 50ms delay after cancel() prevents audio dropping in Chromium
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.resume();
            window.speechSynthesis.speak(utterance);
          }
        }, 50);
      };

      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) {
        const handleVoicesChanged = () => {
          doSpeak();
          window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        };
        window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
        setTimeout(doSpeak, 250);
      } else {
        doSpeak();
      }
    } catch (e) {
      console.warn('TTS playback error:', e);
      setIsSpeakingOutLoud(false);
    }
  };

  // Copy Full Voice Transcript
  const handleCopyTranscript = () => {
    if (convoHistory.length === 0) return;
    const tgtName = LANGUAGES.find((l) => l.code === targetLang)?.name || 'Local Language';
    const lines = [
      `=== Velora AI Voice Translation Transcript ===`,
      `Languages: English <-> ${tgtName}`,
      `Timestamp: ${new Date().toLocaleString()}`,
      `---------------------------------------------`,
      ...convoHistory.map(
        (item) => `${item.speaker === 'tourist' ? 'Tourist (English)' : `Local (${tgtName})`}: "${item.text}"\n   ↳ Translation: "${item.translation}"`
      ),
      `---------------------------------------------`,
      `Generated by Velora AI Multilingual Translator Hub`,
    ];
    navigator.clipboard.writeText(lines.join('\n\n'));
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2200);
  };

  // 2-Way Voice Conversation Handlers
  const handleVoiceTranslate = async (speaker: 'tourist' | 'local', rawText: string) => {
    if (!rawText.trim()) return;

    setVoiceError(null);
    const srcLang = speaker === 'tourist' ? 'en' : targetLang;
    const tgtLang = speaker === 'tourist' ? targetLang : 'en';

    const srcLangObj = LANGUAGES.find((l) => l.code === srcLang);
    const tgtLangObj = LANGUAGES.find((l) => l.code === tgtLang);
    const speechCode = tgtLangObj?.speechCode || (tgtLang === 'en' ? 'en-US' : 'hi-IN');

    try {
      const activeDestination = customDestination.trim() || destinationContext;
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: rawText,
          sourceLang: srcLang,
          sourceLangName: srcLangObj?.name || 'English',
          targetLang: tgtLang,
          targetLangName: tgtLangObj?.name || 'Local Language',
          mode: 'text',
          style: translationStyle,
          destination: activeDestination,
        }),
      });

      const data = await response.json();
      const trans = data.translation || rawText;
      const phonetic = data.phonetic || '';

      setConvoHistory((prev) => [
        ...prev,
        {
          speaker,
          text: rawText,
          translation: trans,
          phonetic: phonetic,
          speechCode: speechCode,
        },
      ]);

      if (speaker === 'tourist') setTouristInputText('');
      else setLocalInputText('');

      // Auto-speak translation out loud
      speakText(trans, speechCode);
    } catch (err) {
      console.warn('Voice translation error:', err);
      setVoiceError('Failed to translate conversation speech.');
    }
  };

  // Fallback MediaRecorder Audio Capture via getUserMedia
  const startMediaRecorderFallback = async (speaker: 'tourist' | 'local') => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setVoiceError('Microphone input is not available in this browser session. Please use text entry.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      recorder.onstop = async () => {
        setRecordingSpeaker(null);
        setActiveMediaRecorder(null);
        stream.getTracks().forEach((track) => track.stop());

        if (audioChunks.length === 0) return;

        const audioBlob = new Blob(audioChunks, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();

        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          setIsProcessingAudio(true);
          setVoiceError(null);

          try {
            const tgtLang = speaker === 'tourist' ? targetLang : 'en';
            const tgtLangObj = LANGUAGES.find((l) => l.code === tgtLang);
            const speechCode = tgtLangObj?.speechCode || (tgtLang === 'en' ? 'en-US' : 'hi-IN');

            const activeDestination = customDestination.trim() || destinationContext;
            const res = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                mode: 'audio',
                audioBase64: base64Audio,
                targetLang: tgtLang,
                targetLangName: tgtLangObj?.name || 'Local Language',
                style: translationStyle,
                destination: activeDestination,
              }),
            });

            const data = await res.json();
            const transcription = data.transcription || 'Spoken message';
            const translation = data.translation || transcription;
            const phonetic = data.phonetic || '';

            setConvoHistory((prev) => [
              ...prev,
              {
                speaker,
                text: transcription,
                translation,
                phonetic,
                speechCode: speechCode,
              },
            ]);

            speakText(translation, speechCode);
          } catch (err) {
            console.warn('Audio processing error:', err);
            setVoiceError('Failed to process recorded speech.');
          } finally {
            setIsProcessingAudio(false);
          }
        };

        reader.readAsDataURL(audioBlob);
      };

      recorder.start();
      setActiveMediaRecorder(recorder);
      setRecordingSpeaker(speaker);

      // Auto stop after 5 seconds
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, 5000);
    } catch (err: any) {
      console.warn('MediaRecorder permission error:', err);
      setRecordingSpeaker(null);
      setVoiceError('Microphone permission blocked or unavailable. Please use text entry or quick phrases below.');
    }
  };

  // Native Web Speech Voice-to-Text Recognition for Text Translator Tab
  const startTextVoiceRecognition = () => {
    setVoiceError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('Native Web Speech Recognition API is not supported in this browser. Please type or use quick phrases.');
      return;
    }

    if (isListeningTextMic) {
      setIsListeningTextMic(false);
      setInterimTranscript('');
      return;
    }

    try {
      const rec = new SpeechRecognition();
      const srcLangObj = LANGUAGES.find((l) => l.code === sourceLang);
      const speechCode = sourceLang === 'auto'
        ? (typeof navigator !== 'undefined' ? navigator.language : 'en-US') || 'en-US'
        : (srcLangObj?.speechCode || 'en-US');

      rec.lang = speechCode;
      rec.continuous = false;
      rec.interimResults = true;

      setIsListeningTextMic(true);
      setInterimTranscript('');

      rec.onresult = (event: any) => {
        let currentInterim = '';
        let finalResult = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalResult += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
          if (sourceLang === 'auto') {
            const detected = detectLanguageFromScript(currentInterim);
            if (detected) setDetectedSourceLang(detected);
          }
        }

        if (finalResult) {
          const newText = (sourceText ? `${sourceText} ${finalResult}` : finalResult).trim();
          setSourceText(newText);
          setInterimTranscript('');

          if (sourceLang === 'auto') {
            const detected = detectLanguageFromScript(finalResult);
            if (detected) setDetectedSourceLang(detected);
          }

          handleTranslateText(newText);
        }
      };

      rec.onerror = (e: any) => {
        console.warn('Text WebSpeech API error:', e);
        setIsListeningTextMic(false);
        setInterimTranscript('');
        if (e.error === 'not-allowed') {
          setVoiceError('Microphone permission blocked. Please allow mic access in your browser address bar.');
        } else if (e.error === 'no-speech') {
          setVoiceError('No speech detected. Please speak closer to your microphone.');
        }
      };

      rec.onend = () => {
        setIsListeningTextMic(false);
        setInterimTranscript('');
      };

      rec.start();
    } catch (err) {
      console.warn('Could not start Web Speech for Text Translator:', err);
      setIsListeningTextMic(false);
      setInterimTranscript('');
    }
  };

  // Primary Speech Trigger with WebSpeech API + MediaRecorder fallback
  const startSpeechRecognition = (speaker: 'tourist' | 'local') => {
    setVoiceError(null);

    // Stop active recording if already recording
    if (activeMediaRecorder && activeMediaRecorder.state === 'recording') {
      activeMediaRecorder.stop();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Direct MediaRecorder fallback
      startMediaRecorderFallback(speaker);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      const srcCode = speaker === 'tourist' ? 'en-US' : LANGUAGES.find((l) => l.code === targetLang)?.speechCode || 'hi-IN';
      rec.lang = srcCode;
      rec.continuous = false;
      rec.interimResults = true;

      if (speaker === 'tourist') setTouristMic(true);
      else setLocalMic(true);

      setInterimTranscript('');

      rec.onresult = async (event: any) => {
        let currentInterim = '';
        let finalResult = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalResult += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
        }

        if (finalResult) {
          setInterimTranscript('');
          await handleVoiceTranslate(speaker, finalResult);
          setTouristMic(false);
          setLocalMic(false);
        }
      };

      rec.onerror = (e: any) => {
        console.warn('WebSpeech API failed, trying MediaRecorder fallback:', e);
        setTouristMic(false);
        setLocalMic(false);
        setInterimTranscript('');
        startMediaRecorderFallback(speaker);
      };

      rec.onend = () => {
        setTouristMic(false);
        setLocalMic(false);
        setInterimTranscript('');
      };

      rec.start();
    } catch (err) {
      setTouristMic(false);
      setLocalMic(false);
      setInterimTranscript('');
      startMediaRecorderFallback(speaker);
    }
  };

  const stopAudioRecording = () => {
    if (activeMediaRecorder && activeMediaRecorder.state === 'recording') {
      activeMediaRecorder.stop();
    }
    setTouristMic(false);
    setLocalMic(false);
  };

  // Process OCR Menu Image Upload
  const handleOcrImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setOcrImage(base64);
      setIsProcessingOcr(true);
      setOcrResult(null);

      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            targetLang,
            targetLangName: LANGUAGES.find((l) => l.code === targetLang)?.name || 'English',
            mode: 'camera_ocr',
          }),
        });

        const data = await response.json();
        setOcrResult({
          detectedLanguage: data.detectedLanguage || 'Regional Menu Script',
          extractedText: data.extractedText || 'Extracted items',
          englishTranslation: data.englishTranslation || 'Translated items',
          foodSafetyNote: data.foodSafetyNote || 'Vegetarian / Hygienic preparation advice.',
        });
      } catch (err) {
        console.warn('OCR processing error:', err);
      } finally {
        setIsProcessingOcr(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Phrasebook Filtered
  const currentTargetLangObj = LANGUAGES.find((l) => l.code === targetLang) || LANGUAGES[1];
  const phraseList = INDIAN_LANGUAGE_PHRASES && INDIAN_LANGUAGE_PHRASES.length > 0 ? INDIAN_LANGUAGE_PHRASES : [];

  const filteredPhrases = phraseList.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.english.toLowerCase().includes(phraseSearch.toLowerCase()) ||
      p.hindi.toLowerCase().includes(phraseSearch.toLowerCase()) ||
      (p.phonetic && p.phonetic.toLowerCase().includes(phraseSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#D8F864]/20 text-[#D8F864] border border-[#D8F864]/30 uppercase tracking-widest flex items-center space-x-1 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#D8F864]" />
              <span>Velora AI Multilingual Suite</span>
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              13+ Indian & Global Languages • Gemini Vision OCR • Speech Synthesizer
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
            Break Language Barriers Instantly
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mt-1">
            Real-time AI translation for Indian regional dialects and global languages. Translate two-way spoken conversations, restaurant menus, signboards, or offline phrasebooks.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-955 p-1.5 rounded-2xl border border-slate-800 flex items-center space-x-1.5 text-xs shrink-0 overflow-x-auto max-w-full shadow-inner">
          <button
            onClick={() => setActiveTab('text')}
            className={`px-3.5 py-2.5 rounded-xl font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'text' ? 'bg-[#D8F864] text-slate-950 shadow-lg font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Text Translate</span>
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`px-3.5 py-2.5 rounded-xl font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'voice' ? 'bg-[#D8F864] text-slate-950 shadow-lg font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>2-Way Voice</span>
          </button>
          <button
            onClick={() => setActiveTab('camera')}
            className={`px-3.5 py-2.5 rounded-xl font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'camera' ? 'bg-[#D8F864] text-slate-950 shadow-lg font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Camera OCR</span>
          </button>
          <button
            onClick={() => setActiveTab('phrasebook')}
            className={`px-3.5 py-2.5 rounded-xl font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'phrasebook' ? 'bg-[#D8F864] text-slate-950 shadow-lg font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Phrasebook</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Text Translator */}
      {activeTab === 'text' && (
        <div className="space-y-4">
          {/* Language Selector Controls */}
          <div className="glass-card p-4.5 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SearchableLanguageSelect
                value={sourceLang}
                onChange={(code) => setSourceLang(code)}
                options={LANGUAGES}
                label="From Source Language:"
                color="cyan"
                allowAuto={true}
              />

              {/* Quick-Switch Swap Button */}
              <button
                onClick={handleSwapLanguages}
                title="Swap Source and Target Languages"
                className="mt-5 px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 flex items-center space-x-2 font-extrabold text-xs transition-all active:scale-95 shadow-md shrink-0"
              >
                <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                <span>Swap Languages ⇄</span>
              </button>

              <SearchableLanguageSelect
                value={targetLang}
                onChange={(code) => handleQuickSwitchTarget(code)}
                options={LANGUAGES}
                label="To Target Local Language:"
                color="emerald"
                allowAuto={false}
              />
            </div>

            {/* Instant Target Language Switch Chips */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">
                Instant Target Switch:
              </span>
              {[
                { code: 'hi', label: 'Hindi (हिंदी)' },
                { code: 'ta', label: 'Tamil (தமிழ்)' },
                { code: 'te', label: 'Telugu (తెలుగు)' },
                { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
                { code: 'fr', label: 'French (Français)' },
                { code: 'es', label: 'Spanish (Español)' },
                { code: 'ja', label: 'Japanese (日本語)' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleQuickSwitchTarget(lang.code)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all border ${
                    targetLang === lang.code
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-extrabold'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Translation Tone Style & Destination Settings Card */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3 shadow-lg bg-slate-900/60 backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 font-bold shrink-0">
                  <Sliders className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-white flex items-center space-x-1.5">
                    <span>AI Translation Style & Tone</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30">
                      {translationStyle === 'conversational' ? '💬 Conversational' : '👔 Standard'}
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Adjusts AI prompt formality based on whether you are chatting with locals or speaking formally
                  </p>
                </div>
              </div>

              {/* Segmented Style Switcher Toggle */}
              <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 space-x-1">
                <button
                  type="button"
                  onClick={() => setTranslationStyle('standard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center space-x-1.5 ${
                    translationStyle === 'standard'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md scale-102'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>👔 Standard (Formal)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTranslationStyle('conversational')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center space-x-1.5 ${
                    translationStyle === 'conversational'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md scale-102'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>💬 Conversational (Casual)</span>
                </button>
              </div>
            </div>

            {/* Active Style Description Banner */}
            <div
              className={`p-2.5 rounded-xl border text-xs flex items-start space-x-2 transition-all ${
                translationStyle === 'conversational'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                  : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div className="space-y-0.5">
                <p className="font-bold">
                  {translationStyle === 'conversational'
                    ? 'Conversational (Casual) Mode Active:'
                    : 'Standard (Formal) Mode Active:'}
                </p>
                <p className="text-[11px] opacity-90">
                  {translationStyle === 'conversational'
                    ? 'Generates friendly local idioms, natural street slang, and relaxed everyday phrasing ideal for markets, cab drivers, street food, and chatting with local residents.'
                    : 'Generates polite grammar, respectful honorifics, and clear formal phrasing ideal for hotels, airports, customs, front desk inquiries, and official paperwork.'}
                </p>
              </div>
            </div>

            {/* Destination / Setting Context Selector */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <label className="text-[11px] font-extrabold text-slate-300 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Select Destination / Setting Context:</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Active Setting: <strong className="text-cyan-300">{customDestination.trim() || destinationContext}</strong>
                </span>
              </div>

              {/* Destination Preset Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { label: '🛒 Street Market & Bargaining', val: 'Street Market & Bargaining' },
                  { label: '🚖 Taxi & Transit', val: 'Taxi & Transit' },
                  { label: '🍽️ Restaurant & Dining', val: 'Restaurant & Dining' },
                  { label: '🏨 Hotel & Hospitality', val: 'Hotel & Hospitality' },
                  { label: '🛃 Customs & Airport', val: 'Customs & Airport' },
                  { label: '🌍 General Tourist', val: 'General Tourist' },
                ].map((dest) => (
                  <button
                    key={dest.val}
                    type="button"
                    onClick={() => {
                      setDestinationContext(dest.val);
                      setCustomDestination('');
                    }}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-xl transition-all border ${
                      destinationContext === dest.val && !customDestination.trim()
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-md'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                  >
                    {dest.label}
                  </button>
                ))}
              </div>

              {/* Optional Custom Destination Box */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="text"
                  value={customDestination}
                  onChange={(e) => setCustomDestination(e.target.value)}
                  placeholder="Or type custom destination e.g., 'Kyoto Ramen Shop', 'Jaipur Souvenir Market'..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner"
                />
                {customDestination && (
                  <button
                    type="button"
                    onClick={() => setCustomDestination('')}
                    className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs"
                    title="Clear custom location"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Card */}
            <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                  <span>Input ({sourceLang === 'auto' ? 'Auto Detect' : LANGUAGES.find((l) => l.code === sourceLang)?.name})</span>
                  {sourceLang === 'auto' && detectedSourceLang && (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30 flex items-center space-x-1 animate-pulse">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>Detected: {detectedSourceLang}</span>
                    </span>
                  )}
                  {isWebSpeechSupported && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20">
                      Web Speech Active ⚡
                    </span>
                  )}
                </span>
                <button
                  onClick={() => setSourceText('')}
                  className="text-[10px] text-slate-500 hover:text-slate-300"
                >
                  Clear Text
                </button>
              </div>

              {/* Active Voice Recognition Banner for Text Tab */}
              {(isListeningTextMic || interimTranscript) && (
                <div className="p-3 bg-cyan-950/80 border border-cyan-500/50 rounded-2xl flex items-center justify-between text-xs text-cyan-200 shadow-md backdrop-blur-md animate-pulse">
                  <div className="flex items-center space-x-2.5">
                    <Mic className="w-4 h-4 text-cyan-400 animate-bounce shrink-0" />
                    <div>
                      <p className="font-extrabold text-[11px]">
                        {sourceLang === 'auto'
                          ? 'Listening... Web Speech Auto-Detecting Spoken Language!'
                          : `Listening (${LANGUAGES.find((l) => l.code === sourceLang)?.name || 'English'})... Speak now!`}
                      </p>
                      {interimTranscript && (
                        <p className="text-[11px] text-cyan-300 italic font-mono">
                          "{interimTranscript}"
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsListeningTextMic(false);
                      setInterimTranscript('');
                    }}
                    className="text-[10px] font-bold px-2 py-1 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg border border-red-500/40"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <textarea
                rows={4}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleTranslateText();
                  }
                }}
                placeholder="Type or speak any text to translate (e.g., 'Where can I buy entry tickets for the fort?')..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-cyan-500 shadow-inner resize-none"
              />

              {/* Quick Sample Travel Phrases */}
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Try quick travel phrases:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Where is the nearest railway station?',
                    'How much does a taxi to the airport cost?',
                    'Is this dish vegetarian?',
                    'Can you help me find my hotel?',
                    'Thank you very much!',
                  ].map((phrase) => (
                    <button
                      key={phrase}
                      onClick={() => {
                        setSourceText(phrase);
                        handleTranslateText(phrase);
                      }}
                      className="text-[10px] bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-800/80 transition-colors"
                    >
                      "{phrase}"
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      speakText(sourceText, LANGUAGES.find((l) => l.code === sourceLang)?.speechCode || 'en-US')
                    }
                    disabled={!sourceText.trim()}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs flex items-center space-x-1.5 border border-slate-800 disabled:opacity-40"
                  >
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    <span>Listen Source</span>
                  </button>

                  <button
                    onClick={startTextVoiceRecognition}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 border transition-all ${
                      isListeningTextMic
                        ? 'bg-red-500/20 text-red-300 border-red-500/50 shadow-md animate-pulse'
                        : sourceLang === 'auto'
                        ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40 shadow-sm'
                        : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    }`}
                    title="Speak text out loud using native browser Web Speech API with Auto Language Recognition"
                  >
                    <Mic className={`w-4 h-4 ${isListeningTextMic ? 'text-red-400 animate-bounce' : sourceLang === 'auto' ? 'text-amber-400' : 'text-cyan-400'}`} />
                    <span>
                      {isListeningTextMic
                        ? 'Listening...'
                        : sourceLang === 'auto'
                        ? '✨ Auto-Detect Voice Input (Web Speech)'
                        : 'Voice Input (Web Speech)'}
                    </span>
                  </button>
                </div>

                <button
                  onClick={() => handleTranslateText()}
                  disabled={isTranslating || !sourceText.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center space-x-2 disabled:opacity-50"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Translating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Translate Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Translation Result Card */}
            <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  Translation ({LANGUAGES.find((l) => l.code === targetLang)?.name})
                </label>
                <span className="text-[10px] text-emerald-400 font-mono">Velora Neural AI</span>
              </div>

              <div className="min-h-[135px] bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                {translatedText ? (
                  <>
                    <p className="text-base font-extrabold text-emerald-300">{translatedText}</p>
                    {phoneticText && (
                      <p className="text-xs font-mono text-slate-400 italic">Phonetic: "{phoneticText}"</p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Translation result will appear here with phonetic pronunciation and audio speech synthesis.
                  </p>
                )}
              </div>

              {translatedText && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <button
                    onClick={() => {
                      if (isSpeakingOutLoud) {
                        stopSpeaking();
                      } else {
                        speakText(translatedText, LANGUAGES.find((l) => l.code === targetLang)?.speechCode || 'hi-IN');
                      }
                    }}
                    className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 border transition-all ${
                      isSpeakingOutLoud
                        ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                        : 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border-slate-800'
                    }`}
                  >
                    {isSpeakingOutLoud ? (
                      <>
                        <VolumeX className="w-4 h-4 text-red-400" />
                        <span>Stop Speech</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-emerald-400" />
                        <span>Speak Aloud</span>
                      </>
                    )}
                  </button>

                  {/* Speech Rate Controls */}
                  <div className="flex items-center space-x-1 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase mr-1">Speed:</span>
                    {[0.8, 1.0, 1.25].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setSpeechRate(rate)}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-all ${
                          speechRate === rate
                            ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 bg-slate-900'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(translatedText);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs flex items-center space-x-1.5 border border-slate-800"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied' : 'Copy Text'}</span>
                  </button>

                  {/* High-Contrast "Show Local Person" Button */}
                  <button
                    onClick={() => setShowLocalCardModal(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center space-x-2 shadow-lg transition-all active:scale-95"
                    title="Opens a high-contrast large display card so you can show your phone directly to a local person"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Show Local Screen 📱</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 2-Way Voice Conversation */}
      {activeTab === 'voice' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
          {/* Header & Modes */}
          <div className="text-center max-w-lg mx-auto space-y-1">
            <h3 className="text-base font-extrabold text-white flex items-center justify-center space-x-2">
              <Mic className="w-5 h-5 text-cyan-400 animate-pulse" />
              <span>Two-Way Voice Conversation Assistant</span>
            </h3>
            <p className="text-xs text-slate-400">
              Speak or tap quick phrases in English or local language. Velora AI transcribes, translates, and speaks out loud.
            </p>
          </div>

          {/* Futuristic Toolbar Controls: Table Dual View, Hands-Free Auto Relay, Speech Speed */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              {/* Flip Mode Button */}
              <button
                onClick={() => setIsFlipMode(!isFlipMode)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-2 transition-all ${
                  isFlipMode
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
                title="Flips the Local Speaker UI 180° so two people sitting across a table can both read comfortably"
              >
                <RotateCw className={`w-3.5 h-3.5 text-amber-400 ${isFlipMode ? 'rotate-180' : ''}`} />
                <span>{isFlipMode ? 'Table Face-to-Face Mode ON (180° Flipped)' : 'Enable Table Dual View (Flip 180°)'}</span>
              </button>

              {/* Auto Hands-Free Relay Toggle */}
              <button
                onClick={() => setIsAutoHandsFree(!isAutoHandsFree)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-2 transition-all ${
                  isAutoHandsFree
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
                title="Automatically starts listening for the opposite speaker after AI finishes speaking"
              >
                <Zap className={`w-3.5 h-3.5 ${isAutoHandsFree ? 'text-cyan-400 animate-bounce' : 'text-slate-400'}`} />
                <span>{isAutoHandsFree ? 'Auto Relay Active ⚡' : 'Auto Hands-Free Relay'}</span>
              </button>

              {/* Speech Speed Control */}
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold px-1.5 flex items-center space-x-1">
                  <Sliders className="w-3 h-3 text-emerald-400" />
                  <span>Speed:</span>
                </span>
                {[0.75, 1.0, 1.25].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setSpeechRate(rate)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-colors ${
                      speechRate === rate
                        ? 'bg-emerald-500 text-slate-950 font-extrabold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Target Language Quick Switch Bar */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <SearchableLanguageSelect
                value={targetLang}
                onChange={(code) => handleQuickSwitchTarget(code)}
                options={LANGUAGES}
                label="Search & Select Target Local Language:"
                color="emerald"
                allowAuto={false}
              />
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">Quick Switch:</span>
                {[
                  { code: 'hi', label: 'Hindi' },
                  { code: 'ta', label: 'Tamil' },
                  { code: 'te', label: 'Telugu' },
                  { code: 'kn', label: 'Kannada' },
                  { code: 'fr', label: 'French' },
                  { code: 'es', label: 'Spanish' },
                  { code: 'ja', label: 'Japanese' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleQuickSwitchTarget(lang.code)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all border ${
                      targetLang === lang.code
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-sm'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cultural Etiquette Tip Card */}
          {CULTURAL_ETIQUETTE_TIPS[targetLang] && (
            <div className="p-3 bg-indigo-950/40 border border-indigo-800/50 rounded-2xl flex items-start space-x-3 text-xs text-indigo-200">
              <Compass className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-indigo-300">
                  Cultural Etiquette Tip ({LANGUAGES.find((l) => l.code === targetLang)?.name}):
                </p>
                <p className="text-[11px] text-indigo-200/90">
                  {CULTURAL_ETIQUETTE_TIPS[targetLang].etiquette}
                </p>
                <p className="text-[10px] text-indigo-400 italic">
                  Gesture: {CULTURAL_ETIQUETTE_TIPS[targetLang].gesture}
                </p>
              </div>
            </div>
          )}

          {/* Active Audio / Speech Waveform Visualizer Banner */}
          {(isProcessingAudio || isSpeakingOutLoud || recordingSpeaker || touristMic || localMic) && (
            <div className="p-3.5 bg-cyan-950/80 border border-cyan-500/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-cyan-200 shadow-lg backdrop-blur-md">
              <div className="flex items-center space-x-3">
                <div className="relative flex h-3.5 w-3.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
                </div>
                <div className="space-y-0.5">
                  <p className="font-extrabold flex items-center space-x-2">
                    <span>
                      {isProcessingAudio
                        ? 'Velora Neural Engine Processing Audio Speech...'
                        : isSpeakingOutLoud
                        ? 'Speaking Translation Aloud...'
                        : recordingSpeaker === 'tourist' || touristMic
                        ? 'Listening to Tourist (English)... Speak now!'
                        : `Listening to Local (${LANGUAGES.find((l) => l.code === targetLang)?.name})... Speak now!`}
                    </span>
                    {isWebSpeechSupported && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                        Native WebSpeech
                      </span>
                    )}
                  </p>
                  {interimTranscript && (
                    <p className="text-[11px] text-cyan-300 italic font-mono">
                      Live Speech: "{interimTranscript}"
                    </p>
                  )}
                </div>
              </div>

              {/* Animated Waveform Equalizer Bars */}
              <div className="flex items-center space-x-1 h-5 shrink-0">
                {[0.4, 0.9, 0.3, 1.0, 0.6, 0.8, 0.5, 0.9, 0.4].map((scale, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [`${scale * 4}px`, `${scale * 18}px`, `${scale * 4}px`] }}
                    transition={{ repeat: Infinity, duration: 0.35 + i * 0.06, ease: 'easeInOut' }}
                    className="w-1 bg-cyan-400 rounded-full"
                  />
                ))}
              </div>

              {(recordingSpeaker || touristMic || localMic) && (
                <button
                  onClick={stopAudioRecording}
                  className="px-3 py-1 bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-[10px] rounded-xl shadow-md transition-all shrink-0"
                >
                  Stop Recording
                </button>
              )}
            </div>
          )}

          {voiceError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs text-center font-medium flex items-center justify-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{voiceError}</span>
            </div>
          )}

          {/* Interactive Speaker Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tourist Speaker Box */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-3.5 shadow-md">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                Tourist (English)
              </span>

              <button
                onClick={() => startSpeechRecognition('tourist')}
                className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center transition-all ${
                  touristMic || recordingSpeaker === 'tourist'
                    ? 'bg-rose-600 text-white animate-bounce shadow-lg shadow-rose-500/50'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                }`}
              >
                <Mic className="w-7 h-7" />
              </button>
              <p className="text-[11px] text-slate-400 font-medium">
                {touristMic || recordingSpeaker === 'tourist' ? 'Recording English... Tap to Stop' : 'Tap Mic to Record Speech'}
              </p>

              <div className="flex items-center space-x-1.5 pt-2 border-t border-slate-800/80">
                <input
                  type="text"
                  placeholder="Or type English phrase..."
                  value={touristInputText}
                  onChange={(e) => setTouristInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVoiceTranslate('tourist', touristInputText)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => handleVoiceTranslate('tourist', touristInputText)}
                  disabled={!touristInputText.trim()}
                  className="p-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl shrink-0 disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Local Speaker Box (Supports 180° Flip for Table Face-to-Face Mode) */}
            <div
              className={`p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-3.5 shadow-md transition-transform duration-500 ${
                isFlipMode ? 'rotate-180 border-amber-500/40 bg-slate-950' : ''
              }`}
            >
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                Local ({LANGUAGES.find((l) => l.code === targetLang)?.name}) {isFlipMode ? '(180° Flipped)' : ''}
              </span>

              <button
                onClick={() => startSpeechRecognition('local')}
                className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center transition-all ${
                  localMic || recordingSpeaker === 'local'
                    ? 'bg-rose-600 text-white animate-bounce shadow-lg shadow-rose-500/50'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                }`}
              >
                <Mic className="w-7 h-7" />
              </button>
              <p className="text-[11px] text-slate-400 font-medium">
                {localMic || recordingSpeaker === 'local'
                  ? `Recording ${LANGUAGES.find((l) => l.code === targetLang)?.native}... Tap to Stop`
                  : `Tap Mic to Record ${LANGUAGES.find((l) => l.code === targetLang)?.native}`}
              </p>

              <div className="flex items-center space-x-1.5 pt-2 border-t border-slate-800/80">
                <input
                  type="text"
                  placeholder={`Or type in ${LANGUAGES.find((l) => l.code === targetLang)?.native}...`}
                  value={localInputText}
                  onChange={(e) => setLocalInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVoiceTranslate('local', localInputText)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleVoiceTranslate('local', localInputText)}
                  disabled={!localInputText.trim()}
                  className="p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl shrink-0 disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Voice Scenarios Drawer */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Quick Scenario Triggers</span>
              </h4>
            </div>

            {/* Scenario Category Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_VOICE_CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveVoiceCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all border ${
                      activeVoiceCategory === cat.id
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-extrabold'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Scenario Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
              {QUICK_VOICE_CATEGORIES.find((c) => c.id === activeVoiceCategory)?.phrases.map((phrase, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 hover:border-slate-700 transition-colors"
                >
                  <p className="text-xs font-bold text-white">"{phrase.tourist}"</p>
                  <p className="text-[11px] text-emerald-300 italic font-medium">"{phrase.local}"</p>
                  <div className="flex items-center space-x-2 pt-1 border-t border-slate-900">
                    <button
                      onClick={() => handleVoiceTranslate('tourist', phrase.tourist)}
                      className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg text-[10px] font-bold border border-cyan-500/30 flex items-center space-x-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Speak Tourist</span>
                    </button>
                    <button
                      onClick={() => handleVoiceTranslate('local', phrase.local)}
                      className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-[10px] font-bold border border-emerald-500/30 flex items-center space-x-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Speak Local</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversation History Log with Export & Copy */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                <span>Live Conversation Log</span>
                {convoHistory.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                    {convoHistory.length} messages
                  </span>
                )}
              </h4>

              {convoHistory.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyTranscript}
                    className="text-[10px] bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 px-2.5 py-1 rounded-xl flex items-center space-x-1 font-bold transition-colors"
                  >
                    {copiedTranscript ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Share2 className="w-3 h-3 text-cyan-400" />
                    )}
                    <span>{copiedTranscript ? 'Copied Transcript!' : 'Export / Copy Transcript'}</span>
                  </button>

                  <button
                    onClick={() => setConvoHistory([])}
                    className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center space-x-1 px-2 py-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
              )}
            </div>

            {convoHistory.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-6 bg-slate-950/50 rounded-2xl border border-slate-900">
                No conversation recorded yet. Tap a microphone button, choose a quick scenario above, or type a message to start speaking.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {convoHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border text-xs space-y-1.5 shadow-sm ${
                      item.speaker === 'tourist'
                        ? 'bg-cyan-950/40 border-cyan-800/60 ml-4'
                        : 'bg-emerald-950/40 border-emerald-800/60 mr-4'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                      <span>
                        {item.speaker === 'tourist'
                          ? 'Tourist (English)'
                          : `Local (${LANGUAGES.find((l) => l.code === targetLang)?.name || 'Local'})`}
                      </span>
                      <button
                        onClick={() => speakText(item.translation, item.speechCode)}
                        className="text-cyan-400 hover:text-white p-1 flex items-center space-x-1"
                        title="Replay Audio"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="text-[9px]">Replay</span>
                      </button>
                    </div>
                    <p className="text-white font-medium">"{item.text}"</p>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <p className="text-emerald-300 font-extrabold text-xs">
                        ↳ Translation: {item.translation}
                      </p>
                      {item.phonetic && (
                        <p className="text-[11px] font-mono text-slate-400 italic">
                          Phonetic: "{item.phonetic}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Camera OCR Menu/Signboard Translator */}
      {activeTab === 'camera' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
          <div className="text-center max-w-lg mx-auto space-y-1">
            <h3 className="text-base font-extrabold text-white">Camera OCR Menu & Signboard Translator</h3>
            <p className="text-xs text-slate-400">
              Upload a photo of a restaurant menu, signboard, or monument plaque to translate into English with prices & food safety notes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Image Upload Drop Area */}
            <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/60 rounded-3xl p-6 text-center space-y-3 bg-slate-950/60 transition-all">
              {ocrImage ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 max-h-64 mx-auto">
                  <img src={ocrImage} alt="Uploaded Menu" className="w-full object-cover" />
                  <button
                    onClick={() => {
                      setOcrImage(null);
                      setOcrResult(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-slate-950/80 text-white rounded-full text-xs hover:bg-rose-600 shadow"
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block space-y-3 py-6">
                  <Upload className="w-10 h-10 text-cyan-400 mx-auto animate-bounce" />
                  <span className="text-xs font-bold text-white block">Upload Menu or Signboard Image</span>
                  <span className="text-[10px] text-slate-400 block">Supports PNG, JPG or WEBP photos</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleOcrImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* OCR Translation Result */}
            <div className="space-y-3">
              {isProcessingOcr ? (
                <div className="p-8 text-center space-y-3 bg-slate-900 border border-slate-800 rounded-2xl">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-white">Gemini Vision OCR analyzing menu & signboard text...</p>
                </div>
              ) : ocrResult ? (
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3.5 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      Detected Script: {ocrResult.detectedLanguage}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Gemini Vision AI</span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-400">Original Text Extracted:</h5>
                    <p className="text-xs text-slate-200 font-mono whitespace-pre-line bg-slate-950 p-3 rounded-xl border border-slate-800 mt-1">
                      {ocrResult.extractedText}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-emerald-400">English Translation & Price Equivalents:</h5>
                    <p className="text-xs text-white font-medium whitespace-pre-line bg-emerald-950/30 p-3 rounded-xl border border-emerald-800/40 mt-1">
                      {ocrResult.englishTranslation}
                    </p>
                  </div>

                  {ocrResult.foodSafetyNote && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-[11px] flex items-center space-x-2">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>{ocrResult.foodSafetyNote}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center border border-slate-800/80 rounded-2xl text-slate-500 text-xs">
                  Upload a photo to see Gemini Vision text extraction and translations.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Offline Phrasebook */}
      {activeTab === 'phrasebook' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search travel phrasebook..."
                value={phraseSearch}
                onChange={(e) => setPhraseSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Target Language Dropdown for Phrasebook */}
            <div className="flex items-center space-x-2 shrink-0">
              <label className="text-xs text-slate-400 font-bold">Target Language:</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-emerald-400 font-bold focus:outline-none"
              >
                {LANGUAGES.filter((l) => l.code !== 'en').map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar text-xs pb-1">
            {['All', 'Emergency', 'Medical', 'Autos & Bargaining', 'Dining & Food', 'Directions'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Phrase Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredPhrases.map((phrase) => {
              const langKeyMap: Record<string, string> = {
                hi: 'Hindi',
                ta: 'Tamil',
                te: 'Telugu',
                kn: 'Kannada',
                bn: 'Bengali',
                mr: 'Marathi',
                gu: 'Gujarati',
                ml: 'Malayalam',
              };

              const matchedLangKey = langKeyMap[targetLang] || 'Hindi';
              const targetTransObj = (phrase.translations && phrase.translations[matchedLangKey]) || {
                text: phrase.hindi || phrase.english,
                phonetic: phrase.phonetic || '',
              };

              return (
                <div key={phrase.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-lg">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-cyan-400 border border-slate-700">
                      {phrase.category}
                    </span>
                    <button
                      onClick={() =>
                        speakText(
                          targetTransObj.text,
                          LANGUAGES.find((l) => l.code === targetLang)?.speechCode || 'hi-IN'
                        )
                      }
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                    </button>
                  </div>

                  <p className="text-xs font-bold text-white">"{phrase.english}"</p>
                  <p className="text-sm font-extrabold text-emerald-300">{targetTransObj.text}</p>
                  {targetTransObj.phonetic && (
                    <p className="text-[11px] text-slate-400 font-mono italic">
                      Pronunciation: {targetTransObj.phonetic}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Show to Local Person - High Contrast Screen Modal */}
      <AnimatePresence>
        {showLocalCardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2">
                  <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-black">
                    <Smartphone className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Show This Screen To Local Person</h3>
                    <p className="text-[11px] text-slate-400">
                      Language: <span className="text-emerald-400 font-bold">{LANGUAGES.find((l) => l.code === targetLang)?.name}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowLocalCardModal(false);
                    setLocalReplyMessage(null);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Giant High-Contrast Display Card */}
              <div className="bg-slate-950 border-2 border-emerald-500/40 rounded-2xl p-6 space-y-4 text-center shadow-inner">
                <p className="text-2xl sm:text-3xl font-black text-emerald-300 leading-snug tracking-wide">
                  {translatedText || 'कपड़े खरीदने की जगह कहां है?'}
                </p>
                {phoneticText && (
                  <p className="text-sm font-mono text-cyan-300 italic bg-cyan-950/40 py-1.5 px-3 rounded-xl border border-cyan-500/30 inline-block">
                    🗣️ "{phoneticText}"
                  </p>
                )}
                <div className="pt-2 border-t border-slate-800/80">
                  <p className="text-xs text-slate-400 italic">
                    Original Message: <span className="text-slate-200 font-bold">"{sourceText || 'I need to buy dresses'}"</span>
                  </p>
                </div>
              </div>

              {/* Big Audio Playback Button */}
              <button
                onClick={() =>
                  speakText(
                    translatedText,
                    LANGUAGES.find((l) => l.code === targetLang)?.speechCode || 'hi-IN'
                  )
                }
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl flex items-center justify-center space-x-2 active:scale-98 transition-all"
              >
                <Volume2 className="w-5 h-5" />
                <span>Play Local Audio Out Loud 🔊</span>
              </button>

              {/* Local One-Tap Response Section */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <p className="text-xs font-extrabold text-amber-400 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>Ask Local to Tap Response (Direct Reply):</span>
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: '👍 Yes / हाँ', english: 'Yes, I understand / Yes' },
                    { label: '👎 No / नहीं', english: 'No, not available / No' },
                    { label: '💵 Price? / कितना?', english: 'How much does it cost?' },
                    { label: '👈 Go Left / बाएँ', english: 'Go to the left' },
                    { label: '👉 Go Right / दाएँ', english: 'Go to the right' },
                    { label: '📍 Straight / सीधा', english: 'Go straight ahead' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setLocalReplyMessage(item.english);
                        speakText(item.english, 'en-US');
                      }}
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-emerald-300 hover:text-white border border-slate-700 hover:border-emerald-500/50 text-xs font-bold transition-all text-center active:scale-95"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {localReplyMessage && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-center space-y-1 animate-fadeIn">
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Local Person Responded:</p>
                    <p className="text-sm font-extrabold text-white">"{localReplyMessage}"</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
