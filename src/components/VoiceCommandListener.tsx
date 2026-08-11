import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Radio,
  Sparkles,
  ShieldAlert,
  Volume2,
  X,
  HelpCircle,
  CheckCircle2,
  Command,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { NavTabType } from './Navbar';
import { triggerSystemPushNotification } from './ToastNotification';

interface VoiceCommandListenerProps {
  activeTab: NavTabType;
  onNavigateTab: (tab: NavTabType) => void;
}

export const VoiceCommandListener: React.FC<VoiceCommandListenerProps> = ({
  activeTab,
  onNavigateTab
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [lastCommand, setLastCommand] = useState<string>('');
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [showCheatSheet, setShowCheatSheet] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  isListeningRef.current = isListening;

  // Speak voice audio confirmation using SpeechSynthesis
  const speakConfirmation = useCallback((text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // Stop any pending speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.9;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('SpeechSynthesis error:', err);
      }
    }
  }, []);

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setPermissionError(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          currentTranscript += text;
        }

        const cleanedText = currentTranscript.trim();
        setTranscript(cleanedText);

        if (cleanedText) {
          processVoiceCommand(cleanedText.toLowerCase());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setPermissionError('Microphone permission was denied by browser settings.');
          setIsListening(false);
        } else if (event.error === 'no-speech') {
          // Normal timeout, ignore
        }
      };

      recognition.onend = () => {
        // Auto-restart if user still wants it active
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch (err) {
            // Ignore restart collisions
          }
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Failed to instantiate SpeechRecognition:', err);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Process incoming spoken command
  const processVoiceCommand = useCallback(
    (speechText: string) => {
      // Emergency / SOS phrase matching
      const sosKeywords = [
        'help',
        'emergency',
        'sos',
        'danger',
        'police',
        'distress',
        'call for help',
        'save me',
        'trigger sos'
      ];

      const isSosMatch = sosKeywords.some((keyword) => speechText.includes(keyword));

      if (isSosMatch) {
        setLastCommand('🚨 EMERGENCY SOS ACTIVATED');
        setTranscript('');
        onNavigateTab('emergency');

        // Dispatch global SOS custom event
        window.dispatchEvent(new CustomEvent('velora_trigger_sos'));

        speakConfirmation('Emergency SOS distress signal triggered! Notifying emergency lines.');
        triggerSystemPushNotification(
          '🚨 HANDS-FREE VOICE SOS TRIGGERED',
          'Voice command detected distress. Opening Emergency SOS Hub & Broadcasting Alert.'
        );
        return;
      }

      // Navigation phrase matching
      const navMappings: { keywords: string[]; tab: NavTabType; label: string }[] = [
        {
          keywords: ['dashboard', 'open dashboard', 'go to dashboard', 'home'],
          tab: 'dashboard',
          label: 'Dashboard'
        },
        {
          keywords: ['explore', 'open explore', 'go to explore', 'simulator'],
          tab: 'simulator',
          label: 'Explore Destinations'
        },
        {
          keywords: ['map', 'open map', 'go to map', 'navigation', 'show map'],
          tab: 'navigation',
          label: 'Interactive Map'
        },
        {
          keywords: ['plan', 'plan trip', 'open planner', 'ai planner', 'trip planner'],
          tab: 'engine',
          label: 'AI Trip Planner'
        },
        {
          keywords: ['atlas', 'states', 'indian states', 'open atlas', 'guide'],
          tab: 'states',
          label: 'Indian States Atlas'
        },
        {
          keywords: ['translator', 'open translator', 'translate', 'languages'],
          tab: 'translator',
          label: 'Multilingual Translator'
        },
        {
          keywords: ['gallery', 'editorial gallery', 'images', 'photos'],
          tab: 'images',
          label: 'Editorial Gallery'
        },
        {
          keywords: ['saved', 'saved trips', 'my trips', 'travel dna'],
          tab: 'saved',
          label: 'Saved Trips'
        },
        {
          keywords: ['copilot', 'ask copilot', 'open copilot', 'velora'],
          tab: 'copilot',
          label: 'Velora AI Copilot'
        },
        {
          keywords: ['tools', 'traveler tools', 'utilities'],
          tab: 'tools',
          label: 'Traveler Utilities'
        },
        {
          keywords: ['security', 'privacy', 'settings', 'data shield'],
          tab: 'security',
          label: 'Security & Privacy'
        },
        {
          keywords: ['sign in', 'login', 'account'],
          tab: 'login',
          label: 'Account Login'
        }
      ];

      for (const mapping of navMappings) {
        if (mapping.keywords.some((keyword) => speechText.includes(keyword))) {
          setLastCommand(`Navigated to ${mapping.label}`);
          setTranscript('');
          onNavigateTab(mapping.tab);
          speakConfirmation(`Opening ${mapping.label}`);
          return;
        }
      }

      // Stop listening command
      if (
        speechText.includes('stop listening') ||
        speechText.includes('turn off voice') ||
        speechText.includes('mute voice')
      ) {
        setLastCommand('Voice Listener Muted');
        toggleListening(false);
        speakConfirmation('Voice command listener turned off.');
      }
    },
    [onNavigateTab, speakConfirmation]
  );

  // Toggle voice recognition
  const toggleListening = (enable?: boolean) => {
    const targetState = enable !== undefined ? enable : !isListening;

    if (!speechSupported) {
      alert('Web Speech API is not supported in this browser. Please use Google Chrome, Edge, or Safari.');
      return;
    }

    if (targetState) {
      try {
        setIsListening(true);
        setLastCommand('Listening for voice commands...');
        setTranscript('');
        recognitionRef.current?.start();
        speakConfirmation('Hands-free voice listener activated. Say Help for Emergency SOS.');
      } catch (err) {
        console.warn('SpeechRecognition start error:', err);
      }
    } else {
      setIsListening(false);
      try {
        recognitionRef.current?.stop();
      } catch (err) {
        // ignore
      }
    }
  };

  return (
    <>
      {/* Floating Voice Listener Control HUD (Bottom Left) */}
      <div className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-40 flex flex-col items-start space-y-2 pointer-events-auto select-none">
        <AnimatePresence>
          {/* Active Voice Listening Transcript Banner */}
          {isListening && isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              className="bg-slate-950/95 border-2 border-rose-500/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl max-w-xs sm:max-w-sm w-full space-y-2 text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                  <span className="text-xs font-bold text-rose-400 tracking-wider uppercase font-mono">
                    Hands-Free Voice Active
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setShowCheatSheet(!showCheatSheet)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    title="Voice Commands Guide"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Real-time speech transcript feedback */}
              <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 min-h-[44px] flex items-center">
                {transcript ? (
                  <p className="text-xs text-emerald-300 font-mono animate-pulse">
                    &ldquo;{transcript}&rdquo;
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">
                    {lastCommand || 'Say "HELP" for SOS or "Go to Map", "Plan Trip"...'}
                  </p>
                )}
              </div>

              {/* Quick Command Hints */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                <span className="text-rose-400 font-bold">🚨 Emergency: Say &quot;HELP&quot; / &quot;SOS&quot;</span>
                <button
                  onClick={() => setShowCheatSheet(true)}
                  className="text-cyan-400 hover:underline flex items-center space-x-0.5"
                >
                  <Command className="w-3 h-3" />
                  <span>All Commands</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Floating Voice Listener Toggle Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (!isExpanded && isListening) {
                setIsExpanded(true);
              } else {
                toggleListening();
              }
            }}
            className={`relative group flex items-center space-x-2 px-3.5 py-2.5 rounded-full shadow-2xl border transition-all cursor-pointer ${
              isListening
                ? 'bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white border-rose-300/60 ring-4 ring-rose-500/20 scale-105'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600'
            }`}
            title={isListening ? 'Mute Voice Listener' : 'Activate Hands-Free Emergency Voice Listener'}
          >
            {isListening && (
              <span className="absolute -inset-1 rounded-full bg-rose-500/30 animate-ping pointer-events-none" />
            )}

            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-white/20 text-white animate-pulse'
                  : 'bg-slate-800 text-slate-400 group-hover:text-cyan-400'
              }`}
            >
              {isListening ? (
                <Mic className="w-4 h-4 text-white" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
            </div>

            <div className="flex flex-col text-left">
              <span className="text-xs font-bold tracking-tight">
                {isListening ? 'Voice Active' : 'Voice Command'}
              </span>
              <span className="text-[9px] text-slate-300 font-mono leading-none">
                {isListening ? 'Listening...' : 'Tap for Hands-Free'}
              </span>
            </div>

            {!isExpanded && isListening && (
              <ChevronUp className="w-4 h-4 text-slate-300 ml-1" />
            )}
          </button>

          {/* Quick Info Badge when permission denied or error */}
          {permissionError && (
            <div className="bg-rose-950 border border-rose-800 text-rose-200 text-[10px] px-2.5 py-1 rounded-xl max-w-xs shadow-lg">
              ⚠️ Mic blocked in browser settings.
            </div>
          )}
        </div>
      </div>

      {/* Voice Commands Cheat Sheet Modal */}
      <AnimatePresence>
        {showCheatSheet && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-white relative"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                    <Command className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Voice Command Dictionary</h3>
                    <p className="text-xs text-slate-400">Speak naturally to control Velora AI hands-free</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCheatSheet(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {/* Emergency Commands */}
                <div className="bg-rose-950/60 border border-rose-900/80 p-3 rounded-2xl space-y-1.5">
                  <div className="text-xs font-bold text-rose-300 flex items-center space-x-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Emergency SOS Distress Phrases</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Instantly triggers 24x7 Emergency SOS Hub, broadcasts GPS & notifies helpline:
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['"Help"', '"Emergency"', '"SOS"', '"Danger"', '"Police"', '"Call for help"'].map((phrase) => (
                      <span
                        key={phrase}
                        className="px-2 py-1 bg-rose-900/80 text-rose-200 border border-rose-700 rounded-lg text-[11px] font-mono font-bold"
                      >
                        {phrase}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Navigation Commands */}
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl space-y-2">
                  <div className="text-xs font-bold text-cyan-400 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>App Navigation Phrases</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { label: 'Dashboard', example: '"Go to Dashboard"' },
                      { label: 'Interactive Map', example: '"Open Map"' },
                      { label: 'Explore Destinations', example: '"Go to Explore"' },
                      { label: 'AI Trip Planner', example: '"Plan Trip"' },
                      { label: 'Indian States Atlas', example: '"Open Atlas"' },
                      { label: 'Multilingual Translator', example: '"Translate"' },
                      { label: 'Saved Trips', example: '"Saved Trips"' },
                      { label: 'Velora AI Copilot', example: '"Ask Copilot"' },
                      { label: 'Traveler Utilities', example: '"Traveler Tools"' },
                      { label: 'Security Shield', example: '"Privacy Settings"' }
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="p-2 bg-slate-900 rounded-xl border border-slate-800/80 space-y-0.5"
                      >
                        <div className="font-bold text-slate-200 text-[11px]">{item.label}</div>
                        <div className="text-[10px] text-emerald-400 font-mono">{item.example}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowCheatSheet(false);
                  if (!isListening) toggleListening(true);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                {isListening ? 'Got it!' : 'Activate Voice Listener Now'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
