import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  BellRing, 
  X, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  RotateCcw, 
  Pause, 
  Play, 
  Search, 
  Sliders, 
  Target, 
  Volume2, 
  VolumeX, 
  Info, 
  ChevronRight,
  TrendingUp,
  Sparkles,
  Zap
} from 'lucide-react';
import { PriceAlert, Stock } from '../types/market';
import { playAlertChime } from '../utils/sound';

interface PriceAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: PriceAlert[];
  stocks: Stock[];
  onSaveAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'> & { id?: string }) => void;
  onDeleteAlert: (id: string) => void;
  onToggleActiveAlert: (id: string) => void;
  onRearmAlert: (id: string, newTarget?: number) => void;
  onSelectStock: (symbol: string) => void;
  initialStockSymbol?: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const PriceAlertsModal: React.FC<PriceAlertsModalProps> = ({
  isOpen,
  onClose,
  alerts,
  stocks,
  onSaveAlert,
  onDeleteAlert,
  onToggleActiveAlert,
  onRearmAlert,
  onSelectStock,
  initialStockSymbol,
  soundEnabled,
  onToggleSound,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'create' | 'history'>('active');
  const [searchFilter, setSearchFilter] = useState('');

  // Form State for creating/editing alert
  const [selectedSymbol, setSelectedSymbol] = useState<string>(() => {
    return initialStockSymbol || (stocks[0]?.symbol ?? 'RELIANCE');
  });
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [alertType, setAlertType] = useState<'BUY' | 'SELL'>('BUY');
  const [alertLabel, setAlertLabel] = useState<PriceAlert['label']>('Target Profit');
  const [note, setNote] = useState<string>('');

  // Sync initialStockSymbol when modal opens or prop changes
  React.useEffect(() => {
    if (initialStockSymbol) {
      setSelectedSymbol(initialStockSymbol);
      const stk = stocks.find(s => s.symbol === initialStockSymbol);
      if (stk) {
        setTargetPrice((stk.price * 1.03).toFixed(2));
        setCondition('ABOVE');
      }
      setActiveTab('create');
    }
  }, [initialStockSymbol, stocks]);

  // Selected stock object for form
  const activeStock = useMemo(() => {
    return stocks.find(s => s.symbol.toUpperCase() === selectedSymbol.toUpperCase()) || stocks[0];
  }, [stocks, selectedSymbol]);

  // When active stock changes, if target price is empty, set default +3%
  const handleStockChange = (symbol: string) => {
    setSelectedSymbol(symbol);
    const s = stocks.find(stk => stk.symbol === symbol);
    if (s) {
      setTargetPrice((s.price * 1.03).toFixed(2));
    }
  };

  const handleApplyPresetPct = (pct: number) => {
    if (!activeStock) return;
    const computed = activeStock.price * (1 + pct / 100);
    setTargetPrice(computed.toFixed(2));
    setCondition(pct >= 0 ? 'ABOVE' : 'BELOW');
    setAlertType(pct >= 0 ? 'SELL' : 'BUY');
    setAlertLabel(pct >= 0 ? (pct >= 5 ? 'Breakout' : 'Target Profit') : (pct <= -5 ? 'Stop Loss' : 'Dip Buy'));
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(targetPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    onSaveAlert({
      symbol: selectedSymbol,
      stockName: activeStock?.name || selectedSymbol,
      targetPrice: priceNum,
      condition,
      type: alertType,
      label: alertLabel,
      note: note.trim() || undefined,
      initialPrice: activeStock?.price,
      active: true,
    });

    // Reset and switch back to active tab
    setNote('');
    setActiveTab('active');
  };

  // Filtered alert lists
  const activeAlerts = useMemo(() => {
    return alerts
      .filter(a => !a.triggered)
      .filter(a => {
        if (!searchFilter.trim()) return true;
        const q = searchFilter.toLowerCase();
        return a.symbol.toLowerCase().includes(q) || (a.stockName?.toLowerCase().includes(q) ?? false);
      });
  }, [alerts, searchFilter]);

  const triggeredAlerts = useMemo(() => {
    return alerts
      .filter(a => a.triggered)
      .filter(a => {
        if (!searchFilter.trim()) return true;
        const q = searchFilter.toLowerCase();
        return a.symbol.toLowerCase().includes(q) || (a.stockName?.toLowerCase().includes(q) ?? false);
      });
  }, [alerts, searchFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-orange-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-orange-100 flex items-center justify-between bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Price Alerts System</h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                  Real-Time Monitor
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Set target price thresholds. Receive instant in-app alerts when market ticks match.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio chime toggle */}
            <button
              onClick={() => {
                onToggleSound();
                if (!soundEnabled) playAlertChime();
              }}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                soundEnabled 
                  ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' 
                  : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
              }`}
              title={soundEnabled ? 'Chime sound enabled (Click to mute)' : 'Sound muted (Click to enable)'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-orange-600" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-orange-100 bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2.5 text-xs font-extrabold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'active'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Active Thresholds</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'active' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {activeAlerts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2.5 text-xs font-extrabold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'create'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Set New Alert</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2.5 text-xs font-extrabold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Triggered History</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'history' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {triggeredAlerts.length}
              </span>
            </button>
          </div>

          {activeTab !== 'create' && (
            <div className="relative pb-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter symbol..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-7 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500 w-32 sm:w-40"
              />
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: ACTIVE ALERTS */}
          {activeTab === 'active' && (
            <div className="space-y-3">
              {activeAlerts.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 mx-auto flex items-center justify-center">
                    <Target className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">No Active Price Alerts</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You don't have any active price monitoring thresholds set. Click below to configure your first stock alert!
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 shadow-md inline-flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Set First Price Alert</span>
                  </button>
                </div>
              ) : (
                activeAlerts.map(alert => {
                  const liveStock = stocks.find(s => s.symbol === alert.symbol);
                  const currentPrice = liveStock?.price ?? alert.targetPrice;
                  const isAbove = alert.condition === 'ABOVE';
                  const diff = alert.targetPrice - currentPrice;
                  const diffPct = ((diff / currentPrice) * 100);
                  const isClose = Math.abs(diffPct) <= 1.0;
                  const isPaused = alert.active === false;

                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isPaused
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : isClose
                          ? 'bg-amber-50/60 border-amber-300 shadow-sm'
                          : 'bg-white border-orange-100 hover:border-orange-300 shadow-xs'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => {
                              onSelectStock(alert.symbol);
                              onClose();
                            }}
                            className="font-black text-base text-slate-900 hover:text-orange-600 transition-colors uppercase tracking-tight"
                          >
                            {alert.symbol}
                          </button>

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                isAbove
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {isAbove ? 'Rises Above (≥)' : 'Drops Below (≤)'}
                              </span>

                              {alert.label && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                                  {alert.label}
                                </span>
                              )}

                              {isPaused && (
                                <span className="text-[10px] bg-slate-200 text-slate-700 font-extrabold px-1.5 py-0.5 rounded">
                                  PAUSED
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-500 font-medium">
                              {alert.stockName || liveStock?.name || alert.symbol}
                            </p>
                          </div>
                        </div>

                        {/* Price & Target Display */}
                        <div className="flex items-baseline gap-4 text-right">
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Market LTP</span>
                            <span className="text-sm font-extrabold text-slate-900 font-mono tabular-nums">
                              ₹{currentPrice.toFixed(2)}
                            </span>
                          </div>

                          <div className="pl-3 border-l border-slate-200">
                            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Target Price</span>
                            <span className="text-base font-black text-orange-600 font-mono tabular-nums">
                              ₹{alert.targetPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Distance & Progress bar */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-500 font-medium">
                          <span>Gap to trigger:</span>
                          <span className={`font-bold font-mono tabular-nums ${
                            isAbove
                              ? diff > 0 ? 'text-amber-700' : 'text-emerald-700'
                              : diff < 0 ? 'text-amber-700' : 'text-rose-700'
                          }`}>
                            {diff >= 0 ? '+' : ''}₹{diff.toFixed(2)} ({diffPct >= 0 ? '+' : ''}{diffPct.toFixed(2)}%)
                          </span>
                          {isClose && (
                            <span className="text-[10px] bg-amber-100 text-amber-900 font-black px-1.5 py-0.5 rounded-full animate-pulse">
                              Near Target!
                            </span>
                          )}
                        </div>

                        {/* Control buttons */}
                        <div className="flex items-center gap-1.5 ml-auto">
                          <button
                            onClick={() => onToggleActiveAlert(alert.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title={isPaused ? 'Resume monitoring' : 'Pause alert'}
                          >
                            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => onDeleteAlert(alert.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="Delete alert"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {alert.note && (
                        <p className="mt-2 text-[11px] text-slate-600 bg-slate-50 rounded-lg p-2 font-medium">
                          <span className="font-bold text-slate-700">Note:</span> {alert.note}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: CREATE / EDIT ALERT */}
          {activeTab === 'create' && (
            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Stock Selector */}
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                  1. Select Stock to Monitor
                </label>
                <div className="relative">
                  <select
                    value={selectedSymbol}
                    onChange={(e) => handleStockChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-orange-50/50 border border-orange-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  >
                    {stocks.map(s => (
                      <option key={s.symbol} value={s.symbol}>
                        {s.symbol} — {s.name} (LTP: ₹{s.price.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Stock Snapshot */}
              {activeStock && (
                <div className="bg-orange-50/60 rounded-2xl p-3.5 border border-orange-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900 text-sm">{activeStock.symbol}</span>
                    <span className="text-slate-500 ml-2 font-medium">{activeStock.sector}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 font-semibold block text-[10px]">CURRENT LTP</span>
                    <span className="font-black text-slate-900 font-mono tabular-nums text-sm">
                      ₹{activeStock.price.toFixed(2)}
                    </span>
                    <span className={`text-[11px] font-bold ml-1.5 ${
                      activeStock.pChange >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      ({activeStock.pChange >= 0 ? '+' : ''}{activeStock.pChange.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              )}

              {/* Condition & Target Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                    2. Condition
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCondition('ABOVE')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        condition === 'ABOVE'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Rises Above (≥)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCondition('BELOW')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        condition === 'BELOW'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span>Drops Below (≤)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                    3. Target Price (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      step="0.05"
                      min="0.1"
                      required
                      placeholder="e.g. 3100.00"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono tabular-nums"
                    />
                  </div>
                </div>
              </div>

              {/* Quick % Threshold Presets */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                  Quick Percentage Presets from current LTP:
                </span>
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                  <span className="text-[10px] text-slate-400 font-semibold mr-1">Targets:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetPct(2)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    +2% Target
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetPct(5)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    +5% Breakout
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetPct(10)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    +10% Rally
                  </button>

                  <span className="text-[10px] text-slate-400 font-semibold ml-2 mr-1">Stop/Dips:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetPct(-2)}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
                  >
                    -2% Dip
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetPct(-5)}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
                  >
                    -5% Stop Loss
                  </button>
                </div>
              </div>

              {/* Strategy Tag & Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                    4. Strategy Purpose
                  </label>
                  <select
                    value={alertLabel}
                    onChange={(e) => setAlertLabel(e.target.value as PriceAlert['label'])}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  >
                    <option value="Target Profit">Target Profit (Booking Gain)</option>
                    <option value="Stop Loss">Stop Loss (Risk Management)</option>
                    <option value="Breakout">Breakout Entry (52W / Resistance)</option>
                    <option value="Dip Buy">Dip Buy (Support Accumulation)</option>
                    <option value="Custom">Custom Strategy Note</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                    5. Execution Memo (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sell 50% holdings / Check RSI"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('active')}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <BellRing className="w-4 h-4" />
                  <span>Activate Price Alert</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: TRIGGERED HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {triggeredAlerts.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-sm text-slate-800">No Triggered Alerts Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    When stock prices hit your configured thresholds, the trigger records and match prices will appear here.
                  </p>
                </div>
              ) : (
                triggeredAlerts.map(alert => {
                  const liveStock = stocks.find(s => s.symbol === alert.symbol);
                  return (
                    <div
                      key={alert.id}
                      className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900">{alert.symbol}</span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                            TRIGGERED
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {alert.triggeredAt ? new Date(alert.triggeredAt).toLocaleTimeString() : 'Recently'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mt-1 font-medium">
                          Crossed target threshold of <strong>₹{alert.targetPrice.toFixed(2)}</strong> ({alert.condition}).
                          {alert.triggeredPrice && (
                            <span> Recorded match price: <strong className="font-mono tabular-nums">₹{alert.triggeredPrice.toFixed(2)}</strong>.</span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onRearmAlert(alert.id, liveStock ? liveStock.price * 1.05 : undefined)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-orange-700 border border-orange-200 hover:bg-orange-50 transition-all flex items-center gap-1 shadow-2xs"
                          title="Set new target threshold"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Re-arm (+5%)</span>
                        </button>

                        <button
                          onClick={() => {
                            onSelectStock(alert.symbol);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-600 text-white hover:bg-orange-500 transition-all shadow-xs"
                        >
                          Chart
                        </button>

                        <button
                          onClick={() => onDeleteAlert(alert.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
