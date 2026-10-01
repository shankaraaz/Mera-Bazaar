import React, { useState } from 'react';
import { 
  Gift, 
  Scissors, 
  DollarSign, 
  Repeat, 
  Calendar, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calculator, 
  TrendingUp, 
  Info,
  ArrowRight,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { CorporateAction, Stock, AIAnalysisResponse } from '../types/market';

interface CorporateActionsBonusProps {
  corporateActions: CorporateAction[];
  stocks: Stock[];
  onSelectStock: (symbol: string) => void;
}

export const CorporateActionsBonus: React.FC<CorporateActionsBonusProps> = ({
  corporateActions,
  stocks,
  onSelectStock,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'BONUS' | 'SPLIT' | 'DIVIDEND' | 'BUYBACK'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'UPCOMING' | 'EX_DATE_TODAY' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Bonus & Dividend Calculator State
  const [selectedCaId, setSelectedCaId] = useState<string>(corporateActions[0]?.id || 'ca-1');
  const [userSharesHeld, setUserSharesHeld] = useState<number>(100);

  // Gemini AI Analysis State
  const [aiReport, setAiReport] = useState<AIAnalysisResponse | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Filter actions logic
  const filteredActions = corporateActions.filter(ca => {
    const matchesType = filterType === 'ALL' || ca.actionType === filterType;
    const matchesStatus = filterStatus === 'ALL' || ca.status === filterStatus;
    const matchesQuery = 
      ca.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ca.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ca.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesQuery;
  });

  // Summary counts
  const bonusCount = corporateActions.filter(ca => ca.actionType === 'BONUS').length;
  const splitCount = corporateActions.filter(ca => ca.actionType === 'SPLIT').length;
  const divCount = corporateActions.filter(ca => ca.actionType === 'DIVIDEND').length;
  const buybackCount = corporateActions.filter(ca => ca.actionType === 'BUYBACK' || ca.actionType === 'RIGHTS').length;

  // Selected Action for Calculator
  const selectedCa = corporateActions.find(ca => ca.id === selectedCaId) || corporateActions[0];
  const selectedStock = stocks.find(s => s.symbol === selectedCa?.symbol);
  const currentPrice = selectedStock?.price || 1000;

  // Calculation Logic
  let postBonusShares = userSharesHeld;
  let freeBonusShares = 0;
  let dividendCashEarned = 0;
  let postSplitShares = userSharesHeld;

  if (selectedCa) {
    if (selectedCa.actionType === 'BONUS') {
      if (selectedCa.ratioOrAmount === '1:1') {
        freeBonusShares = userSharesHeld;
      } else if (selectedCa.ratioOrAmount === '2:1') {
        freeBonusShares = userSharesHeld * 2;
      } else if (selectedCa.ratioOrAmount === '1:2') {
        freeBonusShares = Math.floor(userSharesHeld / 2);
      }
      postBonusShares = userSharesHeld + freeBonusShares;
    } else if (selectedCa.actionType === 'DIVIDEND') {
      const match = selectedCa.ratioOrAmount.match(/₹([0-9.]+)/);
      const perShareAmount = match ? parseFloat(match[1]) : 10;
      dividendCashEarned = userSharesHeld * perShareAmount;
    } else if (selectedCa.actionType === 'SPLIT') {
      if (selectedCa.ratioOrAmount.includes('1:5')) {
        postSplitShares = userSharesHeld * 5;
      } else if (selectedCa.ratioOrAmount.includes('1:2')) {
        postSplitShares = userSharesHeld * 2;
      } else if (selectedCa.ratioOrAmount.includes('1:10')) {
        postSplitShares = userSharesHeld * 10;
      }
    }
  }

  const fetchAiCorporateActionReport = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'MARKET_BRIEF',
          query: `Analyze upcoming corporate actions in Indian share market focusing on ${selectedCa.symbol} (${selectedCa.details}) and tax implications of Bonus vs Dividend vs Split for retail investors.`,
        }),
      });
      const data = await res.json();
      setAiReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100 border border-orange-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
              <Gift className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bonus & Corporate Actions</h1>
                <span className="text-[10px] font-black bg-orange-600 text-white px-2.5 py-0.5 rounded-full uppercase shadow-2xs">
                  LIVE BSE / NSE TRACKER
                </span>
              </div>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                Comprehensive tracking of Bonus Shares, Stock Splits, Dividends, Record Dates & Buyback ratios for Indian listed equities.
              </p>
            </div>
          </div>

          <button
            onClick={fetchAiCorporateActionReport}
            disabled={isAiLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl transition-all shadow-md shadow-orange-500/20 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            {isAiLoading ? 'Analyzing Tax & Impact...' : 'Gemini AI Bonus Verdict'}
          </button>
        </div>

        {/* Quick Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl border border-orange-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-extrabold uppercase">
              <span>Bonus Announcements</span>
              <Gift className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">{bonusCount} Active</div>
            <span className="text-[10px] text-amber-700 font-bold">1:1 & 2:1 Ratio Issues</span>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl border border-orange-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-extrabold uppercase">
              <span>Stock Splits</span>
              <Scissors className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">{splitCount} Scheduled</div>
            <span className="text-[10px] text-blue-700 font-bold">Face Value Sub-divisions</span>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl border border-orange-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-extrabold uppercase">
              <span>Dividends & Yields</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">{divCount} Declared</div>
            <span className="text-[10px] text-emerald-700 font-bold">Payouts Credited Soon</span>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl border border-orange-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-extrabold uppercase">
              <span>Buybacks & Rights</span>
              <Repeat className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">{buybackCount} Open</div>
            <span className="text-[10px] text-purple-700 font-bold">Premium Tender Offers</span>
          </div>
        </div>
      </div>

      {/* AI Report Card (If Triggered) */}
      {aiReport && (
        <div className="bg-amber-50/70 border border-amber-300 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-700" />
              <h3 className="font-black text-slate-900 text-base">Gemini AI Corporate Action Analysis</h3>
            </div>
            <span className="text-xs bg-amber-200 text-amber-900 font-black px-3 py-1 rounded-full">
              RESEARCH BRIEF
            </span>
          </div>
          <p className="text-xs text-slate-800 font-semibold leading-relaxed">{aiReport.summary}</p>
          {aiReport.keyDrivers && (
            <div className="pt-2">
              <span className="text-xs font-black text-amber-900 block mb-1">Key Investor Takeaways:</span>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 font-medium">
                {aiReport.keyDrivers.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Interactive Filters & Search Controls */}
      <div className="bg-white border border-orange-100 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Action Type Filter Tabs */}
          <div className="flex items-center bg-orange-50 p-1.5 rounded-2xl border border-orange-200 text-xs font-bold gap-1 w-full lg:w-auto overflow-x-auto">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                filterType === 'ALL' ? 'bg-orange-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Actions
            </button>
            <button
              onClick={() => setFilterType('BONUS')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                filterType === 'BONUS' ? 'bg-amber-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              Bonus Shares ({bonusCount})
            </button>
            <button
              onClick={() => setFilterType('SPLIT')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                filterType === 'SPLIT' ? 'bg-blue-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              Stock Splits ({splitCount})
            </button>
            <button
              onClick={() => setFilterType('DIVIDEND')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                filterType === 'DIVIDEND' ? 'bg-emerald-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              Dividends ({divCount})
            </button>
            <button
              onClick={() => setFilterType('BUYBACK')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                filterType === 'BUYBACK' ? 'bg-purple-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              Buybacks ({buybackCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search symbol (e.g., RELIANCE, TCS)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold pl-9 pr-3 py-2.5 rounded-2xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        {/* Status Filter Badges */}
        <div className="flex items-center gap-2 pt-1 text-xs font-bold">
          <span className="text-slate-500">Filter Status:</span>
          {(['ALL', 'UPCOMING', 'EX_DATE_TODAY', 'COMPLETED'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-xl border transition-all ${
                filterStatus === st 
                  ? 'bg-slate-900 text-white border-slate-900 font-black' 
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Statuses' : st === 'EX_DATE_TODAY' ? '⚡ Ex-Date Today' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Corporate Actions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActions.length === 0 ? (
          <div className="col-span-full bg-white border border-orange-100 rounded-3xl p-12 text-center text-slate-500 font-semibold space-y-2">
            <Info className="w-8 h-8 text-orange-400 mx-auto" />
            <p>No corporate action entries found matching your search criteria.</p>
          </div>
        ) : (
          filteredActions.map(ca => {
            const isBonus = ca.actionType === 'BONUS';
            const isSplit = ca.actionType === 'SPLIT';
            const isDiv = ca.actionType === 'DIVIDEND';
            const isBuyback = ca.actionType === 'BUYBACK';

            const badgeBg = isBonus 
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
              : isSplit 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
              : isDiv 
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white' 
              : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white';

            return (
              <div
                key={ca.id}
                className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-orange-300 transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase shadow-2xs flex items-center gap-1 ${badgeBg}`}>
                      {isBonus && <Gift className="w-3 h-3" />}
                      {isSplit && <Scissors className="w-3 h-3" />}
                      {isDiv && <DollarSign className="w-3 h-3" />}
                      {isBuyback && <Repeat className="w-3 h-3" />}
                      {ca.actionType}
                    </span>

                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                        ca.status === 'EX_DATE_TODAY'
                          ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                          : ca.status === 'UPCOMING' || ca.status === 'ANNOUNCED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {ca.status === 'EX_DATE_TODAY' ? '⚡ EX-DATE TODAY' : ca.status}
                    </span>
                  </div>

                  {/* Symbol, Name & Live Price */}
                  <div className="mt-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div 
                          onClick={() => onSelectStock(ca.symbol)}
                          className="text-lg font-black text-slate-900 hover:text-orange-600 cursor-pointer transition-colors flex items-center gap-2"
                        >
                          <span>{ca.symbol}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold">{ca.companyName}</p>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-200">
                          {ca.ratioOrAmount}
                        </span>
                        {(() => {
                          const stockData = stocks.find(s => s.symbol.toUpperCase() === ca.symbol.toUpperCase());
                          if (!stockData) return null;
                          return (
                            <div className="mt-1.5 text-right">
                              <div className="text-xs font-black text-slate-900">
                                ₹{stockData.price.toLocaleString('en-IN')}
                              </div>
                              <div className={`text-[10px] font-extrabold flex items-center justify-end ${
                                stockData.change >= 0 ? 'text-emerald-700' : 'text-rose-600'
                              }`}>
                                {stockData.change >= 0 ? '+' : ''}{stockData.pChange.toFixed(2)}%
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Highlights Description Box */}
                  <div className="bg-orange-50/50 p-3.5 rounded-2xl border border-orange-100 mt-3 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-black block">Action Summary</span>
                    <p className="text-xs font-black text-slate-900">{ca.details}</p>
                  </div>

                  {/* Dates Timeline Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold mt-3 pt-3 border-t border-slate-100">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Ex-Date</span>
                      <span className="text-slate-900 font-black">{ca.exDate}</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Record Date</span>
                      <span className="text-slate-900 font-black">{ca.recordDate}</span>
                    </div>
                  </div>

                  {/* Remarks */}
                  <p className="text-[11px] text-slate-600 font-medium mt-3 italic line-clamp-2">
                    "{ca.remarks}"
                  </p>
                </div>

                {/* Footer Action Button */}
                <div className="pt-3 border-t border-orange-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedCaId(ca.id);
                      const el = document.getElementById('bonus-calculator-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full bg-orange-50 hover:bg-orange-100 text-orange-900 font-black text-xs py-2.5 rounded-2xl border border-orange-200 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Calculator className="w-3.5 h-3.5 text-orange-600" />
                    Calculate My Share Benefits
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Interactive Bonus & Dividend Share Estimator Calculator */}
      <div id="bonus-calculator-section" className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-6">
        <div className="flex items-center gap-3 border-b border-orange-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-lg">Bonus & Corporate Action Benefit Estimator</h3>
            <p className="text-xs text-slate-500 font-semibold">
              Select any announced corporate action and enter your share quantity to calculate post-bonus shares and cash dividends.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls Form */}
          <div className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Select Announced Stock Action</label>
              <select
                value={selectedCaId}
                onChange={e => setSelectedCaId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-extrabold rounded-2xl p-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              >
                {corporateActions.map(ca => {
                  const s = stocks.find(st => st.symbol.toUpperCase() === ca.symbol.toUpperCase());
                  const priceStr = s ? ` [₹${s.price}]` : '';
                  return (
                    <option key={ca.id} value={ca.id}>
                      {ca.symbol}{priceStr} - {ca.actionType}: {ca.details} ({ca.exDate})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <div className="flex justify-between font-extrabold text-slate-700 mb-1">
                <span>Number of Shares You Own:</span>
                <span className="text-orange-600 font-black text-sm">{userSharesHeld} Shares</span>
              </div>
              <input
                type="number"
                min={1}
                max={50000}
                value={userSharesHeld}
                onChange={e => setUserSharesHeld(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-2xl p-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 space-y-2">
              <span className="text-[11px] text-orange-950 font-black block uppercase">Market Valuation Context</span>
              <div className="flex justify-between text-slate-700">
                <span>Estimated Share Price:</span>
                <span className="text-slate-900 font-black">₹{currentPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Current Investment Value:</span>
                <span className="text-slate-900 font-black">₹{(userSharesHeld * currentPrice).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Calculator Output Card */}
          <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 p-6 rounded-3xl border border-orange-200 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <span className="text-xs font-black text-orange-900 uppercase tracking-wide block border-b border-orange-200 pb-2">
                Estimated Benefit Breakdown for {selectedCa.symbol}
              </span>

              {selectedCa.actionType === 'BONUS' && (
                <div className="space-y-3">
                  <div className="bg-white/80 p-3.5 rounded-2xl border border-orange-200">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Free Bonus Shares Recieved</span>
                    <span className="text-amber-700 font-black text-2xl">+{freeBonusShares} Free Shares</span>
                  </div>

                  <div className="bg-white/80 p-3.5 rounded-2xl border border-orange-200">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Total Post-Bonus Demat Holding</span>
                    <span className="text-emerald-700 font-black text-2xl">{postBonusShares} Total Shares</span>
                  </div>
                </div>
              )}

              {selectedCa.actionType === 'DIVIDEND' && (
                <div className="space-y-3">
                  <div className="bg-white/80 p-3.5 rounded-2xl border border-orange-200">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Direct Bank Payout Expected</span>
                    <span className="text-emerald-700 font-black text-2xl">₹{dividendCashEarned.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="bg-white/80 p-3.5 rounded-2xl border border-orange-200">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Per Share Payout</span>
                    <span className="text-slate-900 font-black text-lg">{selectedCa.ratioOrAmount}</span>
                  </div>
                </div>
              )}

              {selectedCa.actionType === 'SPLIT' && (
                <div className="space-y-3">
                  <div className="bg-white/80 p-3.5 rounded-2xl border border-orange-200">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Post-Split Share Quantity</span>
                    <span className="text-blue-700 font-black text-2xl">{postSplitShares} Shares</span>
                  </div>

                  <div className="bg-white/80 p-3.5 rounded-2xl border border-orange-200">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Sub-division Adjustment</span>
                    <span className="text-slate-900 font-black text-sm">{selectedCa.details}</span>
                  </div>
                </div>
              )}

              {selectedCa.actionType === 'BUYBACK' && (
                <div className="bg-white/80 p-3.5 rounded-2xl border border-orange-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Buyback Tender Offer</span>
                  <span className="text-purple-700 font-black text-xl">{selectedCa.ratioOrAmount}</span>
                  <p className="text-[11px] text-slate-600 font-medium">Eligible for tender offer submission prior to record date.</p>
                </div>
              )}
            </div>

            <div className="bg-orange-100/80 p-3 rounded-2xl border border-orange-200 text-[11px] text-orange-950 font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-orange-700 shrink-0" />
              <span>Eligibility Rule: Shares must be bought at least 1 trading day before Ex-Date ({selectedCa.exDate}).</span>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Guide Box: Ex-Date vs Record Date */}
      <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-black text-slate-900 text-base flex items-center gap-2 border-b border-orange-100 pb-3">
          <Info className="w-5 h-5 text-orange-600" />
          Indian Market Corporate Action Investor Guide (Ex-Date vs Record Date Rules)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
          <div className="bg-orange-50/40 p-4 rounded-2xl border border-orange-100 space-y-1.5">
            <span className="text-orange-900 font-extrabold text-sm block">1. Board Announcement</span>
            <p className="text-slate-600 font-medium leading-relaxed">
              The board of directors announces the corporate action details (Bonus ratio, Split ratio, or Dividend amount) subject to shareholder consent.
            </p>
          </div>

          <div className="bg-orange-50/40 p-4 rounded-2xl border border-orange-100 space-y-1.5">
            <span className="text-orange-900 font-extrabold text-sm block">2. Ex-Date (Critical Day!)</span>
            <p className="text-slate-600 font-medium leading-relaxed">
              On the Ex-Date, stock price is adjusted downwards proportionally. To receive bonus shares or dividends, you MUST buy the stock BEFORE this date.
            </p>
          </div>

          <div className="bg-orange-50/40 p-4 rounded-2xl border border-orange-100 space-y-1.5">
            <span className="text-orange-900 font-extrabold text-sm block">3. Record Date & Credit</span>
            <p className="text-slate-600 font-medium leading-relaxed">
              The company checks NSDL/CDSL depositories on Record Date. Bonus shares credit to Demat within 10-15 days; Dividends credit within 30 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
