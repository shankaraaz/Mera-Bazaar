import React, { useEffect } from 'react';
import { 
  BellRing, 
  X, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight, 
  Volume2, 
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { PriceAlert, Stock } from '../types/market';

interface PriceAlertToastProps {
  alert: PriceAlert;
  stock?: Stock;
  onDismiss: (id: string) => void;
  onViewStock: (symbol: string) => void;
  onRearm?: (id: string) => void;
}

export const PriceAlertToast: React.FC<PriceAlertToastProps> = ({
  alert,
  stock,
  onDismiss,
  onViewStock,
  onRearm,
}) => {
  const currentPrice = stock?.price ?? alert.triggeredPrice ?? alert.targetPrice;
  const isAbove = alert.condition === 'ABOVE';

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(alert.id);
    }, 10000);
    return () => clearTimeout(timer);
  }, [alert.id, onDismiss]);

  return (
    <div 
      className="max-w-md w-full bg-slate-950 text-white rounded-2xl p-4 shadow-2xl border-2 border-orange-500/80 flex flex-col gap-3 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto backdrop-blur-md"
      role="alert"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600/30 border border-orange-500 text-orange-400 flex items-center justify-center shrink-0 shadow-inner animate-bounce">
            <BellRing className="w-5 h-5 text-orange-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-tight text-white uppercase">
                {alert.symbol}
              </span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                isAbove ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-rose-950 text-rose-300 border border-rose-700'
              }`}>
                {isAbove ? 'Target Hit (Above)' : 'Stop / Dip Hit (Below)'}
              </span>
              {alert.label && (
                <span className="text-[10px] bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded-full">
                  {alert.label}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 font-medium mt-1 leading-snug">
              {alert.stockName || alert.symbol} has crossed your threshold of{' '}
              <strong className="text-orange-300 font-mono tabular-nums">₹{alert.targetPrice.toFixed(2)}</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={() => onDismiss(alert.id)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="bg-slate-900/90 rounded-xl px-3 py-2 flex items-center justify-between border border-slate-800 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Current Market Price</span>
          <span className="text-base font-black text-white font-mono tabular-nums">
            ₹{currentPrice.toFixed(2)}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Target Threshold</span>
          <span className={`font-bold font-mono tabular-nums text-xs flex items-center justify-end gap-0.5 ${
            isAbove ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {isAbove ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {alert.condition} ₹{alert.targetPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {alert.note && (
        <p className="text-[11px] text-orange-200/90 italic bg-orange-950/40 rounded-lg px-2.5 py-1 border border-orange-900/50">
          Memo: {alert.note}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-1">
        {onRearm && (
          <button
            onClick={() => onRearm(alert.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
            <span>Re-arm</span>
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => onDismiss(alert.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Dismiss
          </button>

          <button
            onClick={() => {
              onViewStock(alert.symbol);
              onDismiss(alert.id);
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-orange-600 hover:bg-orange-500 text-white transition-all flex items-center gap-1 shadow-md active:scale-95"
          >
            <span>View Stock</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
