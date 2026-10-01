import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Gift, 
  Percent, 
  ArrowRight,
  TrendingUp,
  Award,
  Clock,
  Flame,
  BrainCircuit,
  RefreshCw,
  Info
} from 'lucide-react';
import { PortfolioPosition, WatchlistItem } from '../types/market';
import { recordAdInteraction } from '../utils/revenueStore';

export interface AdOffer {
  id: string;
  badge: string;
  sponsorName: string;
  sponsorLogoUrl?: string;
  title: string;
  subtitle: string;
  highlightText: string;
  ctaText: string;
  secondaryCtaText?: string;
  gradient: string;
  accentColor: string;
  textColor: string;
  features: string[];
  couponCode?: string;
  expiryText?: string;
  category: 'BROKERAGE' | 'PRO_PLAN' | 'BONDS' | 'IPO_ALERT';
}

const SAMPLE_ADS: AdOffer[] = [
  {
    id: 'ad-broker-1',
    badge: 'EXCLUSIVE BROKERAGE OFFER',
    sponsorName: 'AngelOne / Zerodha Partner',
    title: 'Open 100% Free Demat & Trading Account',
    subtitle: 'Pay ₹0 Brokerage on Delivery Investments & Flat ₹20 on F&O trades. Get ₹500 Market Research Gift Voucher free!',
    highlightText: 'FREE ₹500 GIFT VOUCHER',
    ctaText: 'Claim Free Demat Account',
    secondaryCtaText: 'Learn More',
    gradient: 'from-amber-600 via-orange-600 to-rose-600',
    accentColor: 'bg-amber-400 text-slate-950',
    textColor: 'text-white',
    features: ['Instant 5-Min Paperless KYC', 'Zero Annual Maintenance Fee (1st Yr)', 'Direct UPI Margin Topup'],
    couponCode: 'MERABAZAAR500',
    expiryText: 'Ends in 3 days',
    category: 'BROKERAGE'
  },
  {
    id: 'ad-pro-2',
    badge: 'LIMITED TIME PRO DISCOUNT',
    sponsorName: 'MeraBazaar AI Pro',
    title: 'Unlock 99.4% Precision Gemini AI Screener & Alerts',
    subtitle: 'Get real-time RSI smart alerts, side-by-side stock comparison, and automated portfolio rebalancing recommendations.',
    highlightText: 'FLAT 50% OFF TODAY',
    ctaText: 'Upgrade to Pro @ ₹499/mo',
    secondaryCtaText: 'View Pro Features',
    gradient: 'from-slate-900 via-indigo-950 to-purple-950',
    accentColor: 'bg-emerald-400 text-slate-950',
    textColor: 'text-white',
    features: ['Unlimited Gemini 3.6 Financial Analysis', 'Custom Screener Filters & Backtesting', 'Instant WhatsApp Price Breakout Alerts'],
    couponCode: 'PRO50OFF',
    expiryText: 'Limited to first 500 users',
    category: 'PRO_PLAN'
  },
  {
    id: 'ad-bonds-3',
    badge: 'HIGH-YIELD FIXED RETURN',
    sponsorName: 'Govt Sovereign Gold Bond 2026',
    title: 'Earn 12.5% P.A. Guaranteed Tax-Free Returns',
    subtitle: 'Invest in AAA-Rated Sovereign Gold Bonds & Corporate NCDs with sovereign safety backed by Reserve Bank of India.',
    highlightText: 'TAX-FREE GAINS + 2.5% INTEREST',
    ctaText: 'Apply for SGB Issue',
    secondaryCtaText: 'Download Prospectus',
    gradient: 'from-emerald-900 via-teal-900 to-cyan-950',
    accentColor: 'bg-yellow-400 text-slate-950',
    textColor: 'text-white',
    features: ['100% Capital Protection Guarantee', 'Semiannual Direct Bank Account Interest', 'Tradeable on NSE / BSE'],
    expiryText: 'Subscription closes Aug 15',
    category: 'BONDS'
  },
  {
    id: 'ad-ipo-4',
    badge: 'FEATURED IPO SPONSOR',
    sponsorName: 'MeraBazaar Prime IPO Desk',
    title: 'Get 98% Allotment Priority & GMP Live Push Alerts',
    subtitle: 'Track real-time Grey Market Premium (GMP) for mainboard and SME IPOs before subscription opens.',
    highlightText: 'LIVE GMP TRACKER ACTIVE',
    ctaText: 'Subscribe to WhatsApp IPO Alerts',
    gradient: 'from-purple-900 via-rose-900 to-orange-950',
    accentColor: 'bg-pink-400 text-slate-950',
    textColor: 'text-white',
    features: ['Instant Allotment Status Check', 'SME & Mainboard Multi-bid Calculator', 'AI Listing Day Strategy Verdict'],
    expiryText: 'Updated 5 mins ago',
    category: 'IPO_ALERT'
  }
];

