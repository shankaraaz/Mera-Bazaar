import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Search, 
  Filter, 
  Maximize2, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Info,
  ChevronRight,
  PieChart
} from 'lucide-react';
import { Stock } from '../types/market';

interface MarketHeatmapProps {
  stocks: Stock[];
  onSelectStock: (symbol: string) => void;
  className?: string;
}

type ViewMode = 'sectors' | 'treemap' | 'grid';
type PerformanceFilter = 'all' | 'gainers' | 'losers' | 'movers';

/**
 * Returns rich styling metadata based on percentage change (pChange).
 * Darker/more vibrant colors denote higher magnitude of change.
 */
export const getHeatmapColorData = (pChange: number) => {
  if (pChange >= 3.0) {
    return {
      bgClass: 'bg-emerald-800 hover:bg-emerald-700',
      borderClass: 'border-emerald-600',
      textClass: 'text-white',
      accentClass: 'bg-emerald-950/60 text-emerald-200',
      hex: '#065f46',
      intensityLabel: 'Strong Gain (≥ +3%)',
    };
  }
  if (pChange >= 1.5) {
    return {
      bgClass: 'bg-emerald-600 hover:bg-emerald-500',
      borderClass: 'border-emerald-400',
      textClass: 'text-white',
      accentClass: 'bg-emerald-800/60 text-emerald-100',
      hex: '#059669',
      intensityLabel: 'Moderate Gain (+1.5% to +3%)',
    };
  }
  if (pChange >= 0.5) {
    return {
      bgClass: 'bg-emerald-500 hover:bg-emerald-400',
      borderClass: 'border-emerald-300',
      textClass: 'text-white',
      accentClass: 'bg-emerald-700/50 text-emerald-50',
      hex: '#10b981',
      intensityLabel: 'Mild Gain (+0.5% to +1.5%)',
    };
  }
  if (pChange > 0) {
    return {
      bgClass: 'bg-emerald-400/90 hover:bg-emerald-400',
      borderClass: 'border-emerald-300',
      textClass: 'text-emerald-950',
      accentClass: 'bg-emerald-900/20 text-emerald-950',
      hex: '#34d399',
      intensityLabel: 'Slight Gain (0% to +0.5%)',
    };
  }
  if (pChange === 0) {
    return {
      bgClass: 'bg-slate-500 hover:bg-slate-400',
      borderClass: 'border-slate-400',
      textClass: 'text-white',
      accentClass: 'bg-slate-700/50 text-slate-100',
      hex: '#64748b',
      intensityLabel: 'Flat (0.00%)',
    };
  }
  if (pChange > -0.5) {
    return {
      bgClass: 'bg-rose-400/90 hover:bg-rose-400',
      borderClass: 'border-rose-300',
      textClass: 'text-rose-950',
      accentClass: 'bg-rose-900/20 text-rose-950',
      hex: '#fb7185',
      intensityLabel: 'Slight Decline (0% to -0.5%)',
    };
  }
  if (pChange > -1.5) {
    return {
      bgClass: 'bg-rose-500 hover:bg-rose-400',
      borderClass: 'border-rose-400',
      textClass: 'text-white',
      accentClass: 'bg-rose-700/50 text-rose-50',
      hex: '#f43f5e',
      intensityLabel: 'Mild Decline (-0.5% to -1.5%)',
    };
  }
  if (pChange > -3.0) {
    return {
      bgClass: 'bg-rose-600 hover:bg-rose-500',
      borderClass: 'border-rose-500',
      textClass: 'text-white',
      accentClass: 'bg-rose-800/60 text-rose-100',
      hex: '#e11d48',
      intensityLabel: 'Moderate Decline (-1.5% to -3%)',
    };
  }
  return {
    bgClass: 'bg-rose-800 hover:bg-rose-700',
    borderClass: 'border-rose-600',
    textClass: 'text-white',
    accentClass: 'bg-rose-950/60 text-rose-200',
    hex: '#9f1239',
    intensityLabel: 'Heavy Decline (≤ -3%)',
  };
};

