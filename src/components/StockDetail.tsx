import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  Layers, 
  Building2, 
  PieChart, 
  ShieldCheck, 
  Sparkles, 
  Bot, 
  ArrowUpRight, 
  ArrowDownRight,
  PlusCircle,
  Bell,
  BellRing,
  Sliders,
  Check,
  Eye,
  Trash2,
  X,
  Target,
  CheckCircle2,
  AlertCircle,
  Coins,
  DollarSign,
  Calendar,
  Gift,
  Users,
  RefreshCw,
  Award,
  Trophy,
  ChevronRight
} from 'lucide-react';
import { Stock, AIAnalysisResponse, PricePoint, PriceAlert } from '../types/market';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  ReferenceLine,
  BarChart,
  Cell
} from 'recharts';

interface StockDetailProps {
  stock: Stock;
  stocks: Stock[];
  onSelectStock: (symbol: string) => void;
  onAddToWatchlist: (symbol: string) => void;
  onAddToPortfolio: (stock: Stock) => void;
  onOpenPriceAlertModal?: (symbol: string) => void;
}

// Helper to calculate technical indicators dynamically
function enrichChartDataWithIndicators(prices: PricePoint[]): PricePoint[] {
  if (!prices || prices.length === 0) return [];

  const closes = prices.map(p => p.close);

  // Helper for SMA
  const getSMA = (arr: number[], period: number, idx: number) => {
    const start = Math.max(0, idx - period + 1);
    const subset = arr.slice(start, idx + 1);
    const sum = subset.reduce((acc, val) => acc + val, 0);
    return Number((sum / subset.length).toFixed(2));
  };

  // Exponential Moving Average (EMA 20)
  const k20 = 2 / (20 + 1);
  const ema20Arr: number[] = [];
  closes.forEach((c, i) => {
    if (i === 0) {
      ema20Arr.push(c);
    } else {
      const ema = c * k20 + ema20Arr[i - 1] * (1 - k20);
      ema20Arr.push(Number(ema.toFixed(2)));
    }
  });

  // MACD (12 EMA - 26 EMA) and Signal (9 EMA)
  const k12 = 2 / (12 + 1);
  const k26 = 2 / (26 + 1);
  const ema12Arr: number[] = [];
  const ema26Arr: number[] = [];
  const macdArr: number[] = [];

  closes.forEach((c, i) => {
    if (i === 0) {
      ema12Arr.push(c);
      ema26Arr.push(c);
    } else {
      ema12Arr.push(c * k12 + ema12Arr[i - 1] * (1 - k12));
      ema26Arr.push(c * k26 + ema26Arr[i - 1] * (1 - k26));
    }
    macdArr.push(Number((ema12Arr[i] - ema26Arr[i]).toFixed(2)));
  });

  const kSignal = 2 / (9 + 1);
  const signalArr: number[] = [];
  macdArr.forEach((m, i) => {
    if (i === 0) {
      signalArr.push(m);
    } else {
      signalArr.push(Number((m * kSignal + signalArr[i - 1] * (1 - kSignal)).toFixed(2)));
    }
  });

  // RSI 14
  const rsiArr: number[] = [];
  closes.forEach((c, i) => {
    if (i === 0) {
      rsiArr.push(50);
      return;
    }
    const start = Math.max(1, i - 13);
    let gains = 0;
    let losses = 0;
    for (let j = start; j <= i; j++) {
      const diff = closes[j] - closes[j - 1];
      if (diff >= 0) gains += diff;
      else losses += Math.abs(diff);
    }
    const avgGain = gains / 14;
    const avgLoss = losses / 14;
    if (avgLoss === 0) {
      rsiArr.push(100);
    } else {
      const rs = avgGain / avgLoss;
      const rsiVal = 100 - (100 / (1 + rs));
      rsiArr.push(Number(rsiVal.toFixed(1)));
    }
  });

  return prices.map((p, idx) => {
    const sma20 = p.sma20 ?? getSMA(closes, 20, idx);
    const sma50 = p.sma50 ?? getSMA(closes, 50, idx);

    // Bollinger Bands (20 period, 2 std dev)
    const start20 = Math.max(0, idx - 19);
    const slice20 = closes.slice(start20, idx + 1);
    const mean20 = slice20.reduce((a, b) => a + b, 0) / slice20.length;
    const variance = slice20.reduce((a, b) => a + Math.pow(b - mean20, 2), 0) / slice20.length;
    const stdDev = Math.sqrt(variance);
    const upperBB = Number((mean20 + 2 * stdDev).toFixed(2));
    const lowerBB = Number((mean20 - 2 * stdDev).toFixed(2));

    const macdVal = macdArr[idx];
    const signalVal = signalArr[idx];
    const macdHist = Number((macdVal - signalVal).toFixed(2));

    return {
      ...p,
      sma20,
      sma50,
      ema20: ema20Arr[idx],
      upperBB,
      lowerBB,
      rsi: p.rsi ?? rsiArr[idx],
      macd: macdVal,
      signalLine: signalVal,
      macdHist,
    };
  });
}

