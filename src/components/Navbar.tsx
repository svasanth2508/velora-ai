import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  MapPin,
  ShieldCheck,
  Bookmark,
  MessageSquare,
  Zap,
  PhoneCall,
  Luggage,
  LogIn,
  LogOut,
  User as UserIcon,
  Database,
  Navigation,
  Image as ImageIcon,
  Sparkles,
  Menu,
  X,
  Layers,
  Globe,
  ShieldAlert,
  LayoutDashboard,
  AlertCircle,
  Bell,
  CheckCircle2,
  Radio,
  Palette
} from 'lucide-react';
import { UserProfile } from '../types';
import { auth, logoutUser, onAuthStateChanged, User } from '../lib/firebase';
import { AuthModal } from './AuthModal';
import { ToastNotification, ToastMessage, triggerSystemPushNotification } from './ToastNotification';

export type NavTabType =
  | 'dashboard'
  | 'simulator'
  | 'navigation'
  | 'engine'
  | 'states'
  | 'translator'
  | 'images'
  | 'emergency'
  | 'tools'
  | 'saved'
  | 'security'
  | 'copilot'
  | 'login';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const PRIMARY_NAV: { id: NavTabType; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'simulator', label: 'Explore', icon: Compass },
  { id: 'states', label: 'Atlas', icon: MapPin },
  { id: 'engine', label: 'Plan', icon: Zap },
  { id: 'navigation', label: 'Map', icon: Globe },
  { id: 'saved', label: 'Travel DNA', icon: Bookmark },
  { id: 'copilot', label: '✦ Velora', icon: Sparkles },
];

