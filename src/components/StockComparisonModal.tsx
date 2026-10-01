import React, { useState, useMemo } from 'react';
import { 
  X, 
  ArrowLeftRight, 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  BarChart3, 
  Info, 
  Sparkles, 
  Check,
  Building2,
  PieChart,
  Activity,
  Layers
} from 'lucide-react';
import { Stock, WatchlistItem } from '../types/market';

interface StockComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: Stock[];
  watchlist?: WatchlistItem[];
  initialStockA?: string;
  initialStockB?: string;
  onSelectStock?: (symbol: string) => void;
}

export const StockComparisonModal: React.FC<StockComparisonModalProps> = ({
  isOpen,
  onClose,
  stocks,
  watchlist = [],
  initialStockA,
  initialStockB,
  onSelectStock,
}) => {
  if (!isOpen) return null;

  // Filter available stocks
  const watchlistSymbols = useMemo(() => new Set(watchlist.map(w => w.stockSymbol)), [watchlist]);

  // Default selection
  const defaultA = useMemo(() => {
    if (initialStockA && stocks.some(s => s.symbol === initialStockA)) return initialStockA;
    if (watchlist.length > 0 && stocks.some(s => s.symbol === watchlist[0].stockSymbol)) {
      return watchlist[0].stockSymbol;
    }
    return stocks[0]?.symbol || '';
  }, [initialStockA, watchlist, stocks]);

  const defaultB = useMemo(() => {
    if (initialStockB && stocks.some(s => s.symbol === initialStockB) && initialStockB !== defaultA) {
      return initialStockB;
    }
    const foundOther = stocks.find(s => s.symbol !== defaultA && (watchlistSymbols.has(s.symbol) || true));
    return foundOther?.symbol || stocks[1]?.symbol || '';
  }, [initialStockB, defaultA, stocks, watchlistSymbols]);

  const [symbolA, setSymbolA] = useState<string>(defaultA);
  const [symbolB, setSymbolB] = useState<string>(defaultB);

  const stockA = useMemo(() => stocks.find(s => s.symbol === symbolA), [stocks, symbolA]);
  const stockB = useMemo(() => stocks.find(s => s.symbol === symbolB), [stocks, symbolB]);

  const handleSwap = () => {
    setSymbolA(symbolB);
    setSymbolB(symbolA);
  };

  // Helper function to format numbers cleanly
  const formatCurrency = (val?: number) => {
    if (val == null) return 'N/A';
    return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  const formatPercent = (val?: number) => {
    if (val == null) return 'N/A';
    return `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;
  };

  // Head to head metric evaluation
  const getWinner = (
    valA?: number,
    valB?: number,
    higherIsBetter: boolean = true
  ): 'A' | 'B' | 'EQUAL' => {
    if (valA == null || valB == null) return 'EQUAL';
    if (Math.abs(valA - valB) < 0.001) return 'EQUAL';
    if (higherIsBetter) {
      return valA > valB ? 'A' : 'B';
    } else {
      return valA < valB ? 'A' : 'B';
    }
  };

  // Comparative AI / Rule Summary
  const summary = useMemo(() => {
    if (!stockA || !stockB) return null;

    let aWins = 0;
    let bWins = 0;

    // Valuation win
    if (stockA.pe > 0 && stockB.pe > 0) {
      if (stockA.pe < stockB.pe) aWins++;
      else if (stockB.pe < stockA.pe) bWins++;
    }

    // ROE win
    if (stockA.roe > stockB.roe) aWins++;
    else if (stockB.roe > stockA.roe) bWins++;

    // ROCE win
    if (stockA.roce > stockB.roce) aWins++;
    else if (stockB.roce > stockA.roce) bWins++;

    // Div yield win
    if (stockA.divYield > stockB.divYield) aWins++;
    else if (stockB.divYield > stockA.divYield) bWins++;

    // Debt win
    if (stockA.debtToEquity < stockB.debtToEquity) aWins++;
    else if (stockB.debtToEquity < stockA.debtToEquity) bWins++;

    let verdict = '';
    if (aWins > bWins) {
      verdict = `${stockA.symbol} demonstrates superior fundamentals overall with better efficiency and valuation metrics.`;
    } else if (bWins > aWins) {
      verdict = `${stockB.symbol} holds stronger financial health and returns compared to ${stockA.symbol}.`;
    } else {
      verdict = `Both ${stockA.symbol} and ${stockB.symbol} present balanced trade-offs across valuation, growth, and risk parameters.`;
    }

    return { aWins, bWins, verdict };
  }, [stockA, stockB]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* MODAL HEADER */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-600/30 border border-orange-500/40 rounded-2xl text-orange-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-tight">Stock Comparison Matrix</h3>
                <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  SIDE-BY-SIDE ANALYTICS
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Compare valuation, profitability, financial health, and momentum metrics head-to-head
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SELECTOR BAR */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 shrink-0 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
            {/* STOCK A SELECTOR */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500 flex items-center justify-between">
                <span>Stock 1 (Base Stock)</span>
                {watchlistSymbols.has(symbolA) && (
                  <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[9px] font-bold">
                    ★ In Watchlist
                  </span>
                )}
              </label>
              <select
                value={symbolA}
                onChange={(e) => setSymbolA(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-extrabold text-sm rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
              >
                {stocks.map(s => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.symbol} - {s.name} ({s.sector})
                  </option>
                ))}
              </select>
              {stockA && (
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="font-black text-slate-900">{formatCurrency(stockA.price)}</span>
                  <span className={`font-bold text-[11px] ${stockA.pChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatPercent(stockA.pChange)}
                  </span>
                </div>
              )}
            </div>

            {/* SWAP BUTTON */}
            <div className="flex justify-center">
              <button
                onClick={handleSwap}
                className="p-3 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-slate-700 hover:text-orange-600 rounded-2xl transition-all shadow-2xs group"
                title="Swap Stock 1 and Stock 2"
              >
                <ArrowLeftRight className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
              </button>
            </div>

            {/* STOCK B SELECTOR */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500 flex items-center justify-between">
                <span>Stock 2 (Comparison Stock)</span>
                {watchlistSymbols.has(symbolB) && (
                  <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[9px] font-bold">
                    ★ In Watchlist
                  </span>
                )}
              </label>
              <select
                value={symbolB}
                onChange={(e) => setSymbolB(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-extrabold text-sm rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
              >
                {stocks.map(s => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.symbol} - {s.name} ({s.sector})
                  </option>
                ))}
              </select>
              {stockB && (
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="font-black text-slate-900">{formatCurrency(stockB.price)}</span>
                  <span className={`font-bold text-[11px] ${stockB.pChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatPercent(stockB.pChange)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* WATCHLIST QUICK PICK PILLS */}
          {watchlist.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
              <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase">Watchlist Quick Picks:</span>
              {watchlist.map(w => {
                const isSelected = w.stockSymbol === symbolA || w.stockSymbol === symbolB;
                return (
                  <button
                    key={w.id}
                    onClick={() => {
                      if (w.stockSymbol === symbolA) return;
                      setSymbolB(w.stockSymbol);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
                      isSelected
                        ? 'bg-orange-600 text-white font-black'
                        : 'bg-white hover:bg-slate-200 border border-slate-200 text-slate-700'
                    }`}
                  >
                    {w.stockSymbol}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* COMPARISON BODY (SCROLLABLE TABLE) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {stockA && stockB ? (
            <>
              {/* AI VERDICT BANNER */}
              {summary && (
                <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100/60 border border-orange-200 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
                  <div className="p-2 bg-orange-600 text-white rounded-xl shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-orange-900 tracking-wider">
                        Comparative Head-To-Head AI Summary
                      </span>
                      <span className="bg-orange-200 text-orange-900 text-[10px] font-black px-2 py-0.5 rounded-md">
                        {summary.aWins} Wins ({stockA.symbol}) vs {summary.bWins} Wins ({stockB.symbol})
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                      {summary.verdict}
                    </p>
                  </div>
                </div>
              )}

              {/* SIDE-BY-SIDE METRICS TABLE */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white text-xs">
                      <th className="py-3 px-4 font-black uppercase tracking-wider w-1/3">Financial Metric</th>
                      <th className="py-3 px-4 font-black text-center w-1/3 border-l border-slate-800 bg-slate-950">
                        <div className="flex items-center justify-center gap-1.5">
                          <span>{stockA.symbol}</span>
                          {onSelectStock && (
                            <button
                              onClick={() => onSelectStock(stockA.symbol)}
                              className="text-[9px] bg-orange-600 hover:bg-orange-500 px-1.5 py-0.5 rounded text-white font-extrabold"
                            >
                              View Detail
                            </button>
                          )}
                        </div>
                      </th>
                      <th className="py-3 px-4 font-black text-center w-1/3 border-l border-slate-800 bg-slate-950">
                        <div className="flex items-center justify-center gap-1.5">
                          <span>{stockB.symbol}</span>
                          {onSelectStock && (
                            <button
                              onClick={() => onSelectStock(stockB.symbol)}
                              className="text-[9px] bg-orange-600 hover:bg-orange-500 px-1.5 py-0.5 rounded text-white font-extrabold"
                            >
                              View Detail
                            </button>
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                    {/* SECTION 1: PRICE & OVERVIEW */}
                    <tr className="bg-slate-100 font-black text-slate-900 text-[11px] uppercase tracking-wider">
                      <td colSpan={3} className="py-2.5 px-4 bg-slate-100 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-orange-600" />
                        <span>Price & Valuation Overview</span>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-700">Company Name</td>
                      <td className="py-3 px-4 text-center font-extrabold text-slate-900">{stockA.name}</td>
                      <td className="py-3 px-4 text-center font-extrabold text-slate-900">{stockB.name}</td>
                    </tr>

                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-700">Sector / Industry</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700">{stockA.sector}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700">{stockB.sector}</td>
                    </tr>

                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-700">Live Market Price</td>
                      <td className="py-3 px-4 text-center font-black text-slate-900 text-sm">
                        {formatCurrency(stockA.price)}
                      </td>
                      <td className="py-3 px-4 text-center font-black text-slate-900 text-sm">
                        {formatCurrency(stockB.price)}
                      </td>
                    </tr>

                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-700">Daily % Change</td>
                      <td className={`py-3 px-4 text-center font-black ${stockA.pChange >= 0 ? 'text-emerald-700 bg-emerald-50/50' : 'text-rose-700 bg-rose-50/50'}`}>
                        {formatPercent(stockA.pChange)}
                      </td>
                      <td className={`py-3 px-4 text-center font-black ${stockB.pChange >= 0 ? 'text-emerald-700 bg-emerald-50/50' : 'text-rose-700 bg-rose-50/50'}`}>
                        {formatPercent(stockB.pChange)}
                      </td>
                    </tr>

                    {/* SECTION 2: KEY VALUATION METRICS */}
                    <tr className="bg-slate-100 font-black text-slate-900 text-[11px] uppercase tracking-wider">
                      <td colSpan={3} className="py-2.5 px-4 bg-slate-100 flex items-center gap-1.5">
                        <PieChart className="w-3.5 h-3.5 text-orange-600" />
                        <span>Key Valuation & Scale Metrics</span>
                      </td>
                    </tr>

                    {/* Market Cap */}
                    {(() => {
                      const winner = getWinner(stockA.marketCapCr, stockB.marketCapCr, true);
                      return (
                        <tr>
                          <td className="py-3 px-4 font-bold text-slate-700">Market Capitalization (Cr)</td>
                          <td className={`py-3 px-4 text-center font-black ${winner === 'A' ? 'bg-emerald-50 text-emerald-900 font-black' : ''}`}>
                            ₹{stockA.marketCapCr.toLocaleString('en-IN')} Cr
                            {winner === 'A' && <span className="ml-1.5 text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded">Larger</span>}
                          </td>
                          <td className={`py-3 px-4 text-center font-black ${winner === 'B' ? 'bg-emerald-50 text-emerald-900 font-black' : ''}`}>
                            ₹{stockB.marketCapCr.toLocaleString('en-IN')} Cr
                            {winner === 'B' && <span className="ml-1.5 text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded">Larger</span>}
                          </td>
                        </tr>
                      );
                    })()}

                    {/* P/E Ratio */}
                    {(() => {
                      const winner = getWinner(stockA.pe, stockB.pe, false); // lower PE is better valuation
                      return (
                        <tr>
                          <td className="py-3 px-4 font-bold text-slate-700">
                            <div>P/E Ratio</div>
                            <div className="text-[10px] text-slate-400 font-normal">Industry PE: {stockA.industryPe} vs {stockB.industryPe}</div>
                          </td>
                          <td className={`py-3 px-4 text-center font-black ${winner === 'A' ? 'bg-emerald-50 text-emerald-900' : ''}`}>
                            {stockA.pe ? stockA.pe.toFixed(2) : 'N/A'}
                            {winner === 'A' && <span className="ml-1.5 text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded">Better Value</span>}
                          </td>
                          <td className={`py-3 px-4 text-center font-black ${winner === 'B' ? 'bg-emerald-50 text-emerald-900' : ''}`}>
                            {stockB.pe ? stockB.pe.toFixed(2) : 'N/A'}
                            {winner === 'B' && <span className="ml-1.5 text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded">Better Value</span>}
                          </td>
                        </tr>
                      );
                    })()}

                    {/* Dividend Yield */}
                    {(() => {
                      const winner = getWinner(stockA.divYield, stockB.divYield, true); // higher div yield is better
                      return (
                        <tr>
                          <td className="py-3 px-4 font-bold text-slate-700">Dividend Yield (%)</td>
                          <td className={`py-3 px-4 text-center font-black ${winner === 'A' ? 'bg-emerald-50 text-emerald-900' : ''}`}>
                            {stockA.divYield.toFixed(2)}%
                            {winner === 'A' && stockA.divYield > 0 && <span className="ml-1.5 text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded">Higher Yield</span>}
                          </td>
                          <td className={`py-3 px-4 text-center font-black ${winner === 'B' ? 'bg-emerald-50 text-emerald-900' : ''}`}>
                            {stockB.divYield.toFixed(2)}%
                            {winner === 'B' && stockB.divYield > 0 && <span className="ml-1.5 text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded">Higher Yield</span>}
                          </td>
                        </tr>
                      );
                    })()}

                    {/* Price to Book (P/B) */}
                    {(() => {
                      const winner = getWinner(stockA.pb, stockB.pb, false);
                      return (
                        <tr>
                          <td className="py-3 px-4 font-bold text-slate-700">Price to Book (P/B)</td>
                          <td className={`py-3 px-4 text-center font-black ${winner === 'A' ? 'bg-emerald-50 text-emerald-900' : ''}`}>
                            {stockA.pb ? stockA.pb.toFixed(2) : 'N/A'}
                          </td>
                          <td className={`py-3 px-4 text-center font-black ${winner === 'B' ? 'bg-emerald-50 text-emerald-900' : ''}`}>
                            {stockB.pb ? stockB.pb.toFixed(2) : 'N/A'}
                          </td>
                        </tr>
                      );
                    })()}

                    {/* Book Value per share */}
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-700">Book Value / Share</td>
                      <td className="py-3 px-4 text-center font-extrabold text-slate-900">{formatCurrency(stockA.bookValue)}</td>
                      <td className="py-3 px-4 text-center font-extrabold text-slate-900">{formatCurrency(stockB.bookValue)}</td>
                    </tr>

                    {/* SECTION 3: PROFITABILITY & EFFICIENCY */}
                    <tr className="bg-slate-100 font-black text-slate-900 text-[11px] uppercase tracking-wider">
                      <td colSpan={3} className="py-2.5 px-4 bg-slate-100 flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-orange-600" />
                        <span>Profitability, Returns & Growth</span>
                      </td>
                    </tr>

                    {/* ROE */}
                    {(() => {
                      const winner = getWinner(stockA.roe, stockB.roe, true);
                      return (
                        <tr>
                          <td className="py-3 px-4 font-bold text-slate-700">Return on Equity (ROE %)</td>
                          <td className={`py-3 px-4 text-center font-black ${winner === 'A' ? 'bg-emerald-50 text-emerald-900' : ''}`}>
                            {stockA.roe.toFixed(2)}%
                            {winner === 'A' && <span className="ml-1.5 text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded">Higher ROE</span>}
                          </td>
                          <td className={`py-3 px-4 text-center font-black ${winner === 'B' ? 'bg-emerald-50 text-emerald-900' : ''}`}>
                            {stockB.roe.toFixed(2)}%
                            {winner === 'B' && <span className="ml-1.5 text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded">Higher ROE</span>}
                          </td>
                        </tr>
                      );
                    })()}

                    {/* ROCE */}
                    {(() => {
                      const winner = getWinner(stockA.roce, stockB.roce, true);
                      return (
                        <tr>
                          <td className="py-3 px-4 font-bold text-slate-700">ROCE (%)</td>
                          <td className={`py-3 px-4 text-center font-black ${winner === 'A' ? 'bg-emerald-50 text-emerald-900' : ''}`}>
                            {stockA.roce.toFixed(2)}%
                            {winner === 'A' && <span className="ml-1.5 text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded">Higher ROCE</span>}
                          </td>
                          <td className={`py-3 px-4 text-center font-black ${winner === 'B' ? 'bg-emerald-50 text-emerald-900' : ''}`}>
                            {stockB.roce.toFixed(2)}%
                            {winner === 'B' && <span className="ml-1.5 text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded">Higher ROCE</span>}
                          </td>
                        </tr>
                      );
                    })()}

                    {/* 3-Yr Sales Growth */}
                    {(() => {
                      const winner = getWinner(stockA.salesGrowth3Yr, stockB.salesGrowth3Yr, true);
                      return (
                        <tr>
                          <td className="py-3 px-4 font-bold text-slate-700">3-Year Sales Growth (%)</td>
                          <td className={`py-3 px-4 text-center font-black ${winner === 'A' ? 'bg-emerald-50 text-emerald-900' : ''}`}>
                            {stockA.salesGrowth3Yr.toFixed(2)}%
                          </td>
                          <td className={`py-3 px-4 text-center font-black ${winner === 'B' ? 'bg-emerald-50 text-emerald-900' : ''}`}>
                            {stockB.salesGrowth3Yr.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })()}

                    {/* 3-Yr Profit Growth */}
                    {(() => {
                      const winner = getWinner(stockA.profitGrowth3Yr, stockB.profitGrowth3Yr, true);
                      return (
                        <tr>
                          <td className="py-3 px-4 font-bold text-slate-700">3-Year Profit Growth (%)</td>
                          <td className={`py-3 px-4 text-center font-black ${winner === 'A' ? 'bg-emerald-50 text-emerald-900' : ''}`}>
                            {stockA.profitGrowth3Yr.toFixed(2)}%
                          </td>
                          <td className={`py-3 px-4 text-center font-black ${winner === 'B' ? 'bg-emerald-50 text-emerald-900' : ''}`}>
                            {stockB.profitGrowth3Yr.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })()}

                    {/* Debt to Equity */}
                    {(() => {
                      const winner = getWinner(stockA.debtToEquity, stockB.debtToEquity, false); // lower debt is better
                      return (
                        <tr>
                          <td className="py-3 px-4 font-bold text-slate-700">Debt / Equity Ratio</td>
                          <td className={`py-3 px-4 text-center font-black ${winner === 'A' ? 'bg-emerald-50 text-emerald-900' : ''}`}>
                            {stockA.debtToEquity.toFixed(2)}
                            {winner === 'A' && <span className="ml-1.5 text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded">Lower Debt</span>}
                          </td>
                          <td className={`py-3 px-4 text-center font-black ${winner === 'B' ? 'bg-emerald-50 text-emerald-900' : ''}`}>
                            {stockB.debtToEquity.toFixed(2)}
                            {winner === 'B' && <span className="ml-1.5 text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded">Lower Debt</span>}
                          </td>
                        </tr>
                      );
                    })()}

                    {/* SECTION 4: SHAREHOLDING PATTERN */}
                    <tr className="bg-slate-100 font-black text-slate-900 text-[11px] uppercase tracking-wider">
                      <td colSpan={3} className="py-2.5 px-4 bg-slate-100 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-orange-600" />
                        <span>Shareholding & Ownership Pattern</span>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-700">Promoter Holding</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">{stockA.promoterHolding}%</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">{stockB.promoterHolding}%</td>
                    </tr>

                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-700">Institutional Holding (FII + DII)</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">
                        {(stockA.fiiHolding + stockA.diiHolding).toFixed(1)}% ({stockA.fiiHolding}% FII / {stockA.diiHolding}% DII)
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">
                        {(stockB.fiiHolding + stockB.diiHolding).toFixed(1)}% ({stockB.fiiHolding}% FII / {stockB.diiHolding}% DII)
                      </td>
                    </tr>

                    {/* SECTION 5: TECHNICAL MOMENTUM */}
                    <tr className="bg-slate-100 font-black text-slate-900 text-[11px] uppercase tracking-wider">
                      <td colSpan={3} className="py-2.5 px-4 bg-slate-100 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-orange-600" />
                        <span>Technical Momentum & 52-Week Range</span>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-700">14-Day RSI</td>
                      <td className="py-3 px-4 text-center font-black text-slate-900">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${
                          stockA.rsi >= 70 ? 'bg-rose-100 text-rose-800' : stockA.rsi <= 30 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {stockA.rsi} ({stockA.rsi >= 70 ? 'Overbought' : stockA.rsi <= 30 ? 'Oversold' : 'Normal'})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-black text-slate-900">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${
                          stockB.rsi >= 70 ? 'bg-rose-100 text-rose-800' : stockB.rsi <= 30 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {stockB.rsi} ({stockB.rsi >= 70 ? 'Overbought' : stockB.rsi <= 30 ? 'Oversold' : 'Normal'})
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-700">52-Week High / Low Range</td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-xs font-black text-slate-900">
                          ₹{stockA.high52} / ₹{stockA.low52}
                        </div>
                        {/* Visual Range bar */}
                        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 relative overflow-hidden">
                          <div 
                            className="bg-orange-500 h-full rounded-full"
                            style={{
                              width: `${Math.max(5, Math.min(100, ((stockA.price - stockA.low52) / (stockA.high52 - stockA.low52 || 1)) * 100))}%`
                            }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-xs font-black text-slate-900">
                          ₹{stockB.high52} / ₹{stockB.low52}
                        </div>
                        {/* Visual Range bar */}
                        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 relative overflow-hidden">
                          <div 
                            className="bg-orange-500 h-full rounded-full"
                            style={{
                              width: `${Math.max(5, Math.min(100, ((stockB.price - stockB.low52) / (stockB.high52 - stockB.low52 || 1)) * 100))}%`
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <p className="font-bold">Please select two stocks above to run head-to-head comparison.</p>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Info className="w-4 h-4 text-orange-600 shrink-0" />
            <span>Green highlighted cells indicate superior metric performance. Financial metrics are updated real-time.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-2xs"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
