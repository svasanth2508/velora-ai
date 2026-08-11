import React, { useState, useEffect } from 'react';
import { QRTicket, ExpenseItem, PackingItem, TranslatorPhrase } from '../types';
import {
  SAMPLE_QR_TICKETS,
  SAMPLE_EXPENSES,
  SAMPLE_PACKING_LIST,
  INDIAN_LANGUAGE_PHRASES
} from '../data/mockData';
import {
  QrCode,
  Wallet,
  CheckSquare,
  Languages,
  Plus,
  Trash2,
  Download,
  Volume2,
  DollarSign,
  Ticket,
  Luggage,
  Sparkles,
  PieChart,
  CheckCircle2,
  Copy,
  Check,
  Compass,
  Utensils,
  Car,
  AlertTriangle,
  Search,
  ArrowRight,
  ArrowRightLeft
} from 'lucide-react';
import { fetchLiveExchangeRates } from '../services/realtimeStatsService';
import { CinematicHero, EditorialSection, VisualIndex } from './layout';

export const TravelerToolsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'qr' | 'expenses' | 'packing' | 'translator' | 'currency'>('qr');

  // Currency Converter State
  const [convertAmt, setConvertAmt] = useState<string>('500');
  const [fromCurr, setFromCurr] = useState<string>('USD');
  const [toCurr, setToCurr] = useState<string>('INR');
  const [liveRates, setLiveRates] = useState<Record<string, number>>({ USD: 83.75, EUR: 91.2, GBP: 106.5, AED: 22.8, JPY: 0.56, CAD: 61.4, AUD: 55.1, SGD: 62.3, THB: 2.38, MYR: 18.9, SAR: 22.3, INR: 1.0 });

  useEffect(() => {
    fetchLiveExchangeRates().then((rates) => {
      if (rates && Object.keys(rates).length > 0) {
        setLiveRates(rates);
      }
    });
  }, []);

  // QR Tickets State
  const [qrTickets, setQrTickets] = useState<QRTicket[]>(SAMPLE_QR_TICKETS);
  const [selectedQr, setSelectedQr] = useState<QRTicket | null>(SAMPLE_QR_TICKETS[0]);

  // Expenses State
  const [expenses, setExpenses] = useState<ExpenseItem[]>(SAMPLE_EXPENSES);
  const [newExpTitle, setNewExpTitle] = useState<string>('');
  const [newExpCategory, setNewExpCategory] = useState<ExpenseItem['category']>('Food & Dining');
  const [newExpAmount, setNewExpAmount] = useState<string>('');

  // Packing State
  const [packingList, setPackingList] = useState<PackingItem[]>(SAMPLE_PACKING_LIST);
  const [newItemText, setNewItemText] = useState<string>('');
  const [newItemCat, setNewItemCat] = useState<PackingItem['category']>('Clothing');

  // Translator State
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Hindi');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPhrase, setSelectedPhrase] = useState<TranslatorPhrase | null>(INDIAN_LANGUAGE_PHRASES[0]);
  const [customText, setCustomText] = useState<string>('');
  const [customTranslation, setCustomTranslation] = useState<{ text: string; phonetic: string } | null>(null);
  const [translating, setTranslating] = useState<boolean>(false);
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const INDIAN_LANGUAGES = [
    { name: 'Hindi', script: 'हिंदी', code: 'hi-IN' },
    { name: 'Tamil', script: 'தமிழ்', code: 'ta-IN' },
    { name: 'Bengali', script: 'বাংলা', code: 'bn-IN' },
    { name: 'Telugu', script: 'తెలుగు', code: 'te-IN' },
    { name: 'Marathi', script: 'मराठी', code: 'mr-IN' },
    { name: 'Kannada', script: 'ಕನ್ನಡ', code: 'kn-IN' },
    { name: 'Gujarati', script: 'ગુજરાતી', code: 'gu-IN' },
    { name: 'Malayalam', script: 'മലയാളം', code: 'ml-IN' }
  ];

  const PRESET_TAGS = [
    'Where is the clean restroom?',
    'How much for auto ride to railway station?',
    'Make it less spicy please',
    'Can I pay via Google Pay / UPI?',
    'Emergency, call an ambulance!'
  ];

  // Expense Handlers
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpTitle.trim() || !newExpAmount || isNaN(Number(newExpAmount))) return;
    const newExp: ExpenseItem = {
      id: `exp-${Date.now()}`,
      title: newExpTitle,
      category: newExpCategory,
      amountInr: Number(newExpAmount),
      date: new Date().toISOString().split('T')[0]
    };
    setExpenses((prev) => [newExp, ...prev]);
    setNewExpTitle('');
    setNewExpAmount('');
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const totalExpenseInr = expenses.reduce((acc, curr) => acc + curr.amountInr, 0);

  // Packing Handlers
  const handleTogglePack = (id: string) => {
    setPackingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, packed: !item.packed } : item))
    );
  };

  const handleAddPackingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const newItem: PackingItem = {
      id: `pack-${Date.now()}`,
      item: newItemText,
      category: newItemCat,
      packed: false
    };
    setPackingList((prev) => [...prev, newItem]);
    setNewItemText('');
  };

  // Text-To-Speech
  const handleSpeak = (text: string, langName: string = selectedLanguage) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const langObj = INDIAN_LANGUAGES.find((l) => l.name === langName) || INDIAN_LANGUAGES[0];
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langObj.code;
      setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Live Custom Translator handler
  const handleTranslateCustom = async (textToTranslate: string) => {
    const query = textToTranslate || customText;
    if (!query.trim()) return;
    setTranslating(true);

    try {
      const langCodeMap: Record<string, string> = {
        'Hindi': 'hi', 'Tamil': 'ta', 'Telugu': 'te', 'Kannada': 'kn',
        'Malayalam': 'ml', 'Marathi': 'mr', 'Bengali': 'bn', 'Gujarati': 'gu',
        'French': 'fr', 'Spanish': 'es', 'Japanese': 'ja', 'German': 'de',
      };
      const tgtCode = langCodeMap[selectedLanguage] || 'hi';

      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: query,
          sourceLang: 'en',
          sourceLangName: 'English',
          targetLang: tgtCode,
          targetLangName: selectedLanguage,
          mode: 'text',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.translation) {
          setCustomTranslation({
            text: data.translation,
            phonetic: data.phonetic || query,
          });
          return;
        }
      }
      setCustomTranslation({
        text: query,
        phonetic: query,
      });
    } catch (err) {
      setCustomTranslation({
        text: query,
        phonetic: query,
      });
    } finally {
      setTranslating(false);
    }
  };

  const filteredPhrases = INDIAN_LANGUAGE_PHRASES.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div id="traveler-tools-hub" className="space-y-6">
      {/* Cinematic Hero Header */}
      <CinematicHero
        badge={{ label: 'Essential On-The-Road Toolkit', icon: Luggage, variant: 'cyan' }}
        subtitle="Velora Companion Suite • Offline Capable"
        title="Traveler Utilities Vault"
        description="Access stored ASI & transit QR tickets, track multi-category INR trip expenses, generate Indian language audio phrases, convert currency live, and manage smart packing checklists."
        backgroundImageUrl="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1920&q=80"
        metrics={[
          { label: 'Active Tickets', value: `${qrTickets.length}`, icon: Ticket },
          { label: 'Total Expense', value: `₹${totalExpenseInr.toLocaleString('en-IN')}`, icon: Wallet },
          { label: 'Packed Items', value: `${packingList.filter(i => i.packed).length}/${packingList.length}`, icon: CheckSquare },
        ]}
      />

      {/* Tab Selector Bar */}
      <div className="flex items-center space-x-1.5 bg-slate-900 p-2 rounded-2xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'qr'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Ticket Storage</span>
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'expenses'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Expense Tracker</span>
          </button>

          <button
            onClick={() => setActiveTab('packing')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'packing'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Packing Checklist</span>
          </button>

          <button
            onClick={() => setActiveTab('translator')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'translator'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Languages className="w-4 h-4" />
            <span>Indian Translator</span>
          </button>

          <button
            onClick={() => setActiveTab('currency')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'currency'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Currency to Rupee (₹)</span>
          </button>
        </div>

      {/* TAB 1: QR Ticket Storage */}
      {activeTab === 'qr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Ticket className="w-5 h-5 text-emerald-400" />
                <span>ASI Monument Digital Entry Passes</span>
              </h2>

              <div className="space-y-3">
                {qrTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedQr(ticket)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      selectedQr?.id === ticket.id
                        ? 'bg-slate-800 border-emerald-500 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/30 text-[10px] font-bold uppercase">
                          {ticket.passType}
                        </span>
                        <span className="text-[11px] text-slate-400">Valid: {ticket.validDate}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-1">{ticket.monumentName}</h3>
                      <span className="text-xs text-emerald-400 font-semibold">{ticket.costInr}</span>
                    </div>

                    <div className="p-2 bg-white rounded-lg shrink-0">
                      {ticket.qrCodeUrl ? (
                        <img src={ticket.qrCodeUrl} alt="QR Code" className="w-12 h-12" />
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* QR Display View */}
          <div className="lg:col-span-5">
            {selectedQr ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center space-y-4">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Official Entry Pass QR Scanner
                </span>
                <h3 className="text-lg font-bold text-white">{selectedQr.monumentName}</h3>

                <div className="bg-white p-6 rounded-2xl w-52 h-52 mx-auto flex items-center justify-center shadow-2xl border-4 border-emerald-500">
                  {selectedQr.qrCodeUrl ? (
                    <img src={selectedQr.qrCodeUrl} alt="QR Large" className="w-full h-full" />
                  ) : null}
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pass Type:</span>
                    <span className="font-bold text-white">{selectedQr.passType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fare Paid:</span>
                    <span className="font-bold text-emerald-400">{selectedQr.costInr}</span>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Downloaded offline copy for ${selectedQr.monumentName}`)}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Pass for Offline Entry</span>
                </button>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
                Select a ticket pass to view the full scanner barcode.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Expense Tracker */}
      {activeTab === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            {/* Add Expense Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Log Travel Expense (INR)</span>
              </h2>

              <form onSubmit={handleAddExpense} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Expense Description</label>
                  <input
                    type="text"
                    value={newExpTitle}
                    onChange={(e) => setNewExpTitle(e.target.value)}
                    placeholder="e.g. Auto fare to Agra Fort..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Category</label>
                    <select
                      value={newExpCategory}
                      onChange={(e) => setNewExpCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Food & Dining">Food & Dining</option>
                      <option value="Monument Tickets">Monument Tickets</option>
                      <option value="Auto & Transit">Auto & Transit</option>
                      <option value="Hotel & Stay">Hotel & Stay</option>
                      <option value="Shopping & Souvenirs">Shopping & Souvenirs</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Amount (₹ INR)</label>
                    <input
                      type="number"
                      value={newExpAmount}
                      onChange={(e) => setNewExpAmount(e.target.value)}
                      placeholder="e.g. 150"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md"
                >
                  Save Expense
                </button>
              </form>
            </div>

            {/* Total Expense Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2 text-center">
              <span className="text-xs text-slate-400">Total Spent so far</span>
              <div className="text-3xl font-black text-emerald-400">₹{totalExpenseInr.toLocaleString('en-IN')} INR</div>
              <span className="text-xs text-slate-500 block">Approx ${(totalExpenseInr / 83.2).toFixed(2)} USD</span>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-emerald-400" />
                <span>Expense Itemization ({expenses.length} Entries)</span>
              </h2>

              <div className="space-y-2">
                {expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{exp.title}</div>
                      <div className="text-[10px] text-slate-400">{exp.category} • {exp.date}</div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-emerald-400 text-sm">₹{exp.amountInr}</span>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Packing Checklist */}
      {activeTab === 'packing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Add Item to Packing List</span>
              </h2>

              <form onSubmit={handleAddPackingItem} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Item Name</label>
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="e.g. Universal travel plug adapter..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Category</label>
                  <select
                    value={newItemCat}
                    onChange={(e) => setNewItemCat(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Clothing">Clothing</option>
                    <option value="Documents & Cash">Documents & Cash</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Medicines">Medicines</option>
                    <option value="Sun & Rain Protection">Sun & Rain Protection</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md"
                >
                  Add Packing Item
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                  <span>Smart Packing List</span>
                </h2>
                <span className="text-xs text-emerald-400 font-semibold">
                  {packingList.filter((p) => p.packed).length} / {packingList.length} Packed
                </span>
              </div>

              <div className="space-y-2">
                {packingList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleTogglePack(item.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      item.packed
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-300'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center ${
                          item.packed
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                            : 'border-slate-600'
                        }`}
                      >
                        {item.packed && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <span className={`text-xs ${item.packed ? 'line-through opacity-70' : 'font-semibold'}`}>
                        {item.item}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500 px-2 py-0.5 bg-slate-900 rounded border border-slate-800">
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Quick-Access Indian Tourist Language Translator */}
      {activeTab === 'translator' && (
        <div className="space-y-6">
          {/* Target Language Selection Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <Languages className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold text-white">Select Target Indian Tourist Language</span>
              </div>
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Active: {selectedLanguage} ({INDIAN_LANGUAGES.find((l) => l.name === selectedLanguage)?.script})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {INDIAN_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage === lang.name;
                return (
                  <button
                    key={lang.name}
                    onClick={() => {
                      setSelectedLanguage(lang.name);
                      setCustomTranslation(null);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-md shadow-emerald-500/10 scale-[1.02]'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold">{lang.name}</span>
                    <span className={`text-[11px] ${isSelected ? 'text-slate-900 font-semibold' : 'text-emerald-400'}`}>
                      {lang.script}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Translation Input & AI Powered Translation */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>Instant AI Custom Phrase Translator</span>
              </h2>
              <span className="text-xs text-slate-400">Type any English phrase needed for travel</span>
            </div>

            {/* Quick Preset Tags */}
            <div className="flex flex-wrap gap-2">
              {PRESET_TAGS.map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCustomText(tag);
                    handleTranslateCustom(tag);
                  }}
                  className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-lg text-xs text-slate-300 transition-all text-left"
                >
                  "{tag}"
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTranslateCustom(customText);
                }}
                placeholder={`Type custom phrase (e.g. "Where is the nearest ATM?", "No onion no garlic please")...`}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => handleTranslateCustom(customText)}
                disabled={translating || !customText.trim()}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 shrink-0"
              >
                {translating ? (
                  <span>Translating...</span>
                ) : (
                  <>
                    <span>Translate to {selectedLanguage}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* AI Custom Translation Result Display */}
            {customTranslation && (
              <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-4 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-emerald-400">
                    Translation into {selectedLanguage}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSpeak(customTranslation.text)}
                      className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center space-x-1.5 shadow"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{speaking ? 'Speaking...' : 'Play Audio'}</span>
                    </button>
                    <button
                      onClick={() => handleCopyText(customTranslation.text)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs rounded-lg flex items-center space-x-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Native Script:</span>
                  <p className="text-xl font-bold text-emerald-300 mt-0.5">{customTranslation.text}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">English Phonetic Pronunciation:</span>
                  <p className="text-sm font-mono text-cyan-300 italic">"{customTranslation.phonetic}"</p>
                </div>
              </div>
            )}
          </div>

          {/* Phrase Category Filter & Essential Phrase Cards */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Languages className="w-5 h-5 text-emerald-400" />
                <span>Essential Quick-Access Phrases</span>
              </h2>

              {/* Category Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['All', 'Navigation', 'Dining & Food', 'Autos & Bargaining', 'Emergency'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Phrases Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPhrases.map((phr) => {
                // Get translation for selected language or fallback
                const langTranslation = phr.translations?.[selectedLanguage] || {
                  text: selectedLanguage === 'Tamil' ? phr.tamil : phr.hindi,
                  phonetic: phr.phonetic
                };

                return (
                  <div
                    key={phr.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl space-y-3 flex flex-col justify-between transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {phr.category}
                        </span>
                        <span className="text-[11px] text-slate-500">{selectedLanguage}</span>
                      </div>

                      <h3 className="text-sm font-bold text-white">{phr.english}</h3>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                        <p className="text-lg font-bold text-emerald-300">{langTranslation.text}</p>
                        <p className="text-xs font-mono text-cyan-300 italic">"{langTranslation.phonetic}"</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => handleSpeak(langTranslation.text, selectedLanguage)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all shadow-md"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Play Audio</span>
                      </button>

                      <button
                        onClick={() => handleCopyText(langTranslation.text)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                        title="Copy Translation"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Every Currency to Rupee (₹) Converter */}
      {activeTab === 'currency' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
              <ArrowRightLeft className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Universal Currency to Rupee (₹ INR) Converter</h2>
              <p className="text-xs text-slate-400">Convert foreign currencies instantly into Indian Rupees at live rates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Enter Foreign Currency Amount</label>
                <input
                  type="number"
                  value={convertAmt}
                  onChange={(e) => setConvertAmt(e.target.value)}
                  placeholder="500"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xl font-bold text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">From Currency</label>
                  <select
                    value={fromCurr}
                    onChange={(e) => setFromCurr(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    {[
                      { code: 'USD', name: 'US Dollar ($)' },
                      { code: 'EUR', name: 'Euro (€)' },
                      { code: 'GBP', name: 'British Pound (£)' },
                      { code: 'AED', name: 'UAE Dirham (AED)' },
                      { code: 'JPY', name: 'Japanese Yen (¥)' },
                      { code: 'CAD', name: 'Canadian Dollar (C$)' },
                      { code: 'AUD', name: 'Australian Dollar (A$)' },
                      { code: 'SGD', name: 'Singapore Dollar (S$)' },
                      { code: 'THB', name: 'Thai Baht (฿)' },
                      { code: 'MYR', name: 'Malaysian Ringgit (RM)' },
                      { code: 'SAR', name: 'Saudi Riyal (SAR)' },
                      { code: 'CNY', name: 'Chinese Yuan (¥)' },
                      { code: 'CHF', name: 'Swiss Franc (CHF)' },
                      { code: 'INR', name: 'Indian Rupee (₹)' },
                    ].map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">To Currency</label>
                  <select
                    value={toCurr}
                    onChange={(e) => setToCurr(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    {[
                      { code: 'INR', name: 'Indian Rupee (₹)' },
                      { code: 'USD', name: 'US Dollar ($)' },
                      { code: 'EUR', name: 'Euro (€)' },
                      { code: 'GBP', name: 'British Pound (£)' },
                      { code: 'AED', name: 'UAE Dirham (AED)' },
                      { code: 'JPY', name: 'Japanese Yen (¥)' },
                      { code: 'CAD', name: 'Canadian Dollar (C$)' },
                      { code: 'AUD', name: 'Australian Dollar (A$)' },
                      { code: 'SGD', name: 'Singapore Dollar (S$)' },
                    ].map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Calculated Output Result */}
            <div className="bg-gradient-to-br from-emerald-950/80 via-slate-950 to-cyan-950/80 border border-emerald-500/40 p-6 rounded-2xl text-center space-y-2 shadow-xl">
              <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest block">Converted Value</span>
              <p className="text-3xl font-black text-white font-mono">
                {toCurr === 'INR'
                  ? `₹${(parseFloat(convertAmt || '0') * (liveRates[fromCurr] || 1)).toFixed(2)} INR`
                  : `${(parseFloat(convertAmt || '0') * ((liveRates[fromCurr] || 1) / (liveRates[toCurr] || 1))).toFixed(2)} ${toCurr}`}
              </p>
              <p className="text-xs text-slate-400 pt-1">
                Live Exchange Rate: 1 {fromCurr} = ₹{(liveRates[fromCurr] || 1).toFixed(2)} INR
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
