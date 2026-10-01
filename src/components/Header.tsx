import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  Search, 
  X,
  Activity, 
  BarChart2, 
  Filter, 
  Bot, 
  Briefcase, 
  Layers, 
  User, 
  Sparkles, 
  Globe, 
  Compass, 
  ArrowRight, 
  PanelLeft,
  Menu,
  MoreHorizontal,
  Bell
} from 'lucide-react';
import { MarketIndex, Stock } from '../types/market';
import { UserProfile } from './GoogleAuthModal';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../utils/translations';
import { searchStocksFuzzy } from '../utils/fuzzySearch';

interface HeaderProps {
  indices: MarketIndex[];
  stocks: Stock[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSelectStock: (symbol: string) => void;
  isLiveTicking: boolean;
  setIsLiveTicking: (live: boolean) => void;
  user: UserProfile | null;
  onOpenGoogleAuth: () => void;
  isSubscribed: boolean;
  onOpenSubscription: () => void;
  onOpenAppTour?: () => void;
  onToggleSidebar?: () => void;
  marketStatus?: {
    isOpen: boolean;
    isForced: boolean;
    istTime: string;
    reason: string;
    nextEventText: string;
    forceSimulateMarketOpen: boolean;
  };
  onToggleSimulation?: () => void;
  activeAlertsCount?: number;
  triggeredAlertsCount?: number;
  onOpenAlerts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  indices,
  stocks,
  activeTab,
  setActiveTab,
  onSelectStock,
  isLiveTicking,
  setIsLiveTicking,
  user,
  onOpenGoogleAuth,
  isSubscribed,
  onOpenSubscription,
  onOpenAppTour,
  onToggleSidebar,
  marketStatus,
  onToggleSimulation,
  activeAlertsCount = 0,
  triggeredAlertsCount = 0,
  onOpenAlerts,
}) => {
  const { t, language, setLanguage, languages } = useLanguage();
  const isAdmin = user?.email?.toLowerCase() === 'shankaraazrahi@gmail.com';
  const hasFullAccess = isAdmin || isSubscribed;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Instant fuzzy search over local stock universe & backend lookup
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      setIsSearching(false);
      setHighlightedIndex(-1);
      return;
    }

    // Rank local stock universe using fuzzy matching algorithm
    const fuzzyMatches = searchStocksFuzzy(stocks, q, 12);
    setSearchResults(fuzzyMatches);
    setHighlightedIndex(fuzzyMatches.length > 0 ? 0 : -1);

    // Also query backend API for dynamic Finnhub / NSE stock lookup
    setIsSearching(true);
    const timer = setTimeout(() => {
      fetch(`/api/market/search?q=${encodeURIComponent(q)}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            // Merge backend results with local fuzzy matches without duplicates
            const symbolMap = new Set(fuzzyMatches.map(s => s.symbol.toUpperCase()));
            const combined = [...fuzzyMatches];
            for (const item of data) {
              if (item && item.symbol && !symbolMap.has(item.symbol.toUpperCase())) {
                symbolMap.add(item.symbol.toUpperCase());
                combined.push(item);
              }
            }
            setSearchResults(combined);
          }
        })
        .catch(err => console.warn('Search query error', err))
        .finally(() => setIsSearching(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, stocks]);

  const handleSelectSearch = (symbol: string) => {
    if (!symbol) return;
    onSelectStock(symbol);
    setSearchQuery('');
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || searchResults.length === 0) {
      if (e.key === 'Enter' && searchQuery.trim()) {
        handleSelectSearch(searchQuery.trim().toUpperCase());
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
        handleSelectSearch(searchResults[highlightedIndex].symbol);
      } else if (searchQuery.trim()) {
        handleSelectSearch(searchQuery.trim().toUpperCase());
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const isMarketOpen = marketStatus?.isOpen ?? false;

  return (
    <header className="bg-white border-b border-orange-100 sticky top-0 z-50 shadow-sm">
      {/* Ticker Tape Bar */}
      <div className="bg-[#FFFDFB] border-b border-orange-100/70 px-4 py-1.5 overflow-x-auto text-xs whitespace-nowrap scrollbar-none flex items-center gap-6">
        {/* Dynamic Market Hours Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <div className={`flex items-center gap-1.5 font-extrabold text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
            isMarketOpen 
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
              : 'text-rose-800 bg-rose-50 border-rose-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isMarketOpen ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`}></span>
            {isMarketOpen ? (marketStatus?.isForced ? 'NSE/BSE SIMULATED LIVE' : 'NSE / BSE LIVE OPEN') : 'NSE / BSE MARKET CLOSED'}
          </div>

          <span className="text-[11px] font-semibold text-slate-500">
            {marketStatus?.istTime || '09:15 AM - 03:30 PM IST'}
          </span>

          {!isMarketOpen && (
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">
              {marketStatus?.nextEventText || 'Opens 09:15 AM Mon-Fri'}
            </span>
          )}

          {onToggleSimulation && (
            <button
              onClick={onToggleSimulation}
              className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800 hover:bg-orange-200 border border-orange-300 transition-colors"
              title="Click to force live market ticks even outside trading hours for testing"
            >
              {marketStatus?.forceSimulateMarketOpen ? '⚡ Stop Override' : '⚡ Force Live Test'}
            </button>
          )}
        </div>

        {indices.map(idx => (
          <div key={idx.symbol} className="flex items-center gap-2 shrink-0">
            <span className="text-slate-500 font-semibold">{idx.name}</span>
            <span className="font-bold text-slate-800">{idx.value.toLocaleString('en-IN')}</span>
            <span
              className={`flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                idx.change >= 0 ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-rose-700 bg-rose-50 border border-rose-200'
              }`}
            >
              {idx.change >= 0 ? '▲ +' : '▼ '}
              {idx.change.toFixed(1)} ({idx.pChange >= 0 ? '+' : ''}
              {idx.pChange.toFixed(2)}%)
            </span>
          </div>
        ))}
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Sidebar Toggle */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2.5">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 shadow-2xs transition-all active:scale-95 flex items-center justify-center group"
                title="Toggle Sidebar Navigation"
              >
                <PanelLeft className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" />
              </button>
            )}

            <div 
              onClick={() => setActiveTab('overview')} 
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-emerald-500 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">{t('appName').slice(0, 4)}<span className="text-orange-600">{t('appName').slice(4) || 'Bazaar'}</span></span>
                  <span className="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-md font-bold border border-orange-200">IN</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">{t('appTagline')}</p>
              </div>
            </div>
          </div>

          {/* Mobile Right Bar: Language, Alerts & Profile */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Mobile Alerts Bell Button */}
            {onOpenAlerts && (
              <button
                onClick={onOpenAlerts}
                className="relative p-2 bg-orange-50 border border-orange-200 text-orange-900 rounded-xl"
                title="Stock Price Alerts"
                aria-label="Stock Price Alerts"
              >
                <Bell className="w-4 h-4 text-orange-600" />
                {((triggeredAlertsCount ?? 0) > 0 || (activeAlertsCount ?? 0) > 0) && (
                  <span className={`absolute -top-1 -right-1 text-[9px] font-black rounded-full px-1 min-w-[16px] h-4 flex items-center justify-center text-white ${
                    (triggeredAlertsCount ?? 0) > 0 ? 'bg-rose-600 animate-pulse' : 'bg-orange-600'
                  }`}>
                    {(triggeredAlertsCount ?? 0) > 0 ? triggeredAlertsCount : activeAlertsCount}
                  </span>
                )}
              </button>
            )}

            {/* Mobile Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-orange-50 border border-orange-200 text-orange-900 text-xs font-bold px-2 py-1.5 rounded-xl outline-none"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>

            {/* Mobile Google Login Button */}
            <button
              onClick={onOpenGoogleAuth}
              className="flex items-center gap-1.5 text-xs bg-orange-50 border border-orange-200 text-orange-900 font-bold px-3 py-1.5 rounded-xl"
            >
              {user ? (
                <img src={user.picture} alt="" className="w-5 h-5 rounded-full" />
              ) : (
                <User className="w-4 h-4 text-orange-600" />
              )}
              {user ? 'Profile' : t('login')}
            </button>
          </div>
        </div>

        {/* Search Bar with Fuzzy Search & Autocomplete */}
        <div id="tour-header-search" ref={searchContainerRef} className="relative w-full md:w-80">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              className="w-full bg-slate-50 border border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-slate-900 text-xs pl-9 pr-8 py-2.5 rounded-2xl outline-none placeholder:text-slate-400 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowDropdown(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown with Fuzzy Results & Direct Redirection */}
          {showDropdown && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-orange-100 rounded-2xl shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto animate-in fade-in duration-150">
              <div className="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-orange-50/50 border-b border-orange-100 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-orange-500" />
                  <span>Matching Stocks ({searchResults.length})</span>
                </span>
                {isSearching && <span className="text-orange-600 font-extrabold animate-pulse">Searching Live...</span>}
              </div>

              {searchResults.length === 0 && !isSearching && (
                <div className="p-4 text-center text-xs text-slate-500 font-medium space-y-2">
                  <p>No direct match found for "{searchQuery}".</p>
                  <button 
                    onClick={() => handleSelectSearch(searchQuery.toUpperCase())} 
                    className="inline-flex items-center gap-1 text-orange-600 font-bold bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl border border-orange-200 transition-colors"
                  >
                    <span>Analyze & Load "{searchQuery.toUpperCase()}"</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {searchResults.map((s, idx) => {
                const isHighlighted = idx === highlightedIndex;
                return (
                  <div
                    key={s.symbol}
                    onClick={() => handleSelectSearch(s.symbol)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`p-3 cursor-pointer flex items-center justify-between border-b border-slate-100 last:border-0 transition-colors ${
                      isHighlighted ? 'bg-orange-50 border-l-4 border-l-orange-500' : 'hover:bg-orange-50/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900">{s.symbol}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">{s.sector}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px] font-medium">{s.name}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-slate-900 text-xs">₹{s.price.toFixed(2)}</div>
                      <div className={`text-[11px] font-bold ${s.pChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {s.pChange >= 0 ? '+' : ''}{s.pChange.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Actions: Price Alerts, Real-Time Ticks, Language Selector, App Tour & Google Login */}
        <div id="tour-header-controls" className="hidden md:flex items-center gap-2 sm:gap-3">
          {/* PRICE ALERTS BELL BUTTON */}
          {onOpenAlerts && (
            <button
              onClick={onOpenAlerts}
              className="relative p-2.5 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 hover:border-orange-300 shadow-2xs transition-all active:scale-95 flex items-center justify-center group"
              title="Stock Price Alerts & Target Threshold Monitoring"
              aria-label="Stock Price Alerts"
            >
              <Bell className="w-4 h-4 text-orange-600 group-hover:rotate-12 transition-transform" />
              {((triggeredAlertsCount ?? 0) > 0 || (activeAlertsCount ?? 0) > 0) && (
                <span className={`absolute -top-1 -right-1 text-[10px] font-black rounded-full px-1.5 min-w-[18px] h-4.5 flex items-center justify-center text-white shadow-xs ${
                  (triggeredAlertsCount ?? 0) > 0 ? 'bg-rose-600 animate-bounce' : 'bg-orange-600'
                }`}>
                  {(triggeredAlertsCount ?? 0) > 0 ? triggeredAlertsCount : activeAlertsCount}
                </span>
              )}
            </button>
          )}

          {/* APP TOUR / ONBOARDING GUIDED TOUR BUTTON */}
          {onOpenAppTour && (
            <button
              onClick={onOpenAppTour}
              className="flex items-center gap-1.5 text-xs font-black px-3 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs transition-all active:scale-95"
              title="Start App Tour & Onboarding Walkthrough"
            >
              <Compass className="w-3.5 h-3.5 text-orange-600 animate-spin-slow" />
              <span>App Tour</span>
            </button>
          )}

          {/* LANGUAGE SELECTOR DROPDOWN */}
          <div className="relative flex items-center bg-orange-50 border border-orange-200 rounded-2xl px-3 py-1.5 shadow-2xs hover:border-orange-300 transition-all">
            <Globe className="w-3.5 h-3.5 text-orange-600 mr-1.5 shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-slate-900 text-xs font-bold outline-none cursor-pointer pr-1"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Professional Market Status Indicator / Toggle */}
          <button
            onClick={() => setIsLiveTicking(!isLiveTicking)}
            className={`flex items-center gap-2 text-xs px-3.5 py-2 rounded-2xl border font-semibold transition-all ${
              isMarketOpen && isLiveTicking 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200 shadow-2xs' 
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
            title="NSE/BSE Market Real-Time Feed Status"
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isMarketOpen && isLiveTicking ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
            <div className="flex flex-col items-start leading-none">
              <span className="font-bold text-xs">{isMarketOpen && isLiveTicking ? t('marketLive') : t('marketClosed')}</span>
              <span className={`text-[9px] font-extrabold uppercase mt-0.5 ${isMarketOpen && isLiveTicking ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isMarketOpen && isLiveTicking ? t('liveDataActive') : t('afterHoursClose')}
              </span>
            </div>
          </button>

          {/* PRO SUBSCRIPTION BUTTON */}
          <button
            onClick={onOpenSubscription}
            className={`flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-2xl border transition-all shadow-sm active:scale-95 ${
              isAdmin
                ? 'bg-amber-100 text-amber-950 border-amber-300 shadow-amber-100'
                : isSubscribed
                ? 'bg-emerald-100 text-emerald-950 border-emerald-300 shadow-emerald-100'
                : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white border-transparent shadow-orange-200'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAdmin ? 'text-amber-700' : isSubscribed ? 'text-emerald-700' : 'text-amber-200 animate-spin'}`} />
            <span>
              {isAdmin ? (
                'Admin Pro (Full Access)'
              ) : isSubscribed ? (
                'Pro Active (₹99/mo)'
              ) : (
                'Subscribe Pro ₹99/mo'
              )}
            </span>
          </button>

          {/* GOOGLE LOGIN BUTTON */}
          <button
            onClick={onOpenGoogleAuth}
            className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-2xl border transition-all shadow-sm ${
              user 
                ? 'bg-orange-50 text-orange-950 border-orange-200 hover:bg-orange-100/80' 
                : 'bg-white text-slate-700 border-slate-300 hover:border-orange-400 hover:bg-orange-50/50'
            }`}
          >
            {user ? (
              <>
                <img src={user.picture} alt="" className="w-5 h-5 rounded-full border border-orange-300" />
                <span className="truncate max-w-[120px]">{user.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                {t('login')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Bar Tabs: Curated Key Segments */}
      <div className="border-t border-orange-100 bg-[#FAF8F5]/90">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1">
            <button
              id="tour-nav-overview"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-orange-600 text-orange-700 bg-orange-100/60 font-extrabold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-orange-50/50'
              }`}
            >
              <BarChart2 className="w-4 h-4 text-orange-600" />
              {t('marketOverview')}
            </button>

            <button
              id="tour-nav-screener"
              onClick={() => setActiveTab('screener')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'screener'
                  ? 'border-orange-600 text-orange-700 bg-orange-100/60 font-extrabold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-orange-50/50'
              }`}
            >
              <Filter className="w-4 h-4 text-orange-600" />
              {t('stockScreener')}
            </button>

            <button
              id="tour-nav-detail"
              onClick={() => setActiveTab('detail')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'detail'
                  ? 'border-orange-600 text-orange-700 bg-orange-100/60 font-extrabold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-orange-50/50'
              }`}
            >
              <Activity className="w-4 h-4 text-orange-600" />
              {t('chartsFinancials')}
            </button>

            <button
              id="tour-nav-ai"
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'ai'
                  ? 'border-orange-600 text-orange-700 bg-orange-100/60 font-extrabold'
                  : 'border-transparent text-slate-600 hover:text-orange-700 hover:bg-orange-50/50'
              }`}
            >
              <Bot className="w-4 h-4 text-amber-600 animate-bounce" />
              {t('geminiAnalyst')}
              <span className="text-[9px] bg-amber-200/80 text-amber-900 font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                AI
              </span>
            </button>

            <button
              id="tour-nav-portfolio"
              onClick={() => setActiveTab('portfolio')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'portfolio'
                  ? 'border-orange-600 text-orange-700 bg-orange-100/60 font-extrabold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-orange-50/50'
              }`}
            >
              <Briefcase className="w-4 h-4 text-orange-600" />
              {t('portfolioWatchlist')}
            </button>

            {/* Active Secondary Tab Badge indicator (if currently selected from sidebar) */}
            {['news', 'ipos-funds', 'bonus', 'admin-revenue'].includes(activeTab) && (
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 mx-1 rounded-xl bg-orange-100 border border-orange-300 text-orange-950 text-xs font-black animate-in fade-in">
                <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping"></span>
                <span>
                  {activeTab === 'news' && (t('marketNews') || 'Market News Wire')}
                  {activeTab === 'ipos-funds' && (t('iposMutualFunds') || 'IPOs & Funds')}
                  {activeTab === 'bonus' && (t('bonusActions') || 'Corporate Actions')}
                  {activeTab === 'admin-revenue' && 'Admin Revenue & Payouts'}
                </span>
              </div>
            )}
          </div>

          {/* Quick Trigger to open full sidebar with all segments */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-orange-700 bg-white/80 hover:bg-orange-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-orange-200 transition-all shrink-0 ml-2"
              title="Open full sidebar for IPOs, Bonus, News & Admin"
            >
              <Layers className="w-3.5 h-3.5 text-orange-600" />
              <span>All Segments</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
