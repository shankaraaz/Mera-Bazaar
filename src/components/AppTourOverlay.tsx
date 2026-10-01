import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart2, 
  Filter, 
  Activity, 
  Bot, 
  Briefcase, 
  Search, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  CheckCircle2, 
  Compass, 
  Lightbulb, 
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Zap,
  HelpCircle,
  Calculator
} from 'lucide-react';

export interface TourStep {
  id: string;
  tab: string;
  targetId: string;
  viewTargetId?: string;
  title: string;
  tagline: string;
  description: string;
  highlights: string[];
  icon: React.ElementType;
  tooltipPosition?: 'bottom' | 'top' | 'left' | 'right' | 'center';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'overview',
    tab: 'overview',
    targetId: 'tour-nav-overview',
    viewTargetId: 'tour-view-overview',
    title: '1. Live Market Overview',
    tagline: 'NSE & BSE Indices, Breadth & Institutional Cash Flow',
    description: 'Welcome to MeraBazaar! Start here for a real-time pulse on Indian financial markets. Track Nifty 50, Sensex, Market Breadth (Advances/Declines), Top Gainers/Losers, and FII/DII institutional cash flow.',
    highlights: [
      'Real-time BSE & NSE index tickers and volatility levels',
      'FII vs DII institutional cash buy/sell tracking',
      'Daily gainers, losers, and 52-week breakout leaders'
    ],
    icon: BarChart2,
    tooltipPosition: 'bottom'
  },
  {
    id: 'screener',
    tab: 'screener',
    targetId: 'tour-nav-screener',
    viewTargetId: 'tour-view-screener',
    title: '2. Indian Stock Screener',
    tagline: 'Filter 1,000+ Equities by Value, Growth & Momentum',
    description: 'Uncover high-potential Indian stocks. Filter equities by PE ratio, Market Cap, Dividend Yield, RSI Momentum, and Debt/Equity. Use one-click strategy presets like Value Gems or High Dividend Yield.',
    highlights: [
      'Pre-built strategy presets (Dividend Gems, Momentum, Value)',
      'Custom range sliders for valuation and fundamental ratios',
      'Export filtered equity lists directly to CSV'
    ],
    icon: Filter,
    tooltipPosition: 'bottom'
  },
  {
    id: 'detail',
    tab: 'detail',
    targetId: 'tour-nav-detail',
    viewTargetId: 'tour-view-detail',
    title: '3. Technical Charts & Financials',
    tagline: 'Deep Company Fundamentals & Candlestick Analysis',
    description: 'Drill down into any listed company. Analyze interactive candlestick charts, quarterly profit & revenue statements, valuation multiples, dividend history, and analyst target prices.',
    highlights: [
      'Interactive candlestick & volume trend charts',
      'Quarterly P&L statements & balance sheet metrics',
      'One-click Add to Portfolio & Watchlist controls'
    ],
    icon: Activity,
    tooltipPosition: 'bottom'
  },
  {
    id: 'ai',
    tab: 'ai',
    targetId: 'tour-nav-ai',
    viewTargetId: 'tour-view-ai',
    title: '4. Gemini 3.6 AI Equity Analyst',
    tagline: 'Automated Moat Analysis & Portfolio Diagnostics',
    description: 'Leverage Google Gemini 3.6 AI for instant equity research. Get automated fundamental reports, competitive moat ratings, risk diagnostics, and custom AI stock Q&A.',
    highlights: [
      'Instant AI fundamental health score & sentiment',
      'Portfolio concentration & sector risk analysis',
      'Custom prompt engine for deep equity questions'
    ],
    icon: Bot,
    tooltipPosition: 'bottom'
  },
  {
    id: 'portfolio',
    tab: 'portfolio',
    targetId: 'tour-nav-portfolio',
    viewTargetId: 'tour-view-portfolio',
    title: '5. Portfolio & Capital Gains Tax Estimator',
    tagline: 'Real-time P&L & Union Budget 2024 STCG / LTCG Calculator',
    description: 'Manage your equity investments and estimate capital gains tax. Calculates Union Budget 2024 compliant STCG (20%) and LTCG (12.5%) tax liabilities with built-in tax-loss harvesting tips.',
    highlights: [
      'Real-time position-level profit & loss tracking',
      'Union Budget 2024 STCG (20%) & LTCG (12.5%) engine',
      'Export official Capital Gains Tax Statements to CSV'
    ],
    icon: Briefcase,
    tooltipPosition: 'bottom'
  },
  {
    id: 'header-controls',
    tab: 'overview',
    targetId: 'tour-header-search',
    viewTargetId: 'tour-header-controls',
    title: '6. Search, Live Feed & Language Controls',
    tagline: 'Instant Company Lookup & Multi-Language Support',
    description: 'Search any NSE/BSE stock symbol instantly, toggle the live market feed simulation, switch app language (English, Hindi, Hinglish, Gujarati, Marathi), or upgrade to MeraBazaar Pro!',
    highlights: [
      'Instant search dropdown for all listed Indian companies',
      'Multi-language UI translation support',
      'Market hours simulation toggle & Pro upgrade'
    ],
    icon: Search,
    tooltipPosition: 'bottom'
  }
];

interface AppTourOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSubscription?: () => void;
}

