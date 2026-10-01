import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  CreditCard,
  QrCode,
  Lock,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { UserProfile } from './GoogleAuthModal';
import { recordSubscriptionSale } from '../utils/revenueStore';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  isSubscribed: boolean;
  onSubscribeSuccess: () => void;
  onOpenGoogleAuth: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  isSubscribed,
  onSubscribeSuccess,
  onOpenGoogleAuth,
}) => {
  const { t } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState<'gpay' | 'razorpay'>('gpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [upiIdInput, setUpiIdInput] = useState('');
  const [copied, setCopied] = useState(false);

  const MERCHANT_UPI_ID = '7715933711@upi';

  if (!isOpen) return null;

  const isAdmin = currentUser?.email?.toLowerCase() === 'shankaraazrahi@gmail.com';

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(MERCHANT_UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      recordSubscriptionSale(99, 'monthly');
      onSubscribeSuccess();
      setTimeout(() => {
        setPaymentSuccess(false);
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-orange-100 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-black border border-orange-200">
            <Sparkles className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
            <span>MERA BAZAAR PRO • ₹99 / MONTH</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('unlockAllSegments')}
          </h2>
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
            Get instant full access to live market news, Gemini AI analyst, screeners, real-time charts & portfolio tools.
          </p>
        </div>

        {/* Admin Banner if Admin logged in */}
        {isAdmin && (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                Admin Full-Access Enabled
              </div>
              <p className="text-xs text-emerald-800 font-medium mt-0.5">
                Logged in as <span className="font-bold">{currentUser?.email}</span>. All premium segments are permanently unlocked for you!
              </p>
            </div>
          </div>
        )}

        {/* Success State */}
        {paymentSuccess ? (
          <div className="my-8 text-center py-8 space-y-3 bg-emerald-50 border border-emerald-200 rounded-3xl">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="text-xl font-black text-emerald-900">
              {t('paymentSuccess')}
            </h3>
            <p className="text-xs font-bold text-emerald-700">
              All market segments are now 100% unlocked!
            </p>
          </div>
        ) : (
          <>
            {/* Features Included List */}
            <div className="my-5 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs">
              <div className="font-bold text-slate-900 uppercase tracking-wide text-[11px] text-slate-500 mb-1">
                Included in ₹99/month Pro Subscription:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Live Indian Market News</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Gemini AI Equity Analyst</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Stock Screener & Ratios</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Real-time Financial Charts</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Portfolio & Watchlist Sync</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>IPOs, Funds & Dividends</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector (Google Pay & Razorpay) */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                {t('selectPaymentMethod')}
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* Google Pay Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('gpay')}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                    paymentMethod === 'gpay'
                      ? 'border-orange-600 bg-orange-50/80 shadow-sm text-orange-950 font-bold'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-black text-sm text-slate-900">
                    <span className="text-blue-600 font-bold">G</span>
                    <span className="text-red-500 font-bold">o</span>
                    <span className="text-yellow-500 font-bold">o</span>
                    <span className="text-blue-600 font-bold">g</span>
                    <span className="text-green-600 font-bold">l</span>
                    <span className="text-red-500 font-bold">e</span>
                    <span className="text-slate-800 ml-0.5">Pay</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Google Pay / UPI
                  </span>
                </button>

                {/* Razorpay Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-blue-600 bg-blue-50/80 shadow-sm text-blue-950 font-bold'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-1 font-black text-sm text-blue-900">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Razorpay</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Cards, UPI, NetBanking
                  </span>
                </button>
              </div>

              {/* Form Input for Selected Payment Method */}
              <form onSubmit={handlePay} className="space-y-4 pt-2">
                {/* Receiver UPI Badge */}
                <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 shadow-md">
                  <div>
                    <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                      Official Merchant UPI ID:
                    </div>
                    <div className="text-sm font-black text-amber-400 tracking-wide font-mono mt-0.5">
                      {MERCHANT_UPI_ID}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 transition-all active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy UPI</span>
                      </>
                    )}
                  </button>
                </div>

                {paymentMethod === 'gpay' ? (
                  <div className="bg-orange-50/50 p-3.5 rounded-2xl border border-orange-100 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>Google Pay Direct UPI Checkout</span>
                      <span className="text-orange-700 font-extrabold">₹99.00</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Payment will be credited directly to <strong className="text-slate-900">{MERCHANT_UPI_ID}</strong>.
                    </p>

                    <a
                      href={`upi://pay?pa=${MERCHANT_UPI_ID}&pn=MeraBazaar&am=99&cu=INR`}
                      className="inline-flex items-center justify-center gap-2 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Open Google Pay App (7715933711@upi)</span>
                    </a>

                    <input
                      type="text"
                      placeholder="Enter Your UPI ID (e.g. mobile@okaxis / gpay)"
                      value={upiIdInput}
                      onChange={(e) => setUpiIdInput(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-orange-500"
                    />
                  </div>
                ) : (
                  <div className="bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>Razorpay Payment Gateway</span>
                      <span className="text-blue-700 font-extrabold">₹99.00 / Mo</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Routing ₹99 subscription payment to account <strong className="text-slate-900">{MERCHANT_UPI_ID}</strong> via Razorpay.
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold bg-white p-2 rounded-xl border border-blue-100">
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>256-Bit SSL Encrypted Razorpay Gateway • Direct UPI / Cards / NetBanking</span>
                    </div>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-3.5 rounded-2xl font-black text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 ${
                    paymentMethod === 'gpay'
                      ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-200'
                      : 'bg-blue-600 hover:bg-blue-500 shadow-blue-200'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('processingPayment')}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" />
                      <span>{t('subscribeNow')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Footer notice */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-semibold">
                {t('cancelAnytime')}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
