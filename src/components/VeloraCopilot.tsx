import React, { useState } from 'react';
import { TripTwin, ChatMessage } from '../types';
import { MessageSquare, Send, Sparkles, Bot, User, Loader2, Crosshair, MapPin, Compass } from 'lucide-react';

interface VeloraCopilotProps {
  currentTwin: TripTwin;
}

export const VeloraCopilot: React.FC<VeloraCopilotProps> = ({ currentTwin }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: `Hello! I'm Velora Copilot, your AI travel decision assistant. I see your current active digital twin is for ${currentTwin.destination} (${currentTwin.durationDays} days, $${currentTwin.totalBudgetUsd} budget). How can I assist with your journey optimization today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'Get my location & plan route to Jaipur',
        'Get my location & plan route to Goa',
        'Find low-crowd dining in destination',
        'Reroute for rainy weather',
      ],
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detectingLoc, setDetectingLoc] = useState<boolean>(false);

  const handleGPSLocationPlan = () => {
    setDetectingLoc(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setDetectingLoc(false);
          handleSend(`My current location is GPS (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E). Please plan a 3-day optimal route to ${currentTwin.destination || 'Jaipur'} including train/road options and entry tickets.`);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setDetectingLoc(false);
          handleSend(`My location is New Delhi (Delhi NCR). Please plan an optimized trip to ${currentTwin.destination || 'Jaipur'} with transit options and timing.`);
        },
        { timeout: 7000 }
      );
    } else {
      setDetectingLoc(false);
      handleSend(`My location is New Delhi (Delhi NCR). Please plan an optimized trip to ${currentTwin.destination || 'Jaipur'} with transit options and timing.`);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages,
          currentTrip: currentTwin,
        }),
      });

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'I updated your travel decision parameters.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: data.suggestedActions || ['Check crowd index', 'Simulate rain alternative'],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Apologies, I encountered an issue reaching the Velora decision engine server. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="velora-copilot" className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-[#D8F864]/10 border border-[#D8F864]/30 flex items-center justify-center text-[#D8F864]">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Velora AI Copilot</h1>
            <p className="text-xs text-slate-400">
              Active Context: <span className="text-[#D8F864] font-bold">{currentTwin.destination}</span> Digital Twin
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-300 bg-slate-950 px-3.5 py-2 rounded-2xl border border-slate-800">
          <Sparkles className="w-4 h-4 text-[#D8F864]" />
          <span className="font-semibold">Server-Side Gemini 3.6 Flash</span>
        </div>
      </div>

      {/* Chat Messages Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl min-h-[440px] max-h-[520px] overflow-y-auto space-y-4 flex flex-col">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-[#D8F864]/20 border border-[#D8F864]/40 flex items-center justify-center text-[#D8F864] shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#D8F864] text-slate-950 font-bold rounded-tr-none shadow-lg'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-1">
                <span className="font-extrabold">{msg.sender === 'user' ? 'You' : 'Velora Copilot'}</span>
                <span className="text-[10px] opacity-70 font-mono">{msg.timestamp}</span>
              </div>
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* Suggested Action Chips */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                  {msg.suggestedActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(action)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-[#D8F864] border border-[#D8F864]/30 rounded-xl text-[11px] font-semibold transition-all hover:scale-105 active:scale-95"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 w-fit shadow-md">
            <Loader2 className="w-4 h-4 animate-spin text-[#D8F864]" />
            <span>Velora Copilot is computing recommendations...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-2xl flex items-center space-x-2">
        <button
          onClick={handleGPSLocationPlan}
          disabled={detectingLoc || isLoading}
          title="Detect my GPS location & ask for route plan"
          className="px-3.5 py-2.5 bg-slate-950 hover:bg-slate-800 text-[#D8F864] border border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0"
        >
          {detectingLoc ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#D8F864]" />
          ) : (
            <Crosshair className="w-4 h-4 text-[#D8F864]" />
          )}
          <span className="hidden sm:inline">Use GPS Location</span>
        </button>

        <input
          id="input-copilot-query"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask Velora Copilot or type e.g. 'Plan 3-day trip to Goa from Delhi'..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D8F864]"
        />
        <button
          id="btn-send-copilot"
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className="px-4 py-2.5 bg-[#D8F864] hover:bg-[#cbf046] disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl transition-all shrink-0 flex items-center space-x-1 shadow-lg shadow-[#D8F864]/20"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
};
