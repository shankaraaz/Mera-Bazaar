import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MarketOverview } from './components/MarketOverview';
import { StockScreener } from './components/StockScreener';
import { StockDetail } from './components/StockDetail';
import { AIAnalyst } from './components/AIAnalyst';
import { PortfolioWatchlist } from './components/PortfolioWatchlist';
import { IPOsAndFunds } from './components/IPOsAndFunds';
import { CorporateActionsBonus } from './components/CorporateActionsBonus';
import { MarketNewsSegment } from './components/MarketNewsSegment';
import { GoogleAuthModal, UserProfile } from './components/GoogleAuthModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { LoginPage } from './components/LoginPage';
import { AppTourOverlay } from './components/AppTourOverlay';
import { AdHeroBanner } from './components/AdHeroBanner';
import { AdminRevenueDashboard } from './components/AdminRevenueDashboard';
import { PriceAlertsModal } from './components/PriceAlertsModal';
import { PriceAlertToast } from './components/PriceAlertToast';
import { playAlertChime } from './utils/sound';
import { Sparkles, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

import { Stock, MarketIndex, MarketBreadth, InstitutionalFlow, CommodityForex, MarketNews, IPOCard, MutualFund, PortfolioPosition, WatchlistItem, CorporateAction, PriceAlert } from './types/market';
import { INITIAL_INDICES, INITIAL_STOCKS, INITIAL_BREADTH, INITIAL_INSTITUTIONAL_FLOW, INITIAL_COMMODITIES_FOREX, INITIAL_NEWS, INITIAL_IPOS, INITIAL_MUTUAL_FUNDS, INITIAL_CORPORATE_ACTIONS } from './data/mockMarketData';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string>('RELIANCE');
  const [screenerPreset, setScreenerPreset] = useState<string | undefined>(undefined);
  const [isLiveTicking, setIsLiveTicking] = useState<boolean>(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('merabazaar_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState<boolean>(false);

  const handleToggleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    try {
      localStorage.setItem('merabazaar_sidebar_collapsed', String(collapsed));
    } catch {}
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsSidebarMobileOpen(prev => !prev);
    } else {
      handleToggleSidebarCollapse(!isSidebarCollapsed);
    }
  };

  // App Gate / Entry Login state
  const [hasEnteredApp, setHasEnteredApp] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('merabazaar_user');
      const entered = sessionStorage.getItem('merabazaar_entered');
      return !!saved || entered === 'true';
    } catch {
      return false;
    }
  });

  // Pro Subscription State
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(false);
  const [isAppTourOpen, setIsAppTourOpen] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('merabazaar_pro_subscribed') === 'true';
    } catch {
      return false;
    }
  });

  // Auto-launch App Tour for first-time guest users
  useEffect(() => {
    if (hasEnteredApp) {
      const tourDone = localStorage.getItem('merabazaar_app_tour_completed');
      if (tourDone !== 'true') {
        const timer = setTimeout(() => {
          setIsAppTourOpen(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [hasEnteredApp]);

  // Market Data States
  const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS);
  const [indices, setIndices] = useState<MarketIndex[]>(INITIAL_INDICES);
  const [breadth, setBreadth] = useState<MarketBreadth>(INITIAL_BREADTH);
  const [institutionalFlow, setInstitutionalFlow] = useState<InstitutionalFlow[]>(INITIAL_INSTITUTIONAL_FLOW);
  const [commoditiesForex, setCommoditiesForex] = useState<CommodityForex[]>(INITIAL_COMMODITIES_FOREX);
  const [news, setNews] = useState<MarketNews[]>(INITIAL_NEWS);
  const [ipos, setIpos] = useState<IPOCard[]>(INITIAL_IPOS);
  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>(INITIAL_MUTUAL_FUNDS);
  const [corporateActions, setCorporateActions] = useState<CorporateAction[]>(INITIAL_CORPORATE_ACTIONS);

  // User & Authentication State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('merabazaar_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (userProfile: UserProfile) => {
    setUser(userProfile);
    localStorage.setItem('merabazaar_user', JSON.stringify(userProfile));
    setHasEnteredApp(true);
    sessionStorage.setItem('merabazaar_entered', 'true');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('merabazaar_user');
    sessionStorage.removeItem('merabazaar_entered');
    setHasEnteredApp(false);
  };

  const handleContinueAsGuest = () => {
    setHasEnteredApp(true);
    sessionStorage.setItem('merabazaar_entered', 'true');
  };

  // User Local Storage Persistence for Portfolio & Watchlist
  const [portfolio, setPortfolio] = useState<PortfolioPosition[]>(() => {
    try {
      const saved = localStorage.getItem('merabazaar_portfolio');
      return saved ? JSON.parse(saved) : [
        { id: 'p1', stockSymbol: 'RELIANCE', stockName: 'Reliance Industries Ltd.', quantity: 15, averageBuyPrice: 2950, buyDate: '2026-06-15' },
        { id: 'p2', stockSymbol: 'TCS', stockName: 'Tata Consultancy Services Ltd.', quantity: 10, averageBuyPrice: 4120, buyDate: '2026-07-01' },
        { id: 'p3', stockSymbol: 'TATAMOTORS', stockName: 'Tata Motors Ltd.', quantity: 25, averageBuyPrice: 1050, buyDate: '2026-07-10' }
      ];
    } catch {
      return [];
    }
  });

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('merabazaar_watchlist');
      return saved ? JSON.parse(saved) : [
        { id: 'w1', stockSymbol: 'INFY', addedAt: '2026-08-01' },
        { id: 'w2', stockSymbol: 'ZOMATO', addedAt: '2026-08-02' },
        { id: 'w3', stockSymbol: 'HAL', addedAt: '2026-08-03' }
      ];
    } catch {
      return [];
    }
  });

  // Save to Local Storage
  useEffect(() => {
    localStorage.setItem('merabazaar_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    localStorage.setItem('merabazaar_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Real-Time Price Alerts System State
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem('merabazaar_price_alerts');
      return saved ? JSON.parse(saved) : [
        {
          id: 'alert-sample-1',
          symbol: 'RELIANCE',
          stockName: 'Reliance Industries Ltd.',
          targetPrice: 3080.00,
          condition: 'ABOVE',
          type: 'BUY',
          label: 'Breakout',
          note: 'Resistance breakout target',
          triggered: false,
          createdAt: new Date().toISOString(),
          initialPrice: 3045.50,
          active: true,
        },
        {
          id: 'alert-sample-2',
          symbol: 'TCS',
          stockName: 'Tata Consultancy Services Ltd.',
          targetPrice: 4250.00,
          condition: 'BELOW',
          type: 'BUY',
          label: 'Dip Buy',
          note: 'Support level retest accumulation',
          triggered: false,
          createdAt: new Date().toISOString(),
          initialPrice: 4320.00,
          active: true,
        },
      ];
    } catch {
      return [];
    }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('merabazaar_alert_sound') !== 'false';
    } catch {
      return true;
    }
  });

  const [isPriceAlertsModalOpen, setIsPriceAlertsModalOpen] = useState(false);
  const [alertModalInitialSymbol, setAlertModalInitialSymbol] = useState<string | undefined>(undefined);
  const [activeAlertToast, setActiveAlertToast] = useState<PriceAlert | null>(null);

  // Save alerts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('merabazaar_price_alerts', JSON.stringify(alerts));
    } catch (e) {
      console.error('Failed to save alerts', e);
    }
  }, [alerts]);

  // Save sound setting
  useEffect(() => {
    try {
      localStorage.setItem('merabazaar_alert_sound', String(soundEnabled));
    } catch {}
  }, [soundEnabled]);

  // Real-Time Market Data Matching Engine for Price Alerts
  useEffect(() => {
    if (!stocks || stocks.length === 0) return;

    setAlerts(prevAlerts => {
      let hasUpdates = false;
      let newlyTriggered: PriceAlert | null = null;

      const nextAlerts = prevAlerts.map(alert => {
        if (alert.active === false || alert.triggered) return alert;

        const currentStock = stocks.find(s => s.symbol.toUpperCase() === alert.symbol.toUpperCase());
        if (!currentStock || typeof currentStock.price !== 'number') return alert;

        const isTriggered =
          (alert.condition === 'ABOVE' && currentStock.price >= alert.targetPrice) ||
          (alert.condition === 'BELOW' && currentStock.price <= alert.targetPrice);

        if (isTriggered) {
          hasUpdates = true;
          const hit: PriceAlert = {
            ...alert,
            triggered: true,
            triggeredPrice: currentStock.price,
            triggeredAt: new Date().toISOString(),
          };
          newlyTriggered = hit;
          return hit;
        }

        return alert;
      });

      if (newlyTriggered) {
        setActiveAlertToast(newlyTriggered);
        if (soundEnabled) {
          playAlertChime();
        }
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(`Price Alert: ${newlyTriggered.symbol} Hit Target!`, {
              body: `${newlyTriggered.stockName || newlyTriggered.symbol} crossed ${newlyTriggered.condition} ₹${newlyTriggered.targetPrice} (LTP: ₹${newlyTriggered.triggeredPrice})`,
            });
          } catch {}
        }
      }

      return hasUpdates ? nextAlerts : prevAlerts;
    });
  }, [stocks, soundEnabled]);

  // Alert Handlers
  const handleSaveAlert = (alertData: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'> & { id?: string }) => {
    if (alertData.id) {
      setAlerts(prev => prev.map(a => a.id === alertData.id ? { ...a, ...alertData } : a));
    } else {
      const newAlert: PriceAlert = {
        ...alertData,
        id: `alert-${Date.now()}`,
        triggered: false,
        createdAt: new Date().toISOString(),
      };
      setAlerts(prev => [newAlert, ...prev]);
    }
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleToggleActiveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: a.active === false ? true : false } : a));
  };

  const handleRearmAlert = (id: string, newTarget?: number) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === id) {
        const liveStock = stocks.find(s => s.symbol === a.symbol);
        const target = newTarget || (liveStock ? Number((liveStock.price * 1.05).toFixed(2)) : a.targetPrice);
        return {
          ...a,
          targetPrice: target,
          triggered: false,
          triggeredPrice: undefined,
          triggeredAt: undefined,
          active: true,
        };
      }
      return a;
    }));
  };

  const handleOpenAlertsWithStock = (symbol?: string) => {
    setAlertModalInitialSymbol(symbol);
    setIsPriceAlertsModalOpen(true);
  };

  // Market Hours Status & Simulation State
  const [marketStatus, setMarketStatus] = useState<{
    isOpen: boolean;
    isForced: boolean;
    istTime: string;
    reason: string;
    nextEventText: string;
    forceSimulateMarketOpen: boolean;
  }>({
    isOpen: false,
    isForced: false,
    istTime: '',
    reason: 'Checking market hours...',
    nextEventText: '',
    forceSimulateMarketOpen: false,
  });

  // Fetch Market Hours Status
  const fetchMarketStatus = async () => {
    try {
      const res = await fetch('/api/market/status');
      const data = await res.json();
      if (data && typeof data.isOpen === 'boolean') {
        setMarketStatus(data);
      }
    } catch (e) {
      console.error('Error fetching market status', e);
    }
  };

  useEffect(() => {
    fetchMarketStatus();
    const interval = setInterval(fetchMarketStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSimulation = async () => {
    try {
      const res = await fetch('/api/market/toggle-simulation', { method: 'POST' });
      const data = await res.json();
      if (data) {
        setMarketStatus(data);
      }
    } catch (e) {
      console.error('Error toggling simulation', e);
    }
  };

  // Periodic API fetch from server when live ticking is enabled AND market is open (or forced)
  useEffect(() => {
    if (!isLiveTicking) return;

    const interval = setInterval(() => {
      fetch('/api/market/stocks')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setStocks(data);
        })
        .catch(() => {});

      fetch('/api/market/indices')
        .then(res => res.json())
        .then(data => {
          if (data.indices) setIndices(data.indices);
          if (data.breadth) setBreadth(data.breadth);
        })
        .catch(() => {});
    }, 3500);

    return () => clearInterval(interval);
  }, [isLiveTicking]);

  // Handler to select stock and jump to Detail View (with dynamic API fetch for searched/global stocks)
  const handleSelectStock = async (symbol: string) => {
    const cleanSym = symbol.trim().toUpperCase();
    const existing = stocks.find(s => s.symbol.toUpperCase() === cleanSym || s.id.toUpperCase() === cleanSym);
    
    if (!existing) {
      try {
        const res = await fetch(`/api/market/stocks/${encodeURIComponent(cleanSym)}`);
        if (res.ok) {
          const stockData = await res.json();
          if (stockData && stockData.symbol) {
            setStocks(prev => {
              if (prev.some(s => s.symbol === stockData.symbol)) return prev;
              return [...prev, stockData];
            });
          }
        }
      } catch (err) {
        console.error('Failed to load dynamic stock data', err);
      }
    }

    setSelectedStockSymbol(cleanSym);
    setActiveTab('detail');
  };

  // Handler to open Screener with a preset
  const handleOpenScreenerPreset = (presetKey: string) => {
    setScreenerPreset(presetKey);
    setActiveTab('screener');
  };

  // Add position to Portfolio
  const handleAddStockToPortfolio = (pos: Omit<PortfolioPosition, 'id'>) => {
    const newPos: PortfolioPosition = {
      ...pos,
      id: `pos-${Date.now()}`,
    };
    setPortfolio(prev => [...prev, newPos]);
  };

  // Remove position from Portfolio
  const handleRemoveFromPortfolio = (id: string) => {
    setPortfolio(prev => prev.filter(p => p.id !== id));
  };

  // Add stock to Watchlist
  const handleAddToWatchlist = (symbol: string) => {
    if (!watchlist.some(w => w.stockSymbol === symbol)) {
      setWatchlist(prev => [...prev, { id: `w-${Date.now()}`, stockSymbol: symbol, addedAt: new Date().toISOString() }]);
    }
  };

  // Remove stock from Watchlist
  const handleRemoveFromWatchlist = (id: string) => {
    setWatchlist(prev => prev.filter(w => w.id !== id));
  };

  const selectedStock = stocks.find(s => s.symbol === selectedStockSymbol) || stocks[0];
  const isAdmin = user?.email?.toLowerCase() === 'shankaraazrahi@gmail.com';
  const hasFullAccess = isAdmin || isSubscribed;

  // Protect admin-revenue tab if user is not logged in as admin
  useEffect(() => {
    if (activeTab === 'admin-revenue' && !isAdmin) {
      setActiveTab('overview');
    }
  }, [activeTab, isAdmin]);

  const handleSubscribeSuccess = () => {
    setIsSubscribed(true);
    localStorage.setItem('merabazaar_pro_subscribed', 'true');
  };

  if (!hasEnteredApp) {
    return (
      <>
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onContinueAsGuest={handleContinueAsGuest}
          onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
        />
        <SubscriptionModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          currentUser={user}
          isSubscribed={hasFullAccess}
          onSubscribeSuccess={handleSubscribeSuccess}
          onOpenGoogleAuth={() => setIsAuthModalOpen(true)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-orange-500 selection:text-white">
      {/* Top Full-Width Fixed Header & Navigation */}
      <Header
        indices={indices}
        stocks={stocks}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectStock={handleSelectStock}
        isLiveTicking={isLiveTicking}
        setIsLiveTicking={setIsLiveTicking}
        user={user}
        onOpenGoogleAuth={() => setIsAuthModalOpen(true)}
        isSubscribed={hasFullAccess}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
        onOpenAppTour={() => setIsAppTourOpen(true)}
        onToggleSidebar={handleToggleSidebar}
        marketStatus={marketStatus}
        onToggleSimulation={handleToggleSimulation}
        activeAlertsCount={alerts.filter(a => a.active !== false && !a.triggered).length}
        triggeredAlertsCount={alerts.filter(a => a.triggered).length}
        onOpenAlerts={() => handleOpenAlertsWithStock()}
      />

      {/* Left Sidebar Navigation with Category Icons (Starts below Header on desktop) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={handleToggleSidebarCollapse}
        isMobileOpen={isSidebarMobileOpen}
        setIsMobileOpen={setIsSidebarMobileOpen}
        user={user}
        isSubscribed={hasFullAccess}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
        onOpenAppTour={() => setIsAppTourOpen(true)}
        portfolioCount={portfolio.length}
        watchlistCount={watchlist.length}
        alertsCount={alerts.filter(a => !a.triggered).length}
        onOpenAlerts={() => handleOpenAlertsWithStock()}
      />

      {/* Main Page Layout (Offset for Sidebar on desktop) */}
      <div className={`transition-all duration-300 flex flex-col min-h-[calc(100vh-138px)] ${
        isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
      }`}>
        {/* Main Content Area */}
        <main className="max-w-7xl w-full mx-auto px-4 py-6 space-y-6 flex-1">
          {/* Promoted / Sponsored Ads Hero Banner Section */}
          <AdHeroBanner 
            portfolio={portfolio} 
            watchlist={watchlist} 
            onOpenSubscription={() => setIsSubscriptionModalOpen(true)} 
          />

        {/* Banner for Unsubscribed Users viewing Pro Tabs */}
        {!hasFullAccess && activeTab !== 'overview' && (
          <div className="mb-6 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white rounded-3xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm uppercase tracking-wide">MeraBazaar Pro Segment</span>
                  <span className="bg-white/20 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                    ₹99 / Month
                  </span>
                </div>
                <p className="text-xs text-orange-100 font-medium mt-0.5">
                  Unlock unlimited access to all segments or log in as Admin (<span className="font-bold underline">shankaraazrahi@gmail.com</span>) for full access!
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="px-6 py-3 bg-white text-orange-950 hover:bg-orange-50 font-black text-xs rounded-2xl shadow-md transition-all shrink-0 flex items-center gap-2 active:scale-95"
            >
              <span>Pay ₹99 & Unlock All Segments</span>
              <ArrowRight className="w-4 h-4 text-orange-600" />
            </button>
          </div>
        )}

        {activeTab === 'overview' && (
          <MarketOverview
            indices={indices}
            breadth={breadth}
            stocks={stocks}
            institutionalFlow={institutionalFlow}
            commoditiesForex={commoditiesForex}
            news={news}
            onSelectStock={handleSelectStock}
            onOpenScreenerPreset={handleOpenScreenerPreset}
            marketStatus={marketStatus}
          />
        )}

        {activeTab === 'news' && (
          <MarketNewsSegment
            news={news}
            stocks={stocks}
            onSelectStock={handleSelectStock}
          />
        )}

        {activeTab === 'screener' && (
          <StockScreener
            stocks={stocks}
            onSelectStock={handleSelectStock}
            initialPreset={screenerPreset}
          />
        )}

        {activeTab === 'detail' && selectedStock && (
          <StockDetail
            stock={selectedStock}
            stocks={stocks}
            onSelectStock={handleSelectStock}
            onAddToWatchlist={handleAddToWatchlist}
            onAddToPortfolio={stockObj =>
              handleAddStockToPortfolio({
                stockSymbol: stockObj.symbol,
                stockName: stockObj.name,
                quantity: 10,
                averageBuyPrice: stockObj.price,
                buyDate: new Date().toISOString().split('T')[0],
              })
            }
            onOpenPriceAlertModal={handleOpenAlertsWithStock}
          />
        )}

        {activeTab === 'ai' && (
          <AIAnalyst
            portfolio={portfolio}
            stocks={stocks}
            onSelectStock={handleSelectStock}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioWatchlist
            portfolio={portfolio}
            watchlist={watchlist}
            stocks={stocks}
            onAddStockToPortfolio={handleAddStockToPortfolio}
            onRemoveFromPortfolio={handleRemoveFromPortfolio}
            onRemoveFromWatchlist={handleRemoveFromWatchlist}
            onSelectStock={handleSelectStock}
          />
        )}

        {activeTab === 'ipos-funds' && (
          <IPOsAndFunds
            ipos={ipos}
            mutualFunds={mutualFunds}
            stocks={stocks}
            portfolio={portfolio}
            watchlist={watchlist}
            onSelectStock={handleSelectStock}
          />
        )}

        {activeTab === 'bonus' && (
          <CorporateActionsBonus
            corporateActions={corporateActions}
            stocks={stocks}
            onSelectStock={handleSelectStock}
          />
        )}

        {activeTab === 'admin-revenue' && isAdmin && (
          <AdminRevenueDashboard
            currentUser={user}
            isSubscribed={hasFullAccess}
            onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-orange-100 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">MeraBazaar</span>
            <span>• Indian Share Market Screener & Real-Time Tracking</span>
          </div>

          <div className="text-slate-500">
            Data powered by BSE/NSE Live Simulation & Gemini 3.6 AI Equity Research
          </div>
        </div>
      </footer>
      </div>

      {/* Google Authentication Modal */}
      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={user}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />

      {/* Pro Plan Subscription Checkout Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        currentUser={user}
        isSubscribed={hasFullAccess}
        onSubscribeSuccess={handleSubscribeSuccess}
        onOpenGoogleAuth={() => {
          setIsSubscriptionModalOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Guided App Tour Onboarding Overlay */}
      <AppTourOverlay
        isOpen={isAppTourOpen}
        onClose={() => setIsAppTourOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
      />

      {/* Floating Real-Time Price Alert Toast Notifications */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 pointer-events-none max-w-sm sm:max-w-md w-full px-2">
        {activeAlertToast && (
          <PriceAlertToast
            alert={activeAlertToast}
            stock={stocks.find(s => s.symbol.toUpperCase() === activeAlertToast.symbol.toUpperCase())}
            onDismiss={() => setActiveAlertToast(null)}
            onViewStock={(sym) => {
              handleSelectStock(sym);
              setActiveAlertToast(null);
            }}
            onRearm={(id) => {
              handleRearmAlert(id);
              setActiveAlertToast(null);
            }}
          />
        )}
      </div>

      {/* Global Price Alerts Management Modal */}
      <PriceAlertsModal
        isOpen={isPriceAlertsModalOpen}
        onClose={() => {
          setIsPriceAlertsModalOpen(false);
          setAlertModalInitialSymbol(undefined);
        }}
        alerts={alerts}
        stocks={stocks}
        onSaveAlert={handleSaveAlert}
        onDeleteAlert={handleDeleteAlert}
        onToggleActiveAlert={handleToggleActiveAlert}
        onRearmAlert={handleRearmAlert}
        onSelectStock={handleSelectStock}
        initialStockSymbol={alertModalInitialSymbol}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(prev => !prev)}
      />
    </div>
  );
}
