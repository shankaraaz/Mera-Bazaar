import React, { useState } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  User,
  CheckCircle2,
  Lock,
  Globe2,
  Newspaper,
  BarChart2,
  Zap,
  Building2,
  CreditCard
} from 'lucide-react';
import { UserProfile } from './GoogleAuthModal';
import { useLanguage } from '../context/LanguageContext';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onContinueAsGuest: () => void;
  onOpenSubscriptionModal?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onContinueAsGuest,
  onOpenSubscriptionModal,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'google' | 'admin' | 'email'>('admin');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleQuickLogin = (email: string, name: string) => {
    setIsLoggingIn(true);
    setTimeout(() => {
      const userProfile: UserProfile = {
        id: `google-${Date.now()}`,
        name: name,
        email: email,
        picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
        loginMethod: 'google',
      };
      onLoginSuccess(userProfile);
      setIsLoggingIn(false);
    }, 600);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    const name = customName.trim() || customEmail.split('@')[0];
    handleQuickLogin(customEmail, name);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Decorative Gradients & Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[140px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[140px] pointer-events-none translate-y-1/2"></div>
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none"></div>

      {/* Top Bar Navigation */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-4 py-5 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-400 flex items-center justify-center text-white shadow-lg shadow-orange-950/50">
            <TrendingUp className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span>MeraBazaar</span>
              <span className="text-[10px] bg-orange-500/20 text-orange-400 font-extrabold px-2 py-0.5 rounded-full border border-orange-500/30 uppercase">
                India Market Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">NSE • BSE • AI Equity Analyst</p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-bold">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                language === 'en' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                language === 'hi' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              हिंदी
            </button>
          </div>

          <button
            onClick={onContinueAsGuest}
            className="text-xs font-bold text-slate-300 hover:text-white bg-slate-900/90 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
          >
            <span>Skip to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Login / Gateway Hero Section */}
      <main className="relative z-10 max-w-6xl w-full mx-auto px-4 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
        {/* Left Side: Product Intro & Value Prop */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
            <span>MeraBazaar Pro Access Portal • ₹99/Month</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Indian Share Market Intelligence <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
              Powered by Gemini AI
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Welcome! Log in with Google or Admin credentials to access real-time NSE/BSE stocks, Gemini AI price target predictions, live financial news, stock screeners & portfolio tracking.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 pt-2 max-w-md mx-auto lg:mx-0">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 text-center">
              <div className="text-lg font-black text-orange-400">NIFTY 50</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Live Ticker</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 text-center">
              <div className="text-lg font-black text-emerald-400">₹99/Mo</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Pro Subscription</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 text-center">
              <div className="text-lg font-black text-amber-400">Gemini 2.5</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">AI Engine</div>
            </div>
          </div>

          {/* Feature Bullets */}
          <div className="space-y-2.5 pt-2 text-xs font-semibold text-slate-300 text-left max-w-md mx-auto lg:mx-0">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Full Admin Access reserved for <strong className="text-white">shankaraazrahi@gmail.com</strong></span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
              <span>UPI Payments via Google Pay & Razorpay Gateway</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Real-time news in English & Hindi with AI Sentiment Analysis</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Box Card */}
        <div className="lg:col-span-6 max-w-md w-full mx-auto">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
            {/* Login Card Header */}
            <div className="text-center space-y-1.5 mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-1">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Sign In to MeraBazaar</h2>
              <p className="text-xs text-slate-400 font-medium">Choose your login method to continue</p>
            </div>

            {/* Login Method Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-6 text-xs font-extrabold">
              <button
                onClick={() => setActiveTab('admin')}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Login</span>
              </button>

              <button
                onClick={() => setActiveTab('google')}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'google'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-blue-400 font-black">G</span>
                <span>Google Login</span>
              </button>
            </div>

            {/* TAB CONTENT: ADMIN LOGIN */}
            {activeTab === 'admin' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="bg-amber-950/40 border border-amber-800/50 rounded-2xl p-4 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-black text-amber-300 text-xs">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Administrator Primary Account</span>
                  </div>
                  <p className="text-[11px] text-amber-200/80 font-medium leading-relaxed">
                    Log in as Admin to enjoy permanent full access to all stock segments, AI analyst reports, and subscription controls.
                  </p>
                </div>

                <button
                  onClick={() => handleQuickLogin('shankaraazrahi@gmail.com', 'Shankar Aazrahi')}
                  disabled={isLoggingIn}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-950/50 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying Admin Account...</span>
                    </div>
                  ) : (
                    <>
                      <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=shankaraazrahi@gmail.com"
                        alt="Shankar"
                        className="w-6 h-6 rounded-full border border-slate-900 bg-white"
                      />
                      <span>Log In as Admin (Shankar Aazrahi)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TAB CONTENT: GOOGLE LOGIN */}
            {activeTab === 'google' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* One Click Google Account */}
                <button
                  onClick={() => handleQuickLogin('user.investor@gmail.com', 'Stock Investor')}
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-between bg-slate-800/80 hover:bg-slate-800 border border-slate-700 p-3.5 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=user.investor@gmail.com"
                      alt="Investor Avatar"
                      className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600"
                    />
                    <div className="text-left">
                      <div className="font-bold text-white text-xs">Stock Investor Account</div>
                      <div className="text-[11px] text-slate-400">user.investor@gmail.com</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-orange-400 group-hover:translate-x-0.5 transition-transform">
                    Connect →
                  </span>
                </button>

                {/* Custom Google Email Form */}
                <form onSubmit={handleCustomSubmit} className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                    Or Enter Any Google Email:
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Enter Google Email (e.g., name@gmail.com)"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-medium outline-none focus:border-orange-500"
                  />
                  <input
                    type="text"
                    placeholder="Your Name (Optional)"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-medium outline-none focus:border-orange-500"
                  />

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-all shadow-md active:scale-98"
                  >
                    {isLoggingIn ? 'Logging In...' : 'Continue with Google Account'}
                  </button>
                </form>
              </div>
            )}

            {/* Or Continue as Guest button */}
            <div className="mt-6 pt-5 border-t border-slate-800 text-center space-y-3">
              <button
                onClick={onContinueAsGuest}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <span>Continue as Guest (Explore Dashboard)</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <p className="text-[10px] text-slate-500 font-medium">
                By logging in, you agree to MeraBazaar terms and conditions.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-4 py-4 border-t border-slate-900 text-center text-xs text-slate-500 font-medium flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>© 2026 MeraBazaar India • Financial Intelligence & Trading Tools</div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span>NSE / BSE Realtime</span>
          <span>•</span>
          <span>Google Pay & Razorpay Integrated</span>
          <span>•</span>
          <span>Admin Access Enabled</span>
        </div>
      </footer>
    </div>
  );
};