interface AdHeroBannerProps {
  portfolio?: PortfolioPosition[];
  watchlist?: WatchlistItem[];
  onOpenSubscription?: () => void;
  className?: string;
}

export const AdHeroBanner: React.FC<AdHeroBannerProps> = ({
  portfolio = [],
  watchlist = [],
  onOpenSubscription,
  className = ''
}) => {
  const [genericAds] = useState<AdOffer[]>(SAMPLE_ADS);
  const [targetedAds, setTargetedAds] = useState<AdOffer[]>([]);
  const [activeMode, setActiveMode] = useState<'generic' | 'targeted'>('generic');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300); // 5 minutes = 300 seconds

  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [selectedOfferModal, setSelectedOfferModal] = useState<AdOffer | null>(null);
  const [isClaimSuccess, setIsClaimSuccess] = useState(false);

  // Gemini ML Ad Targeting State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<{
    userPersona?: string;
    riskRating?: string;
    targetingReason?: string;
    matchedSponsors?: string[];
  } | null>(null);
  const [showAiInfoModal, setShowAiInfoModal] = useState(false);

  const fetchAiTargetedAds = useCallback(async () => {
    setIsAiLoading(true);
    try {
      const resp = await fetch('/api/gemini/targeted-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolio, watchlist })
      });
      const data = await resp.json();
      if (data && Array.isArray(data.ads) && data.ads.length > 0) {
        setTargetedAds(data.ads);
        setAiInsights({
          userPersona: data.userPersona,
          riskRating: data.riskRating,
          targetingReason: data.targetingReason,
          matchedSponsors: data.matchedSponsors
        });
      }
    } catch (err) {
      console.warn('AI Ad Targeting fetch fallback:', err);
    } finally {
      setIsAiLoading(false);
    }
  }, [portfolio, watchlist]);

  useEffect(() => {
    fetchAiTargetedAds();
  }, [fetchAiTargetedAds]);

  // 5-Minute Alternating Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          // Switch active mode
          setActiveMode(current => (current === 'generic' ? 'targeted' : 'generic'));
          setCurrentAdIndex(0);
          return 300; // Reset to 5 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Determine active display ads
  const currentAdList = activeMode === 'targeted' && targetedAds.length > 0 ? targetedAds : genericAds;
  const currentAd = currentAdList[currentAdIndex] || currentAdList[0] || SAMPLE_ADS[0];

  // Helper to format 300s -> "04:59"
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Auto-play slide timer every 6 seconds
  useEffect(() => {
    if (!isAutoPlaying || isDismissed || currentAdList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % currentAdList.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isDismissed, currentAdList.length]);

  // Track impressions cleanly without side-effects in render phase
  useEffect(() => {
    if (currentAdList[currentAdIndex]) {
      recordAdInteraction(currentAdList[currentAdIndex].sponsorName, 'impression');
    }
  }, [currentAdIndex, currentAdList]);

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentAdIndex(prev => (prev + 1) % currentAdList.length);
  };

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentAdIndex(prev => (prev - 1 + currentAdList.length) % currentAdList.length);
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    if (currentAd) {
      recordAdInteraction(currentAd.sponsorName, 'click');
    }
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  const handleActionClick = (ad: AdOffer) => {
    recordAdInteraction(ad.sponsorName, 'click');
    if (ad.category === 'PRO_PLAN' && onOpenSubscription) {
      onOpenSubscription();
    } else {
      setSelectedOfferModal(ad);
    }
  };

  if (isDismissed) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-end">
        <button
          onClick={() => setIsDismissed(false)}
          className="text-[11px] font-bold text-orange-600 hover:text-orange-800 flex items-center gap-1 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full transition-all"
        >
          <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />
          <span>Show Promoted Hero Ads (5-Min Auto-Rotate)</span>
        </button>
      </div>
    );
  }

  return (
    <section className={`max-w-7xl mx-auto px-4 my-4 ${className}`}>
      {/* Container Box */}
      <div className={`relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r ${currentAd.gradient} text-white transition-all duration-500 border border-white/10`}>
        {/* Decorative ambient blurred glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Control Bar */}
        <div className="relative z-10 px-6 pt-5 flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Active Ad Mode Badge */}
            {activeMode === 'targeted' ? (
              <span className="bg-purple-500/30 text-purple-100 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border border-purple-300/40 flex items-center gap-1">
                <BrainCircuit className="w-3.5 h-3.5 text-purple-300" /> Gemini ML AI Targeted Ads
              </span>
            ) : (
              <span className="bg-white/20 text-white text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border border-white/20 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Standard Partner Offers
              </span>
            )}

            <span className="bg-white/10 text-white/90 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-300" /> Auto-Switch in {formatTime(secondsRemaining)} (5m)
            </span>

            <span className="text-white/80 text-xs font-semibold">
              Sponsored by <strong className="text-white">{currentAd.sponsorName}</strong>
            </span>

            {/* AI ML Personalization Indicator */}
            {aiInsights && activeMode === 'targeted' && (
              <button
                onClick={() => setShowAiInfoModal(true)}
                className="bg-purple-500/30 hover:bg-purple-500/50 text-purple-100 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-purple-300/40 flex items-center gap-1 transition-all"
                title="Click to view Gemini ML Ad Targeting Analysis"
              >
                <Info className="w-3 h-3 text-purple-300" />
                <span>Why this ad?</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Manual Toggle Mode Button */}
            <button
              onClick={() => {
                setActiveMode(prev => (prev === 'generic' ? 'targeted' : 'generic'));
                setCurrentAdIndex(0);
                setSecondsRemaining(300); // Reset 5m timer
              }}
              className="bg-white/15 hover:bg-white/25 text-white text-[10px] font-black px-3 py-1 rounded-full border border-white/20 transition-all flex items-center gap-1"
              title="Switch between Standard Offers and AI Targeted Ads"
            >
              <RefreshCw className="w-3 h-3 text-amber-300" />
              <span>Switch to {activeMode === 'generic' ? 'Gemini AI Ads' : 'Standard Ads'}</span>
            </button>

            {/* Re-run AI Targeting Button */}
            {activeMode === 'targeted' && (
              <button
                onClick={fetchAiTargetedAds}
                disabled={isAiLoading}
                className="bg-white/10 hover:bg-white/20 text-white/90 hover:text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border border-white/15 transition-all disabled:opacity-50"
                title="Re-analyze portfolio and regenerate targeted ads via Gemini ML"
              >
                <RefreshCw className={`w-3 h-3 text-amber-300 ${isAiLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isAiLoading ? 'Analyzing...' : 'Re-Match AI'}</span>
              </button>
            )}

            {/* Auto Play toggle indicator */}
            <span className="hidden sm:inline-block text-[10px] text-white/70 font-bold bg-black/20 px-2 py-0.5 rounded-full">
              Ad {currentAdIndex + 1} of {currentAdList.length}
            </span>

            {/* Close / Dismiss Ad Header */}
            <button
              onClick={() => setIsDismissed(true)}
              className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
              title="Hide sponsored ads banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="relative z-10 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Hero Text & CTA */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Highlight Tag */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-2xl border border-white/20 text-xs font-black">
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${currentAd.accentColor}`}>
                {currentAd.highlightText}
              </span>
              {currentAd.expiryText && (
                <span className="text-white/90 text-[11px] font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-300" /> {currentAd.expiryText}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
              {currentAd.title}
            </h2>

            {/* Subtitle */}
            <p className="text-white/85 text-sm sm:text-base font-medium max-w-2xl leading-relaxed">
              {currentAd.subtitle}
            </p>

            {/* Feature Bullets */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1 text-xs font-semibold text-white/95">
              {currentAd.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-xl border border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={() => handleActionClick(currentAd)}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-2"
              >
                <span>{currentAd.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {currentAd.couponCode && (
                <button
                  onClick={() => handleCopyCoupon(currentAd.couponCode!)}
                  className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-4 py-3 rounded-2xl border border-white/25 transition-all flex items-center gap-2"
                >
                  <Percent className="w-4 h-4 text-amber-300" />
                  <span>
                    {copiedCoupon === currentAd.couponCode ? '✓ Code Copied!' : `Use Code: ${currentAd.couponCode}`}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Right Visual Badge / Ad Card */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center">
            <div className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl space-y-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto shadow-lg">
                <Gift className="w-8 h-8 text-slate-950" />
              </div>

              <div>
                <span className="text-xs uppercase font-extrabold text-amber-300 tracking-wider block">Special Partner Offer</span>
                <div className="font-black text-white text-lg mt-0.5">{currentAd.sponsorName}</div>
                <p className="text-xs text-white/80 mt-1">Instant Activation • 100% Verified Secure</p>
              </div>

              <button
                onClick={() => handleActionClick(currentAd)}
                className="w-full bg-white text-slate-950 hover:bg-amber-300 font-extrabold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Claim Offer Now</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Navigation Bar for Slides */}
        <div className="relative z-10 bg-black/30 backdrop-blur-sm px-6 py-2.5 flex items-center justify-between border-t border-white/10 text-xs font-bold">
          
          {/* Slide Indicators */}
          <div className="flex items-center gap-2">
            {currentAdList.map((ad, idx) => (
              <button
                key={ad.id}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentAdIndex(idx);
                }}
                className={`h-2 rounded-full transition-all ${
                  currentAdIndex === idx ? 'w-8 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                title={`Go to ad ${idx + 1}: ${ad.title}`}
              />
            ))}
          </div>

          {/* Arrows Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
              title="Previous Ad"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
              title="Next Ad"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Gemini ML Ad Targeting Info Modal */}
      {showAiInfoModal && aiInsights && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 relative">
            <button
              onClick={() => setShowAiInfoModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center font-black">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider">Gemini 3.6 ML Intelligence</span>
                <h3 className="text-xl font-black text-slate-900">Personalized Ad Match</h3>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="font-extrabold text-slate-500 uppercase text-[10px] block">Investor Persona Identified</span>
                <span className="font-black text-slate-900 text-sm">{aiInsights.userPersona || 'Growth Equity Specialist'}</span>
              </div>

              {aiInsights.riskRating && (
                <div>
                  <span className="font-extrabold text-slate-500 uppercase text-[10px] block">Risk Profile</span>
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 inline-block mt-0.5">
                    {aiInsights.riskRating}
                  </span>
                </div>
              )}

              <div>
                <span className="font-extrabold text-slate-500 uppercase text-[10px] block">Why You Are Seeing These Offers</span>
                <p className="font-medium text-slate-700 mt-0.5 leading-relaxed">
                  {aiInsights.targetingReason}
                </p>
              </div>

              {aiInsights.matchedSponsors && (
                <div>
                  <span className="font-extrabold text-slate-500 uppercase text-[10px] block mb-1">Matched Financial Partners</span>
                  <div className="flex flex-wrap gap-1.5">
                    {aiInsights.matchedSponsors.map((sp, idx) => (
                      <span key={idx} className="bg-purple-100 text-purple-800 font-extrabold text-[10px] px-2.5 py-1 rounded-lg">
                        {sp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAiInfoModal(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-2xl transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offer Claim Modal */}
      {selectedOfferModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 relative">
            
            <button
              onClick={() => {
                setSelectedOfferModal(null);
                setIsClaimSuccess(false);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {!isClaimSuccess ? (
              <div className="space-y-4">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-black">
                  <Gift className="w-6 h-6" />
                </div>

                <div>
                  <span className="text-[10px] uppercase font-black text-orange-600 tracking-wider">
                    {selectedOfferModal.badge}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    {selectedOfferModal.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    {selectedOfferModal.subtitle}
                  </p>
                </div>

                <div className="bg-orange-50 p-3.5 rounded-2xl border border-orange-200 space-y-2">
                  <div className="text-xs font-black text-slate-800">What you get:</div>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {selectedOfferModal.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Claim Form */}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    setIsClaimSuccess(true);
                  }}
                  className="space-y-3 pt-2"
                >
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Enter Phone Number / Email for Offer Link</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 98765 43210 or email@domain.com"
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black text-xs py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Instant Apply & Redirect</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto font-black animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900">Offer Access Link Sent!</h3>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto mt-1">
                    We have dispatched your exclusive referral link and benefits voucher. Check your device messages.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedOfferModal(null);
                    setIsClaimSuccess(false);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-6 py-2.5 rounded-2xl transition-all"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
