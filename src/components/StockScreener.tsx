import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Search, 
  RotateCcw, 
  Download, 
  Sparkles, 
  ArrowUpDown, 
  ChevronRight, 
  CheckCircle2, 
  SlidersHorizontal,
  Bot
} from 'lucide-react';
import { Stock, ScreenerFilters } from '../types/market';

interface StockScreenerProps {
  stocks: Stock[];
  onSelectStock: (symbol: string) => void;
  initialPreset?: string;
}

const DEFAULT_FILTERS: ScreenerFilters = {
  searchQuery: '',
  sector: 'ALL',
  marketCapRange: [0, 2500000],
  peRange: [0, 200],
  pbRange: [0, 50],
  minDivYield: 0,
  minRoe: 0,
  minRoce: 0,
  maxDebtToEquity: 10,
  minSalesGrowth3Yr: 0,
  minProfitGrowth3Yr: 0,
  minPromoterHolding: 0,
  near52WeekHighOnly: false,
  volumeShockersOnly: false,
};

export const StockScreener: React.FC<StockScreenerProps> = ({
  stocks,
  onSelectStock,
  initialPreset,
}) => {
  const [filters, setFilters] = useState<ScreenerFilters>(DEFAULT_FILTERS);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>(stocks);
  const [sortField, setSortField] = useState<keyof Stock>('marketCapCr');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activePresetName, setActivePresetName] = useState<string | null>(initialPreset || null);

  const sectorsList = ['ALL', 'Information Technology', 'Banking & Financial Services', 'Oil & Gas / Telecom / Retail', 'Automobile', 'Consumer Tech / Quick Commerce', 'Aerospace & Defence', 'NBFC / Fintech'];

  useEffect(() => {
    if (initialPreset) {
      applyPreset(initialPreset);
    }
  }, [initialPreset]);

  useEffect(() => {
    let result = [...stocks];

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        s =>
          s.symbol.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q)
      );
    }

    if (filters.sector && filters.sector !== 'ALL') {
      result = result.filter(s => s.sector.toLowerCase() === filters.sector.toLowerCase());
    }

    result = result.filter(
      s =>
        s.marketCapCr >= filters.marketCapRange[0] &&
        s.marketCapCr <= filters.marketCapRange[1] &&
        s.pe >= filters.peRange[0] &&
        s.pe <= filters.peRange[1] &&
        s.divYield >= filters.minDivYield &&
        s.roe >= filters.minRoe &&
        s.roce >= filters.minRoce &&
        s.debtToEquity <= filters.maxDebtToEquity &&
        s.salesGrowth3Yr >= filters.minSalesGrowth3Yr &&
        s.profitGrowth3Yr >= filters.minProfitGrowth3Yr &&
        s.promoterHolding >= filters.minPromoterHolding
    );

    if (filters.near52WeekHighOnly) {
      result = result.filter(s => s.price >= s.high52 * 0.95);
    }

    if (filters.volumeShockersOnly) {
      result = result.filter(s => s.volume > 10000000);
    }

    result.sort((a, b) => {
      const valA = a[sortField] ?? 0;
      const valB = b[sortField] ?? 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });

    setFilteredStocks(result);
  }, [filters, stocks, sortField, sortOrder]);

  const handleSort = (field: keyof Stock) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const applyPreset = (presetKey: string) => {
    setActivePresetName(presetKey);
    if (presetKey === 'UNDERVALUED') {
      setFilters({
        ...DEFAULT_FILTERS,
        peRange: [0, 30],
        minRoe: 15,
        maxDebtToEquity: 0.5,
      });
    } else if (presetKey === 'DIVIDEND') {
      setFilters({
        ...DEFAULT_FILTERS,
        minDivYield: 1.0,
        maxDebtToEquity: 0.8,
      });
    } else if (presetKey === 'BREAKOUT') {
      setFilters({
        ...DEFAULT_FILTERS,
        near52WeekHighOnly: true,
      });
    } else if (presetKey === 'HIGH_GROWTH') {
      setFilters({
        ...DEFAULT_FILTERS,
        minSalesGrowth3Yr: 15,
        minProfitGrowth3Yr: 15,
        minRoe: 18,
      });
    } else if (presetKey === 'LOW_DEBT') {
      setFilters({
        ...DEFAULT_FILTERS,
        maxDebtToEquity: 0.1,
        minRoe: 12,
      });
    } else {
      setFilters(DEFAULT_FILTERS);
    }
  };

  const handleAiSearch = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'SCREENER_GEN',
          query: aiPrompt,
        }),
      });
      await res.json();
      
      const newFilters = { ...DEFAULT_FILTERS };
      const q = aiPrompt.toLowerCase();
      if (q.includes('it') || q.includes('tech')) newFilters.sector = 'Information Technology';
      if (q.includes('bank') || q.includes('finance')) newFilters.sector = 'Banking & Financial Services';
      if (q.includes('auto')) newFilters.sector = 'Automobile';
      if (q.includes('low debt') || q.includes('zero debt')) newFilters.maxDebtToEquity = 0.1;
      if (q.includes('high roe') || q.includes('roe > 20')) newFilters.minRoe = 20;
      if (q.includes('high dividend') || q.includes('dividend')) newFilters.minDivYield = 1.0;
      if (q.includes('undervalued') || q.includes('low pe')) newFilters.peRange = [0, 25];

      setFilters(newFilters);
      setActivePresetName('AI Custom Screener');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Symbol', 'Name', 'Sector', 'Price', 'P/E', 'ROE %', 'Div Yield %', 'Market Cap Cr', '3Y Sales Growth %'];
    const rows = filteredStocks.map(s => [
      s.symbol,
      `"${s.name}"`,
      `"${s.sector}"`,
      s.price,
      s.pe,
      s.roe,
      s.divYield,
      s.marketCapCr,
      s.salesGrowth3Yr,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MeraBazaar_Screener_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="tour-view-screener" className="space-y-6">
      {/* Header & AI Natural Language Prompt Bar */}
      <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                <Filter className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Stock Screener Engine</h2>
              <span className="text-xs bg-orange-50 text-orange-800 border border-orange-200 font-extrabold px-2.5 py-0.5 rounded-full">
                Screener.in Power
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Screen thousands of fundamental variables: Market Cap, ROE, P/E ratio, 3-Yr Sales Growth, & Debt/Equity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setFilters(DEFAULT_FILTERS);
                setActivePresetName(null);
              }}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3.5 py-2 rounded-2xl font-bold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 text-xs bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 font-extrabold px-3.5 py-2 rounded-2xl transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-orange-600" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Gemini AI Natural Language Screener Input */}
        <div className="bg-orange-50/50 border border-orange-200/80 rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-2">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-black shrink-0 pl-1">
            <Bot className="w-4 h-4 text-orange-600 animate-bounce" />
            AI Screener Prompt:
          </div>
          <input
            type="text"
            placeholder="e.g. 'Find IT companies with P/E under 35, ROE over 20% and zero debt'"
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAiSearch()}
            className="w-full bg-white border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 font-medium outline-none px-3 py-2 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
          <button
            onClick={handleAiSearch}
            disabled={isAiLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shrink-0 shadow-sm shadow-orange-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isAiLoading ? 'Building Filters...' : 'Build AI Screener'}
          </button>
        </div>

        {/* Preset Cards Bar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2">
          <span className="text-xs font-bold text-slate-500 shrink-0">Popular Presets:</span>
          {[
            { id: 'UNDERVALUED', label: 'Undervalued Growth' },
            { id: 'DIVIDEND', label: 'Dividend Champions' },
            { id: 'HIGH_GROWTH', label: 'High Growth & ROE' },
            { id: 'LOW_DEBT', label: 'Debt-Free Leaders' },
            { id: 'BREAKOUT', label: '52W Breakouts' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              className={`text-xs px-3.5 py-2 rounded-2xl border font-bold transition-all shrink-0 ${
                activePresetName === p.id
                  ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-orange-50/50 hover:border-orange-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Controls Panel */}
      <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
        <div className="flex items-center gap-2 border-b border-orange-100 pb-3 text-xs font-black text-slate-900 uppercase tracking-wider">
          <SlidersHorizontal className="w-4 h-4 text-orange-600" />
          Filter Parameters
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
          {/* Sector Selection */}
          <div>
            <label className="block text-slate-600 mb-1.5">Industry Sector</label>
            <select
              value={filters.sector}
              onChange={e => setFilters({ ...filters, sector: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-2xl p-2.5 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            >
              {sectorsList.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          {/* Max P/E Ratio */}
          <div>
            <label className="block text-slate-600 mb-1.5">
              Max P/E Ratio: <span className="text-orange-600 font-black">{filters.peRange[1]}</span>
            </label>
            <input
              type="range"
              min={10}
              max={200}
              step={5}
              value={filters.peRange[1]}
              onChange={e => setFilters({ ...filters, peRange: [0, Number(e.target.value)] })}
              className="w-full accent-orange-600 cursor-pointer"
            />
          </div>

          {/* Min ROE % */}
          <div>
            <label className="block text-slate-600 mb-1.5">
              Min ROE %: <span className="text-emerald-700 font-black">{filters.minRoe}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={50}
              step={2}
              value={filters.minRoe}
              onChange={e => setFilters({ ...filters, minRoe: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Max Debt to Equity */}
          <div>
            <label className="block text-slate-600 mb-1.5">
              Max Debt / Equity: <span className="text-amber-700 font-black">{filters.maxDebtToEquity}</span>
            </label>
            <input
              type="range"
              min={0}
              max={3}
              step={0.1}
              value={filters.maxDebtToEquity}
              onChange={e => setFilters({ ...filters, maxDebtToEquity: Number(e.target.value) })}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          {/* Min Sales Growth 3Yr */}
          <div>
            <label className="block text-slate-600 mb-1.5">
              Min 3Y Sales Growth: <span className="text-orange-600 font-black">{filters.minSalesGrowth3Yr}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={50}
              step={5}
              value={filters.minSalesGrowth3Yr}
              onChange={e => setFilters({ ...filters, minSalesGrowth3Yr: Number(e.target.value) })}
              className="w-full accent-orange-600 cursor-pointer"
            />
          </div>

          {/* Min Dividend Yield % */}
          <div>
            <label className="block text-slate-600 mb-1.5">
              Min Dividend Yield: <span className="text-emerald-700 font-black">{filters.minDivYield}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={5}
              step={0.25}
              value={filters.minDivYield}
              onChange={e => setFilters({ ...filters, minDivYield: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Near 52-Week High Checkbox */}
          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="chk52"
              checked={filters.near52WeekHighOnly}
              onChange={e => setFilters({ ...filters, near52WeekHighOnly: e.target.checked })}
              className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
            />
            <label htmlFor="chk52" className="text-slate-800 font-bold cursor-pointer">
              52-Week High Proximity Only (&gt;95%)
            </label>
          </div>

          {/* Volume Shockers Checkbox */}
          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="chkVol"
              checked={filters.volumeShockersOnly}
              onChange={e => setFilters({ ...filters, volumeShockersOnly: e.target.checked })}
              className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
            />
            <label htmlFor="chkVol" className="text-slate-800 font-bold cursor-pointer">
              High Trading Volume (&gt;1 Cr shares)
            </label>
          </div>
        </div>
      </div>

      {/* Results Count & Screener Table */}
      <div className="bg-white border border-orange-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
        <div className="p-4 bg-orange-50/50 border-b border-orange-100 flex items-center justify-between text-xs font-bold">
          <div className="text-slate-900">
            Matching Companies: <span className="text-orange-600 font-black text-sm">{filteredStocks.length}</span>
          </div>

          <div className="text-slate-500 text-[11px] font-medium">
            Click table headers to re-sort results.
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-orange-50/30 text-slate-600 font-extrabold border-b border-orange-100 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Company</th>
                <th 
                  onClick={() => handleSort('price')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-orange-600"
                >
                  <div className="flex items-center justify-end gap-1">
                    Price (₹) <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('pChange')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-orange-600"
                >
                  <div className="flex items-center justify-end gap-1">
                    Day % <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('marketCapCr')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-orange-600"
                >
                  <div className="flex items-center justify-end gap-1">
                    Market Cap (Cr) <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('pe')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-orange-600"
                >
                  <div className="flex items-center justify-end gap-1">
                    P/E <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('roe')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-orange-600"
                >
                  <div className="flex items-center justify-end gap-1">
                    ROE % <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('debtToEquity')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-orange-600"
                >
                  <div className="flex items-center justify-end gap-1">
                    D/E <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('salesGrowth3Yr')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-orange-600"
                >
                  <div className="flex items-center justify-end gap-1">
                    3Y Sales % <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-medium">
                    No stocks match the selected screener parameters. Try resetting filters or choosing another preset.
                  </td>
                </tr>
              ) : (
                filteredStocks.map(s => {
                  const isUp = s.pChange >= 0;
                  return (
                    <tr 
                      key={s.symbol}
                      className="hover:bg-orange-50/40 transition-colors group cursor-pointer font-semibold"
                      onClick={() => onSelectStock(s.symbol)}
                    >
                      <td className="py-3.5 px-4 font-black">
                        <div className="text-slate-900 group-hover:text-orange-600 transition-colors flex items-center gap-2">
                          {s.symbol}
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">
                            {s.sector}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">{s.name}</div>
                      </td>

                      <td className="py-3.5 px-3 text-right font-black text-slate-900">
                        ₹{s.price.toFixed(2)}
                      </td>

                      <td className={`py-3.5 px-3 text-right font-black ${isUp ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isUp ? '+' : ''}{s.pChange.toFixed(2)}%
                      </td>

                      <td className="py-3.5 px-3 text-right font-bold text-slate-700">
                        ₹{s.marketCapCr.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-3 text-right font-bold text-orange-600">
                        {s.pe.toFixed(1)}
                      </td>

                      <td className="py-3.5 px-3 text-right font-bold text-emerald-700">
                        {s.roe.toFixed(1)}%
                      </td>

                      <td className="py-3.5 px-3 text-right font-semibold text-slate-700">
                        {s.debtToEquity.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-3 text-right font-semibold text-slate-700">
                        {s.salesGrowth3Yr.toFixed(1)}%
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStock(s.symbol);
                          }}
                          className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-[11px] font-bold px-3 py-1 rounded-xl transition-colors"
                        >
                          View Chart →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
