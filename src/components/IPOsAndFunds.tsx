import React, { useState } from 'react';
import { 
  Layers, 
  Flame, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Award, 
  Calculator, 
  CheckCircle2, 
  PieChart,
  CalendarDays
} from 'lucide-react';
import { IPOCard, MutualFund, EarningsEvent, Stock, PortfolioPosition, WatchlistItem } from '../types/market';
import { EarningsCalendar } from './EarningsCalendar';

interface IPOsAndFundsProps {
  ipos: IPOCard[];
  mutualFunds: MutualFund[];
  earningsEvents?: EarningsEvent[];
  stocks?: Stock[];
  portfolio?: PortfolioPosition[];
  watchlist?: WatchlistItem[];
  onSelectStock?: (symbol: string) => void;
  defaultSubTab?: 'ipos' | 'mutual-funds' | 'sip-calc' | 'earnings';
}

export const IPOsAndFunds: React.FC<IPOsAndFundsProps> = ({
  ipos,
  mutualFunds,
  earningsEvents,
  stocks = [],
  portfolio = [],
  watchlist = [],
  onSelectStock,
  defaultSubTab
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ipos' | 'mutual-funds' | 'sip-calc' | 'earnings'>(defaultSubTab || 'ipos');

  // SIP Calculator State
  const [monthlySip, setMonthlySip] = useState(10000);
  const [expectedReturn, setExpectedReturn] = useState(15);
  const [years, setYears] = useState(10);

  // SIP Math Formula: M = P × ({[1 + i]^n - 1} / i) × (1 + i)
  const monthlyRate = expectedReturn / 12 / 100;
  const totalMonths = years * 12;
  const investedCapital = monthlySip * totalMonths;
  const maturityValue = Math.round(
    monthlySip *
      (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate))
  );
  const estimatedWealthGained = maturityValue - investedCapital;

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-orange-100 p-4 rounded-3xl shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center bg-orange-50 p-1.5 rounded-2xl border border-orange-200 text-xs font-bold gap-1">
          <button
            onClick={() => setActiveSubTab('ipos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'ipos' ? 'bg-orange-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-300" />
            IPO Tracker ({ipos.length})
          </button>

          <button
            onClick={() => setActiveSubTab('mutual-funds')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'mutual-funds' ? 'bg-orange-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Top Mutual Funds
          </button>

          <button
            onClick={() => setActiveSubTab('sip-calc')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'sip-calc' ? 'bg-orange-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4 text-emerald-300" />
            SIP Calculator
          </button>

          <button
            onClick={() => setActiveSubTab('earnings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'earnings' ? 'bg-orange-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-amber-300" />
            Earnings Calendar
          </button>
        </div>
      </div>

      {/* 1. IPO Tracker View */}
      {activeSubTab === 'ipos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ipos.map(ipo => (
            <div
              key={ipo.id}
              className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm space-y-4 hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black bg-orange-50 text-orange-800 px-2.5 py-0.5 rounded-full border border-orange-200 uppercase">
                    {ipo.category} IPO
                  </span>

                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                      ipo.status === 'ONGOING'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : ipo.status === 'UPCOMING'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    ● {ipo.status}
                  </span>
                </div>

                <h3 className="font-black text-slate-900 text-base mt-2">{ipo.companyName}</h3>
                <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {ipo.issueDates}
                </p>

                {/* GMP Box */}
                <div className="bg-orange-50/40 p-3.5 rounded-2xl border border-orange-100 my-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Grey Market Premium (GMP)</span>
                    <span className="text-emerald-700 font-black text-sm">+₹{ipo.gmpAmount} per share</span>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-900 font-black px-2.5 py-1 rounded-full border border-emerald-200">
                    +{ipo.gmpPercent}% Expected
                  </span>
                </div>

                {/* Key Details */}
                <div className="space-y-1.5 text-xs font-semibold">
                  <div className="flex justify-between text-slate-600">
                    <span>Price Band:</span>
                    <span className="text-slate-900 font-black">{ipo.priceBand}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Lot Size:</span>
                    <span className="text-slate-900 font-black">{ipo.lotSize} Shares</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Issue Size:</span>
                    <span className="text-slate-900 font-black">₹{ipo.issueSizeCr} Cr</span>
                  </div>
                </div>

                {/* Subscription Multiplier */}
                {ipo.subscription.overall > 0 && (
                  <div className="mt-3 pt-3 border-t border-orange-100">
                    <div className="flex justify-between text-xs font-black text-slate-800 mb-1">
                      <span>Total Subscription:</span>
                      <span className="text-orange-600">{ipo.subscription.overall}x</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-600 text-center font-bold">
                      <div className="bg-orange-50/50 p-1.5 rounded-xl border border-orange-100">
                        QIB: <span className="font-black text-slate-900">{ipo.subscription.qib}x</span>
                      </div>
                      <div className="bg-orange-50/50 p-1.5 rounded-xl border border-orange-100">
                        NII: <span className="font-black text-slate-900">{ipo.subscription.nii}x</span>
                      </div>
                      <div className="bg-orange-50/50 p-1.5 rounded-xl border border-orange-100">
                        Retail: <span className="font-black text-slate-900">{ipo.subscription.retail}x</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-orange-100">
                <button className="w-full bg-orange-50 hover:bg-orange-100 text-orange-900 font-black text-xs py-2.5 rounded-2xl border border-orange-200 transition-colors shadow-2xs">
                  Apply via UPI Broker →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Mutual Funds View */}
      {activeSubTab === 'mutual-funds' && (
        <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
          <div className="flex items-center justify-between border-b border-orange-100 pb-3">
            <h3 className="font-black text-slate-900 text-base">Top Performing Mutual Funds (Direct-Growth)</h3>
            <span className="text-xs font-bold text-slate-500">5-Star Rated Funds</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="bg-orange-50/50 text-slate-700 border-b border-orange-100 uppercase text-[10px] font-black">
                  <th className="py-2.5 px-3">Fund Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">NAV (₹)</th>
                  <th className="py-2.5 px-3 text-right">3Y CAGR</th>
                  <th className="py-2.5 px-3 text-right">5Y CAGR</th>
                  <th className="py-2.5 px-3 text-right">AUM (Cr)</th>
                  <th className="py-2.5 px-3 text-right">Min SIP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mutualFunds.map(mf => (
                  <tr key={mf.id} className="hover:bg-orange-50/40 transition-colors">
                    <td className="py-3.5 px-3 font-extrabold text-slate-900">
                      <div>{mf.name}</div>
                      <div className="text-[10px] text-slate-500 font-medium">Manager: {mf.fundManager}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="text-[10px] bg-orange-50 text-orange-800 font-extrabold px-2.5 py-0.5 rounded-full border border-orange-200">
                        {mf.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right font-black text-slate-900">₹{mf.nav.toFixed(2)}</td>
                    <td className="py-3.5 px-3 text-right font-black text-emerald-700">+{mf.cagr3Y}%</td>
                    <td className="py-3.5 px-3 text-right font-black text-emerald-700">+{mf.cagr5Y}%</td>
                    <td className="py-3.5 px-3 text-right text-slate-800 font-bold">₹{mf.aumCr.toLocaleString('en-IN')} Cr</td>
                    <td className="py-3.5 px-3 text-right font-black text-orange-600">₹{mf.minSipAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SIP Calculator View */}
      {activeSubTab === 'sip-calc' && (
        <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-6">
          <div className="flex items-center gap-2 border-b border-orange-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <h3 className="font-black text-slate-900 text-base">Systematic Investment Plan (SIP) Calculator</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Controls */}
            <div className="space-y-5 text-xs font-semibold">
              {/* Monthly SIP Amount */}
              <div>
                <div className="flex justify-between font-extrabold text-slate-700 mb-2">
                  <span>Monthly Investment:</span>
                  <span className="text-orange-600 text-sm font-black">₹{monthlySip.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={100000}
                  step={500}
                  value={monthlySip}
                  onChange={e => setMonthlySip(Number(e.target.value))}
                  className="w-full accent-orange-600 cursor-pointer"
                />
              </div>

              {/* Expected Return Rate */}
              <div>
                <div className="flex justify-between font-extrabold text-slate-700 mb-2">
                  <span>Expected Annual Return Rate (CAGR):</span>
                  <span className="text-emerald-700 text-sm font-black">{expectedReturn}%</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={25}
                  step={0.5}
                  value={expectedReturn}
                  onChange={e => setExpectedReturn(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Investment Period */}
              <div>
                <div className="flex justify-between font-extrabold text-slate-700 mb-2">
                  <span>Time Period (Years):</span>
                  <span className="text-amber-700 text-sm font-black">{years} Years</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={years}
                  onChange={e => setYears(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Results Output */}
            <div className="bg-orange-50/40 p-6 rounded-3xl border border-orange-100 flex flex-col justify-between space-y-4">
              <div className="space-y-4 text-xs font-semibold">
                <div>
                  <span className="text-slate-500 font-bold block mb-1">Total Invested Amount:</span>
                  <span className="text-slate-900 font-black text-lg">₹{investedCapital.toLocaleString('en-IN')}</span>
                </div>

                <div>
                  <span className="text-slate-500 font-bold block mb-1">Estimated Wealth Gained:</span>
                  <span className="text-emerald-700 font-black text-lg">+₹{estimatedWealthGained.toLocaleString('en-IN')}</span>
                </div>

                <div className="pt-2 border-t border-orange-200">
                  <span className="text-slate-500 font-bold block mb-1">Total Expected Maturity Value:</span>
                  <span className="text-orange-600 font-black text-2xl">₹{maturityValue.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Progress bar ratio */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-black text-slate-600">
                  <span>Invested ({Math.round((investedCapital / maturityValue) * 100)}%)</span>
                  <span className="text-emerald-700">Wealth Growth ({Math.round((estimatedWealthGained / maturityValue) * 100)}%)</span>
                </div>
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex border border-slate-300">
                  <div className="bg-slate-500 h-full" style={{ width: `${(investedCapital / maturityValue) * 100}%` }}></div>
                  <div className="bg-emerald-600 h-full" style={{ width: `${(estimatedWealthGained / maturityValue) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Corporate Earnings Calendar View */}
      {activeSubTab === 'earnings' && (
        <EarningsCalendar
          earningsEvents={earningsEvents}
          stocks={stocks}
          portfolio={portfolio}
          watchlist={watchlist}
          onSelectStock={onSelectStock}
        />
      )}
    </div>
  );
};
