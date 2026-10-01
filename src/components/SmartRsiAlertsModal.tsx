import React, { useState } from 'react';
import { 
  Bell, 
  Settings2, 
  Sliders, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Volume2, 
  VolumeX, 
  ShieldAlert,
  Info,
  RotateCcw,
  Target,
  AlertOctagon,
  Crosshair
} from 'lucide-react';
import { Stock, WatchlistItem } from '../types/market';

export interface SmartRsiConfig {
  enabled: boolean;
  overboughtThreshold: number; // e.g. 70
  oversoldThreshold: number;   // e.g. 30
  soundEnabled: boolean;
  bannerEnabled: boolean;
  stockOverrides: Record<string, { 
    overbought?: number; 
    oversold?: number; 
    targetPrice?: number; 
    stopLossPrice?: number; 
    disabled?: boolean 
  }>;
}

interface SmartRsiAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SmartRsiConfig;
  onSaveConfig: (newConfig: SmartRsiConfig) => void;
  watchlist: WatchlistItem[];
  stocks: Stock[];
}

export const SmartRsiAlertsModal: React.FC<SmartRsiAlertsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  watchlist,
  stocks,
}) => {
  const [localConfig, setLocalConfig] = useState<SmartRsiConfig>(config);
  const [activeTab, setActiveTab] = useState<'thresholds' | 'overrides'>('thresholds');

  if (!isOpen) return null;

  const applyPreset = (overbought: number, oversold: number) => {
    setLocalConfig(prev => ({
      ...prev,
      overboughtThreshold: overbought,
      oversoldThreshold: oversold,
    }));
  };

  const handleResetDefaults = () => {
    setLocalConfig({
      enabled: true,
      overboughtThreshold: 70,
      oversoldThreshold: 30,
      soundEnabled: true,
      bannerEnabled: true,
      stockOverrides: {},
    });
  };

  const handleSave = () => {
    onSaveConfig(localConfig);
    onClose();
  };

  // Compute live match preview
  const trackedStockData = watchlist.map(w => {
    const s = stocks.find(stk => stk.symbol === w.stockSymbol);
    const override = localConfig.stockOverrides[w.stockSymbol] || {};
    const effectiveOb = override.overbought ?? localConfig.overboughtThreshold;
    const effectiveOs = override.oversold ?? localConfig.oversoldThreshold;
    const targetPrice = override.targetPrice;
    const stopLossPrice = override.stopLossPrice;
    const isDisabled = override.disabled ?? false;

    const rsi = s?.rsi ?? 50;
    const price = s?.price ?? 0;

    const isOverbought = !isDisabled && rsi >= effectiveOb;
    const isOversold = !isDisabled && rsi <= effectiveOs;
    const isTargetHit = !isDisabled && targetPrice != null && targetPrice > 0 && price >= targetPrice;
    const isStopLossHit = !isDisabled && stopLossPrice != null && stopLossPrice > 0 && price <= stopLossPrice;

    return {
      symbol: w.stockSymbol,
      name: s?.name || w.stockSymbol,
      rsi,
      effectiveOb,
      effectiveOs,
      targetPrice,
      stopLossPrice,
      isDisabled,
      isOverbought,
      isOversold,
      isTargetHit,
      isStopLossHit,
      price,
      pChange: s?.pChange ?? 0,
    };
  });

  const overboughtMatches = trackedStockData.filter(d => d.isOverbought);
  const oversoldMatches = trackedStockData.filter(d => d.isOversold);
  const targetMatches = trackedStockData.filter(d => d.isTargetHit);
  const stopLossMatches = trackedStockData.filter(d => d.isStopLossHit);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-orange-100 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white p-6 flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Bell className="w-48 h-48" />
          </div>
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                <Bell className="w-5 h-5 text-white" />
              </span>
              <h3 className="text-lg font-black tracking-tight">Smart Watchlist Alerts & Targets</h3>
            </div>
            <p className="text-xs text-orange-100 font-medium">
              Automated RSI momentum alerts, price target alerts, and stop-loss triggers for tracked stocks
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center justify-between px-6 pt-4 border-b border-orange-100 bg-orange-50/30">
          <div className="flex items-center gap-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('thresholds')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-2xl border-t border-x transition-all ${
                activeTab === 'thresholds'
                  ? 'bg-white border-orange-200 text-orange-600 font-black shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Global RSI Limits</span>
            </button>

            <button
              onClick={() => setActiveTab('overrides')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-2xl border-t border-x transition-all ${
                activeTab === 'overrides'
                  ? 'bg-white border-orange-200 text-orange-600 font-black shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Settings2 className="w-4 h-4" />
              <span>Per-Stock Targets & Rules ({watchlist.length})</span>
            </button>
          </div>

          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-orange-600 transition-colors pb-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* Modal Body Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Master Enable Toggle */}
          <div className="bg-orange-50/60 border border-orange-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                <span>Master Smart Watchlist Alerts</span>
                {localConfig.enabled ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md">ACTIVE</span>
                ) : (
                  <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-md">PAUSED</span>
                )}
              </div>
              <p className="text-slate-600 text-[11px]">
                Monitors RSI momentum extremes, custom target prices, and stop loss triggers for your watchlist.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={localConfig.enabled}
                onChange={e => setLocalConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>

          {activeTab === 'thresholds' ? (
            <div className="space-y-6">
              {/* Presets */}
              <div className="space-y-2">
                <label className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span>Preset RSI Sensitivity Levels</span>
                </label>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => applyPreset(70, 30)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      localConfig.overboughtThreshold === 70 && localConfig.oversoldThreshold === 30
                        ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-200 text-orange-950 font-black'
                        : 'bg-white border-slate-200 hover:border-orange-200 text-slate-700 font-bold'
                    }`}
                  >
                    <div className="text-xs">Standard (70 / 30)</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">Classic technical analysis standard for equities</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset(75, 25)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      localConfig.overboughtThreshold === 75 && localConfig.oversoldThreshold === 25
                        ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-200 text-orange-950 font-black'
                        : 'bg-white border-slate-200 hover:border-orange-200 text-slate-700 font-bold'
                    }`}
                  >
                    <div className="text-xs">Conservative (75 / 25)</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">Fewer false alerts, triggers only on high extremes</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset(65, 35)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      localConfig.overboughtThreshold === 65 && localConfig.oversoldThreshold === 35
                        ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-200 text-orange-950 font-black'
                        : 'bg-white border-slate-200 hover:border-orange-200 text-slate-700 font-bold'
                    }`}
                  >
                    <div className="text-xs">Aggressive (65 / 35)</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">Early momentum warning for fast swing traders</div>
                  </button>
                </div>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/70 border border-slate-200 rounded-2xl p-5">
                {/* Overbought Limit */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-black text-rose-700 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-rose-600" />
                      <span>Overbought RSI Limit</span>
                    </label>
                    <span className="bg-rose-100 text-rose-800 font-black px-2.5 py-1 rounded-lg text-xs">
                      RSI ≥ {localConfig.overboughtThreshold}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="55"
                    max="85"
                    step="1"
                    value={localConfig.overboughtThreshold}
                    onChange={e => setLocalConfig(prev => ({ ...prev, overboughtThreshold: Number(e.target.value) }))}
                    className="w-full h-2 bg-rose-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                  />

                  <p className="text-[11px] text-slate-500">
                    Stocks with RSI above <strong>{localConfig.overboughtThreshold}</strong> will trigger an <strong className="text-rose-700">Overbought Alert</strong> (Profit booking zone).
                  </p>
                </div>

                {/* Oversold Limit */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-black text-emerald-700 flex items-center gap-1.5">
                      <TrendingDown className="w-4 h-4 text-emerald-600" />
                      <span>Oversold RSI Limit</span>
                    </label>
                    <span className="bg-emerald-100 text-emerald-800 font-black px-2.5 py-1 rounded-lg text-xs">
                      RSI ≤ {localConfig.oversoldThreshold}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="15"
                    max="45"
                    step="1"
                    value={localConfig.oversoldThreshold}
                    onChange={e => setLocalConfig(prev => ({ ...prev, oversoldThreshold: Number(e.target.value) }))}
                    className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />

                  <p className="text-[11px] text-slate-500">
                    Stocks with RSI below <strong>{localConfig.oversoldThreshold}</strong> will trigger an <strong className="text-emerald-700">Oversold Alert</strong> (Value accumulation buy dip).
                  </p>
                </div>
              </div>

              {/* Preferences Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between bg-white border border-slate-200 p-3.5 rounded-2xl">
                  <div className="flex items-center gap-2.5">
                    <Volume2 className="w-4 h-4 text-orange-600" />
                    <div>
                      <div className="font-extrabold text-slate-900">Audio Chime Notification</div>
                      <div className="text-[10px] text-slate-500">Play subtle sound when alert triggers</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localConfig.soundEnabled}
                    onChange={e => setLocalConfig(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                    className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between bg-white border border-slate-200 p-3.5 rounded-2xl">
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-orange-600" />
                    <div>
                      <div className="font-extrabold text-slate-900">Watchlist Banner Alert</div>
                      <div className="text-[10px] text-slate-500">Show summary alert badge on top</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localConfig.bannerEnabled}
                    onChange={e => setLocalConfig(prev => ({ ...prev, bannerEnabled: e.target.checked }))}
                    className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Live Matching Preview Panel */}
              <div className="border border-orange-100 rounded-2xl p-4 bg-orange-50/30 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-black text-slate-900 uppercase text-[11px] flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-orange-600" />
                    <span>Live Match Preview ({watchlist.length} Tracked Stocks)</span>
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold flex-wrap">
                    <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">{overboughtMatches.length} Overbought</span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">{oversoldMatches.length} Oversold</span>
                    <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md">🎯 {targetMatches.length} Target Hit</span>
                    <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-md">🛑 {stopLossMatches.length} Stop Loss</span>
                  </div>
                </div>

                <div className="divide-y divide-orange-100 max-h-48 overflow-y-auto pr-1">
                  {trackedStockData.map(st => (
                    <div key={st.symbol} className="py-2.5 flex items-center justify-between text-xs font-semibold">
                      <div>
                        <span className="font-black text-slate-900">{st.symbol}</span>
                        <span className="text-[10px] text-slate-500 ml-2">₹{st.price.toFixed(2)}</span>
                        {st.targetPrice && (
                          <span className="text-[9px] text-teal-700 font-bold ml-2">T: ₹{st.targetPrice}</span>
                        )}
                        {st.stopLossPrice && (
                          <span className="text-[9px] text-rose-700 font-bold ml-1">SL: ₹{st.stopLossPrice}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-600 font-extrabold text-[11px]">RSI: {st.rsi}</span>
                        {st.isTargetHit && (
                          <span className="bg-teal-600 text-white font-black text-[9px] px-2 py-0.5 rounded-md animate-pulse">
                            🎯 TARGET HIT
                          </span>
                        )}
                        {st.isStopLossHit && (
                          <span className="bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded-md animate-pulse">
                            🛑 STOP LOSS
                          </span>
                        )}
                        {st.isOverbought && (
                          <span className="bg-rose-600 text-white font-black text-[9px] px-2 py-0.5 rounded-md">
                            🔴 OVERBOUGHT
                          </span>
                        )}
                        {st.isOversold && (
                          <span className="bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded-md">
                            🟢 OVERSOLD
                          </span>
                        )}
                        {!st.isTargetHit && !st.isStopLossHit && !st.isOverbought && !st.isOversold && (
                          <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-md">
                            Neutral
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Per-Stock Overrides & Target / Stop Loss Tab */
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-slate-700 space-y-1">
                <div className="font-black text-blue-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-700" />
                  <span>Custom Target Price, Stop Loss & RSI Limits</span>
                </div>
                <p className="text-[11px]">
                  Set profit target prices (₹) and stop-loss levels (₹) for individual watchlist stocks alongside custom RSI overbought/oversold boundaries.
                </p>
              </div>

              <div className="space-y-4">
                {watchlist.map(item => {
                  const stock = stocks.find(s => s.symbol === item.stockSymbol);
                  const override = localConfig.stockOverrides[item.stockSymbol] || {};
                  const isMuted = override.disabled ?? false;
                  const currentPrice = stock?.price ?? 0;

                  const quickTarget10 = Math.round(currentPrice * 1.10);
                  const quickStop5 = Math.round(currentPrice * 0.95);

                  return (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-sm">{item.stockSymbol}</span>
                            <span className="text-[11px] text-slate-500">({stock?.name})</span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] font-bold mt-0.5">
                            <span className="text-slate-800">Live Price: <strong className="text-slate-950 font-black">₹{currentPrice.toFixed(2)}</strong></span>
                            <span className="text-orange-600">RSI: {stock?.rsi ?? 50}</span>
                          </div>
                        </div>

                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!isMuted}
                            onChange={e => {
                              const mute = !e.target.checked;
                              setLocalConfig(prev => ({
                                ...prev,
                                stockOverrides: {
                                  ...prev.stockOverrides,
                                  [item.stockSymbol]: {
                                    ...prev.stockOverrides[item.stockSymbol],
                                    disabled: mute,
                                  },
                                },
                              }));
                            }}
                            className="w-4 h-4 accent-orange-600 rounded"
                          />
                          <span>{isMuted ? 'Alert Muted' : 'Alert Active'}</span>
                        </label>
                      </div>

                      {!isMuted && (
                        <div className="space-y-3">
                          {/* Price Target & Stop Loss Section */}
                          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 space-y-2">
                            <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                              <Target className="w-3.5 h-3.5 text-orange-600" />
                              <span>Price Threshold Alerts (Target & Stop Loss)</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Target Price */}
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[10px] font-extrabold text-teal-800 uppercase flex items-center gap-1">
                                    <Target className="w-3 h-3 text-teal-600" />
                                    <span>Target Price (₹)</span>
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setLocalConfig(prev => ({
                                        ...prev,
                                        stockOverrides: {
                                          ...prev.stockOverrides,
                                          [item.stockSymbol]: {
                                            ...prev.stockOverrides[item.stockSymbol],
                                            targetPrice: quickTarget10,
                                          },
                                        },
                                      }));
                                    }}
                                    className="text-[9px] font-black text-teal-700 hover:text-teal-900 bg-teal-100/60 px-1.5 py-0.5 rounded"
                                  >
                                    +10% (₹{quickTarget10})
                                  </button>
                                </div>
                                <input
                                  type="number"
                                  placeholder={`e.g. ${quickTarget10}`}
                                  value={override.targetPrice ?? ''}
                                  onChange={e => {
                                    const val = e.target.value ? Number(e.target.value) : undefined;
                                    setLocalConfig(prev => ({
                                      ...prev,
                                      stockOverrides: {
                                        ...prev.stockOverrides,
                                        [item.stockSymbol]: {
                                          ...prev.stockOverrides[item.stockSymbol],
                                          targetPrice: val,
                                        },
                                      },
                                    }));
                                  }}
                                  className="w-full bg-white border border-slate-200 text-slate-900 font-bold rounded-xl p-2 text-xs outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                />
                                <span className="text-[9px] text-slate-400 mt-0.5 block">Alerts when Price ≥ Target</span>
                              </div>

                              {/* Stop Loss Price */}
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[10px] font-extrabold text-rose-800 uppercase flex items-center gap-1">
                                    <AlertOctagon className="w-3 h-3 text-rose-600" />
                                    <span>Stop Loss Price (₹)</span>
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setLocalConfig(prev => ({
                                        ...prev,
                                        stockOverrides: {
                                          ...prev.stockOverrides,
                                          [item.stockSymbol]: {
                                            ...prev.stockOverrides[item.stockSymbol],
                                            stopLossPrice: quickStop5,
                                          },
                                        },
                                      }));
                                    }}
                                    className="text-[9px] font-black text-rose-700 hover:text-rose-900 bg-rose-100/60 px-1.5 py-0.5 rounded"
                                  >
                                    -5% (₹{quickStop5})
                                  </button>
                                </div>
                                <input
                                  type="number"
                                  placeholder={`e.g. ${quickStop5}`}
                                  value={override.stopLossPrice ?? ''}
                                  onChange={e => {
                                    const val = e.target.value ? Number(e.target.value) : undefined;
                                    setLocalConfig(prev => ({
                                      ...prev,
                                      stockOverrides: {
                                        ...prev.stockOverrides,
                                        [item.stockSymbol]: {
                                          ...prev.stockOverrides[item.stockSymbol],
                                          stopLossPrice: val,
                                        },
                                      },
                                    }));
                                  }}
                                  className="w-full bg-white border border-slate-200 text-slate-900 font-bold rounded-xl p-2 text-xs outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                />
                                <span className="text-[9px] text-slate-400 mt-0.5 block">Alerts when Price ≤ Stop Loss</span>
                              </div>
                            </div>
                          </div>

                          {/* Custom RSI Overrides Section */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-extrabold text-rose-700 uppercase block mb-1">
                                Custom Overbought RSI (Default: {localConfig.overboughtThreshold})
                              </label>
                              <input
                                type="number"
                                min="50"
                                max="90"
                                placeholder={localConfig.overboughtThreshold.toString()}
                                value={override.overbought ?? ''}
                                onChange={e => {
                                  const val = e.target.value ? Number(e.target.value) : undefined;
                                  setLocalConfig(prev => ({
                                    ...prev,
                                    stockOverrides: {
                                      ...prev.stockOverrides,
                                      [item.stockSymbol]: {
                                        ...prev.stockOverrides[item.stockSymbol],
                                        overbought: val,
                                      },
                                    },
                                  }));
                                }}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-xl p-2 text-xs outline-none focus:border-orange-500"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-extrabold text-emerald-700 uppercase block mb-1">
                                Custom Oversold RSI (Default: {localConfig.oversoldThreshold})
                              </label>
                              <input
                                type="number"
                                min="10"
                                max="50"
                                placeholder={localConfig.oversoldThreshold.toString()}
                                value={override.oversold ?? ''}
                                onChange={e => {
                                  const val = e.target.value ? Number(e.target.value) : undefined;
                                  setLocalConfig(prev => ({
                                    ...prev,
                                    stockOverrides: {
                                      ...prev.stockOverrides,
                                      [item.stockSymbol]: {
                                        ...prev.stockOverrides[item.stockSymbol],
                                        oversold: val,
                                      },
                                    },
                                  }));
                                }}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-xl p-2 text-xs outline-none focus:border-orange-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-orange-100 bg-orange-50/50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-2xl font-bold transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-2xl font-extrabold shadow-md shadow-orange-500/20 transition-all active:scale-95 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply Smart Alert Rules</span>
          </button>
        </div>
      </div>
    </div>
  );
};

