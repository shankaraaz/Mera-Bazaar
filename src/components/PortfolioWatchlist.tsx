import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon, 
  Sparkles, 
  Bot, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  FileSpreadsheet,
  Calculator,
  Receipt,
  Percent,
  Sliders,
  Calendar,
  CheckCircle2,
  Info,
  ShieldAlert,
  HelpCircle,
  FileText,
  Clock,
  Layers,
  Coins,
  Activity,
  Filter,
  Settings2,
  Target,
  AlertOctagon,
  ArrowLeftRight
} from 'lucide-react';
import { Stock, PortfolioPosition, WatchlistItem, AIAnalysisResponse } from '../types/market';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { SmartRsiAlertsModal, SmartRsiConfig } from './SmartRsiAlertsModal';
import { StockComparisonModal } from './StockComparisonModal';

interface PortfolioWatchlistProps {
  portfolio: PortfolioPosition[];
  watchlist: WatchlistItem[];
  stocks: Stock[];
  onAddStockToPortfolio: (pos: Omit<PortfolioPosition, 'id'>) => void;
  onRemoveFromPortfolio: (id: string) => void;
  onRemoveFromWatchlist: (id: string) => void;
  onSelectStock: (symbol: string) => void;
}

const COLORS = ['#ea580c', '#059669', '#d97706', '#8257e5', '#ec4899', '#2563eb'];

interface RsiSparklineChartProps {
  currentRsi: number;
  obLimit?: number;
  osLimit?: number;
  width?: number;
  height?: number;
  symbol: string;
}