const MORE_NAV: { id: NavTabType; label: string; icon: React.ElementType }[] = [
  { id: 'translator', label: 'Multilingual Translator', icon: Globe },
  { id: 'images', label: 'Editorial Gallery', icon: ImageIcon },
  { id: 'emergency', label: 'Emergency SOS (24/7)', icon: PhoneCall },
  { id: 'tools', label: 'Traveler Utilities', icon: Luggage },
  { id: 'security', label: 'Privacy & Data Shield', icon: ShieldCheck },
  { id: 'login', label: 'Sign In / Account', icon: LogIn },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userProfile,
  setUserProfile,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState<boolean>(false);

  // Logout confirmation & theme state
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState<boolean>(false);
  const [activeTheme, setActiveTheme] = useState<string>('emerald');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('velora_theme') || 'emerald';
    setActiveTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleSelectTheme = (themeId: string, themeName: string) => {
    setActiveTheme(themeId);
    localStorage.setItem('velora_theme', themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    setThemeMenuOpen(false);
    addToast({
      title: '🎨 Aesthetic Theme Activated',
      description: `Switched application ambiance to ${themeName}.`,
      type: 'info'
    });
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };
    setToasts((prev) => [newToast, ...prev].slice(0, 4));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setUserProfile((prev) => ({
          ...prev,
          name: user.displayName || user.email?.split('@')[0] || prev.name,
        }));
      }
    });
    return () => unsubscribe();
  }, [setUserProfile]);

  const handleConfirmLogout = async () => {
    try {
      setShowLogoutModal(false);
      await logoutUser();
      addToast({
        title: 'Logged Out Successfully',
        description: 'You have been signed out of Velora AI. Your local trip preferences are safely saved.',
        type: 'logout'
      });
      triggerSystemPushNotification(
        'Velora AI • Signed Out',
        'You have successfully signed out of your account.'
      );
    } catch (err) {
      console.error('Logout error:', err);
      addToast({
        title: 'Sign Out Error',
        description: 'An unexpected error occurred during sign out.',
        type: 'warning'
      });
    }
  };

  return (
    <>
      <ToastNotification toasts={toasts} onDismiss={removeToast} />

      <header id="velora-header" className="sticky top-0 z-50 py-3 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-[#F6F3EC]/90 backdrop-blur-xl border border-[#151515]/10 rounded-full py-2.5 px-4 sm:px-6 shadow-sm">
          {/* Brand Logo & Editorial Title */}
          <div
            className="flex items-center space-x-3 cursor-pointer group shrink-0"
            onClick={() => setActiveTab('simulator')}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#022C22] via-[#163D32] to-[#047857] p-0.5 shadow-md flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5 h-5 text-[#E7C75F]" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="50" r="48" fill="#163D32" />
                <path d="M50 18 L62 40 L85 50 L62 60 L50 82 L38 60 L15 50 L38 40 Z" fill="#E7C75F" />
                <circle cx="50" cy="50" r="10" fill="#022C22" />
                <circle cx="50" cy="50" r="4" fill="#10B981" />
              </svg>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-lg sm:text-xl font-editorial font-bold tracking-tight text-[#151515] flex items-center gap-1.5">
                VELORA AI
              </span>
              <span className="text-[9px] font-sans font-semibold text-[#163D32] bg-[#E7C75F]/20 px-2 py-0.5 rounded-full border border-[#E7C75F]/40 uppercase tracking-widest hidden sm:inline-block">
                Smart Tourism & SOS
              </span>
            </div>
          </div>

          {/* Floating Minimalist Pill Navigation */}
          <nav id="velora-main-nav" className="hidden lg:flex items-center space-x-1 bg-[#E8E2D5]/70 p-1 rounded-full border border-[#151515]/05">
            {PRIMARY_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-[#163D32] text-white font-bold shadow-sm'
                      : 'text-[#151515]/80 hover:text-[#151515] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E7C75F]' : 'text-[#6E6E67]'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}

            {/* More Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold text-[#151515]/70 hover:bg-[#FAF8F5] transition-all"
              >
                <span>More</span>
              </button>

              <AnimatePresence>
                {moreMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-[#FAF8F5] border border-[#151515]/10 rounded-2xl p-2 shadow-xl z-50 space-y-1"
                  >
                    {MORE_NAV.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setMoreMenuOpen(false);
                          }}
                          className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
                            activeTab === item.id ? 'bg-[#163D32] text-white' : 'text-[#151515] hover:bg-[#E8E2D5]'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-[#C76B45]" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right actions */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Enhanced High-End SOS Button */}
            <button
              onClick={() => setActiveTab('emergency')}
              className="relative group flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs rounded-full border border-rose-400/50 transition-all shadow-md hover:shadow-rose-500/30 active:scale-95 cursor-pointer"
              title="24x7 Emergency SOS Safety Shield"
            >
              <span className="absolute -inset-0.5 rounded-full bg-rose-500/40 animate-ping pointer-events-none opacity-75" />
              <ShieldAlert className="w-3.5 h-3.5 text-rose-100 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline tracking-wider">SOS 24/7</span>
              <span className="sm:hidden tracking-wider">SOS</span>
            </button>

            {/* Interactive Theme Selector Menu */}
            <div className="relative">
              <button
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="p-2 bg-[#E8E2D5]/80 hover:bg-[#E8E2D5] text-[#151515] rounded-full border border-[#151515]/10 transition-all cursor-pointer flex items-center justify-center"
                title="Select Aesthetic Theme"
              >
                <Palette className="w-3.5 h-3.5 text-[#C76B45]" />
              </button>

              <AnimatePresence>
                {themeMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-60 bg-[#FAF8F5] border border-[#151515]/15 rounded-2xl p-2.5 shadow-2xl z-50 space-y-1.5"
                  >
                    <div className="px-2 py-1 text-[10px] font-bold text-[#6E6E67] uppercase tracking-wider">
                      Select Aesthetic Theme
                    </div>
                    {[
                      { id: 'emerald', name: 'Emerald Sanctuary', preview: 'bg-[#163D32]', border: 'border-[#E7C75F]' },
                      { id: 'jaipur', name: 'Royal Jaipur Pink', preview: 'bg-[#C76B45]', border: 'border-amber-400' },
                      { id: 'obsidian', name: 'Midnight Obsidian', preview: 'bg-slate-900', border: 'border-cyan-400' },
                      { id: 'kerala', name: 'Kerala Backwaters', preview: 'bg-emerald-800', border: 'border-emerald-300' }
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => handleSelectTheme(theme.id, theme.name)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all ${
                          activeTheme === theme.id
                            ? 'bg-[#163D32] text-white shadow-sm'
                            : 'text-[#151515] hover:bg-[#E8E2D5]/80'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className={`w-3.5 h-3.5 rounded-full ${theme.preview} border ${theme.border}`} />
                          <span>{theme.name}</span>
                        </div>
                        {activeTheme === theme.id && <Sparkles className="w-3.5 h-3.5 text-[#E7C75F]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {currentUser ? (
              <div className="flex items-center space-x-2 bg-[#E8E2D5]/80 p-1 pl-2.5 rounded-full border border-[#151515]/10">
                {currentUser.photoURL && currentUser.photoURL.trim() ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-6 h-6 rounded-full border border-[#163D32]" />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-[#151515]" />
                )}
                <span className="text-[11px] font-semibold text-[#151515] truncate max-w-[80px] hidden sm:inline">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="p-1 text-[#6E6E67] hover:text-rose-600 hover:bg-rose-500/10 rounded-full transition-colors cursor-pointer"
                  title="Sign out of Velora AI"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#151515] hover:bg-[#163D32] text-white font-medium text-xs rounded-full transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#E7C75F]" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-[#151515] hover:bg-[#E8E2D5] rounded-full transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden mt-2 bg-[#FAF8F5] border border-[#151515]/10 rounded-2xl p-3 space-y-1.5 overflow-hidden shadow-xl"
            >
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[...PRIMARY_NAV, ...MORE_NAV].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center space-x-2 p-2.5 rounded-xl text-left font-medium transition-all ${
                        isActive
                          ? 'bg-[#163D32] text-white'
                          : 'bg-[#E8E2D5]/50 text-[#151515] hover:bg-[#E8E2D5]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-[#C76B45]" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Interactive Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center space-y-5 text-white relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center shadow-lg">
                <LogOut className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-serif font-bold text-white">Confirm Sign Out</h3>
                <p className="text-xs text-slate-300 font-light leading-relaxed">
                  Are you sure you want to sign out of <strong className="text-amber-300">Velora AI</strong>? Your saved trip twins and state preferences remain safely synced in local storage.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-2xl border border-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLogout}
                  className="py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-2xl shadow-xl shadow-rose-600/30 transition-all cursor-pointer"
                >
                  Yes, Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