export const AppTourOverlay: React.FC<AppTourOverlayProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onOpenSubscription,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isFinishedModalOpen, setIsFinishedModalOpen] = useState<boolean>(false);

  const currentStep = TOUR_STEPS[currentStepIndex];

  // Update active tab and compute element bounding box when step changes
  const updateHighlightTarget = useCallback(() => {
    if (!isOpen || !currentStep) return;

    // First ensure tab is selected
    if (activeTab !== currentStep.tab) {
      setActiveTab(currentStep.tab);
    }

    // Give DOM time to update layout
    const timer = setTimeout(() => {
      let el = document.getElementById(currentStep.targetId);
      if (!el && currentStep.viewTargetId) {
        el = document.getElementById(currentStep.viewTargetId);
      }

      if (el) {
        const rect = el.getBoundingClientRect();
        // Scroll target into view if needed
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [isOpen, currentStep, activeTab, setActiveTab]);

  useEffect(() => {
    updateHighlightTarget();
  }, [currentStepIndex, isOpen, updateHighlightTarget]);

  // Recalculate target rect on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!isOpen || !currentStep) return;
      let el = document.getElementById(currentStep.targetId);
      if (!el && currentStep.viewTargetId) {
        el = document.getElementById(currentStep.viewTargetId);
      }
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [isOpen, currentStep]);

  // Keyboard Navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkipTour();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNextStep();
      } else if (e.key === 'ArrowLeft') {
        handlePrevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  if (!isOpen) return null;

  const handleNextStep = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Tour Completed
      localStorage.setItem('merabazaar_app_tour_completed', 'true');
      setIsFinishedModalOpen(true);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkipTour = () => {
    localStorage.setItem('merabazaar_app_tour_completed', 'true');
    onClose();
  };

  const handleFinishTour = () => {
    localStorage.setItem('merabazaar_app_tour_completed', 'true');
    setIsFinishedModalOpen(false);
    onClose();
  };

  const handleRestartTour = () => {
    setIsFinishedModalOpen(false);
    setCurrentStepIndex(0);
  };

  const StepIcon = currentStep.icon;
  const progressPercent = Math.round(((currentStepIndex + 1) / TOUR_STEPS.length) * 100);

  // Position popover relative to target rectangle if available
  let popoverStyle: React.CSSProperties = {};
  let showHighlightBox = false;

  if (targetRect && targetRect.width > 0 && targetRect.height > 0) {
    showHighlightBox = true;
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden select-none animate-in fade-in duration-300">
      {/* Dark Blur Overlay Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300"
        onClick={handleSkipTour}
      />

      {/* Target Element Spotlight Highlight Ring */}
      {showHighlightBox && targetRect && (
        <div
          className="absolute pointer-events-none transition-all duration-300 ease-out rounded-2xl ring-4 ring-orange-500 shadow-[0_0_35px_rgba(249,115,22,0.4)] bg-white/10"
          style={{
            top: `${Math.max(0, targetRect.top - 6)}px`,
            left: `${Math.max(0, targetRect.left - 6)}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
          }}
        >
          {/* Animated Glowing Beacon Pin */}
          <div className="absolute -top-3 -right-3 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center font-black text-xs shadow-lg animate-bounce">
            <Zap className="w-3 h-3 text-amber-200 fill-amber-200" />
          </div>
        </div>
      )}

      {/* Tour Completion Celebration Modal */}
      {isFinishedModalOpen ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="bg-white border border-orange-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200 relative">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-orange-500/30">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-2">
              <span className="bg-emerald-100 text-emerald-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Onboarding Completed!</span>
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                You're Ready to Explore MeraBazaar!
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                You have mastered all key segments of MeraBazaar. Use the Stock Screener to find growth stocks, analyze financials, or calculate capital gains tax anytime.
              </p>
            </div>

            <div className="bg-orange-50/80 p-4 rounded-2xl border border-orange-200 text-left space-y-2">
              <div className="text-xs font-black text-orange-950 uppercase tracking-wide flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-orange-600" />
                <span>Pro Trader Quick Tips</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1 font-semibold list-disc list-inside">
                <li>Search any company symbol (e.g. RELIANCE, TCS) in the header</li>
                <li>Use Gemini AI Analyst for instant equity risk diagnostics</li>
                <li>Calculate Union Budget 2024 STCG/LTCG tax liabilities</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={handleFinishTour}
                className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs py-3.5 px-4 rounded-2xl shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Start Exploring App</span>
                <ArrowRight className="w-4 h-4 text-amber-200" />
              </button>

              <button
                onClick={handleRestartTour}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>Replay Tour</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ACTIVE STEP POPOVER TOOLTIP CARD */
        <div className="fixed inset-0 pointer-events-none z-[105] flex items-center justify-center p-4">
          <div 
            className="pointer-events-auto bg-white border-2 border-orange-200 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-5 relative animate-in zoom-in-95 duration-200"
            style={popoverStyle}
          >
            {/* Top Progress Bar & Header Badge */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {currentStep.title.split('.')[0] ? `Step ${currentStepIndex + 1} of ${TOUR_STEPS.length}` : ''}
                  </span>
                  <span className="text-xs font-extrabold text-slate-500">
                    {progressPercent}% Explored
                  </span>
                </div>

                <button
                  onClick={handleSkipTour}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                  title="Close App Tour (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar Line */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Step Title & Icon */}
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/20">
                <StepIcon className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                  {currentStep.title}
                </h3>
                <p className="text-xs font-bold text-orange-600 mt-0.5">
                  {currentStep.tagline}
                </p>
              </div>
            </div>

            {/* Step Body Description */}
            <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
              {currentStep.description}
            </p>

            {/* Key Feature Highlights */}
            <div className="space-y-2">
              <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Key Capabilities</span>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {currentStep.highlights.map((h, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={handleSkipTour}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-all px-2 py-1"
              >
                Skip Tour
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  onClick={handleNextStep}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-md shadow-orange-600/20 transition-all active:scale-95"
                >
                  <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish Tour 🎉' : 'Next Step'}</span>
                  <ChevronRight className="w-4 h-4 text-amber-200" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