export const RsiSparklineChart: React.FC<RsiSparklineChartProps> = ({
  currentRsi,
  obLimit = 70,
  osLimit = 30,
  width = 130,
  height = 40,
  symbol,
}) => {
  const points = 14;

  const history = React.useMemo(() => {
    let hash = 0;
    for (let i = 0; i < symbol.length; i++) {
      hash = (hash << 5) - hash + symbol.charCodeAt(i);
      hash |= 0;
    }

    const series: number[] = new Array(points);
    series[points - 1] = currentRsi;

    let val = currentRsi;
    for (let i = points - 2; i >= 0; i--) {
      const delta = Math.sin(hash * 0.7 + i * 1.9) * 5;
      val = val - delta;
      val = Math.max(15, Math.min(88, val));
      series[i] = Math.round(val * 10) / 10;
    }
    return series;
  }, [symbol, currentRsi]);

  const paddingY = 4;
  const effectiveHeight = height - paddingY * 2;

  const rsiToY = (val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    return paddingY + effectiveHeight * (1 - clamped / 100);
  };

  const obY = rsiToY(obLimit);
  const osY = rsiToY(osLimit);

  const stepX = width / (points - 1);
  const pathData = history
    .map((val, idx) => {
      const x = idx * stepX;
      const y = rsiToY(val);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const lastX = (points - 1) * stepX;
  const lastY = rsiToY(currentRsi);

  const isOverbought = currentRsi >= obLimit;
  const isOversold = currentRsi <= osLimit;

  const strokeColor = isOverbought ? '#e11d48' : isOversold ? '#059669' : '#d97706';
  const dotGlow = isOverbought ? '#f43f5e' : isOversold ? '#10b981' : '#f59e0b';

  return (
    <div className="relative group inline-block">
      <svg
        width={width}
        height={height}
        className="overflow-visible bg-slate-50/80 rounded-xl p-1 border border-slate-200/60 shadow-2xs"
      >
        <defs>
          <linearGradient id={`rsiGrad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* Overbought Band (top area above obLimit) */}
        <rect x={0} y={0} width={width} height={Math.max(0, obY)} fill="rgba(244, 63, 94, 0.09)" />

        {/* Oversold Band (bottom area below osLimit) */}
        <rect x={0} y={osY} width={width} height={Math.max(0, height - osY)} fill="rgba(16, 185, 129, 0.09)" />

        {/* Reference Dashed Lines */}
        <line x1={0} y1={obY} x2={width} y2={obY} stroke="#e11d48" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
        <line x1={0} y1={osY} x2={width} y2={osY} stroke="#059669" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />

        {/* Area Fill Under Curve */}
        <polygon points={`0,${height} ${pathData} ${lastX},${height}`} fill={`url(#rsiGrad-${symbol})`} />

        {/* Trend Polyline */}
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pathData}
        />

        {/* Endpoint Highlight Dot */}
        <circle cx={lastX} cy={lastY} r="4" fill={dotGlow} className="animate-ping opacity-75" />
        <circle cx={lastX} cy={lastY} r="3" fill={dotGlow} stroke="#ffffff" strokeWidth="1.5" />
      </svg>

      {/* Hover Tooltip showing 14D trend history */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
        <div className="bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl shadow-lg border border-slate-700 whitespace-nowrap">
          <div>14-Day RSI Sparkline Trend</div>
          <div className="text-orange-300">
            Latest: <span className="font-extrabold">{currentRsi}</span> (Overbought: {obLimit} / Oversold: {osLimit})
          </div>
        </div>
        <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
      </div>
    </div>
  );
};

export const PortfolioWatchlist: React.FC<PortfolioWatchlistProps> = ({
  portfolio,
  watchlist,
  stocks,
  onAddStockToPortfolio,
  onRemoveFromPortfolio,
  onRemoveFromWatchlist,
  onSelectStock,
}) => {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'tax-estimator' | 'watchlist'>('portfolio');
  const [showAddModal, setShowAddModal] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('6M');
  const [chartMetric, setChartMetric] = useState<'gain' | 'value'>('gain');

  const [selectedSymbol, setSelectedSymbol] = useState(stocks[0]?.symbol || 'RELIANCE');
  const [quantity, setQuantity] = useState(10);
  const [buyPrice, setBuyPrice] = useState(3000);

  // --- SMART RSI ALERTS CONFIGURATION & ANALYSIS STATE ---
  const [isSmartRsiModalOpen, setIsSmartRsiModalOpen] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [compareStockA, setCompareStockA] = useState<string | undefined>(undefined);
  const [compareStockB, setCompareStockB] = useState<string | undefined>(undefined);
  const [watchlistFilter, setWatchlistFilter] = useState<'ALL' | 'OVERBOUGHT' | 'OVERSOLD' | 'TARGET_HIT' | 'STOP_LOSS_HIT' | 'NEUTRAL'>('ALL');
  const [rsiAlertConfig, setRsiAlertConfig] = useState<SmartRsiConfig>(() => {
    try {
      const saved = localStorage.getItem('merabazaar_rsi_smart_alert_config');
      return saved ? JSON.parse(saved) : {
        enabled: true,
        overboughtThreshold: 70,
        oversoldThreshold: 30,
        soundEnabled: true,
        bannerEnabled: true,
        stockOverrides: {},
      };
    } catch {
      return {
        enabled: true,
        overboughtThreshold: 70,
        oversoldThreshold: 30,
        soundEnabled: true,
        bannerEnabled: true,
        stockOverrides: {},
      };
    }
  });

  const handleSaveRsiConfig = (newCfg: SmartRsiConfig) => {
    setRsiAlertConfig(newCfg);
    localStorage.setItem('merabazaar_rsi_smart_alert_config', JSON.stringify(newCfg));
  };

  // --- TAX ESTIMATION UTILITY STATE ---
  const [stcgRate, setStcgRate] = useState<number>(20.0); // Budget 2024 STCG = 20%
  const [ltcgRate, setLtcgRate] = useState<number>(12.5); // Budget 2024 LTCG = 12.5%
  const [ltcgExemptionLimit, setLtcgExemptionLimit] = useState<number>(125000); // Budget 2024 LTCG exemption = ₹1,25,000
  const [cessRate, setCessRate] = useState<number>(4.0); // 4% Health & Education Cess
  const [taxRegimePreset, setTaxRegimePreset] = useState<'budget_2024' | 'budget_2023' | 'custom_slab'>('budget_2024');
  const [customSlabRate, setCustomSlabRate] = useState<number>(30.0);
  const [targetRealizationDate, setTargetRealizationDate] = useState<string>('2026-08-03');

  // Per-position overrides for tax simulation
  const [positionTaxOverrides, setPositionTaxOverrides] = useState<Record<string, { buyDate?: string; selectedForSale?: boolean; customSellPrice?: number }>>({});

  const applyTaxPreset = (preset: 'budget_2024' | 'budget_2023' | 'custom_slab') => {
    setTaxRegimePreset(preset);
    if (preset === 'budget_2024') {
      setStcgRate(20.0);
      setLtcgRate(12.5);
      setLtcgExemptionLimit(125000);
      setCessRate(4.0);
    } else if (preset === 'budget_2023') {
      setStcgRate(15.0);
      setLtcgRate(10.0);
      setLtcgExemptionLimit(100000);
      setCessRate(4.0);
    } else if (preset === 'custom_slab') {
      setStcgRate(customSlabRate);
      setLtcgRate(customSlabRate);
      setLtcgExemptionLimit(0);
      setCessRate(4.0);
    }
  };

  const holdings = portfolio.map(pos => {
    const liveStock = stocks.find(s => s.symbol === pos.stockSymbol) || {
      price: pos.averageBuyPrice,
      pChange: 0,
      name: pos.stockName,
      sector: 'General',
    };
    const currentValue = liveStock.price * pos.quantity;
    const investedValue = pos.averageBuyPrice * pos.quantity;
    const profitLoss = currentValue - investedValue;
    const profitLossPercent = ((profitLoss / (investedValue || 1)) * 100);

    return {
      ...pos,
      livePrice: liveStock.price,
      pChange: liveStock.pChange,
      sector: liveStock.sector,
      currentValue,
      investedValue,
      profitLoss,
      profitLossPercent,
    };
  });

  const totalInvested = holdings.reduce((sum, h) => sum + h.investedValue, 0);
  const totalCurrent = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalPL = totalCurrent - totalInvested;
  const totalPLPercent = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

  // --- TAX CALCULATION ENGINE ---
  const calculateHoldingDays = (buyDateStr: string, targetDateStr: string) => {
    const buy = new Date(buyDateStr || '2025-08-01');
    const target = new Date(targetDateStr || '2026-08-03');
    if (isNaN(buy.getTime()) || isNaN(target.getTime())) return { days: 0, months: '0.0', isLTCG: false, daysToLTCG: 365 };
    const diffTime = Math.max(0, target.getTime() - buy.getTime());
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const months = (days / 30.4375).toFixed(1);
    const isLTCG = days > 365; // Equity held > 12 Months (365 days)
    const daysToLTCG = isLTCG ? 0 : Math.max(0, 365 - days);
    return { days, months, isLTCG, daysToLTCG };
  };

  // Per-position Tax Calculation Array
  const taxPositionDetails = holdings.map(h => {
    const override = positionTaxOverrides[h.id] || {};
    const effectiveBuyDate = override.buyDate || h.buyDate || '2025-08-01';
    const isSelected = override.selectedForSale !== false;
    const effectiveSellPrice = override.customSellPrice ?? h.livePrice;

    const { days, months, isLTCG, daysToLTCG } = calculateHoldingDays(effectiveBuyDate, targetRealizationDate);

    const investedCapital = h.averageBuyPrice * h.quantity;
    const realizedVal = effectiveSellPrice * h.quantity;
    const gainLoss = realizedVal - investedCapital;
    const gainLossPercent = investedCapital > 0 ? (gainLoss / investedCapital) * 100 : 0;

    return {
      ...h,
      effectiveBuyDate,
      isSelected,
      effectiveSellPrice,
      daysHeld: days,
      monthsHeld: months,
      isLTCG,
      daysToLTCG,
      investedCapital,
      realizedVal,
      gainLoss,
      gainLossPercent,
    };
  });

  // Aggregated Tax Calculations
  const selectedTaxPositions = taxPositionDetails.filter(p => p.isSelected);

  const stcgPositions = selectedTaxPositions.filter(p => !p.isLTCG);
  const ltcgPositions = selectedTaxPositions.filter(p => p.isLTCG);

  const stcgGains = stcgPositions.filter(p => p.gainLoss > 0).reduce((sum, p) => sum + p.gainLoss, 0);
  const stcgLosses = stcgPositions.filter(p => p.gainLoss < 0).reduce((sum, p) => sum + Math.abs(p.gainLoss), 0);
  const netSTCG = Math.max(0, stcgGains - stcgLosses);

  const ltcgGains = ltcgPositions.filter(p => p.gainLoss > 0).reduce((sum, p) => sum + p.gainLoss, 0);
  const ltcgLosses = ltcgPositions.filter(p => p.gainLoss < 0).reduce((sum, p) => sum + Math.abs(p.gainLoss), 0);
  const netLTCG = Math.max(0, ltcgGains - ltcgLosses);

  const effectiveSTCGRate = taxRegimePreset === 'custom_slab' ? customSlabRate : stcgRate;
  const effectiveLTCGRate = taxRegimePreset === 'custom_slab' ? customSlabRate : ltcgRate;

  const stcgTaxBase = netSTCG * (effectiveSTCGRate / 100);
  const taxableLTCG = Math.max(0, netLTCG - ltcgExemptionLimit);
  const ltcgTaxBase = taxableLTCG * (effectiveLTCGRate / 100);

  const totalBaseTax = stcgTaxBase + ltcgTaxBase;
  const totalCessAmount = totalBaseTax * (cessRate / 100);
  const totalTaxLiability = totalBaseTax + totalCessAmount;

  // LTCG Exemption headroom
  const ltcgExemptionUsed = Math.min(netLTCG, ltcgExemptionLimit);
  const ltcgExemptionRemaining = Math.max(0, ltcgExemptionLimit - netLTCG);

  // --- WATCHLIST SMART RSI ANALYSIS COMPUTATION ENGINE ---
  const watchlistAnalysis = watchlist.map(item => {
    const stock = stocks.find(s => s.symbol === item.stockSymbol) || {
      price: 0,
      pChange: 0,
      high52: 0,
      pe: 0,
      rsi: 50,
      name: item.stockSymbol,
      sector: 'General',
    };

    const override = rsiAlertConfig.stockOverrides[item.stockSymbol] || {};
    const obLimit = override.overbought ?? rsiAlertConfig.overboughtThreshold;
    const osLimit = override.oversold ?? rsiAlertConfig.oversoldThreshold;
    const targetPrice = override.targetPrice;
    const stopLossPrice = override.stopLossPrice;
    const isMuted = override.disabled ?? false;

    const rsi = stock.rsi ?? 50;
    const isOverbought = rsiAlertConfig.enabled && !isMuted && rsi >= obLimit;
    const isOversold = rsiAlertConfig.enabled && !isMuted && rsi <= osLimit;
    const isTargetHit = rsiAlertConfig.enabled && !isMuted && targetPrice != null && targetPrice > 0 && stock.price >= targetPrice;
    const isStopLossHit = rsiAlertConfig.enabled && !isMuted && stopLossPrice != null && stopLossPrice > 0 && stock.price <= stopLossPrice;

    let alertStatus: 'OVERBOUGHT' | 'OVERSOLD' | 'TARGET_HIT' | 'STOP_LOSS_HIT' | 'NEUTRAL' = 'NEUTRAL';
    if (isTargetHit) alertStatus = 'TARGET_HIT';
    else if (isStopLossHit) alertStatus = 'STOP_LOSS_HIT';
    else if (isOverbought) alertStatus = 'OVERBOUGHT';
    else if (isOversold) alertStatus = 'OVERSOLD';

    return {
      item,
      stock,
      rsi,
      obLimit,
      osLimit,
      targetPrice,
      stopLossPrice,
      isMuted,
      isOverbought,
      isOversold,
      isTargetHit,
      isStopLossHit,
      alertStatus,
    };
  });

  const overboughtCount = watchlistAnalysis.filter(a => a.isOverbought).length;
  const oversoldCount = watchlistAnalysis.filter(a => a.isOversold).length;
  const targetHitCount = watchlistAnalysis.filter(a => a.isTargetHit).length;
  const stopLossHitCount = watchlistAnalysis.filter(a => a.isStopLossHit).length;
  const totalSmartAlerts = overboughtCount + oversoldCount + targetHitCount + stopLossHitCount;

  const filteredWatchlistAnalysis = watchlistAnalysis.filter(a => {
    if (watchlistFilter === 'OVERBOUGHT') return a.isOverbought;
    if (watchlistFilter === 'OVERSOLD') return a.isOversold;
    if (watchlistFilter === 'TARGET_HIT') return a.isTargetHit;
    if (watchlistFilter === 'STOP_LOSS_HIT') return a.isStopLossHit;
    if (watchlistFilter === 'NEUTRAL') return a.alertStatus === 'NEUTRAL';
    return true;
  });

  // Export Tax Statement CSV
  const handleExportTaxCSV = () => {
    if (taxPositionDetails.length === 0) return;

    const headers = [
      'Stock Symbol',
      'Stock Name',
      'Sector',
      'Buy Date',
      'Target Sale Date',
      'Holding Days',
      'Holding Months',
      'Holding Type',
      'Quantity',
      'Avg Buy Price (INR)',
      'Sell Price (INR)',
      'Invested (INR)',
      'Realized Value (INR)',
      'Capital Gain/Loss (INR)',
      'Include in Tax Calculation',
    ];

    const rows = taxPositionDetails.map(p => [
      `"${p.stockSymbol}"`,
      `"${p.stockName}"`,
      `"${p.sector}"`,
      `"${p.effectiveBuyDate}"`,
      `"${targetRealizationDate}"`,
      p.daysHeld,
      p.monthsHeld,
      p.isLTCG ? 'LTCG (>1 Year)' : 'STCG (<=1 Year)',
      p.quantity,
      p.averageBuyPrice.toFixed(2),
      p.effectiveSellPrice.toFixed(2),
      p.investedCapital.toFixed(2),
      p.realizedVal.toFixed(2),
      p.gainLoss.toFixed(2),
      p.isSelected ? 'YES' : 'NO',
    ]);

    const summaryLines = [
      '',
      'TAX SUMMARY STATEMENT',
      `Tax Regime Preset,${taxRegimePreset}`,
      `STCG Rate,${effectiveSTCGRate}%`,
      `LTCG Rate,${effectiveLTCGRate}%`,
      `LTCG Annual Exemption Threshold,INR ${ltcgExemptionLimit}`,
      `Health & Education Cess,${cessRate}%`,
      `Net Short-Term Capital Gains (STCG),INR ${netSTCG.toFixed(2)}`,
      `STCG Tax Payable,INR ${stcgTaxBase.toFixed(2)}`,
      `Net Long-Term Capital Gains (LTCG),INR ${netLTCG.toFixed(2)}`,
      `Taxable LTCG (After Exemption),INR ${taxableLTCG.toFixed(2)}`,
      `LTCG Tax Payable,INR ${ltcgTaxBase.toFixed(2)}`,
      `Total Cess Amount,INR ${totalCessAmount.toFixed(2)}`,
      `TOTAL ESTIMATED TAX LIABILITY,INR ${totalTaxLiability.toFixed(2)}`,
    ];

    const csvLines = [
      headers.join(','),
      ...rows.map(r => r.join(',')),
      ...summaryLines,
    ];

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MeraBazaar_Capital_Gains_Tax_Statement_${targetRealizationDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Cumulative Gain/Loss Over Time Chart Generator
  const generateHistoryData = () => {
    const configs = {
      '1M': ['W1', 'W2', 'W3', 'W4', 'Today'],
      '3M': ['3M Ago', '2.5M', '2M', '1.5M', '1M', '0.5M', 'Today'],
      '6M': ['Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Current'],
      '1Y': ['Q1 25', 'Q2 25', 'Q3 25', 'Q4 25', 'Q1 26', 'Current'],
      'ALL': ['Start', '25% Time', '50% Time', '75% Time', 'Current'],
    };

    const labels = configs[chartTimeframe];
    const count = labels.length;

    return labels.map((label, idx) => {
      if (idx === count - 1) {
        return {
          time: label,
          cumGainLoss: Math.round(totalPL),
          portfolioValue: Math.round(totalCurrent),
          invested: Math.round(totalInvested),
          gainPercent: Number(totalPLPercent.toFixed(2)),
        };
      }

      const ratio = (idx + 1) / count;
      // Smooth curve with slight market fluctuation
      const noise = Math.sin(idx * 1.5) * 0.08;
      const progressFactor = ratio * (1 + noise);
      
      const simulatedPL = totalPL * progressFactor;
      const simulatedValue = totalInvested + simulatedPL;
      const simulatedPercent = totalInvested > 0 ? (simulatedPL / totalInvested) * 100 : 0;

      return {
        time: label,
        cumGainLoss: Math.round(simulatedPL),
        portfolioValue: Math.round(Math.max(0, simulatedValue)),
        invested: Math.round(totalInvested),
        gainPercent: Number(simulatedPercent.toFixed(2)),
      };
    });
  };

  const cumulativeHistoryData = generateHistoryData();

  const sectorMap: Record<string, number> = {};
  holdings.forEach(h => {
    sectorMap[h.sector] = (sectorMap[h.sector] || 0) + h.currentValue;
  });
  const sectorChartData = Object.keys(sectorMap).map(sec => ({
    name: sec,
    value: sectorMap[sec],
  }));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStock = stocks.find(s => s.symbol === selectedSymbol);
    onAddStockToPortfolio({
      stockSymbol: selectedSymbol,
      stockName: targetStock?.name || selectedSymbol,
      quantity: Number(quantity),
      averageBuyPrice: Number(buyPrice),
      buyDate: new Date().toISOString().split('T')[0],
    });
    setShowAddModal(false);
  };

  // Dedicated function to download current portfolio data as a formatted CSV file
  const downloadPortfolioCSV = () => {
    if (holdings.length === 0) return;

    const dateStr = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toLocaleString('en-IN');

    const headers = [
      'Stock Symbol',
      'Stock Name',
      'Sector',
      'Purchase Date',
      'Quantity (Shares)',
      'Average Buy Price (INR)',
      'Live Market Price (INR)',
      'Invested Capital (INR)',
      'Current Valuation (INR)',
      'Unrealized P&L (INR)',
      'Return (%)',
      'Holding Days',
      'Tax Classification',
    ];

    const rows = holdings.map(h => {
      const { days, isLTCG } = calculateHoldingDays(h.buyDate || '2025-08-01', dateStr);
      return [
        `"${(h.stockSymbol || '').replace(/"/g, '""')}"`,
        `"${(h.stockName || '').replace(/"/g, '""')}"`,
        `"${(h.sector || 'General').replace(/"/g, '""')}"`,
        `"${h.buyDate || dateStr}"`,
        h.quantity,
        h.averageBuyPrice.toFixed(2),
        h.livePrice.toFixed(2),
        h.investedValue.toFixed(2),
        h.currentValue.toFixed(2),
        h.profitLoss.toFixed(2),
        `${h.profitLossPercent.toFixed(2)}%`,
        days,
        isLTCG ? 'LTCG (>1 Year)' : 'STCG (<=1 Year)',
      ];
    });

    const summaryRows = [
      '',
      '=== PORTFOLIO PERFORMANCE SUMMARY ===',
      `Total Positions Count,${holdings.length}`,
      `Total Shares Held,${holdings.reduce((sum, h) => sum + h.quantity, 0)}`,
      `Total Invested Capital (INR),${totalInvested.toFixed(2)}`,
      `Current Portfolio Value (INR),${totalCurrent.toFixed(2)}`,
      `Net Unrealized Profit / Loss (INR),${totalPL.toFixed(2)}`,
      `Overall Return Percentage,${totalPLPercent.toFixed(2)}%`,
      `Estimated Capital Gains Tax Liability (INR),${totalTaxLiability.toFixed(2)}`,
      `Export Timestamp,"${timestamp}"`,
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(',')),
      ...summaryRows,
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MeraBazaar_Portfolio_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = (exportType?: 'all' | 'portfolio' | 'watchlist' | React.MouseEvent) => {
    let targetType: 'all' | 'portfolio' | 'watchlist' = 'all';
    if (exportType === 'watchlist' || exportType === 'portfolio' || exportType === 'all') {
      targetType = exportType;
    } else if (activeTab === 'portfolio') {
      targetType = 'portfolio';
    } else if (activeTab === 'watchlist') {
      targetType = 'watchlist';
    }

    if (targetType === 'portfolio') {
      downloadPortfolioCSV();
      return;
    }

    const csvSections: string[] = [];
    const dateStr = new Date().toISOString().split('T')[0];

    // 1. PORTFOLIO HOLDINGS SECTION (When exporting all)
    if (targetType === 'all' && holdings.length > 0) {
      csvSections.push('=== MERABAZAAR PORTFOLIO HOLDINGS ===');
      const headers = [
        'Symbol',
        'Stock Name',
        'Sector',
        'Buy Date',
        'Quantity',
        'Avg Buy Price (INR)',
        'Live Market Price (INR)',
        'Invested Value (INR)',
        'Current Value (INR)',
        'Profit / Loss (INR)',
        'Profit / Loss (%)',
      ];

      const rows = holdings.map(h => [
        `"${(h.stockSymbol || '').replace(/"/g, '""')}"`,
        `"${(h.stockName || '').replace(/"/g, '""')}"`,
        `"${(h.sector || 'General').replace(/"/g, '""')}"`,
        `"${h.buyDate || ''}"`,
        h.quantity,
        h.averageBuyPrice.toFixed(2),
        h.livePrice.toFixed(2),
        h.investedValue.toFixed(2),
        h.currentValue.toFixed(2),
        h.profitLoss.toFixed(2),
        `${h.profitLossPercent.toFixed(2)}%`,
      ]);

      const summaryRow = [
        '"TOTAL / SUMMARY"',
        `"All Holdings (${holdings.length})"`,
        '""',
        '""',
        holdings.reduce((sum, h) => sum + h.quantity, 0),
        '""',
        '""',
        totalInvested.toFixed(2),
        totalCurrent.toFixed(2),
        totalPL.toFixed(2),
        `${totalPLPercent.toFixed(2)}%`,
      ];

      csvSections.push(headers.join(','));
      csvSections.push(...rows.map(r => r.join(',')));
      csvSections.push(summaryRow.join(','));
      csvSections.push('');
    }

    // 2. WATCHLIST ITEMS SECTION
    if ((targetType === 'all' || targetType === 'watchlist') && watchlist.length > 0) {
      csvSections.push('=== MERABAZAAR TRACKED WATCHLIST STOCKS ===');
      const wlHeaders = [
        'Symbol',
        'Stock Name',
        'Sector',
        'Live Price (INR)',
        'Day % Change',
        '52W High (INR)',
        'P/E Ratio',
        '14D RSI',
        'Target Price (INR)',
        'Stop Loss Price (INR)',
        'Smart Alert Status',
      ];

      const wlRows = watchlistAnalysis.map(w => {
        const stock = stocks.find(s => s.symbol === w.item.stockSymbol);
        const targetStr = w.targetPrice ? w.targetPrice.toFixed(2) : 'Not Set';
        const stopLossStr = w.stopLossPrice ? w.stopLossPrice.toFixed(2) : 'Not Set';
        const statusStr = w.isTargetHit
          ? 'TARGET HIT'
          : w.isStopLossHit
          ? 'STOP LOSS TRIGGERED'
          : w.isOverbought
          ? 'OVERBOUGHT'
          : w.isOversold
          ? 'OVERSOLD'
          : 'NORMAL';

        return [
          `"${(w.item.stockSymbol || '').replace(/"/g, '""')}"`,
          `"${(stock?.name || w.item.stockSymbol).replace(/"/g, '""')}"`,
          `"${(stock?.sector || 'General').replace(/"/g, '""')}"`,
          (stock?.price ?? 0).toFixed(2),
          `${(stock?.pChange ?? 0).toFixed(2)}%`,
          (stock?.high52 ?? 0).toFixed(2),
          stock?.pe ?? 'N/A',
          w.rsi,
          `"${targetStr}"`,
          `"${stopLossStr}"`,
          `"${statusStr}"`,
        ];
      });

      csvSections.push(wlHeaders.join(','));
      csvSections.push(...wlRows.map(r => r.join(',')));
      csvSections.push('');
    }

    if (csvSections.length === 0) return;

    const blob = new Blob(['\uFEFF' + csvSections.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = targetType === 'watchlist'
      ? `MeraBazaar_Watchlist_${dateStr}.csv`
      : `MeraBazaar_Portfolio_Watchlist_${dateStr}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="tour-view-portfolio" className="space-y-6">
      {/* Tab Switcher & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-orange-100 p-4 rounded-3xl shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center bg-orange-50 p-1.5 rounded-2xl border border-orange-200 text-xs font-bold gap-1 flex-wrap">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'portfolio' ? 'bg-orange-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            My Portfolio ({portfolio.length})
          </button>

          <button
            onClick={() => setActiveTab('tax-estimator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'tax-estimator' ? 'bg-orange-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-300" />
            <span>Tax Estimator</span>
            {netSTCG > 0 || netLTCG > 0 ? (
              <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-md">
                STCG/LTCG
              </span>
            ) : null}
          </button>

          <button
            onClick={() => setActiveTab('watchlist')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'watchlist' ? 'bg-orange-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-4 h-4" />
            Watchlist ({watchlist.length})
          </button>
        </div>

        {activeTab === 'portfolio' && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('tax-estimator')}
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-extrabold px-3.5 py-2.5 rounded-2xl transition-all shadow-2xs active:scale-95"
              title="Estimate Capital Gains Tax (STCG & LTCG)"
            >
              <Receipt className="w-4 h-4 text-amber-700" />
              <span>Tax Calculator</span>
            </button>

            <button
              onClick={() => handleExportCSV('all')}
              disabled={holdings.length === 0 && watchlist.length === 0}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200 text-xs font-extrabold px-3.5 py-2.5 rounded-2xl transition-all shadow-2xs disabled:opacity-50 disabled:pointer-events-none active:scale-95"
              title="Download portfolio positions and watchlist stocks as CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl transition-all shadow-sm shadow-orange-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stock Transaction</span>
            </button>
          </div>
        )}

        {activeTab === 'watchlist' && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setCompareStockA(watchlist[0]?.stockSymbol);
                setCompareStockB(watchlist[1]?.stockSymbol);
                setIsComparisonModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-orange-50 hover:bg-orange-600 text-orange-800 hover:text-white border border-orange-200 text-xs font-extrabold px-3.5 py-2.5 rounded-2xl transition-all shadow-2xs active:scale-95"
              title="Compare watchlist stocks side-by-side"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Compare Stocks</span>
            </button>

            <button
              onClick={() => handleExportCSV('watchlist')}
              disabled={watchlist.length === 0}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200 text-xs font-extrabold px-3.5 py-2.5 rounded-2xl transition-all shadow-2xs disabled:opacity-50 disabled:pointer-events-none active:scale-95"
              title="Export tracked watchlist stocks & alert signals as CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Watchlist CSV</span>
            </button>

            <button
              onClick={() => setIsSmartRsiModalOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl transition-all shadow-sm shadow-orange-500/20 active:scale-95"
            >
              <Bell className="w-4 h-4 text-amber-200" />
              <span>Smart Alert Rules</span>
              {totalSmartAlerts > 0 && (
                <span className="bg-white text-orange-800 text-[10px] font-black px-2 py-0.5 rounded-md animate-pulse">
                  {totalSmartAlerts}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {activeTab === 'portfolio' ? (
        <div className="space-y-6">
          {/* Summary Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-orange-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
              <span className="text-xs font-extrabold text-slate-500 uppercase">Current Portfolio Value</span>
              <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                ₹{totalCurrent.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Real-time market valuation</span>
            </div>

            <div className="bg-white border border-orange-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
              <span className="text-xs font-extrabold text-slate-500 uppercase">Total Investment</span>
              <div className="text-2xl font-black text-slate-800 tracking-tight mt-1">
                ₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Principal capital invested</span>
            </div>

            <div className="bg-white border border-orange-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
              <span className="text-xs font-extrabold text-slate-500 uppercase">Overall P&L</span>
              <div className={`text-2xl font-black tracking-tight mt-1 ${totalPL >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {totalPL >= 0 ? '+' : ''}₹{totalPL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
              <span className={`text-xs font-black ${totalPL >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {totalPL >= 0 ? '▲ +' : '▼ '}{totalPLPercent.toFixed(2)}%
              </span>
            </div>

            <div className="bg-white border border-orange-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold text-slate-500 uppercase">Estimated Tax Liability</span>
                <div className="text-xl font-black text-amber-900 tracking-tight mt-1">
                  ₹{totalTaxLiability.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </div>
              <button
                onClick={() => setActiveTab('tax-estimator')}
                className="text-[10px] text-amber-900 font-extrabold bg-amber-100/80 hover:bg-amber-200 px-3 py-1 rounded-full border border-amber-300 w-fit flex items-center gap-1 transition-all"
              >
                <Calculator className="w-3 h-3 text-amber-700" />
                <span>Calculate STCG / LTCG</span>
              </button>
            </div>
          </div>

          {/* VISUAL CUMULATIVE GAIN/LOSS OVER TIME PROGRESS CHART */}
          <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-orange-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-slate-900 text-base">
                    Portfolio Cumulative Gain/Loss Progress
                  </h3>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Track historical total return trajectory and net profits over time for your holdings.
                </p>
              </div>

              {/* Metric & Timeframe Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Metric Selector */}
                <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600">
                  <button
                    onClick={() => setChartMetric('gain')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      chartMetric === 'gain' ? 'bg-orange-600 text-white font-black shadow-xs' : 'hover:text-slate-900'
                    }`}
                  >
                    Gain / Loss (₹)
                  </button>
                  <button
                    onClick={() => setChartMetric('value')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      chartMetric === 'value' ? 'bg-orange-600 text-white font-black shadow-xs' : 'hover:text-slate-900'
                    }`}
                  >
                    Total Value (₹)
                  </button>
                </div>

                {/* Timeframe Selector */}
                <div className="flex items-center bg-orange-50/80 p-1 rounded-2xl border border-orange-200 text-xs font-bold text-slate-600">
                  {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setChartTimeframe(tf)}
                      className={`px-2.5 py-1 rounded-xl transition-all ${
                        chartTimeframe === tf ? 'bg-slate-900 text-white font-black shadow-xs' : 'hover:text-slate-900'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Chart Highlight Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 text-xs font-semibold">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-extrabold">Net Profit/Loss</span>
                <div className={`font-black text-sm mt-0.5 ${totalPL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {totalPL >= 0 ? '+' : ''}₹{totalPL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-extrabold">Return Rate</span>
                <div className={`font-black text-sm mt-0.5 ${totalPLPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {totalPLPercent >= 0 ? '▲ +' : '▼ '}{totalPLPercent.toFixed(2)}%
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-extrabold">Invested Capital</span>
                <div className="font-black text-slate-800 text-sm mt-0.5">
                  ₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-extrabold">Timeframe Trend</span>
                <div className="font-black text-orange-600 text-sm mt-0.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{chartTimeframe} Cumulative</span>
                </div>
              </div>
            </div>

            {/* Chart Container */}
            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeHistoryData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  
                  <XAxis 
                    dataKey="time" 
                    stroke="#94a3b8" 
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                  />

                  <YAxis 
                    stroke="#94a3b8" 
                    tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }}
                    tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                  />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const isPos = data.cumGainLoss >= 0;
                        return (
                          <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1">
                            <div className="font-extrabold text-orange-400 uppercase text-[10px] tracking-wider">
                              Time: {data.time}
                            </div>
                            <div className="font-black text-sm text-white">
                              Portfolio Value: ₹{data.portfolioValue.toLocaleString('en-IN')}
                            </div>
                            <div className={`font-bold flex items-center gap-1 ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                              <span>Net Gain/Loss:</span>
                              <span>{isPos ? '+' : ''}₹{data.cumGainLoss.toLocaleString('en-IN')} ({isPos ? '+' : ''}{data.gainPercent}%)</span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Invested Capital: ₹{data.invested.toLocaleString('en-IN')}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey={chartMetric === 'gain' ? 'cumGainLoss' : 'portfolioValue'}
                    stroke={
                      chartMetric === 'value'
                        ? '#ea580c'
                        : totalPL >= 0
                        ? '#059669'
                        : '#e11d48'
                    }
                    fillOpacity={1}
                    fill={
                      chartMetric === 'value'
                        ? 'url(#valueGrad)'
                        : totalPL >= 0
                        ? 'url(#profitGrad)'
                        : 'url(#lossGrad)'
                    }
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sector Allocation Donut + Holdings Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Holdings Table */}
            <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-orange-100 pb-3">
                <div>
                  <h3 className="font-black text-slate-900 text-base">Your Equity Holdings</h3>
                  <span className="text-xs font-bold text-slate-500">{holdings.length} Active Positions</span>
                </div>

                <button
                  onClick={handleExportCSV}
                  disabled={holdings.length === 0}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                  title="Export equity holdings as CSV file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold">
                  <thead>
                    <tr className="bg-orange-50/50 text-slate-700 border-b border-orange-100 uppercase text-[10px] font-black">
                      <th className="py-2.5 px-3">Stock</th>
                      <th className="py-2.5 px-3 text-right">Qty</th>
                      <th className="py-2.5 px-3 text-right">Avg Price</th>
                      <th className="py-2.5 px-3 text-right">Live Price</th>
                      <th className="py-2.5 px-3 text-right">Current Value</th>
                      <th className="py-2.5 px-3 text-right">P&L (₹)</th>
                      <th className="py-2.5 px-3 text-center">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {holdings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                          Your portfolio is empty. Click 'Add Stock Transaction' to start tracking!
                        </td>
                      </tr>
                    ) : (
                      holdings.map(h => {
                        const isGain = h.profitLoss >= 0;
                        return (
                          <tr key={h.id} className="hover:bg-orange-50/40 transition-colors">
                            <td className="py-3.5 px-3 font-extrabold">
                              <div 
                                onClick={() => onSelectStock(h.stockSymbol)} 
                                className="text-slate-900 hover:text-orange-600 cursor-pointer"
                              >
                                {h.stockSymbol}
                              </div>
                              <div className="text-[10px] text-slate-500 font-medium">{h.sector}</div>
                            </td>

                            <td className="py-3.5 px-3 text-right font-bold text-slate-800">{h.quantity}</td>
                            <td className="py-3.5 px-3 text-right text-slate-700">₹{h.averageBuyPrice.toFixed(2)}</td>
                            <td className="py-3.5 px-3 text-right font-black text-slate-900">₹{h.livePrice.toFixed(2)}</td>
                            <td className="py-3.5 px-3 text-right font-extrabold text-slate-900">₹{h.currentValue.toLocaleString('en-IN')}</td>

                            <td className={`py-3.5 px-3 text-right font-black ${isGain ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {isGain ? '+' : ''}₹{h.profitLoss.toFixed(2)} ({isGain ? '+' : ''}{h.profitLossPercent.toFixed(2)}%)
                            </td>

                            <td className="py-3.5 px-3 text-center">
                              <button
                                onClick={() => onRemoveFromPortfolio(h.id)}
                                className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
                                title="Remove position"
                              >
                                <Trash2 className="w-4 h-4" />
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

            {/* Sector Allocation Donut Chart */}
            <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-base mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                    <PieIcon className="w-4 h-4" />
                  </div>
                  Sector Weightage
                </h3>
                <p className="text-xs text-slate-500 font-medium mb-4">Allocation breakdown by current market value.</p>

                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sectorChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={4}
                      >
                        {sectorChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#fed7aa', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        itemStyle={{ color: '#ea580c', fontSize: '12px', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 mt-2">
                  {sectorChartData.map((sec, i) => (
                    <div key={sec.name} className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                        <span className="text-slate-700 truncate max-w-[140px]">{sec.name}</span>
                      </div>
                      <span className="text-slate-900 font-black">
                        {Math.round((sec.value / (totalCurrent || 1)) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'tax-estimator' ? (
        /* TAX ESTIMATOR SUITE VIEW */
        <div className="space-y-6">
          {/* Header & Preset Controller Card */}
          <div className="bg-white border border-amber-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-amber-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 text-lg">Portfolio Tax Estimation Suite</h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Estimate STCG (Held ≤12 Months) and LTCG (Held &gt;12 Months) Capital Gains Tax based on current holding durations and customizable tax slabs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleExportTaxCSV}
                  disabled={taxPositionDetails.length === 0}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
                  title="Download Capital Gains Tax Calculation Statement as CSV"
                >
                  <FileText className="w-4 h-4" />
                  <span>Export Tax Statement</span>
                </button>
              </div>
            </div>

            {/* Quick Tax Rule Preset Switcher */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-orange-600" />
                  <span>Select Tax Regime & Rate Preset</span>
                </label>
                <span className="text-[11px] font-bold text-slate-500">
                  Target Sale Date: <strong className="text-slate-900 font-black">{targetRealizationDate}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => applyTaxPreset('budget_2024')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    taxRegimePreset === 'budget_2024'
                      ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">Union Budget 2024 (Standard)</span>
                    <span className="bg-amber-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md">CURRENT</span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-bold mt-1">
                    STCG: <strong className="text-orange-600">20.0%</strong> | LTCG: <strong className="text-emerald-700">12.5%</strong>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Annual LTCG Exemption: ₹1,25,000 | Cess: 4%
                  </div>
                </button>

                <button
                  onClick={() => applyTaxPreset('budget_2023')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    taxRegimePreset === 'budget_2023'
                      ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">Union Budget 2023 (Legacy)</span>
                    <span className="bg-slate-200 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded-md">PREVIOUS</span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-bold mt-1">
                    STCG: <strong className="text-orange-600">15.0%</strong> | LTCG: <strong className="text-emerald-700">10.0%</strong>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Annual LTCG Exemption: ₹1,00,000 | Cess: 4%
                  </div>
                </button>

                <button
                  onClick={() => applyTaxPreset('custom_slab')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    taxRegimePreset === 'custom_slab'
                      ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">Custom Income Tax Slab</span>
                    <span className="bg-orange-100 text-orange-900 text-[9px] font-bold px-2 py-0.5 rounded-md">USER SLAB</span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-bold mt-1">
                    Slab Rate: <strong className="text-purple-700">{customSlabRate}%</strong>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Taxed at income slab rate (No LTCG exemption)
                  </div>
                </button>
              </div>
            </div>

            {/* Granular Parameter Adjusters */}
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-slate-600" />
                <span>Adjust Parameters & Tax Slabs</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-semibold">
                <div>
                  <label className="block text-slate-600 text-[11px] font-bold mb-1">Target Sale Date</label>
                  <input
                    type="date"
                    value={targetRealizationDate}
                    onChange={(e) => setTargetRealizationDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 font-bold rounded-xl p-2 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] font-bold mb-1">STCG Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={stcgRate}
                    disabled={taxRegimePreset === 'custom_slab'}
                    onChange={(e) => setStcgRate(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 text-slate-900 font-bold rounded-xl p-2 outline-none focus:border-amber-500 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] font-bold mb-1">LTCG Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={ltcgRate}
                    disabled={taxRegimePreset === 'custom_slab'}
                    onChange={(e) => setLtcgRate(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 text-slate-900 font-bold rounded-xl p-2 outline-none focus:border-amber-500 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] font-bold mb-1">LTCG Exemption Limit (₹)</label>
                  <input
                    type="number"
                    step="5000"
                    value={ltcgExemptionLimit}
                    disabled={taxRegimePreset === 'custom_slab'}
                    onChange={(e) => setLtcgExemptionLimit(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 text-slate-900 font-bold rounded-xl p-2 outline-none focus:border-amber-500 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] font-bold mb-1">Health & Edu Cess (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={cessRate}
                    onChange={(e) => setCessRate(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 text-slate-900 font-bold rounded-xl p-2 outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SUMMARY KPI CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Estimated Tax Liability */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-3xl p-5 shadow-md shadow-amber-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-100">Total Estimated Tax</span>
                <Receipt className="w-5 h-5 text-amber-200" />
              </div>

              <div className="text-3xl font-black tracking-tight">
                ₹{totalTaxLiability.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>

              <div className="pt-2 border-t border-amber-400/40 text-[11px] font-semibold space-y-0.5 text-amber-100">
                <div className="flex justify-between">
                  <span>Base Tax (STCG + LTCG):</span>
                  <span className="font-bold text-white">₹{totalBaseTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cess ({cessRate}%):</span>
                  <span className="font-bold text-white">₹{totalCessAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Short-Term Capital Gains (STCG) */}
            <div className="bg-white border border-orange-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500 uppercase">Short-Term Tax (STCG)</span>
                <span className="bg-orange-100 text-orange-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                  ≤ 12 Months
                </span>
              </div>

              <div className="text-2xl font-black text-orange-600 tracking-tight">
                ₹{stcgTaxBase.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Tax Rate:</span>
                  <span className="font-bold text-slate-900">{effectiveSTCGRate}%</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Net STCG Gains:</span>
                  <span className={`font-extrabold ${netSTCG >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    ₹{netSTCG.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {stcgPositions.length} STCG holdings selected
                </div>
              </div>
            </div>

            {/* Card 3: Long-Term Capital Gains (LTCG) */}
            <div className="bg-white border border-emerald-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500 uppercase">Long-Term Tax (LTCG)</span>
                <span className="bg-emerald-100 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                  &gt; 12 Months
                </span>
              </div>

              <div className="text-2xl font-black text-emerald-700 tracking-tight">
                ₹{ltcgTaxBase.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Tax Rate:</span>
                  <span className="font-bold text-slate-900">{effectiveLTCGRate}%</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Net LTCG Gains:</span>
                  <span className="font-extrabold text-slate-900">₹{netLTCG.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxable LTCG:</span>
                  <span className="font-extrabold text-emerald-700">₹{taxableLTCG.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>

            {/* Card 4: LTCG Exemption Utilization Tracker */}
            <div className="bg-white border border-amber-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-slate-500 uppercase">LTCG Exemption Tracker</span>
                  <Coins className="w-4 h-4 text-amber-600" />
                </div>

                <div className="text-lg font-black text-slate-900">
                  ₹{ltcgExemptionUsed.toLocaleString('en-IN')} / ₹{ltcgExemptionLimit.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Annual Tax-Free Gains Limit</span>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 mt-2.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2.5 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (ltcgExemptionUsed / (ltcgExemptionLimit || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                {ltcgExemptionRemaining > 0 ? (
                  <span>₹{ltcgExemptionRemaining.toLocaleString('en-IN')} remaining tax-free capacity this FY!</span>
                ) : (
                  <span>Full ₹{ltcgExemptionLimit.toLocaleString('en-IN')} exemption limit utilized.</span>
                )}
              </div>
            </div>
          </div>

          {/* POSITION-BY-POSITION BREAKDOWN TABLE */}
          <div className="bg-white border border-amber-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">Position-Level Holding Duration & Tax Calculation</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Toggle positions, adjust purchase dates, or test target sell prices to simulate tax liabilities.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPositionTaxOverrides({})}
                  className="text-xs font-extrabold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all"
                >
                  Reset Overrides
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase text-[10px] font-black">
                    <th className="py-3 px-3 text-center">Simulate</th>
                    <th className="py-3 px-3">Stock & Sector</th>
                    <th className="py-3 px-3">Buy Date & Duration</th>
                    <th className="py-3 px-3 text-center">Classification</th>
                    <th className="py-3 px-3 text-right">Qty & Avg Price</th>
                    <th className="py-3 px-3 text-right">Target Sell Price</th>
                    <th className="py-3 px-3 text-right">Capital Gain / Loss</th>
                    <th className="py-3 px-3 text-right">Est. Tax</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {taxPositionDetails.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 font-medium">
                        No portfolio holdings found. Add stocks to your portfolio to compute capital gains tax!
                      </td>
                    </tr>
                  ) : (
                    taxPositionDetails.map(p => {
                      const isGain = p.gainLoss >= 0;
                      const posTaxBase = p.isSelected
                        ? p.isLTCG
                          ? (p.gainLoss > 0 ? (p.gainLoss * (effectiveLTCGRate / 100)) : 0)
                          : (p.gainLoss > 0 ? (p.gainLoss * (effectiveSTCGRate / 100)) : 0)
                        : 0;

                      return (
                        <tr
                          key={p.id}
                          className={`transition-colors ${
                            !p.isSelected ? 'opacity-40 bg-slate-50/60' : 'hover:bg-amber-50/40'
                          }`}
                        >
                          <td className="py-3.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={p.isSelected}
                              onChange={(e) => {
                                setPositionTaxOverrides(prev => ({
                                  ...prev,
                                  [p.id]: {
                                    ...prev[p.id],
                                    selectedForSale: e.target.checked
                                  }
                                }));
                              }}
                              className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
                            />
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="font-extrabold text-slate-900">{p.stockSymbol}</div>
                            <div className="text-[10px] text-slate-500 font-medium">{p.stockName}</div>
                          </td>

                          <td className="py-3.5 px-3 space-y-1">
                            <input
                              type="date"
                              value={p.effectiveBuyDate}
                              onChange={(e) => {
                                setPositionTaxOverrides(prev => ({
                                  ...prev,
                                  [p.id]: {
                                    ...prev[p.id],
                                    buyDate: e.target.value
                                  }
                                }));
                              }}
                              className="bg-white border border-slate-200 text-slate-800 text-[11px] font-bold rounded-lg p-1 outline-none focus:border-amber-500"
                            />
                            <div className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{p.daysHeld} Days ({p.monthsHeld} Mo)</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-center">
                            {p.isLTCG ? (
                              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black px-2.5 py-1 rounded-full inline-block">
                                LTCG (&gt;1 Yr)
                              </span>
                            ) : (
                              <div className="space-y-0.5">
                                <span className="bg-amber-100 text-amber-950 border border-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full inline-block">
                                  STCG (≤1 Yr)
                                </span>
                                {p.daysToLTCG <= 90 && (
                                  <span className="block text-[9px] text-amber-900 font-extrabold">
                                    {p.daysToLTCG} days to LTCG
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-3 text-right">
                            <div className="font-bold text-slate-900">{p.quantity} shares</div>
                            <div className="text-[10px] text-slate-500">@ ₹{p.averageBuyPrice.toFixed(2)}</div>
                          </td>

                          <td className="py-3.5 px-3 text-right">
                            <input
                              type="number"
                              step="1"
                              value={p.effectiveSellPrice}
                              onChange={(e) => {
                                setPositionTaxOverrides(prev => ({
                                  ...prev,
                                  [p.id]: {
                                    ...prev[p.id],
                                    customSellPrice: Number(e.target.value)
                                  }
                                }));
                              }}
                              className="w-24 text-right bg-white border border-slate-200 text-slate-900 font-black text-xs rounded-lg p-1 outline-none focus:border-amber-500"
                            />
                          </td>

                          <td className="py-3.5 px-3 text-right">
                            <div className={`font-black ${isGain ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {isGain ? '+' : ''}₹{p.gainLoss.toFixed(2)}
                            </div>
                            <div className={`text-[10px] font-bold ${isGain ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {isGain ? '+' : ''}{p.gainLossPercent.toFixed(1)}%
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-right font-black text-slate-900">
                            ₹{(posTaxBase * (1 + cessRate / 100)).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* TAX OPTIMIZATION & HARVESTING INTELLIGENCE PANEL */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tip 1: LTCG Exemption Opportunity */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-5 space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800">
                  <Coins className="w-4 h-4" />
                </div>
                <h4 className="font-black text-slate-900 text-xs uppercase">LTCG Tax-Free Opportunity</h4>
              </div>
              <p className="text-xs text-slate-700">
                You have <strong className="text-emerald-800 font-black">₹{ltcgExemptionRemaining.toLocaleString('en-IN')}</strong> unused LTCG exemption limit for this fiscal year. Realizing long-term gains up to this limit will incur <strong>0% tax liability</strong>!
              </p>
            </div>

            {/* Tip 2: Tax Loss Harvesting Opportunity */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-5 space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-800">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h4 className="font-black text-slate-900 text-xs uppercase">Tax-Loss Harvesting</h4>
              </div>
              <p className="text-xs text-slate-700">
                {taxPositionDetails.some(p => p.gainLoss < 0) ? (
                  <>
                    You have positions in unrealized loss. Booking these losses allows setting off against taxable capital gains, reducing your overall tax bill!
                  </>
                ) : (
                  <>
                    No unrealized losses found in selected positions. All active holdings are in positive profit territory!
                  </>
                )}
              </p>
            </div>

            {/* Tip 3: STCG to LTCG Transition Alert */}
            <div className="bg-blue-50/80 border border-blue-200 rounded-3xl p-5 space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-xl text-blue-800">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="font-black text-slate-900 text-xs uppercase">Horizon Optimization</h4>
              </div>
              <p className="text-xs text-slate-700">
                Holdings kept beyond <strong>365 days (1 Year)</strong> qualify for the lower <strong>{effectiveLTCGRate}% LTCG tax rate</strong> + ₹{ltcgExemptionLimit.toLocaleString('en-IN')} exemption threshold instead of the higher {effectiveSTCGRate}% STCG rate.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Watchlist Tab View */
        <div className="space-y-6">
          {/* SMART RSI ALERT SUMMARY BANNER */}
          {rsiAlertConfig.enabled && rsiAlertConfig.bannerEnabled && (
            <div className="bg-gradient-to-r from-orange-950 via-slate-900 to-amber-950 text-white rounded-3xl p-6 shadow-md border border-orange-900/40 relative overflow-hidden space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-600/30 border border-orange-500/40 rounded-2xl text-orange-400">
                    <Activity className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-base text-white">Smart RSI Momentum Alerts</h4>
                      <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                        AUTOMATED REAL-TIME
                      </span>
                    </div>
                    <p className="text-xs text-orange-200/80 mt-0.5">
                      System auto-detects extreme Relative Strength Index momentum setups across tracked stocks
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setIsSmartRsiModalOpen(true)}
                    className="flex items-center gap-1.5 bg-orange-600/40 hover:bg-orange-600 text-orange-100 border border-orange-400/30 text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Alert Limits ({rsiAlertConfig.overboughtThreshold}/{rsiAlertConfig.oversoldThreshold})</span>
                  </button>
                </div>
              </div>

              {/* Quick Status Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {/* Target Price Hit Box */}
                <div className="bg-teal-950/40 border border-teal-800/40 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-black text-teal-300">Target Price Hit</div>
                      <div className="text-sm font-black text-white">{targetHitCount} Stocks (Price ≥ Target)</div>
                    </div>
                  </div>
                  {targetHitCount > 0 ? (
                    <span className="bg-teal-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md animate-pulse shrink-0">
                      🎯 Target Met
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">None</span>
                  )}
                </div>

                {/* Stop Loss Triggered Box */}
                <div className="bg-rose-950/50 border border-rose-800/50 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
                      <AlertOctagon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-black text-rose-300">Stop Loss Triggered</div>
                      <div className="text-sm font-black text-white">{stopLossHitCount} Stocks (Price ≤ SL)</div>
                    </div>
                  </div>
                  {stopLossHitCount > 0 ? (
                    <span className="bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md animate-pulse shrink-0">
                      🛑 Exit Signal
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">None</span>
                  )}
                </div>

                {/* Overbought Triggered Box */}
                <div className="bg-rose-950/30 border border-rose-900/40 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-black text-rose-300">Overbought Zone</div>
                      <div className="text-sm font-black text-white">{overboughtCount} Stocks (RSI ≥ {rsiAlertConfig.overboughtThreshold})</div>
                    </div>
                  </div>
                  {overboughtCount > 0 ? (
                    <span className="bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md animate-pulse shrink-0">
                      Overbought
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">None</span>
                  )}
                </div>

                {/* Oversold Triggered Box */}
                <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                      <TrendingDown className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-black text-emerald-300">Oversold Value Dip</div>
                      <div className="text-sm font-black text-white">{oversoldCount} Stocks (RSI ≤ {rsiAlertConfig.oversoldThreshold})</div>
                    </div>
                  </div>
                  {oversoldCount > 0 ? (
                    <span className="bg-emerald-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md animate-pulse shrink-0">
                      Buy Dip
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">None</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* WATCHLIST CONTAINER WITH FILTERS */}
          <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-orange-100 pb-4">
              <div>
                <h3 className="font-black text-slate-900 text-base">Your Saved Watchlist</h3>
                <p className="text-xs text-slate-500 font-medium">Click any stock to inspect technical charts & detailed financials</p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center bg-slate-100 p-1 rounded-2xl gap-1 text-xs font-bold flex-wrap">
                <button
                  onClick={() => setWatchlistFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    watchlistFilter === 'ALL'
                      ? 'bg-white text-slate-900 font-black shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({watchlist.length})
                </button>

                <button
                  onClick={() => setWatchlistFilter('TARGET_HIT')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                    watchlistFilter === 'TARGET_HIT'
                      ? 'bg-teal-600 text-white font-black shadow-2xs'
                      : 'text-teal-700 hover:text-teal-900'
                  }`}
                >
                  <span>🎯 Target Hit</span>
                  <span className="bg-teal-100 text-teal-800 text-[10px] px-1.5 rounded-md font-black">
                    {targetHitCount}
                  </span>
                </button>

                <button
                  onClick={() => setWatchlistFilter('STOP_LOSS_HIT')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                    watchlistFilter === 'STOP_LOSS_HIT'
                      ? 'bg-red-600 text-white font-black shadow-2xs'
                      : 'text-red-700 hover:text-red-900'
                  }`}
                >
                  <span>🛑 Stop Loss</span>
                  <span className="bg-red-100 text-red-800 text-[10px] px-1.5 rounded-md font-black">
                    {stopLossHitCount}
                  </span>
                </button>

                <button
                  onClick={() => setWatchlistFilter('OVERBOUGHT')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                    watchlistFilter === 'OVERBOUGHT'
                      ? 'bg-rose-600 text-white font-black shadow-2xs'
                      : 'text-rose-700 hover:text-rose-900'
                  }`}
                >
                  <span>🔴 Overbought</span>
                  <span className="bg-rose-100 text-rose-800 text-[10px] px-1.5 rounded-md font-black">
                    {overboughtCount}
                  </span>
                </button>

                <button
                  onClick={() => setWatchlistFilter('OVERSOLD')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                    watchlistFilter === 'OVERSOLD'
                      ? 'bg-emerald-600 text-white font-black shadow-2xs'
                      : 'text-emerald-700 hover:text-emerald-900'
                  }`}
                >
                  <span>🟢 Oversold</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 rounded-md font-black">
                    {oversoldCount}
                  </span>
                </button>

                <button
                  onClick={() => setWatchlistFilter('NEUTRAL')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    watchlistFilter === 'NEUTRAL'
                      ? 'bg-white text-slate-900 font-black shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Normal
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="bg-orange-50/50 text-slate-700 border-b border-orange-100 uppercase text-[10px] font-black">
                    <th className="py-2.5 px-3">Stock</th>
                    <th className="py-2.5 px-3 text-right">Live Price</th>
                    <th className="py-2.5 px-3 text-right">Day % Change</th>
                    <th className="py-2.5 px-3 text-right">52W High</th>
                    <th className="py-2.5 px-3 text-right">P/E</th>
                    <th className="py-2.5 px-3 text-center">14D RSI Trend</th>
                    <th className="py-2.5 px-3 text-center">RSI & Smart Alert Signal</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWatchlistAnalysis.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 font-medium">
                        {watchlist.length === 0
                          ? "Your watchlist is empty. Click the 'Watchlist' button on any stock page to save it here!"
                          : "No stocks match the selected Smart RSI alert filter."}
                      </td>
                    </tr>
                  ) : (
                    filteredWatchlistAnalysis.map(({ item, stock, rsi, obLimit, osLimit, targetPrice, stopLossPrice, isOverbought, isOversold, isTargetHit, isStopLossHit, alertStatus, isMuted }) => {
                      const isUp = stock.pChange >= 0;

                      return (
                        <tr key={item.id} className="hover:bg-orange-50/40 transition-colors">
                          <td className="py-3.5 px-3 font-black">
                            <div 
                              onClick={() => onSelectStock(item.stockSymbol)} 
                              className="text-slate-900 hover:text-orange-600 cursor-pointer flex items-center gap-1.5 flex-wrap"
                            >
                              <span>{item.stockSymbol}</span>
                              {isTargetHit && (
                                <span className="bg-teal-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded animate-pulse">
                                  🎯 TARGET HIT
                                </span>
                              )}
                              {isStopLossHit && (
                                <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded animate-pulse">
                                  🛑 STOP LOSS
                                </span>
                              )}
                              {!isTargetHit && !isStopLossHit && isOverbought && (
                                <span className="bg-rose-100 text-rose-800 text-[9px] font-black px-1.5 py-0.5 rounded">
                                  OVERBOUGHT
                                </span>
                              )}
                              {!isTargetHit && !isStopLossHit && isOversold && (
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded">
                                  OVERSOLD
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">{stock.name}</div>
                            {(targetPrice || stopLossPrice) && (
                              <div className="flex items-center gap-1.5 text-[9px] font-bold mt-0.5">
                                {targetPrice && (
                                  <span className={isTargetHit ? 'text-teal-700 font-extrabold' : 'text-slate-500'}>
                                    Target: ₹{targetPrice}
                                  </span>
                                )}
                                {stopLossPrice && (
                                  <span className={isStopLossHit ? 'text-red-700 font-extrabold' : 'text-slate-500'}>
                                    SL: ₹{stopLossPrice}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-3 text-right font-black text-slate-900">₹{stock.price.toFixed(2)}</td>

                          <td className={`py-3.5 px-3 text-right font-black ${isUp ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {isUp ? '+' : ''}{stock.pChange.toFixed(2)}%
                          </td>

                          <td className="py-3.5 px-3 text-right text-slate-800 font-bold">₹{stock.high52}</td>
                          <td className="py-3.5 px-3 text-right text-orange-600 font-black">{stock.pe}</td>

                          {/* 14D RSI Sparkline Mini-Chart Column */}
                          <td className="py-3.5 px-3 text-center">
                            <RsiSparklineChart
                              currentRsi={rsi}
                              obLimit={obLimit}
                              osLimit={osLimit}
                              symbol={item.stockSymbol}
                            />
                          </td>

                          {/* RSI & Smart Alert Indicator Column */}
                          <td className="py-3.5 px-3 text-center">
                            <div className="inline-flex flex-col items-center gap-1 max-w-[170px] mx-auto">
                              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                                {isTargetHit ? (
                                  <span className="bg-teal-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full animate-pulse shadow-xs">
                                    🎯 Target Hit (₹{targetPrice})
                                  </span>
                                ) : isStopLossHit ? (
                                  <span className="bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full animate-pulse shadow-xs">
                                    🛑 Stop Loss Hit (₹{stopLossPrice})
                                  </span>
                                ) : isOverbought ? (
                                  <span className="bg-rose-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full animate-pulse shadow-xs">
                                    🔴 Overbought ({rsi})
                                  </span>
                                ) : isOversold ? (
                                  <span className="bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full animate-pulse shadow-xs">
                                    🟢 Oversold ({rsi})
                                  </span>
                                ) : (
                                  <span className="bg-slate-100 text-slate-700 font-bold text-[9px] px-2 py-0.5 rounded-full">
                                    RSI: {rsi} (Normal)
                                  </span>
                                )}
                              </div>

                              {/* RSI Progress Track */}
                              <div className="w-28 h-1.5 bg-slate-200 rounded-full relative overflow-hidden">
                                {/* Threshold markers: 30% and 70% */}
                                <div className="absolute left-[30%] top-0 bottom-0 w-0.5 bg-emerald-500 z-10 opacity-60"></div>
                                <div className="absolute left-[70%] top-0 bottom-0 w-0.5 bg-rose-500 z-10 opacity-60"></div>

                                <div 
                                  className={`h-full transition-all rounded-full ${
                                    isOverbought ? 'bg-rose-600' : isOversold ? 'bg-emerald-500' : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${Math.min(100, Math.max(0, rsi))}%` }}
                                />
                              </div>

                              {/* Context Guidance Note */}
                              <span className="text-[9px] text-slate-500 font-medium leading-tight">
                                {isTargetHit
                                  ? `Price ≥ Target (₹${targetPrice})`
                                  : isStopLossHit
                                  ? `Price ≤ Stop Loss (₹${stopLossPrice})`
                                  : isOverbought
                                  ? `≥${obLimit} limit • Profit booking zone`
                                  : isOversold
                                  ? `≤${osLimit} limit • Dip buy signal`
                                  : `Range: ${osLimit} - ${obLimit}`}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => {
                                  setCompareStockA(item.stockSymbol);
                                  setIsComparisonModalOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                                title={`Compare ${item.stockSymbol} with another stock`}
                              >
                                <ArrowLeftRight className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onRemoveFromWatchlist(item.id)}
                                className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors rounded-lg"
                                title="Remove stock from Watchlist"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
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
      )}

      {/* Add Stock Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-orange-100 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900">Add Stock to Portfolio</h3>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Stock Symbol</label>
                <select
                  value={selectedSymbol}
                  onChange={e => {
                    setSelectedSymbol(e.target.value);
                    const st = stocks.find(s => s.symbol === e.target.value);
                    if (st) setBuyPrice(st.price);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-2xl p-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                >
                  {stocks.map(s => (
                    <option key={s.symbol} value={s.symbol}>{s.symbol} - {s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Quantity (Shares)</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-2xl p-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Average Buy Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={buyPrice}
                  onChange={e => setBuyPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-2xl p-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200 p-3 rounded-2xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white p-3 rounded-2xl font-extrabold shadow-md shadow-orange-500/20"
                >
                  Save Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart RSI Alert Settings Modal */}
      <SmartRsiAlertsModal
        isOpen={isSmartRsiModalOpen}
        onClose={() => setIsSmartRsiModalOpen(false)}
        config={rsiAlertConfig}
        onSaveConfig={handleSaveRsiConfig}
        watchlist={watchlist}
        stocks={stocks}
      />

      {/* Stock Comparison Modal */}
      <StockComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        stocks={stocks}
        watchlist={watchlist}
        initialStockA={compareStockA}
        initialStockB={compareStockB}
        onSelectStock={(sym) => {
          setIsComparisonModalOpen(false);
          onSelectStock(sym);
        }}
      />
    </div>
  );
};