export const StockDetail: React.FC<StockDetailProps> = ({
  stock,
  stocks,
  onSelectStock,
  onAddToWatchlist,
  onAddToPortfolio,
  onOpenPriceAlertModal,
}) => {
  const [activeFinancialTab, setActiveFinancialTab] = useState<'pnl' | 'balance' | 'shareholding' | 'peers' | 'dividends'>('pnl');
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '6M' | '1Y'>('1M');

  // Dividend History Data Generator
  const dividendHistoryData = useMemo(() => {
    const currentYield = stock.divYield || 1.2;
    const currentPrice = stock.price || 1000;
    const ttmDiv = (currentPrice * currentYield) / 100;
    const safeTTM = ttmDiv > 0 ? ttmDiv : 4.5;

    const multipliers = [0.62, 0.72, 0.82, 0.91, 1.0];
    const years = ['FY22', 'FY23', 'FY24', 'FY25', 'FY26 (TTM)'];

    return years.map((year, idx) => {
      const totalDividend = Number((safeTTM * multipliers[idx]).toFixed(2));
      const interim = Number((totalDividend * 0.4).toFixed(2));
      const final = Number((totalDividend * 0.6).toFixed(2));
      const yieldPct = Number((currentYield * (0.8 + idx * 0.05)).toFixed(2));

      return {
        year,
        totalDividend,
        interim,
        final,
        yieldPct: yieldPct > 0 ? yieldPct : 0.8,
        payoutRatio: Math.min(85, Math.round(28 + idx * 3 + (stock.pe % 12))),
      };
    });
  }, [stock.divYield, stock.price, stock.pe]);

  const detailedDividendPayouts = useMemo(() => {
    const currentYield = stock.divYield || 1.2;
    const currentPrice = stock.price || 1000;
    const baseAmt = (currentPrice * currentYield) / 100;
    const safeBase = baseAmt > 0 ? baseAmt : 4.5;

    return [
      { id: 'div-1', exDate: '18 Jul 2026', type: 'Final Dividend', amount: Number((safeBase * 0.6).toFixed(2)), recordDate: '20 Jul 2026', status: 'PAID' },
      { id: 'div-2', exDate: '12 Feb 2026', type: 'Interim Dividend', amount: Number((safeBase * 0.4).toFixed(2)), recordDate: '14 Feb 2026', status: 'PAID' },
      { id: 'div-3', exDate: '22 Jul 2025', type: 'Final Dividend', amount: Number((safeBase * 0.52).toFixed(2)), recordDate: '24 Jul 2025', status: 'PAID' },
      { id: 'div-4', exDate: '10 Feb 2025', type: 'Interim Dividend', amount: Number((safeBase * 0.38).toFixed(2)), recordDate: '12 Feb 2025', status: 'PAID' },
      { id: 'div-5', exDate: '15 Jul 2024', type: 'Final Dividend', amount: Number((safeBase * 0.45).toFixed(2)), recordDate: '17 Jul 2024', status: 'PAID' },
    ];
  }, [stock.divYield, stock.price]);

  // Top 3 Industry Peers State & Fetcher
  const [fetchedPeers, setFetchedPeers] = useState<Stock[]>([]);
  const [isPeersLoading, setIsPeersLoading] = useState<boolean>(false);

  const fetchTopPeers = React.useCallback(async () => {
    setIsPeersLoading(true);
    try {
      const res = await fetch(`/api/market/stocks/${stock.symbol}/peers`);
      if (!res.ok) throw new Error('Failed to fetch peer data');
      const data = await res.json();
      if (data && Array.isArray(data.peers)) {
        setFetchedPeers(data.peers.slice(0, 3));
      } else {
        throw new Error('Invalid peer data format');
      }
    } catch (err) {
      console.warn('API peer fetch fallback to local stocks', err);
      const localPeers = stocks
        .filter(s => s.sector === stock.sector && s.symbol !== stock.symbol)
        .sort((a, b) => (b.marketCapCr || 0) - (a.marketCapCr || 0))
        .slice(0, 3);
      setFetchedPeers(localPeers);
    } finally {
      setIsPeersLoading(false);
    }
  }, [stock.symbol, stock.sector, stocks]);

  React.useEffect(() => {
    fetchTopPeers();
  }, [fetchTopPeers]);

  const allComparedStocks = useMemo(() => {
    const list = [stock];
    for (const p of fetchedPeers) {
      if (!list.some(s => s.symbol === p.symbol)) {
        list.push(p);
      }
    }
    return list;
  }, [stock, fetchedPeers]);

  const peerInsights = useMemo(() => {
    if (allComparedStocks.length === 0) return null;

    const lowestPE = [...allComparedStocks].sort((a, b) => (a.pe || 999) - (b.pe || 999))[0];
    const highestYield = [...allComparedStocks].sort((a, b) => (b.divYield || 0) - (a.divYield || 0))[0];
    const largestCap = [...allComparedStocks].sort((a, b) => (b.marketCapCr || 0) - (a.marketCapCr || 0))[0];

    const avgPE = Number((allComparedStocks.reduce((acc, s) => acc + (s.pe || 0), 0) / allComparedStocks.length).toFixed(1));
    const avgYield = Number((allComparedStocks.reduce((acc, s) => acc + (s.divYield || 0), 0) / allComparedStocks.length).toFixed(2));

    return {
      lowestPE,
      highestYield,
      largestCap,
      avgPE,
      avgYield,
    };
  }, [allComparedStocks]);
  
  // Technical Indicator Toggle States
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(false);
  const [showEMA20, setShowEMA20] = useState(false);
  const [showBB, setShowBB] = useState(false);
  const [showRSI, setShowRSI] = useState(true);
  const [showMACD, setShowMACD] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  
  const [aiReport, setAiReport] = useState<AIAnalysisResponse | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // PRICE ALERT FEATURE STATES
  const [alerts, setAlerts] = React.useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem('merabazaar_price_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [targetPriceInput, setTargetPriceInput] = useState<string>('');
  const [alertCondition, setAlertCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [alertType, setAlertType] = useState<'BUY' | 'SELL'>('BUY');
  const [alertNote, setAlertNote] = useState('');
  const [triggeredToast, setTriggeredToast] = useState<PriceAlert | null>(null);

  // Save alerts to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('merabazaar_price_alerts', JSON.stringify(alerts));
    } catch (err) {
      console.error(err);
    }
  }, [alerts]);

  // Open alert modal prefilled with target price
  const handleOpenAlertModal = () => {
    if (onOpenPriceAlertModal) {
      onOpenPriceAlertModal(stock.symbol);
      return;
    }
    setTargetPriceInput((stock.price * 1.05).toFixed(2));
    setAlertCondition('ABOVE');
    setAlertType('BUY');
    setAlertNote('');
    setIsAlertModalOpen(true);
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(targetPriceInput);
    if (isNaN(priceNum) || priceNum <= 0) return;

    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}`,
      symbol: stock.symbol,
      stockName: stock.name,
      targetPrice: priceNum,
      condition: alertCondition,
      type: alertType,
      note: alertNote.trim() || undefined,
      triggered: false,
      createdAt: new Date().toISOString(),
    };

    setAlerts(prev => [newAlert, ...prev]);
    setIsAlertModalOpen(false);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handlePresetPercentage = (pct: number) => {
    const calculated = stock.price * (1 + pct / 100);
    setTargetPriceInput(calculated.toFixed(2));
    setAlertCondition(pct >= 0 ? 'ABOVE' : 'BELOW');
    setAlertType(pct >= 0 ? 'BUY' : 'SELL');
  };

  // Check live price against alerts for current stock
  React.useEffect(() => {
    if (!stock || !stock.price) return;

    setAlerts(prevAlerts => {
      let updated = false;
      let hitAlert: PriceAlert | null = null;

      const next = prevAlerts.map(alt => {
        if (alt.symbol === stock.symbol && !alt.triggered) {
          const isTriggered =
            (alt.condition === 'ABOVE' && stock.price >= alt.targetPrice) ||
            (alt.condition === 'BELOW' && stock.price <= alt.targetPrice);

          if (isTriggered) {
            updated = true;
            hitAlert = { ...alt, triggered: true };
            return { ...alt, triggered: true };
          }
        }
        return alt;
      });

      if (hitAlert) {
        setTriggeredToast(hitAlert);
      }

      return updated ? next : prevAlerts;
    });
  }, [stock.price, stock.symbol]);

  const symbolAlerts = alerts.filter(a => a.symbol === stock.symbol);
  const activeSymbolAlerts = symbolAlerts.filter(a => !a.triggered);

  const isUp = stock.pChange >= 0;

  // Enrich data with indicators
  const enrichedChartData = useMemo(() => {
    return enrichChartDataWithIndicators(stock.historicalPrices || []);
  }, [stock.historicalPrices]);

  const latestPoint = enrichedChartData[enrichedChartData.length - 1] || {};
  const currentRsi = latestPoint.rsi ?? stock.rsi ?? 50;

  const fetchAiReport = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'STOCK_ANALYSIS',
          symbol: stock.symbol,
          query: `Provide a detailed fundamental and technical research verdict on ${stock.symbol} (${stock.name}).`,
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

  const peers = stocks.filter(s => s.sector === stock.sector && s.symbol !== stock.symbol);

  return (
    <div id="tour-view-detail" className="space-y-6">
      {/* TRIGGERED PRICE ALERT TOAST NOTIFICATION BANNER */}
      {triggeredToast && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 text-white rounded-3xl p-5 shadow-xl flex items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
              <BellRing className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm uppercase tracking-wide">Price Alert Hit!</span>
                <span className="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  {triggeredToast.type} TARGET REACHED
                </span>
              </div>
              <p className="text-xs text-orange-100 font-bold mt-0.5">
                <strong className="text-white">{triggeredToast.symbol}</strong> market price of <span className="underline">₹{stock.price.toFixed(2)}</span> has reached your target level of <span className="underline">₹{triggeredToast.targetPrice.toFixed(2)}</span> ({triggeredToast.condition === 'ABOVE' ? 'Rose Above' : 'Dropped Below'}).
                {triggeredToast.note && <span className="block text-[11px] text-amber-200 italic mt-0.5">Note: "{triggeredToast.note}"</span>}
              </p>
            </div>
          </div>

          <button
            onClick={() => setTriggeredToast(null)}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all shrink-0"
            title="Dismiss Alert"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Stock Main Header Banner */}
      <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{stock.symbol}</h1>
              <span className="text-xs font-bold bg-orange-50 text-orange-800 px-2.5 py-1 rounded-full border border-orange-200">
                {stock.sector}
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                {stock.exchange} LISTED
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-semibold">{stock.name} • ISIN: {stock.isin}</p>
          </div>

          {/* Price Header & Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                ₹{stock.price.toFixed(2)}
              </div>
              <div className={`text-sm font-extrabold flex items-center justify-end gap-1 ${isUp ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {isUp ? '+' : ''}{stock.change.toFixed(2)} ({isUp ? '+' : ''}{stock.pChange.toFixed(2)}%)
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAlertModal}
                className="flex items-center gap-1.5 bg-orange-100 hover:bg-orange-200 text-orange-950 text-xs font-black px-3.5 py-2.5 rounded-2xl border border-orange-300 transition-all shadow-xs relative"
              >
                <BellRing className="w-4 h-4 text-orange-600 animate-bounce" />
                <span>Price Alert</span>
                {activeSymbolAlerts.length > 0 && (
                  <span className="bg-orange-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ml-0.5">
                    {activeSymbolAlerts.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => onAddToWatchlist(stock.symbol)}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2.5 rounded-2xl transition-colors border border-slate-200"
              >
                <Bell className="w-4 h-4 text-orange-600" />
                Watchlist
              </button>

              <button
                onClick={() => onAddToPortfolio(stock)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl transition-all shadow-sm shadow-orange-500/20"
              >
                <PlusCircle className="w-4 h-4" />
                Add to Portfolio
              </button>

              <button
                onClick={fetchAiReport}
                disabled={isAiLoading}
                className="flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-black px-4 py-2.5 rounded-2xl border border-amber-300 transition-all shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                {isAiLoading ? 'Analyzing...' : 'AI Gemini Report'}
              </button>
            </div>
          </div>
        </div>

        {/* Day Range & 52-Week Range Meters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs font-semibold">
          {/* Day Range */}
          <div>
            <div className="flex justify-between text-slate-500 mb-1">
              <span>Day Low: ₹{stock.low.toFixed(2)}</span>
              <span className="text-slate-900 font-bold">Day Range</span>
              <span>Day High: ₹{stock.high.toFixed(2)}</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 relative">
              <div 
                className="h-full bg-orange-500 rounded-full" 
                style={{
                  width: `${Math.min(100, Math.max(5, ((stock.price - stock.low) / (stock.high - stock.low || 1)) * 100))}%`
                }}
              ></div>
            </div>
          </div>

          {/* 52W Range */}
          <div>
            <div className="flex justify-between text-slate-500 mb-1">
              <span>52W Low: ₹{stock.low52.toFixed(2)}</span>
              <span className="text-slate-900 font-bold">52-Week Proximity</span>
              <span>52W High: ₹{stock.high52.toFixed(2)}</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 relative">
              <div 
                className="h-full bg-amber-500 rounded-full" 
                style={{
                  width: `${Math.min(100, Math.max(5, ((stock.price - stock.low52) / (stock.high52 - stock.low52 || 1)) * 100))}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* PRICE ALERTS MONITORING CARD FOR THIS STOCK */}
      <div className="bg-white border border-orange-100 rounded-3xl p-5 shadow-sm space-y-3.5 hover:shadow-md transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-orange-100/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <span>Price Target Alerts for {stock.symbol}</span>
                <span className="bg-orange-100 text-orange-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {symbolAlerts.length} Configured
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Live Price: <strong className="text-slate-900 font-black">₹{stock.price.toFixed(2)}</strong> • Get notified instantly when stock reaches your buy/sell target.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAlertModal}
            className="text-xs font-black text-orange-600 hover:text-white bg-orange-50 hover:bg-orange-600 px-3.5 py-2 rounded-xl border border-orange-200 hover:border-orange-600 transition-all flex items-center gap-1.5 shrink-0 active:scale-95 shadow-2xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Set New Target Alert</span>
          </button>
        </div>

        {symbolAlerts.length === 0 ? (
          <div className="bg-slate-50/80 border border-dashed border-slate-200 rounded-2xl p-4 text-center text-xs text-slate-500 font-medium flex flex-col items-center justify-center gap-2">
            <BellRing className="w-6 h-6 text-slate-300" />
            <span>No price target alerts set for {stock.symbol}. Click <strong>"+ Set New Target Alert"</strong> to set target buy or sell notifications.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {symbolAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  alert.triggered
                    ? 'bg-amber-50/90 border-amber-300 text-amber-950 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200 text-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase ${
                      alert.type === 'BUY' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {alert.type} TARGET
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      ₹{alert.targetPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                    <span>Condition:</span>
                    <strong className="text-slate-900">
                      {alert.condition === 'ABOVE' ? 'Rises Above (≥)' : 'Drops Below (≤)'} ₹{alert.targetPrice.toFixed(2)}
                    </strong>
                  </div>

                  {alert.note && (
                    <p className="text-[10px] text-slate-500 italic">"{alert.note}"</p>
                  )}

                  <div className="pt-1">
                    {alert.triggered ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-200 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-amber-700" />
                        TRIGGERED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">
                        <Bell className="w-3 h-3 text-orange-500" />
                        Active Monitoring
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteAlert(alert.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-rose-200"
                  title="Delete Alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Research Report Card (If Triggered) */}
      {aiReport && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-700" />
              <h3 className="font-black text-slate-900 text-base">Gemini Equity Research Verdict</h3>
            </div>
            <span
              className={`text-xs font-black px-3 py-1 rounded-full border ${
                aiReport.verdict === 'BULLISH' || aiReport.verdict === 'STRONG_BUY' 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                  : 'bg-rose-100 text-rose-800 border-rose-300'
              }`}
            >
              VERDICT: {aiReport.verdict}
            </span>
          </div>

          <p className="text-sm text-slate-800 leading-relaxed font-semibold">{aiReport.summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold">
            <div className="bg-white p-3.5 rounded-2xl border border-amber-200">
              <span className="text-slate-500 block mb-1">Target Price Range:</span>
              <span className="text-orange-700 font-black text-sm">{aiReport.targetPriceRange || 'N/A'}</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-amber-200">
              <span className="text-slate-500 block mb-1">Fundamental Health Score:</span>
              <span className="text-emerald-700 font-black text-sm">{aiReport.fundamentalScore}/100</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-amber-200">
              <span className="text-slate-500 block mb-1">Technical Outlook:</span>
              <span className="text-amber-800 font-black">{aiReport.technicalOutlook}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <span className="text-emerald-800 font-extrabold block mb-1.5">Key Growth Drivers:</span>
              <ul className="space-y-1 text-slate-700 list-disc list-inside font-medium">
                {aiReport.keyDrivers?.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </div>

            <div>
              <span className="text-rose-800 font-extrabold block mb-1.5">Key Risks & Constraints:</span>
              <ul className="space-y-1 text-slate-700 list-disc list-inside font-medium">
                {aiReport.risks?.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Price & Technical Indicator Chart */}
      <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Technical Chart & Indicator Overlays</h3>
              <p className="text-xs text-slate-500 font-semibold">Toggle technical indicators below to overlay onto the stock price chart.</p>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center bg-orange-50 p-1 rounded-2xl border border-orange-200 text-xs font-bold">
            {(['1D', '1W', '1M', '6M', '1Y'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-xl transition-all ${
                  timeframe === tf ? 'bg-orange-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Technical Indicators Control Toolbar */}
        <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="text-slate-500 flex items-center gap-1 mr-1">
            <Sliders className="w-3.5 h-3.5 text-orange-600" />
            Overlay Indicators:
          </span>

          <button
            onClick={() => setShowSMA20(!showSMA20)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              showSMA20 ? 'bg-amber-500 text-white border-amber-600 font-black shadow-2xs' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {showSMA20 && <Check className="w-3.5 h-3.5" />}
            20 SMA
          </button>

          <button
            onClick={() => setShowSMA50(!showSMA50)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              showSMA50 ? 'bg-purple-600 text-white border-purple-700 font-black shadow-2xs' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {showSMA50 && <Check className="w-3.5 h-3.5" />}
            50 SMA
          </button>

          <button
            onClick={() => setShowEMA20(!showEMA20)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              showEMA20 ? 'bg-cyan-600 text-white border-cyan-700 font-black shadow-2xs' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {showEMA20 && <Check className="w-3.5 h-3.5" />}
            20 EMA
          </button>

          <button
            onClick={() => setShowBB(!showBB)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              showBB ? 'bg-indigo-600 text-white border-indigo-700 font-black shadow-2xs' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {showBB && <Check className="w-3.5 h-3.5" />}
            Bollinger Bands (20,2)
          </button>

          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              showVolume ? 'bg-orange-600 text-white border-orange-700 font-black shadow-2xs' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {showVolume && <Check className="w-3.5 h-3.5" />}
            Volume
          </button>

          <span className="h-4 w-px bg-slate-200 mx-1 hidden sm:inline-block" />

          <button
            onClick={() => setShowRSI(!showRSI)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              showRSI ? 'bg-pink-600 text-white border-pink-700 font-black shadow-2xs' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {showRSI && <Check className="w-3.5 h-3.5" />}
            RSI (14) Panel
          </button>

          <button
            onClick={() => setShowMACD(!showMACD)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              showMACD ? 'bg-blue-600 text-white border-blue-700 font-black shadow-2xs' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {showMACD && <Check className="w-3.5 h-3.5" />}
            MACD Panel
          </button>
        </div>

        {/* Main Price Chart Canvas */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={enrichedChartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isUp ? '#10b981' : '#f43f5e'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isUp ? '#10b981' : '#f43f5e'} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis domain={['auto', 'auto']} stroke="#94a3b8" tick={{ fontSize: 11 }} orientation="right" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#fed7aa', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
              />
              
              <Area type="monotone" dataKey="close" stroke={isUp ? '#059669' : '#e11d48'} strokeWidth={2.5} fillOpacity={1} fill="url(#colorPrice)" name="Price (₹)" />
              
              {showVolume && <Bar dataKey="volume" yAxisId={1} fill="#ea580c" opacity={0.15} name="Volume" />}
              
              {showSMA20 && <Line type="monotone" dataKey="sma20" stroke="#f59e0b" strokeWidth={2} dot={false} name="20 SMA" />}
              {showSMA50 && <Line type="monotone" dataKey="sma50" stroke="#8b5cf6" strokeWidth={2} dot={false} name="50 SMA" />}
              {showEMA20 && <Line type="monotone" dataKey="ema20" stroke="#0891b2" strokeWidth={2} dot={false} name="20 EMA" />}
              
              {showBB && (
                <>
                  <Line type="monotone" dataKey="upperBB" stroke="#6366f1" strokeDasharray="3 3" strokeWidth={1.5} dot={false} name="Upper BB" />
                  <Line type="monotone" dataKey="lowerBB" stroke="#6366f1" strokeDasharray="3 3" strokeWidth={1.5} dot={false} name="Lower BB" />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* RSI (14) Dedicated Sub-Chart Panel */}
        {showRSI && (
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span className="text-pink-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-pink-600" />
                RSI (14) Relative Strength Index Oscillator
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                currentRsi >= 70 ? 'bg-rose-100 text-rose-800' : currentRsi <= 30 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
              }`}>
                RSI: {currentRsi} • {currentRsi >= 70 ? 'OVERBOUGHT (>70)' : currentRsi <= 30 ? 'OVERSOLD (<30)' : 'NEUTRAL ZONE'}
              </span>
            </div>

            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={enrichedChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} ticks={[30, 50, 70]} stroke="#94a3b8" tick={{ fontSize: 10 }} orientation="right" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#fbcfe8', borderRadius: '12px' }}
                  />
                  <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Overbought (70)', fill: '#f43f5e', fontSize: 9 }} />
                  <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Oversold (30)', fill: '#10b981', fontSize: 9 }} />
                  <Line type="monotone" dataKey="rsi" stroke="#db2777" strokeWidth={2} dot={false} name="RSI (14)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* MACD Dedicated Sub-Chart Panel */}
        {showMACD && (
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span className="text-blue-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                MACD (12, 26, 9) Convergence Divergence
              </span>
              <span className="text-[10px] text-slate-500 font-bold">
                Blue: MACD Line • Orange: Signal Line • Bars: Histogram
              </span>
            </div>

            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={enrichedChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} orientation="right" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#bfdbfe', borderRadius: '12px' }}
                  />
                  <ReferenceLine y={0} stroke="#cbd5e1" />
                  <Bar dataKey="macdHist" fill="#10b981" opacity={0.5} name="Histogram" />
                  <Line type="monotone" dataKey="macd" stroke="#2563eb" strokeWidth={2} dot={false} name="MACD" />
                  <Line type="monotone" dataKey="signalLine" stroke="#ea580c" strokeWidth={1.5} dot={false} name="Signal Line" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Fundamental Key Financial Ratio Matrix */}
      <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
        <h3 className="font-black text-slate-900 text-base flex items-center gap-2 border-b border-orange-100 pb-3">
          <Layers className="w-5 h-5 text-orange-600" /> Key Fundamental Metrics
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
          <div className="bg-orange-50/40 p-3.5 rounded-2xl border border-orange-100">
            <span className="text-slate-500 block mb-1">Market Cap</span>
            <span className="text-slate-900 font-black text-sm">₹{stock.marketCapCr.toLocaleString('en-IN')} Cr</span>
          </div>

          <div className="bg-orange-50/40 p-3.5 rounded-2xl border border-orange-100">
            <span className="text-slate-500 block mb-1">Stock P/E vs Ind P/E</span>
            <span className="text-orange-600 font-black text-sm">{stock.pe} / {stock.industryPe}</span>
          </div>

          <div className="bg-orange-50/40 p-3.5 rounded-2xl border border-orange-100">
            <span className="text-slate-500 block mb-1">ROE / ROCE</span>
            <span className="text-emerald-700 font-black text-sm">{stock.roe}% / {stock.roce}%</span>
          </div>

          <div className="bg-orange-50/40 p-3.5 rounded-2xl border border-orange-100">
            <span className="text-slate-500 block mb-1">Dividend Yield</span>
            <span className="text-amber-700 font-black text-sm">{stock.divYield}%</span>
          </div>

          <div className="bg-orange-50/40 p-3.5 rounded-2xl border border-orange-100">
            <span className="text-slate-500 block mb-1">Debt to Equity</span>
            <span className="text-slate-900 font-black text-sm">{stock.debtToEquity}</span>
          </div>

          <div className="bg-orange-50/40 p-3.5 rounded-2xl border border-orange-100">
            <span className="text-slate-500 block mb-1">Book Value</span>
            <span className="text-slate-900 font-black text-sm">₹{stock.bookValue}</span>
          </div>

          <div className="bg-orange-50/40 p-3.5 rounded-2xl border border-orange-100">
            <span className="text-slate-500 block mb-1">3Y Sales Growth</span>
            <span className="text-emerald-700 font-black text-sm">{stock.salesGrowth3Yr}%</span>
          </div>

          <div className="bg-orange-50/40 p-3.5 rounded-2xl border border-orange-100">
            <span className="text-slate-500 block mb-1">Deliverable Quantity %</span>
            <span className="text-orange-600 font-black text-sm">{stock.deliverablePercent}%</span>
          </div>
        </div>
      </div>

      {/* TOP 3 INDUSTRY PEERS COMPARISON SECTION */}
      <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-700 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-base">Top 3 Industry Peers Comparison</h3>
                <span className="bg-orange-100 text-orange-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-orange-200">
                  {stock.sector} Sector
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Side-by-side comparison of {stock.symbol} against top 3 industry peers by Market Cap, P/E ratio, Dividend Yield & ROE
              </p>
            </div>
          </div>

          <button
            onClick={fetchTopPeers}
            disabled={isPeersLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs rounded-2xl transition-all self-start sm:self-auto shrink-0 disabled:opacity-50"
            title="Refresh Peer Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isPeersLoading ? 'animate-spin' : ''}`} />
            <span>{isPeersLoading ? 'Syncing...' : 'Sync Peers'}</span>
          </button>
        </div>

        {/* Sector Averages & Metrics Summary Bar */}
        {peerInsights && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-orange-50/50 p-3.5 rounded-2xl border border-orange-100">
              <span className="text-slate-500 block text-[11px] font-extrabold uppercase">Industry Group Avg P/E</span>
              <span className="text-slate-900 font-black text-lg">{peerInsights.avgPE}x</span>
            </div>
            <div className="bg-orange-50/50 p-3.5 rounded-2xl border border-orange-100">
              <span className="text-slate-500 block text-[11px] font-extrabold uppercase">Industry Avg Dividend Yield</span>
              <span className="text-amber-800 font-black text-lg">{peerInsights.avgYield}%</span>
            </div>
            <div className="bg-orange-50/50 p-3.5 rounded-2xl border border-orange-100">
              <span className="text-slate-500 block text-[11px] font-extrabold uppercase">Market Cap Leader</span>
              <span className="text-slate-900 font-black text-lg truncate block">{peerInsights.largestCap.symbol}</span>
            </div>
            <div className="bg-orange-50/50 p-3.5 rounded-2xl border border-orange-100">
              <span className="text-slate-500 block text-[11px] font-extrabold uppercase">Lowest Valuation (P/E)</span>
              <span className="text-emerald-700 font-black text-lg truncate block">{peerInsights.lowestPE.symbol} ({peerInsights.lowestPE.pe})</span>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <div className="space-y-2">
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase text-[10px] font-black">
                  <th className="py-3 px-3.5">Company / Ticker</th>
                  <th className="py-3 px-3.5 text-right">Price & 1D %</th>
                  <th className="py-3 px-3.5 text-right">Market Cap (₹ Cr)</th>
                  <th className="py-3 px-3.5 text-right">P/E Ratio</th>
                  <th className="py-3 px-3.5 text-right">Div. Yield</th>
                  <th className="py-3 px-3.5 text-right">ROE %</th>
                  <th className="py-3 px-3.5 text-right">P/B Ratio</th>
                  <th className="py-3 px-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allComparedStocks.map(item => {
                  const isSelected = item.symbol === stock.symbol;
                  const isUp = (item.pChange || 0) >= 0;
                  const isLowestPE = peerInsights?.lowestPE.symbol === item.symbol;
                  const isHighestYield = peerInsights?.highestYield.symbol === item.symbol;
                  const isLargestCap = peerInsights?.largestCap.symbol === item.symbol;

                  return (
                    <tr
                      key={item.symbol}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-orange-100/70 font-black border-l-4 border-orange-600'
                          : 'hover:bg-orange-50/40'
                      }`}
                    >
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-900 font-black">{item.symbol}</span>
                              {isSelected && (
                                <span className="bg-orange-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 block truncate max-w-[150px]">{item.name}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-right">
                        <div className="font-extrabold text-slate-900">₹{item.price.toFixed(2)}</div>
                        <div className={`text-[11px] font-bold inline-flex items-center gap-0.5 ${isUp ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          <span>{item.pChange >= 0 ? '+' : ''}{item.pChange}%</span>
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-right font-black text-slate-900">
                        ₹{(item.marketCapCr || 0).toLocaleString('en-IN')}
                        {isLargestCap && (
                          <span className="block text-[9px] text-amber-700 font-bold uppercase">Largest Cap</span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 text-right">
                        <span className={`font-black ${isLowestPE ? 'text-emerald-700 underline decoration-emerald-500' : 'text-slate-800'}`}>
                          {item.pe ?? 'N/A'}
                        </span>
                        {isLowestPE && (
                          <span className="block text-[9px] text-emerald-700 font-bold uppercase">Lowest P/E</span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 text-right">
                        <span className={`font-black ${isHighestYield ? 'text-amber-800 underline decoration-amber-500' : 'text-slate-800'}`}>
                          {item.divYield ?? 0}%
                        </span>
                        {isHighestYield && (
                          <span className="block text-[9px] text-amber-800 font-bold uppercase">Top Yield</span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 text-right font-bold text-slate-800">
                        {item.roe ? `${item.roe}%` : 'N/A'}
                      </td>

                      <td className="py-3 px-3.5 text-right font-bold text-slate-800">
                        {item.pb ?? 'N/A'}
                      </td>

                      <td className="py-3 px-3.5 text-center">
                        {isSelected ? (
                          <span className="text-[11px] font-extrabold text-orange-700 italic">Viewing</span>
                        ) : (
                          <button
                            onClick={() => onSelectStock(item.symbol)}
                            className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[11px] rounded-xl transition-all shadow-2xs inline-flex items-center gap-1 active:scale-95"
                          >
                            <span>Analyze</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Insights Cards */}
        {peerInsights && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-2xl p-3.5 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-emerald-950 block">Valuation Leader (Lowest P/E)</span>
                <p className="text-slate-600 mt-0.5">
                  <strong className="text-slate-900">{peerInsights.lowestPE.symbol}</strong> trades at a P/E of <span className="font-bold text-emerald-800">{peerInsights.lowestPE.pe}</span>, offering valuation discount vs group avg of {peerInsights.avgPE}x.
                </p>
              </div>
            </div>

            <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-3.5 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-amber-950 block">Top Dividend Yield</span>
                <p className="text-slate-600 mt-0.5">
                  <strong className="text-slate-900">{peerInsights.highestYield.symbol}</strong> offers the highest dividend yield at <span className="font-bold text-amber-800">{peerInsights.highestYield.divYield}%</span> among the {stock.sector} peer group.
                </p>
              </div>
            </div>

            <div className="bg-blue-50/60 border border-blue-200/60 rounded-2xl p-3.5 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-800 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-blue-950 block">Market Cap Titan</span>
                <p className="text-slate-600 mt-0.5">
                  <strong className="text-slate-900">{peerInsights.largestCap.symbol}</strong> leads industry scale with <span className="font-bold text-slate-900">₹{(peerInsights.largestCap.marketCapCr || 0).toLocaleString('en-IN')} Cr</span> market capitalization.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DIVIDEND PAYOUT HISTORY & ANALYSIS CARD */}
      <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-base">Dividend Payout History</h3>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200">
                  {stock.divYield}% Yield
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Annual dividend per share (₹) and yield progression for {stock.name} ({stock.symbol})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-2 rounded-2xl border border-amber-200 shrink-0">
            <Gift className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-950">
              5-Yr Div CAGR: <strong className="text-emerald-700 font-black">+12.4%</strong>
            </span>
          </div>
        </div>

        {/* Key Dividend Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
            <span className="text-slate-500 block text-[11px] font-extrabold uppercase">Current Yield</span>
            <span className="text-amber-700 font-black text-lg">{stock.divYield}%</span>
          </div>
          <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
            <span className="text-slate-500 block text-[11px] font-extrabold uppercase">Annual Dividend / Share</span>
            <span className="text-slate-900 font-black text-lg">
              ₹{((stock.price * (stock.divYield || 1.2)) / 100 || 4.5).toFixed(2)}
            </span>
          </div>
          <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
            <span className="text-slate-500 block text-[11px] font-extrabold uppercase">Avg Payout Ratio</span>
            <span className="text-emerald-700 font-black text-lg">~38%</span>
          </div>
          <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
            <span className="text-slate-500 block text-[11px] font-extrabold uppercase">Payment Frequency</span>
            <span className="text-slate-900 font-black text-lg">Bi-Annual</span>
          </div>
        </div>

        {/* Dividend Bar Chart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Dividend Payout per Share Trend (₹)</span>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block"></span>
                <span>Interim Dividend</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-orange-600 inline-block"></span>
                <span>Final Dividend</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full bg-slate-50/60 border border-slate-100 rounded-2xl p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dividendHistoryData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="year" tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tick={{ fontSize: 11, fontWeight: 700, fill: '#475569' }} />
                <YAxis tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tick={{ fontSize: 11, fontWeight: 700, fill: '#475569' }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1">
                          <p className="font-black text-amber-400">{data.year} Dividend Payout</p>
                          <p className="font-semibold">Interim: <strong className="text-white">₹{data.interim}</strong></p>
                          <p className="font-semibold">Final: <strong className="text-white">₹{data.final}</strong></p>
                          <div className="border-t border-slate-700 pt-1 mt-1 flex justify-between gap-4 font-bold">
                            <span>Total Dividend:</span>
                            <span className="text-emerald-400">₹{data.totalDividend} / share</span>
                          </div>
                          <p className="text-[10px] text-slate-400">Yield: {data.yieldPct}% • Payout Ratio: {data.payoutRatio}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="interim" name="Interim Dividend" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} barSize={36} />
                <Bar dataKey="final" name="Final Dividend" stackId="a" fill="#ea580c" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Dividend Records Table */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">Recent Dividend Events</h4>
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase text-[10px] font-black">
                  <th className="py-2.5 px-3">Ex-Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹/Share)</th>
                  <th className="py-2.5 px-3">Record Date</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {detailedDividendPayouts.map(div => (
                  <tr key={div.id} className="hover:bg-amber-50/30">
                    <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span>{div.exDate}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium">{div.type}</td>
                    <td className="py-2.5 px-3 text-right font-black text-amber-700">₹{div.amount.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-slate-500">{div.recordDate}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        {div.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Financial Statements & Shareholding Tabs */}
      <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
        <div className="flex items-center bg-orange-50 p-1.5 rounded-2xl border border-orange-200 text-xs font-bold gap-1 max-w-lg">
          <button
            onClick={() => setActiveFinancialTab('pnl')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeFinancialTab === 'pnl' ? 'bg-orange-600 text-white font-black shadow-xs' : 'text-slate-600'
            }`}
          >
            Profit & Loss
          </button>
          <button
            onClick={() => setActiveFinancialTab('balance')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeFinancialTab === 'balance' ? 'bg-orange-600 text-white font-black shadow-xs' : 'text-slate-600'
            }`}
          >
            Balance Sheet
          </button>
          <button
            onClick={() => setActiveFinancialTab('shareholding')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeFinancialTab === 'shareholding' ? 'bg-orange-600 text-white font-black shadow-xs' : 'text-slate-600'
            }`}
          >
            Shareholding
          </button>
          <button
            onClick={() => setActiveFinancialTab('peers')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeFinancialTab === 'peers' ? 'bg-orange-600 text-white font-black shadow-xs' : 'text-slate-600'
            }`}
          >
            Peers
          </button>
          <button
            onClick={() => setActiveFinancialTab('dividends')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeFinancialTab === 'dividends' ? 'bg-orange-600 text-white font-black shadow-xs' : 'text-slate-600'
            }`}
          >
            Dividends
          </button>
        </div>

        {/* P&L Statement Table */}
        {activeFinancialTab === 'pnl' && (
          <div className="overflow-x-auto">
            <h4 className="text-xs font-extrabold text-slate-500 mb-2 uppercase">Quarterly Financial Performance (₹ Cr)</h4>
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="bg-orange-50/50 text-slate-700 border-b border-orange-100 uppercase text-[10px] font-black">
                  <th className="py-2.5 px-3">Quarter</th>
                  <th className="py-2.5 px-3 text-right">Sales / Revenue</th>
                  <th className="py-2.5 px-3 text-right">Operating Profit</th>
                  <th className="py-2.5 px-3 text-right">OPM %</th>
                  <th className="py-2.5 px-3 text-right">Net Profit</th>
                  <th className="py-2.5 px-3 text-right">EPS (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stock.quarterlyResults.map((q, i) => (
                  <tr key={i} className="hover:bg-orange-50/40">
                    <td className="py-2.5 px-3 font-extrabold text-slate-900">{q.quarter}</td>
                    <td className="py-2.5 px-3 text-right text-slate-900 font-bold">₹{q.sales.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">₹{q.opProfit.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-right text-orange-600 font-black">{q.opm}%</td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 font-black">₹{q.netProfit.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-right text-slate-900 font-black">₹{q.eps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Shareholding Pattern Table */}
        {activeFinancialTab === 'shareholding' && (
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase">Shareholding Pattern %</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
              <div className="bg-orange-50/40 p-4 rounded-2xl border border-orange-100 text-center">
                <span className="text-slate-500 block mb-1 font-bold">Promoter Holding</span>
                <span className="text-orange-600 font-black text-xl">{stock.promoterHolding}%</span>
              </div>
              <div className="bg-orange-50/40 p-4 rounded-2xl border border-orange-100 text-center">
                <span className="text-slate-500 block mb-1 font-bold">FII Holding</span>
                <span className="text-emerald-700 font-black text-xl">{stock.fiiHolding}%</span>
              </div>
              <div className="bg-orange-50/40 p-4 rounded-2xl border border-orange-100 text-center">
                <span className="text-slate-500 block mb-1 font-bold">DII Holding</span>
                <span className="text-amber-700 font-black text-xl">{stock.diiHolding}%</span>
              </div>
              <div className="bg-orange-50/40 p-4 rounded-2xl border border-orange-100 text-center">
                <span className="text-slate-500 block mb-1 font-bold">Public & Others</span>
                <span className="text-slate-800 font-black text-xl">{stock.publicHolding}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Peer Comparison */}
        {activeFinancialTab === 'peers' && (
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase">Sector Peer Comparison ({stock.sector})</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="bg-orange-50/50 text-slate-700 border-b border-orange-100 uppercase text-[10px] font-black">
                    <th className="py-2.5 px-3">Company</th>
                    <th className="py-2.5 px-3 text-right">Price</th>
                    <th className="py-2.5 px-3 text-right">P/E</th>
                    <th className="py-2.5 px-3 text-right">ROE %</th>
                    <th className="py-2.5 px-3 text-right">Market Cap (Cr)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-orange-100/60 font-black border-l-4 border-orange-600">
                    <td className="py-2.5 px-3 text-orange-950">{stock.symbol} (Selected)</td>
                    <td className="py-2.5 px-3 text-right">₹{stock.price.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right">{stock.pe}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-800">{stock.roe}%</td>
                    <td className="py-2.5 px-3 text-right">₹{stock.marketCapCr.toLocaleString('en-IN')}</td>
                  </tr>
                  {peers.map(p => (
                    <tr 
                      key={p.symbol}
                      onClick={() => onSelectStock(p.symbol)}
                      className="hover:bg-orange-50/40 cursor-pointer"
                    >
                      <td className="py-2.5 px-3 text-slate-900 font-bold">{p.symbol}</td>
                      <td className="py-2.5 px-3 text-right text-slate-800">₹{p.price.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-800">{p.pe}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">{p.roe}%</td>
                      <td className="py-2.5 px-3 text-right text-slate-800">₹{p.marketCapCr.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dividend Tab Content */}
        {activeFinancialTab === 'dividends' && (
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase">Dividend Track Record ({stock.symbol})</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
                <span className="text-slate-500 block mb-1">Dividend Yield</span>
                <span className="text-amber-800 font-black text-lg">{stock.divYield}%</span>
              </div>
              <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
                <span className="text-slate-500 block mb-1">Payout Ratio</span>
                <span className="text-emerald-700 font-black text-lg">~38%</span>
              </div>
              <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
                <span className="text-slate-500 block mb-1">TTM Div / Share</span>
                <span className="text-slate-900 font-black text-lg">
                  ₹{((stock.price * (stock.divYield || 1.2)) / 100 || 4.5).toFixed(2)}
                </span>
              </div>
              <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
                <span className="text-slate-500 block mb-1">Distribution Type</span>
                <span className="text-slate-900 font-black text-lg">Cash Dividends</span>
              </div>
            </div>

            <div className="h-56 w-full bg-slate-50/60 border border-slate-100 rounded-2xl p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dividendHistoryData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="year" tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tick={{ fontSize: 11, fontWeight: 700, fill: '#475569' }} />
                  <YAxis tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tick={{ fontSize: 11, fontWeight: 700, fill: '#475569' }} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl border border-slate-800 text-xs">
                            <p className="font-black text-amber-400">{data.year}</p>
                            <p>Interim: ₹{data.interim} • Final: ₹{data.final}</p>
                            <p className="text-emerald-400 font-bold">Total: ₹{data.totalDividend} / share</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="interim" name="Interim" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} barSize={32} />
                  <Bar dataKey="final" name="Final" stackId="a" fill="#ea580c" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* PRICE ALERT CREATION MODAL */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-orange-100 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsAlertModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Set Price Alert</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {stock.symbol} • Current Price: <strong className="text-slate-900">₹{stock.price.toFixed(2)}</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-4">
              {/* Quick Percentage Presets */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Quick Target Presets:
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                  {[-10, -5, -2, 2, 5, 10].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handlePresetPercentage(pct)}
                      className={`py-1.5 rounded-xl text-xs font-black transition-all border ${
                        pct > 0
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {pct > 0 ? `+${pct}%` : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Price Input */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">
                  Target Trigger Price (₹)
                </label>
                <input
                  type="number"
                  step="0.05"
                  required
                  value={targetPriceInput}
                  onChange={(e) => setTargetPriceInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-black text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition-all"
                />
              </div>

              {/* Condition Selector */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">
                  Alert Trigger Condition
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAlertCondition('ABOVE')}
                    className={`p-2.5 rounded-2xl border text-xs font-extrabold transition-all text-center ${
                      alertCondition === 'ABOVE'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Price Rises Above (≥)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlertCondition('BELOW')}
                    className={`p-2.5 rounded-2xl border text-xs font-extrabold transition-all text-center ${
                      alertCondition === 'BELOW'
                        ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Price Drops Below (≤)
                  </button>
                </div>
              </div>

              {/* Type Selector (BUY vs SELL) */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">
                  Target Purpose / Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAlertType('BUY')}
                    className={`p-2.5 rounded-2xl border text-xs font-extrabold transition-all text-center ${
                      alertType === 'BUY'
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Buy Target / Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlertType('SELL')}
                    className={`p-2.5 rounded-2xl border text-xs font-extrabold transition-all text-center ${
                      alertType === 'SELL'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Sell Target / Take Profit
                  </button>
                </div>
              </div>

              {/* Note Input */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">
                  Alert Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Buy on breakout / Stop loss trigger"
                  value={alertNote}
                  onChange={(e) => setAlertNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <BellRing className="w-4 h-4" />
                <span>Create Price Alert</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
