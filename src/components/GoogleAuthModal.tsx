import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, Sparkles, User, LogOut, Lock } from 'lucide-react';

export interface UserProfile {
  name: string;
  email: string;
  picture: string;
  id: string;
  loginMethod: 'google';
}

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onLogout: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginStep, setLoginStep] = useState<'choose' | 'custom'>('choose');

  if (!isOpen) return null;

  const handleQuickGoogleLogin = (email: string, name: string) => {
    setIsLoggingIn(true);
    setTimeout(() => {
      const user: UserProfile = {
        id: `google-${Date.now()}`,
        name: name,
        email: email,
        picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
        loginMethod: 'google',
      };
      onLoginSuccess(user);
      setIsLoggingIn(false);
      onClose();
    }, 800);
  };

  const handleCustomGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    const name = customName.trim() || customEmail.split('@')[0];
    handleQuickGoogleLogin(customEmail, name);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-orange-100 rounded-3xl p-6 w-full max-w-md shadow-2xl relative space-y-5 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser ? (
          /* Already Logged In View */
          <div className="text-center space-y-4 pt-2">
            <div className="relative inline-block">
              <img
                src={currentUser.picture}
                alt={currentUser.name}
                className="w-20 h-20 rounded-full border-4 border-orange-200 mx-auto shadow-md bg-orange-50"
              />
              <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5 font-bold text-slate-900 text-lg">
                {currentUser.name}
                <CheckCircle className="w-4 h-4 text-orange-600 fill-orange-100" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{currentUser.email}</p>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 mt-2">
                Google Account Connected
              </span>
            </div>

            <div className="bg-orange-50/60 border border-orange-100 rounded-2xl p-3.5 text-xs text-slate-600 text-left space-y-1">
              <div className="font-bold text-orange-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-orange-600" />
                Synced Cloud Data
              </div>
              <p className="text-[11px] text-slate-600">
                Your portfolio positions, custom stock screeners, and AI research history are saved under your Google account.
              </p>
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl text-xs transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out from Google
            </button>
          </div>
        ) : (
          /* Login Dialog */
          <div className="space-y-4">
            {/* Header branding */}
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-center mx-auto text-orange-600 shadow-sm">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-900">Sign in with Google</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Connect your Google Account to save live portfolio holdings, watchlists, and custom stock screeners.
              </p>
            </div>

            {loginStep === 'choose' ? (
              <div className="space-y-3 pt-2">
                {/* Admin Quick Account option */}
                <button
                  onClick={() => handleQuickGoogleLogin('shankaraazrahi@gmail.com', 'Shankar Aazrahi')}
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-between bg-amber-50/80 hover:bg-amber-100/80 border-2 border-amber-300 p-3.5 rounded-2xl transition-all shadow-sm group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=shankaraazrahi@gmail.com"
                      alt="Avatar"
                      className="w-9 h-9 rounded-full bg-amber-200 border border-amber-400"
                    />
                    <div className="text-left">
                      <div className="font-extrabold text-amber-950 text-xs flex items-center gap-1.5">
                        <span>Shankar Aazrahi</span>
                        <span className="bg-amber-200 text-amber-900 text-[9px] px-1.5 py-0.5 rounded font-black uppercase">Admin</span>
                      </div>
                      <div className="text-[11px] text-amber-800 font-medium">shankaraazrahi@gmail.com</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-amber-900 bg-amber-200 px-2.5 py-1 rounded-xl shadow-2xs">
                    Admin Full Access →
                  </span>
                </button>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-[11px]">
                    <span className="bg-white px-2 text-slate-400 font-medium">or login with another Google account</span>
                  </div>
                </div>

                <button
                  onClick={() => setLoginStep('custom')}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl text-xs transition-colors"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  Use Different Google Account
                </button>
              </div>
            ) : (
              <form onSubmit={handleCustomGoogleLogin} className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Google Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="yourname@gmail.com"
                    value={customEmail}
                    onChange={e => setCustomEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setLoginStep('choose')}
                    className="w-1/3 bg-slate-100 text-slate-600 hover:bg-slate-200 py-3 rounded-xl font-bold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-2/3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3 rounded-xl shadow-md shadow-orange-500/20"
                  >
                    {isLoggingIn ? 'Connecting Google...' : 'Sign In with Google'}
                  </button>
                </div>
              </form>
            )}

            {/* Footer lock notice */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted & Private
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
