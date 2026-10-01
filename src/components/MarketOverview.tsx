import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Newspaper, 
  DollarSign, 
  Users, 
  Award, 
  Compass, 
  ChevronRight,
  Flame,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { Stock, MarketIndex, MarketBreadth, InstitutionalFlow, CommodityForex, MarketNews } from '../types/market';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { MarketHeatmap } from './MarketHeatmap';

interface MarketOverviewProps {
  indices: MarketIndex[];
  breadth: MarketBreadth;
  stocks: Stock[];
  institutionalFlow: InstitutionalFlow[];
  commoditiesForex: CommodityForex[];
  news: MarketNews[];
  onSelectStock: (symbol: string) => void;
  onOpenScreenerPreset: (preset: string) => void;
  marketStatus?: {
    isOpen: boolean;
    isForced: boolean;
    istTime: string;
    reason: string;
    nextEventText: string;
    forceSimulateMarketOpen: boolean;
  };
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({
  indices,
  breadth,
  stocks,
  institutionalFlow,
  commoditiesForex,
  news,
  onSelectStock,
  onOpenScreenerPreset,
  marketStatus,
}) => {
  const [activeMoversTab, setActiveMoversTab] = useState<'gainers' | 'losers' | 'volume' | 'highs52'>('gainers');

  const sortedByGain = [...stocks].sort((a, b) => b.pChange - a.pChange);
  const sortedByVolume = [...stocks].sort((a, b) => b.volume - a.volume);
  const highs52 = stocks.filter(s => s.price >= s.high52 * 0.95);

  const currentMovers = 
    activeMoversTab === 'gainers' ? sortedByGain.slice(0, 6) :
    activeMoversTab === 'losers' ? sortedByGain.slice(-6).reverse() :
    activeMoversTab === 'volume' ? sortedByVolume.slice(0, 6) :
    highs52.slice(0, 6);

  const isMarketOpen = marketStatus?.isOpen ?? false;

  return (
    <div id="tour-view-overview" className="space-y-6">
      {/* Market Status Notification Banner */}
      {!isMarketOpen && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-orange-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0 font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <span>NSE / BSE Indian Markets Closed</span>
                <span className="text-[10px] bg-rose-100 text-rose-800 font-black px-2 py-0.5 rounded-full uppercase">
                  {marketStatus?.reason || 'After Hours'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Standard Trading Hours: <strong>09:15 AM to 03:30 PM IST (Mon-Fri)</strong>. Showing official last market close prices.
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs font-bold text-orange-700 block">{marketStatus?.istTime || 'IST Time'}</span>
            <span className="text-[11px] text-slate-500 font-semibold">{marketStatus?.nextEventText || 'Opens Monday at 09:15 AM'}</span>
          </div>
        </div>
      )}
      {/* Top Hero Indices Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {indices.map(idx => {
          const isUp = idx.change >= 0;
          return (
            <div
              key={idx.symbol}
              className="bg-white border border-orange-100 hover:border-orange-300 rounded-3xl p-5 transition-all shadow-sm hover:shadow-md group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-[11px] font-extrabold text-orange-800 uppercase tracking-wider">{idx.symbol}</span>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-orange-600 transition-colors">{idx.name}</h3>
                </div>
                <div
                  className={`p-2.5 rounded-2xl flex items-center justify-center font-bold ${
                    isUp ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {isUp ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
              </div>

              <div className="flex items-baseline justify-between my-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {idx.value.toLocaleString('en-IN')}
                </span>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${isUp ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-rose-700 bg-rose-50 border border-rose-200'}`}>
                  {isUp ? '+' : ''}{idx.change.toFixed(2)} ({isUp ? '+' : ''}{idx.pChange.toFixed(2)}%)
                </span>
              </div>

              {/* Sparkline chart */}
              <div className="h-12 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={idx.history}>
                    <defs>
                      <linearGradient id={`grad-${idx.symbol}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isUp ? '#10b981' : '#f43f5e'} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={isUp ? '#10b981' : '#f43f5e'} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={isUp ? '#059669' : '#e11d48'}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill={`url(#grad-${idx.symbol})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-2 border-t border-slate-100 pt-2">
                <span>Low: ₹{idx.low.toLocaleString('en-IN')}</span>
                <span>High: ₹{idx.high.toLocaleString('en-IN')}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Second Row: Market Breadth Meter & Institutional Flows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Breadth Card */}
        <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                  <Compass className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 text-base">Market Breadth</h3>
              </div>
              <span className="text-xs bg-orange-50 text-orange-800 font-bold px-2.5 py-1 rounded-full border border-orange-200">
                A/D Ratio: {breadth.advanceDeclineRatio}
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
              Real-time advance vs decline ratio across all active NSE & BSE equities today.
            </p>

            {/* Visual Ratio Bar */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs font-extrabold">
                <span className="text-emerald-700 flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" /> Advances: {breadth.advances} ({Math.round((breadth.advances/breadth.total)*100)}%)
                </span>
                <span className="text-rose-700 flex items-center gap-1">
                  Declines: {breadth.declines} ({Math.round((breadth.declines/breadth.total)*100)}%) <ArrowDownRight className="w-4 h-4" />
                </span>
              </div>

              <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex p-0.5 border border-slate-200 shadow-inner">
                <div 
                  className="bg-emerald-500 h-full rounded-l-full transition-all duration-500" 
                  style={{ width: `${(breadth.advances / breadth.total) * 100}%` }}
                ></div>
                <div 
                  className="bg-slate-300 h-full" 
                  style={{ width: `${(breadth.unchanged / breadth.total) * 100}%` }}
                ></div>
                <div 
                  className="bg-rose-500 h-full rounded-r-full transition-all duration-500" 
                  style={{ width: `${(breadth.declines / breadth.total) * 100}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 font-medium pt-1">
                <span>Unchanged: {breadth.unchanged}</span>
                <span>Active Equities: {breadth.total}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>Overall Sentiment:</span>
            <span className="text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Moderate Bullish
            </span>
          </div>
        </div>

        {/* FII / DII Institutional Flow Widget */}
        <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 text-base">FII & DII Institutional Activity</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">Values in ₹ Crores</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-orange-100 font-extrabold uppercase text-[10px] tracking-wider bg-orange-50/40">
                    <th className="py-2.5 px-3 rounded-l-xl">Date / Session</th>
                    <th className="py-2.5 px-3 text-right">FII Cash Net</th>
                    <th className="py-2.5 px-3 text-right">DII Cash Net</th>
                    <th className="py-2.5 px-3 text-right">FII F&O Net</th>
                    <th className="py-2.5 px-3 text-right rounded-r-xl">Combined Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold">
                  {institutionalFlow.map((flow, i) => {
                    const combined = flow.fiiCashNet + flow.diiCashNet;
                    return (
                      <tr key={i} className="hover:bg-orange-50/40 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900">{flow.date}</td>
                        <td className={`py-3 px-3 text-right font-bold ${flow.fiiCashNet >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {flow.fiiCashNet >= 0 ? '+' : ''}₹{flow.fiiCashNet.toLocaleString('en-IN')}
                        </td>
                        <td className={`py-3 px-3 text-right font-bold ${flow.diiCashNet >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {flow.diiCashNet >= 0 ? '+' : ''}₹{flow.diiCashNet.toLocaleString('en-IN')}
                        </td>
                        <td className={`py-3 px-3 text-right font-semibold ${flow.fiiFnONet >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {flow.fiiFnONet >= 0 ? '+' : ''}₹{flow.fiiFnONet.toLocaleString('en-IN')}
                        </td>
                        <td className={`py-3 px-3 text-right font-black ${combined >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {combined >= 0 ? '+' : ''}₹{combined.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 pt-2 text-[11px] text-slate-500 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            Strong DII domestic mutual fund inflows absorb global market volatility.
          </div>
        </div>
      </div>

      {/* Stock Performance Heatmap */}
      <MarketHeatmap
        stocks={stocks}
        onSelectStock={onSelectStock}
      />

      {/* Third Row: Market Movers & Screener Quick Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MoneyControl Market Movers */}
        <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all lg:col-span-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="font-black text-slate-900 text-base">Market Movers</h3>
            </div>

            {/* Tabs */}
            <div className="flex items-center bg-orange-50 p-1 rounded-2xl border border-orange-200/80 text-xs font-bold gap-1">
              <button
                onClick={() => setActiveMoversTab('gainers')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeMoversTab === 'gainers' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Top Gainers
              </button>
              <button
                onClick={() => setActiveMoversTab('losers')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeMoversTab === 'losers' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Top Losers
              </button>
              <button
                onClick={() => setActiveMoversTab('volume')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeMoversTab === 'volume' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Most Active
              </button>
              <button
                onClick={() => setActiveMoversTab('highs52')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeMoversTab === 'highs52' ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                52W Highs
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentMovers.map(s => {
              const isUp = s.pChange >= 0;
              return (
                <div
                  key={s.symbol}
                  onClick={() => onSelectStock(s.symbol)}
                  className="bg-orange-50/30 border border-orange-100 hover:border-orange-300 rounded-2xl p-3.5 cursor-pointer transition-all hover:bg-orange-50/70 flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm group-hover:text-orange-600 transition-colors">{s.symbol}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md">{s.sector}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate max-w-[180px] mt-0.5">{s.name}</p>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-slate-900 text-sm">₹{s.price.toFixed(2)}</div>
                    <div className={`text-xs font-bold flex items-center justify-end gap-0.5 ${isUp ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isUp ? '+' : ''}{s.change.toFixed(2)} ({isUp ? '+' : ''}{s.pChange.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Screener Quick Starters */}
        <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="font-black text-slate-900 text-base">Screener Presets</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
              Run Screener.in quantitative algorithms to spot fundamentally strong Indian companies.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => onOpenScreenerPreset('UNDERVALUED')}
                className="w-full text-left bg-orange-50/50 hover:bg-orange-100/60 border border-orange-200/80 p-3.5 rounded-2xl transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="font-extrabold text-xs text-slate-900 group-hover:text-orange-600">Undervalued Growth</div>
                  <div className="text-[11px] text-slate-500 font-medium">P/E &lt; Industry P/E & ROE &gt; 20%</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => onOpenScreenerPreset('DIVIDEND')}
                className="w-full text-left bg-orange-50/50 hover:bg-orange-100/60 border border-orange-200/80 p-3.5 rounded-2xl transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-700">Dividend Champions</div>
                  <div className="text-[11px] text-slate-500 font-medium">Yield &gt; 1.5% & Low Debt/Equity</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => onOpenScreenerPreset('BREAKOUT')}
                className="w-full text-left bg-orange-50/50 hover:bg-orange-100/60 border border-orange-200/80 p-3.5 rounded-2xl transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="font-extrabold text-xs text-slate-900 group-hover:text-amber-700">52W Breakout Leaders</div>
                  <div className="text-[11px] text-slate-500 font-medium">Price near 52W High + High Volume</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => onOpenScreenerPreset('CUSTOM')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
            >
              Open Custom Screener Builder →
            </button>
          </div>
        </div>
      </div>

      {/* Fourth Row: Commodities & Forex + Market News */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commodities & Forex */}
        <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <h3 className="font-black text-slate-900 text-base">Commodities & Forex</h3>
          </div>

          <div className="space-y-3">
            {commoditiesForex.map(cf => {
              const isUp = cf.change >= 0;
              return (
                <div key={cf.symbol} className="bg-orange-50/40 p-3.5 rounded-2xl border border-orange-100 flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-xs text-slate-900">{cf.name}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">{cf.category} • {cf.unit}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-900 text-xs">
                      {cf.category === 'Forex' ? `₹${cf.price.toFixed(2)}` : `₹${cf.price.toLocaleString('en-IN')}`}
                    </div>
                    <div className={`text-[11px] font-extrabold ${isUp ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isUp ? '+' : ''}{cf.pChange.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live News Stream with AI Sentiment Tags */}
        <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                <Newspaper className="w-4 h-4" />
              </div>
              <h3 className="font-black text-slate-900 text-base">MoneyControl Live Market News</h3>
            </div>
            <span className="text-xs text-slate-500 font-semibold bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
              AI Sentiment Tagged
            </span>
          </div>

          <div className="space-y-3">
            {news.map(item => (
              <div
                key={item.id}
                className="bg-orange-50/30 p-4 rounded-2xl border border-orange-100 hover:border-orange-300 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-white border border-orange-200 text-orange-900 font-extrabold px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">{item.source} • {item.timeAgo}</span>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      item.sentiment === 'Bullish' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      item.sentiment === 'Bearish' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {item.sentiment.toUpperCase()}
                  </span>
                </div>

                <h4 className="font-black text-sm text-slate-900 hover:text-orange-600 transition-colors cursor-pointer">
                  {item.title}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.summary}</p>

                {item.relatedSymbols.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-500 font-bold">Related:</span>
                    {item.relatedSymbols.map(sym => (
                      <button
                        key={sym}
                        onClick={() => onSelectStock(sym)}
                        className="text-[10px] bg-white text-orange-700 border border-orange-200 hover:bg-orange-100 px-2 py-0.5 rounded-md font-bold transition-colors shadow-xs"
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
