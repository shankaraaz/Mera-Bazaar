import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  Clock, 
  TrendingUp, 
  Briefcase, 
  Star, 
  Building2, 
  ChevronRight, 
  Bell, 
  CheckCircle, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  Layers,
  Sparkles,
  CalendarDays,
  X
} from 'lucide-react';
import { EarningsEvent, Stock, PortfolioPosition, WatchlistItem } from '../types/market';
import { INITIAL_EARNINGS_EVENTS } from '../data/mockMarketData';

interface EarningsCalendarProps {
  earningsEvents?: EarningsEvent[];
  stocks?: Stock[];
  portfolio?: PortfolioPosition[];
  watchlist?: WatchlistItem[];
  onSelectStock?: (symbol: string) => void;
}

export const EarningsCalendar: React.FC<EarningsCalendarProps> = ({
  earningsEvents = INITIAL_EARNINGS_EVENTS,
  stocks = [],
  portfolio = [],
  watchlist = [],
  onSelectStock,
}) => {
  // Set default reference date for simulation (Aug 3, 2026)
  const [searchTerm, setSearchTerm] = useState('');
  const [stockScopeFilter, setStockScopeFilter] = useState<'ALL' | 'TRACKED_ONLY'>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<'ALL_UPCOMING' | 'NEXT_7_DAYS' | 'THIS_MONTH' | 'NEXT_MONTH' | 'REPORTED' | 'CUSTOM'>('NEXT_7_DAYS');
  const [customStartDate, setCustomStartDate] = useState('2026-08-01');
  const [customEndDate, setCustomEndDate] = useState('2026-08-31');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [marketTimingFilter, setMarketTimingFilter] = useState<'ALL' | 'BEFORE_MARKET' | 'AFTER_MARKET' | 'DURING_MARKET'>('ALL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');
  
  // Notification alert state
  const [notifiedEvents, setNotifiedEvents] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Set of user tracked stock symbols
  const portfolioSymbols = useMemo(() => new Set(portfolio.map(p => p.stockSymbol.toUpperCase())), [portfolio]);
  const watchlistSymbols = useMemo(() => new Set(watchlist.map(w => w.stockSymbol.toUpperCase())), [watchlist]);
  const allTrackedSymbols = useMemo(() => {
    const set = new Set<string>();
    portfolioSymbols.forEach(s => set.add(s));
    watchlistSymbols.forEach(s => set.add(s));
    return set;
  }, [portfolioSymbols, watchlistSymbols]);

  // Unique sectors available in dataset
  const sectorsList = useMemo(() => {
    const set = new Set<string>();
    earningsEvents.forEach(e => {
      if (e.sector) set.add(e.sector);
    });
    return Array.from(set).sort();
  }, [earningsEvents]);

  // Handle setting/toggling calendar reminders
  const handleToggleReminder = (event: EarningsEvent) => {
    const eventId = event.id;
    const isAlreadySet = !!notifiedEvents[eventId];
    setNotifiedEvents(prev => ({ ...prev, [eventId]: !isAlreadySet }));
    
    if (!isAlreadySet) {
      setToastMessage(`Calendar reminder set for ${event.symbol} (${event.fiscalQuarter}) on ${event.date}!`);
    } else {
      setToastMessage(`Reminder removed for ${event.symbol}.`);
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter logic
  const filteredEvents = useMemo(() => {
    return earningsEvents.filter(event => {
      const sym = event.symbol.toUpperCase();
      const company = event.companyName.toLowerCase();
      const search = searchTerm.toLowerCase().trim();

      // Search term filter
      if (search && !sym.toLowerCase().includes(search) && !company.includes(search)) {
        return false;
      }

      // Tracked stocks scope filter
      if (stockScopeFilter === 'TRACKED_ONLY' && !allTrackedSymbols.has(sym)) {
        return false;
      }

      // Sector filter
      if (selectedSector !== 'ALL' && event.sector !== selectedSector) {
        return false;
      }

      // Market timing filter
      if (marketTimingFilter !== 'ALL' && event.marketTiming !== marketTimingFilter) {
        return false;
      }

      // Date Range Filter logic based on simulation date 2026-08-03
      const eventDate = new Date(event.date);
      const refDate = new Date('2026-08-03');
      
      if (dateRangeFilter === 'NEXT_7_DAYS') {
        const next7 = new Date('2026-08-11');
        if (eventDate < refDate || eventDate > next7) return false;
      } else if (dateRangeFilter === 'ALL_UPCOMING') {
        if (event.status === 'REPORTED' && eventDate < refDate) return false;
      } else if (dateRangeFilter === 'THIS_MONTH') {
        // August 2026
        if (event.date < '2026-08-01' || event.date > '2026-08-31') return false;
      } else if (dateRangeFilter === 'NEXT_MONTH') {
        // September 2026
        if (event.date < '2026-09-01' || event.date > '2026-09-30') return false;
      } else if (dateRangeFilter === 'REPORTED') {
        if (event.status !== 'REPORTED') return false;
      } else if (dateRangeFilter === 'CUSTOM') {
        if (customStartDate && event.date < customStartDate) return false;
        if (customEndDate && event.date > customEndDate) return false;
      }

      return true;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [
    earningsEvents, 
    searchTerm, 
    stockScopeFilter, 
    selectedSector, 
    marketTimingFilter, 
    dateRangeFilter, 
    customStartDate, 
    customEndDate,
    allTrackedSymbols
  ]);

  // Statistics calculation for banner
  const trackedCountInRange = useMemo(() => {
    return filteredEvents.filter(e => allTrackedSymbols.has(e.symbol.toUpperCase())).length;
  }, [filteredEvents, allTrackedSymbols]);

  const todayCount = useMemo(() => {
    return earningsEvents.filter(e => e.date === '2026-08-03' || e.status === 'TODAY').length;
  }, [earningsEvents]);

  const upcoming7DaysCount = useMemo(() => {
    return earningsEvents.filter(e => {
      return e.date >= '2026-08-03' && e.date <= '2026-08-10';
    }).length;
  }, [earningsEvents]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Bell className="w-4 h-4 text-orange-400 animate-bounce" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Analytics Summary Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-orange-100 p-4 rounded-3xl shadow-2xs hover:shadow-sm transition-all flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-extrabold text-slate-500 block mb-0.5">Upcoming (Next 7 Days)</span>
            <div className="text-2xl font-black text-slate-900 flex items-baseline gap-1.5">
              {upcoming7DaysCount} <span className="text-xs text-orange-600 font-bold">Companies</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500">Q1 FY27 Results Season</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 font-bold">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-amber-100 p-4 rounded-3xl shadow-2xs hover:shadow-sm transition-all flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-extrabold text-slate-500 block mb-0.5">Your Tracked Earnings</span>
            <div className="text-2xl font-black text-slate-900 flex items-baseline gap-1.5">
              {trackedCountInRange} <span className="text-xs text-amber-600 font-bold">in View</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500">
              {allTrackedSymbols.size > 0 ? `${allTrackedSymbols.size} Portfolio & Watchlist Symbols` : 'Add stocks to track'}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold">
            <Star className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-emerald-100 p-4 rounded-3xl shadow-2xs hover:shadow-sm transition-all flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-extrabold text-slate-500 block mb-0.5">Reporting Today (Aug 03)</span>
            <div className="text-2xl font-black text-slate-900 flex items-baseline gap-1.5">
              {todayCount} <span className="text-xs text-emerald-600 font-bold">Active Board Meetings</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700">HDFC Bank Q1 Announced</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-indigo-100 p-4 rounded-3xl shadow-2xs hover:shadow-sm transition-all flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-extrabold text-slate-500 block mb-0.5">Sector In Focus</span>
            <div className="text-lg font-black text-slate-900 truncate max-w-[140px]">
              IT & Banking
            </div>
            <span className="text-[10px] font-bold text-indigo-600">TCS, INFY & SBIN this week</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Filter Toolbar */}
      <div className="bg-white border border-orange-100 p-5 rounded-3xl shadow-sm space-y-4">
        {/* Top Controls Row */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search company or stock symbol (e.g. RELIANCE, TCS, INFY)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Scope Toggle: All vs Tracked Only */}
          <div className="flex items-center bg-orange-50/70 border border-orange-200 p-1 rounded-2xl self-start lg:self-auto text-xs font-extrabold">
            <button
              onClick={() => setStockScopeFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                stockScopeFilter === 'ALL'
                  ? 'bg-orange-600 text-white font-black shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Stocks
            </button>
            <button
              onClick={() => setStockScopeFilter('TRACKED_ONLY')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                stockScopeFilter === 'TRACKED_ONLY'
                  ? 'bg-orange-600 text-white font-black shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current text-amber-300" />
              <span>Tracked Stocks</span>
              {allTrackedSymbols.size > 0 && (
                <span className="ml-1 bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {allTrackedSymbols.size}
                </span>
              )}
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold self-start lg:self-auto">
            <button
              onClick={() => setViewMode('CARDS')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                viewMode === 'CARDS' ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                viewMode === 'TABLE' ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Table View
            </button>
          </div>
        </div>

        {/* Date Filter Quick Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs font-semibold">
          <span className="text-slate-500 font-bold flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-orange-500" /> Date Range:
          </span>

          <button
            onClick={() => setDateRangeFilter('NEXT_7_DAYS')}
            className={`px-3 py-1.5 rounded-xl border transition-all text-xs font-extrabold ${
              dateRangeFilter === 'NEXT_7_DAYS'
                ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-orange-50'
            }`}
          >
            Next 7 Days
          </button>

          <button
            onClick={() => setDateRangeFilter('ALL_UPCOMING')}
            className={`px-3 py-1.5 rounded-xl border transition-all text-xs font-extrabold ${
              dateRangeFilter === 'ALL_UPCOMING'
                ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-orange-50'
            }`}
          >
            All Upcoming
          </button>

          <button
            onClick={() => setDateRangeFilter('THIS_MONTH')}
            className={`px-3 py-1.5 rounded-xl border transition-all text-xs font-extrabold ${
              dateRangeFilter === 'THIS_MONTH'
                ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-orange-50'
            }`}
          >
            This Month (Aug 2026)
          </button>

          <button
            onClick={() => setDateRangeFilter('NEXT_MONTH')}
            className={`px-3 py-1.5 rounded-xl border transition-all text-xs font-extrabold ${
              dateRangeFilter === 'NEXT_MONTH'
                ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-orange-50'
            }`}
          >
            Next Month (Sep 2026)
          </button>

          <button
            onClick={() => setDateRangeFilter('REPORTED')}
            className={`px-3 py-1.5 rounded-xl border transition-all text-xs font-extrabold ${
              dateRangeFilter === 'REPORTED'
                ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-orange-50'
            }`}
          >
            Past / Reported
          </button>

          <button
            onClick={() => setDateRangeFilter('CUSTOM')}
            className={`px-3 py-1.5 rounded-xl border transition-all text-xs font-extrabold ${
              dateRangeFilter === 'CUSTOM'
                ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-orange-50'
            }`}
          >
            Custom Range...
          </button>

          {/* Sector & Timing Selectors */}
          <div className="ml-auto flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
            <select
              value={selectedSector}
              onChange={e => setSelectedSector(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="ALL">All Sectors</option>
              {sectorsList.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>

            <select
              value={marketTimingFilter}
              onChange={e => setMarketTimingFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="ALL">All Market Timings</option>
              <option value="BEFORE_MARKET">Before Market Hours</option>
              <option value="DURING_MARKET">During Market Hours</option>
              <option value="AFTER_MARKET">After Market Hours</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Picker inputs if CUSTOM selected */}
        {dateRangeFilter === 'CUSTOM' && (
          <div className="flex items-center gap-3 bg-orange-50/50 p-3 rounded-2xl border border-orange-200 text-xs font-bold animate-in fade-in duration-200">
            <span className="text-slate-700">Select Date Window:</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">From:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1 text-slate-900 font-extrabold focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">To:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1 text-slate-900 font-extrabold focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Header Info */}
      <div className="flex items-center justify-between text-xs font-extrabold text-slate-600 px-1">
        <span>
          Showing <span className="text-orange-600 font-black">{filteredEvents.length}</span> Corporate Earnings Announcements
        </span>
        
        {(searchTerm || stockScopeFilter !== 'ALL' || dateRangeFilter !== 'NEXT_7_DAYS' || selectedSector !== 'ALL' || marketTimingFilter !== 'ALL') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setStockScopeFilter('ALL');
              setDateRangeFilter('NEXT_7_DAYS');
              setSelectedSector('ALL');
              setMarketTimingFilter('ALL');
            }}
            className="text-orange-600 hover:text-orange-800 underline font-bold"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* No Events Empty State */}
      {filteredEvents.length === 0 && (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-black text-slate-800 text-base">No Corporate Earnings Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
            No company earnings matched your current search filters or date range. Try switching to "All Upcoming" or clearing search query.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStockScopeFilter('ALL');
              setDateRangeFilter('ALL_UPCOMING');
              setSelectedSector('ALL');
              setMarketTimingFilter('ALL');
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-2xl shadow-xs transition-colors"
          >
            Show All Upcoming Earnings
          </button>
        </div>
      )}

      {/* CARDS / TIMELINE GRID VIEW */}
      {viewMode === 'CARDS' && filteredEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => {
            const sym = event.symbol.toUpperCase();
            const isPortfolio = portfolioSymbols.has(sym);
            const isWatchlist = watchlistSymbols.has(sym);
            const isReminderSet = !!notifiedEvents[event.id];

            // Match stock live price if available
            const stockData = stocks.find(s => s.symbol.toUpperCase() === sym);

            return (
              <div
                key={event.id}
                className={`bg-white border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative ${
                  isPortfolio 
                    ? 'border-emerald-300 bg-gradient-to-b from-emerald-50/20 to-white' 
                    : isWatchlist 
                    ? 'border-amber-300 bg-gradient-to-b from-amber-50/20 to-white' 
                    : 'border-orange-100 hover:border-orange-300'
                }`}
              >
                <div>
                  {/* Top Header Row with Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black bg-orange-100 text-orange-900 px-2.5 py-0.5 rounded-full border border-orange-200">
                        {event.fiscalQuarter}
                      </span>

                      {isPortfolio && (
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-emerald-700" /> Portfolio
                        </span>
                      )}

                      {isWatchlist && !isPortfolio && (
                        <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current text-amber-600" /> Watchlist
                        </span>
                      )}

                      {event.importance === 'HIGH' && (
                        <span className="text-[10px] font-black bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                          🔥 High Impact
                        </span>
                      )}
                    </div>

                    {/* Status Pill */}
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                      event.status === 'TODAY'
                        ? 'bg-emerald-600 text-white border-emerald-700 animate-pulse'
                        : event.status === 'REPORTED'
                        ? 'bg-slate-100 text-slate-700 border-slate-300'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {event.status === 'TODAY' ? '● REPORTING TODAY' : event.status === 'REPORTED' ? '✓ REPORTED' : 'UPCOMING'}
                    </span>
                  </div>

                  {/* Stock Name & Symbol */}
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectStock && onSelectStock(event.symbol)}
                          className="font-black text-slate-900 text-base hover:text-orange-600 transition-colors text-left"
                        >
                          {event.companyName}
                        </button>
                      </div>
                      <div className="text-xs text-slate-500 font-semibold flex items-center gap-2 mt-0.5">
                        <span className="font-extrabold text-slate-700">{event.symbol}</span>
                        <span>•</span>
                        <span>{event.sector}</span>
                      </div>
                    </div>

                    {stockData && (
                      <div className="text-right">
                        <div className="font-black text-slate-900 text-sm">₹{stockData.price.toLocaleString('en-IN')}</div>
                        <div className={`text-[11px] font-bold flex items-center justify-end ${
                          stockData.change >= 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}>
                          {stockData.change >= 0 ? '+' : ''}{stockData.pChange.toFixed(2)}%
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Date & Market Timing */}
                  <div className="bg-orange-50/50 p-3 rounded-2xl border border-orange-100 my-3 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <Calendar className="w-4 h-4 text-orange-600" />
                        {new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded-lg border border-orange-200 text-slate-700 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {event.marketTiming === 'BEFORE_MARKET' ? 'Before Market' : event.marketTiming === 'AFTER_MARKET' ? 'After Market' : 'During Market'}
                      </span>
                    </div>
                  </div>

                  {/* Consensus Estimates or Actual Reported Numbers */}
                  {event.status === 'REPORTED' ? (
                    <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs font-black text-emerald-900 border-b border-emerald-200 pb-1.5">
                        <span>Actual Results vs Estimates</span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded-full font-black">
                          Official Q1
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Actual Revenue:</span>
                          <span className="font-black text-slate-900">₹{event.actualRevenueCr?.toLocaleString('en-IN')} Cr</span>
                          {event.revenueSurprisePct !== undefined && (
                            <span className="text-[10px] text-emerald-700 font-extrabold block">
                              (+{event.revenueSurprisePct}% Beat)
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 block">Actual EPS:</span>
                          <span className="font-black text-slate-900">₹{event.actualEps} / share</span>
                          {event.epsSurprisePct !== undefined && (
                            <span className="text-[10px] text-emerald-700 font-extrabold block">
                              (+{event.epsSurprisePct}% Beat)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs font-semibold">
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Consensus Street Estimates</div>
                      
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Revenue Est:</span>
                          <span className="font-black text-slate-900">
                            {event.consensusRevenueEstCr ? `₹${event.consensusRevenueEstCr.toLocaleString('en-IN')} Cr` : 'N/A'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 block">EPS Est:</span>
                          <span className="font-black text-slate-900">
                            {event.consensusEpsEst ? `₹${event.consensusEpsEst} / share` : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {event.previousRevenueCr && event.previousEps && (
                        <div className="flex justify-between text-[11px] text-slate-500 font-medium pt-1">
                          <span>Previous Quarter:</span>
                          <span className="font-bold text-slate-700">₹{event.previousRevenueCr.toLocaleString('en-IN')} Cr | EPS ₹{event.previousEps}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Remarks & Analysis Focus */}
                  {event.remarks && (
                    <p className="text-[11px] text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200 italic mt-3">
                      💡 "{event.remarks}"
                    </p>
                  )}
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-3 border-t border-orange-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleReminder(event)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                      isReminderSet 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-orange-50 hover:border-orange-200'
                    }`}
                    title="Toggle calendar reminder"
                  >
                    <Bell className={`w-3.5 h-3.5 ${isReminderSet ? 'fill-current' : ''}`} />
                    <span>{isReminderSet ? 'Remind Set' : 'Set Alert'}</span>
                  </button>

                  <button
                    onClick={() => onSelectStock && onSelectStock(event.symbol)}
                    className="flex-1 bg-orange-50 hover:bg-orange-600 text-orange-900 hover:text-white font-black text-xs py-2 rounded-xl border border-orange-200 transition-all flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <span>View Stock Analysis</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'TABLE' && filteredEvents.length > 0 && (
        <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="bg-orange-50/60 text-slate-700 border-b border-orange-100 uppercase text-[10px] font-black">
                <th className="py-3 px-3">Company & Symbol</th>
                <th className="py-3 px-3">Sector</th>
                <th className="py-3 px-3">Quarter</th>
                <th className="py-3 px-3">Earnings Date</th>
                <th className="py-3 px-3">Market Timing</th>
                <th className="py-3 px-3 text-right">Revenue Est (Cr)</th>
                <th className="py-3 px-3 text-right">EPS Est (₹)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.map(event => {
                const sym = event.symbol.toUpperCase();
                const isPortfolio = portfolioSymbols.has(sym);
                const isWatchlist = watchlistSymbols.has(sym);
                const isReminderSet = !!notifiedEvents[event.id];

                return (
                  <tr key={event.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectStock && onSelectStock(event.symbol)}
                          className="font-black text-slate-900 text-sm hover:text-orange-600 text-left"
                        >
                          {event.companyName}
                        </button>

                        {isPortfolio && (
                          <span className="bg-emerald-100 text-emerald-900 text-[9px] font-black px-1.5 py-0.2 rounded border border-emerald-300">
                            PORTFOLIO
                          </span>
                        )}

                        {isWatchlist && !isPortfolio && (
                          <span className="bg-amber-100 text-amber-900 text-[9px] font-black px-1.5 py-0.2 rounded border border-amber-300">
                            WATCHLIST
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-bold">{event.symbol}</div>
                    </td>

                    <td className="py-3.5 px-3 text-slate-600 font-bold">{event.sector}</td>

                    <td className="py-3.5 px-3">
                      <span className="bg-orange-50 text-orange-900 font-extrabold px-2 py-0.5 rounded-full border border-orange-200 text-[10px]">
                        {event.fiscalQuarter}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-extrabold text-slate-900">
                      {new Date(event.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="py-3.5 px-3 text-slate-600">
                      {event.marketTiming === 'BEFORE_MARKET' ? 'BMH (Before Market)' : event.marketTiming === 'AFTER_MARKET' ? 'AMH (After Market)' : 'DMH (During Market)'}
                    </td>

                    <td className="py-3.5 px-3 text-right font-black text-slate-900">
                      {event.status === 'REPORTED' && event.actualRevenueCr
                        ? `₹${event.actualRevenueCr.toLocaleString('en-IN')}`
                        : event.consensusRevenueEstCr
                        ? `₹${event.consensusRevenueEstCr.toLocaleString('en-IN')}`
                        : 'N/A'}
                    </td>

                    <td className="py-3.5 px-3 text-right font-black text-slate-900">
                      {event.status === 'REPORTED' && event.actualEps
                        ? `₹${event.actualEps}`
                        : event.consensusEpsEst
                        ? `₹${event.consensusEpsEst}`
                        : 'N/A'}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                        event.status === 'TODAY'
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : event.status === 'REPORTED'
                          ? 'bg-slate-100 text-slate-700 border-slate-300'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {event.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleToggleReminder(event)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            isReminderSet ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-orange-50'
                          }`}
                          title="Toggle reminder alert"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onSelectStock && onSelectStock(event.symbol)}
                          className="p-1.5 rounded-lg bg-orange-50 text-orange-900 border border-orange-200 hover:bg-orange-600 hover:text-white transition-all"
                          title="View detail"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