// Heatmap intensity scale buckets for interactive legend
const SCALE_BUCKETS = [
  { label: '≤ -3%', min: -Infinity, max: -3, bg: 'bg-rose-800', hex: '#9f1239' },
  { label: '-2%', min: -3, max: -1.5, bg: 'bg-rose-600', hex: '#e11d48' },
  { label: '-1%', min: -1.5, max: -0.001, bg: 'bg-rose-500', hex: '#f43f5e' },
  { label: '0%', min: -0.001, max: 0.001, bg: 'bg-slate-500', hex: '#64748b' },
  { label: '+1%', min: 0.001, max: 1.5, bg: 'bg-emerald-500', hex: '#10b981' },
  { label: '+2%', min: 1.5, max: 3, bg: 'bg-emerald-600', hex: '#059669' },
  { label: '≥ +3%', min: 3, max: Infinity, bg: 'bg-emerald-800', hex: '#065f46' },
];

export const MarketHeatmap: React.FC<MarketHeatmapProps> = ({
  stocks,
  onSelectStock,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('sectors');
  const [performanceFilter, setPerformanceFilter] = useState<PerformanceFilter>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sizeBy, setSizeBy] = useState<'mcap' | 'equal'>('mcap');
  const [hoveredStock, setHoveredStock] = useState<Stock | null>(null);
  const [selectedBucket, setSelectedBucket] = useState<number | null>(null);

  // Normalize sectors for clean grouping
  const normalizeSector = (sector: string): string => {
    const s = sector.toLowerCase();
    if (s.includes('bank') || s.includes('nbfc') || s.includes('fintech') || s.includes('financial')) {
      return 'Banking & Financials';
    }
    if (s.includes('it') || s.includes('information tech') || s.includes('technology')) {
      return 'Information Technology';
    }
    if (s.includes('oil') || s.includes('gas') || s.includes('energy') || s.includes('wind') || s.includes('power')) {
      return 'Energy & Power';
    }
    if (s.includes('auto')) {
      return 'Automobile';
    }
    if (s.includes('fmcg') || s.includes('consumer')) {
      return 'FMCG & Consumer';
    }
    if (s.includes('metal') || s.includes('steel') || s.includes('mining')) {
      return 'Metals & Mining';
    }
    if (s.includes('pharma') || s.includes('health')) {
      return 'Pharma & Healthcare';
    }
    if (s.includes('infra') || s.includes('defence') || s.includes('engineering') || s.includes('aerospace')) {
      return 'Infra & Defence';
    }
    return sector;
  };

  // Unique sector list
  const sectors = useMemo(() => {
    const sectorSet = new Set<string>();
    stocks.forEach(s => sectorSet.add(normalizeSector(s.sector)));
    return Array.from(sectorSet).sort();
  }, [stocks]);

  // Filter stocks based on search, sector, performance filter, and legend bucket
  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = 
          stock.symbol.toLowerCase().includes(q) || 
          stock.name.toLowerCase().includes(q) ||
          stock.sector.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Sector filter
      if (selectedSector !== 'all') {
        if (normalizeSector(stock.sector) !== selectedSector) return false;
      }

      // Performance filter
      if (performanceFilter === 'gainers' && stock.pChange <= 0) return false;
      if (performanceFilter === 'losers' && stock.pChange >= 0) return false;
      if (performanceFilter === 'movers' && Math.abs(stock.pChange) < 1.8) return false;

      // Legend bucket filter
      if (selectedBucket !== null) {
        const bucket = SCALE_BUCKETS[selectedBucket];
        if (bucket) {
          if (stock.pChange < bucket.min || stock.pChange >= bucket.max) return false;
        }
      }

      return true;
    });
  }, [stocks, searchQuery, selectedSector, performanceFilter, selectedBucket]);

  // Group stocks by sector
  const sectorGroups = useMemo(() => {
    const map = new Map<string, Stock[]>();
    filteredStocks.forEach(s => {
      const sec = normalizeSector(s.sector);
      if (!map.has(sec)) map.set(sec, []);
      map.get(sec)!.push(s);
    });

    // Sort stocks within sector by market cap descending
    map.forEach(list => list.sort((a, b) => b.marketCapCr - a.marketCapCr));

    return Array.from(map.entries()).map(([sectorName, stockList]) => {
      const avgPChange = stockList.reduce((acc, curr) => acc + curr.pChange, 0) / (stockList.length || 1);
      const totalMcap = stockList.reduce((acc, curr) => acc + curr.marketCapCr, 0);
      return {
        sectorName,
        stocks: stockList,
        avgPChange,
        totalMcap,
      };
    }).sort((a, b) => b.totalMcap - a.totalMcap);
  }, [filteredStocks]);

  // Compute market summary stats
  const summaryStats = useMemo(() => {
    const advances = stocks.filter(s => s.pChange > 0).length;
    const declines = stocks.filter(s => s.pChange < 0).length;
    const unchanged = stocks.filter(s => s.pChange === 0).length;
    const totalMcap = stocks.reduce((acc, s) => acc + s.marketCapCr, 0);
    const weightedReturn = stocks.reduce((acc, s) => acc + (s.pChange * (s.marketCapCr / (totalMcap || 1))), 0);

    return {
      total: stocks.length,
      advances,
      declines,
      unchanged,
      weightedReturn,
    };
  }, [stocks]);

  // Helper to get tile sizing classes when sizeBy === 'mcap'
  const getTileSizeClasses = (stock: Stock, isSectorGrouped: boolean = false) => {
    if (sizeBy === 'equal') {
      return 'col-span-1 min-h-[90px]';
    }

    // Mega Caps (> ₹10 Lakh Cr)
    if (stock.marketCapCr >= 1000000) {
      return isSectorGrouped 
        ? 'col-span-2 sm:col-span-2 row-span-2 min-h-[140px]' 
        : 'col-span-2 sm:col-span-2 lg:col-span-2 row-span-2 min-h-[150px]';
    }
    // Large Caps (₹4 Lakh Cr - ₹10 Lakh Cr)
    if (stock.marketCapCr >= 400000) {
      return isSectorGrouped
        ? 'col-span-2 sm:col-span-1 min-h-[110px]'
        : 'col-span-2 sm:col-span-1 min-h-[120px]';
    }
    // Mid/Standard Caps
    return 'col-span-1 min-h-[95px]';
  };

  return (
    <div className={`bg-white border border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-orange-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-lg tracking-tight">Market Heatmap</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                  Live Performance
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Visualizing equity performance using color intensity graded by % change & market capitalization weight.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Segmented Control */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode buttons */}
          <div className="flex items-center p-1 bg-orange-50/70 border border-orange-200/80 rounded-2xl gap-1 text-xs font-bold">
            <button
              onClick={() => setViewMode('sectors')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                viewMode === 'sectors' 
                  ? 'bg-orange-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>By Sector</span>
            </button>
            <button
              onClick={() => setViewMode('treemap')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                viewMode === 'treemap' 
                  ? 'bg-orange-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Treemap</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                viewMode === 'grid' 
                  ? 'bg-orange-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
          </div>

          {/* Sizing Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setSizeBy('mcap')}
              className={`px-2.5 py-1.5 rounded-xl transition-all ${
                sizeBy === 'mcap' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Size tiles proportionally by Market Cap"
            >
              Market Cap
            </button>
            <button
              onClick={() => setSizeBy('equal')}
              className={`px-2.5 py-1.5 rounded-xl transition-all ${
                sizeBy === 'equal' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Equal size tiles"
            >
              Equal
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Quick Performance Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setPerformanceFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              performanceFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            All Equities ({stocks.length})
          </button>
          <button
            onClick={() => setPerformanceFilter('gainers')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
              performanceFilter === 'gainers'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Gainers ({summaryStats.advances})</span>
          </button>
          <button
            onClick={() => setPerformanceFilter('losers')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
              performanceFilter === 'losers'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Losers ({summaryStats.declines})</span>
          </button>
          <button
            onClick={() => setPerformanceFilter('movers')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
              performanceFilter === 'movers'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>High Volatility (&ge; &plusmn;2%)</span>
          </button>
        </div>

        {/* Sector select & Search input */}
        <div className="flex items-center gap-2">
          {/* Sector dropdown */}
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-3 py-1.5 bg-orange-50/60 border border-orange-200/80 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs cursor-pointer"
          >
            <option value="all">All Sectors ({sectors.length})</option>
            {sectors.map(sec => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search stock..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 w-36 sm:w-44"
            />
          </div>
        </div>
      </div>

      {/* Interactive Color Scale Legend */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-400" />
            Intensity Scale:
          </span>
          <div className="flex items-center gap-0.5 rounded-lg overflow-hidden border border-slate-200 p-0.5 bg-slate-50 shadow-inner">
            {SCALE_BUCKETS.map((bucket, index) => {
              const isSelected = selectedBucket === index;
              return (
                <button
                  key={bucket.label}
                  onClick={() => setSelectedBucket(isSelected ? null : index)}
                  title={`Filter: ${bucket.label}`}
                  className={`px-2 py-0.5 text-[10px] font-black transition-all ${bucket.bg} ${
                    index === 3 ? 'text-white' : 'text-white'
                  } ${isSelected ? 'ring-2 ring-orange-500 scale-105 z-10 rounded' : 'hover:opacity-90'}`}
                >
                  {bucket.label}
                </button>
              );
            })}
          </div>
          {selectedBucket !== null && (
            <button
              onClick={() => setSelectedBucket(null)}
              className="text-[10px] text-orange-600 font-bold hover:underline"
            >
              Reset Scale Filter
            </button>
          )}
        </div>

        {/* Market Momentum Summary */}
        <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Advances: <strong className="text-slate-900">{summaryStats.advances}</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Declines: <strong className="text-slate-900">{summaryStats.declines}</strong>
          </span>
          <span className="hidden md:inline text-slate-400">&middot;</span>
          <span className="hidden md:flex items-center gap-1">
            Weighted Return: 
            <strong className={`font-mono tabular-nums ${summaryStats.weightedReturn >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {summaryStats.weightedReturn >= 0 ? '+' : ''}{summaryStats.weightedReturn.toFixed(2)}%
            </strong>
          </span>
        </div>
      </div>

      {/* Main Heatmap Canvas */}
      <div className="mt-5 relative min-h-[380px]">
        {filteredStocks.length === 0 ? (
          <div className="py-16 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="font-semibold text-sm">No equities matched the selected filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSector('all');
                setPerformanceFilter('all');
                setSelectedBucket(null);
              }}
              className="mt-2 text-xs text-orange-600 font-bold hover:underline"
            >
              Clear all filters & restore view
            </button>
          </div>
        ) : viewMode === 'sectors' ? (
          /* View Mode 1: Sector-Grouped Treemap Cards */
          <div className="space-y-5">
            {sectorGroups.map(group => {
              const isSectorUp = group.avgPChange >= 0;
              return (
                <div 
                  key={group.sectorName} 
                  className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3"
                >
                  {/* Sector Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                        {group.sectorName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        ({group.stocks.length} {group.stocks.length === 1 ? 'stock' : 'stocks'} &middot; &asymp; &inr;{(group.totalMcap / 100000).toFixed(1)}L Cr)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500">Sector Avg:</span>
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-lg flex items-center gap-0.5 ${
                          isSectorUp 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {isSectorUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {isSectorUp ? '+' : ''}{group.avgPChange.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Sector Stock Tiles */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                    {group.stocks.map(stock => renderStockTile(stock, true))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : viewMode === 'treemap' ? (
          /* View Mode 2: Market Cap Proportional Treemap Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 auto-rows-[100px] gap-2.5">
            {filteredStocks
              .slice()
              .sort((a, b) => b.marketCapCr - a.marketCapCr)
              .map(stock => renderStockTile(stock, false))}
          </div>
        ) : (
          /* View Mode 3: Performance Sorted Uniform Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {filteredStocks
              .slice()
              .sort((a, b) => b.pChange - a.pChange)
              .map(stock => renderStockTile(stock, false))}
          </div>
        )}
      </div>

      {/* Floating Detailed Inspection Card on Hover */}
      {hoveredStock && (
        <div className="mt-4 p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-200 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-base tracking-tight text-white">{hoveredStock.symbol}</span>
              <span className="text-xs text-slate-300 font-semibold">{hoveredStock.name}</span>
              <span className="text-[10px] bg-slate-800 text-orange-300 font-bold px-2 py-0.5 rounded-md border border-slate-700">
                {hoveredStock.sector}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-medium">
              <span>LTP: <strong className="text-white font-mono tabular-nums">&inr;{hoveredStock.price.toFixed(2)}</strong></span>
              <span>&middot;</span>
              <span>1D Change: 
                <strong className={`font-mono tabular-nums ml-1 ${hoveredStock.pChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {hoveredStock.pChange >= 0 ? '+' : ''}{hoveredStock.change.toFixed(2)} ({hoveredStock.pChange >= 0 ? '+' : ''}{hoveredStock.pChange.toFixed(2)}%)
                </strong>
              </span>
              <span>&middot;</span>
              <span>Day Range: <strong className="text-slate-200 font-mono tabular-nums">&inr;{hoveredStock.low} - &inr;{hoveredStock.high}</strong></span>
              <span>&middot;</span>
              <span>52W High: <strong className="text-slate-200 font-mono tabular-nums">&inr;{hoveredStock.high52}</strong></span>
              <span>&middot;</span>
              <span>M-Cap: <strong className="text-slate-200 font-mono tabular-nums">&inr;{(hoveredStock.marketCapCr / 1000).toFixed(1)}k Cr</strong></span>
            </div>
          </div>

          <button
            onClick={() => onSelectStock(hoveredStock.symbol)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-md"
          >
            <span>Open Chart & Financials</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );

  /**
   * Helper to render an individual interactive stock tile.
   */
  function renderStockTile(stock: Stock, isSectorGrouped: boolean) {
    const colorData = getHeatmapColorData(stock.pChange);
    const sizeClasses = getTileSizeClasses(stock, isSectorGrouped);
    const isLarge = stock.marketCapCr >= 600000 && sizeBy === 'mcap';
    const isHovered = hoveredStock?.symbol === stock.symbol;

    return (
      <button
        key={stock.symbol}
        onClick={() => onSelectStock(stock.symbol)}
        onMouseEnter={() => setHoveredStock(stock)}
        onMouseLeave={() => {
          if (hoveredStock?.symbol === stock.symbol) {
            setHoveredStock(null);
          }
        }}
        className={`group relative rounded-2xl p-3 text-left transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs border ${
          colorData.bgClass
        } ${colorData.borderClass} ${sizeClasses} ${
          isHovered ? 'ring-2 ring-white scale-[1.02] shadow-lg z-10' : 'hover:scale-[1.01]'
        }`}
        style={{
          cursor: 'pointer',
        }}
        aria-label={`${stock.symbol}: ${stock.pChange >= 0 ? '+' : ''}${stock.pChange}%`}
      >
        {/* Top: Symbol and Sector Tag */}
        <div className="flex items-start justify-between w-full gap-1">
          <div className="truncate">
            <span className={`font-black text-sm tracking-tight block ${colorData.textClass}`}>
              {stock.symbol}
            </span>
            {isLarge && (
              <span className={`text-[10px] font-medium opacity-80 truncate block max-w-[120px] ${colorData.textClass}`}>
                {stock.name}
              </span>
            )}
          </div>

          {/* Quick Pill / Badge showing % change */}
          <span 
            className={`text-[10px] font-black px-1.5 py-0.5 rounded-md font-mono tabular-nums shrink-0 ${colorData.accentClass}`}
          >
            {stock.pChange >= 0 ? '+' : ''}{stock.pChange.toFixed(2)}%
          </span>
        </div>

        {/* Center/Bottom: Price & Meta details */}
        <div className="mt-2 w-full flex items-end justify-between">
          <div>
            <div className={`font-extrabold text-xs font-mono tabular-nums ${colorData.textClass}`}>
              &inr;{stock.price.toFixed(2)}
            </div>
            {isLarge && (
              <div className={`text-[9px] font-semibold opacity-75 font-mono tabular-nums ${colorData.textClass}`}>
                M-Cap: &inr;{(stock.marketCapCr / 100000).toFixed(2)}L Cr
              </div>
            )}
          </div>

          <div className={`text-[10px] font-black flex items-center justify-end ${colorData.textClass}`}>
            {stock.pChange >= 0 ? (
              <ArrowUpRight className="w-3.5 h-3.5 opacity-90" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 opacity-90" />
            )}
          </div>
        </div>
      </button>
    );
  }
};
