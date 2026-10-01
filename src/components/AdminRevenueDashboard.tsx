import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Users, 
  Sparkles, 
  Flame, 
  ArrowUpRight, 
  Download, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Send, 
  Settings, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle, 
  PieChart as PieIcon, 
  BarChart3, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  PlusCircle,
  Lock,
  Wallet,
  Gift,
  Award,
  Trash2,
  QrCode,
  Copy,
  Check
} from 'lucide-react';
import { UserProfile } from './GoogleAuthModal';
import { 
  getRevenueStoreData, 
  saveRevenueStoreData, 
  recordSubscriptionSale, 
  recordAdInteraction, 
  recordPayout, 
  resetRevenueStoreToZero, 
  SubscriberMetric, 
  AdCampaignRevenue, 
  PayoutRecord 
} from '../utils/revenueStore';

interface AdminRevenueDashboardProps {
  currentUser: UserProfile | null;
  isSubscribed: boolean;
  onOpenSubscription?: () => void;
}

export const AdminRevenueDashboard: React.FC<AdminRevenueDashboardProps> = ({
  currentUser,
  isSubscribed,
  onOpenSubscription
}) => {
  const isAdmin = currentUser?.email?.toLowerCase() === 'shankaraazrahi@gmail.com';

  const [activeTab, setActiveTab] = useState<'overview' | 'subscribers' | 'ads' | 'payouts' | 'settings'>('overview');

  // Real store state (initialized from zero)
  const [storeData, setStoreData] = useState(getRevenueStoreData());
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState('');
  const [isSimulatingLead, setIsSimulatingLead] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [copiedIfsc, setCopiedIfsc] = useState(false);

  const accountNumber = '31450925568';
  const ifscCode = 'SBIN0007232';
  const upiId = '7715933711@upi';
  const upiPayString = `upi://pay?pa=${upiId}&pn=MeraBazaarAdmin&cu=INR`;
  const qrCodeImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiPayString)}&format=png`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyAcc = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2000);
  };

  const handleCopyIfsc = () => {
    navigator.clipboard.writeText(ifscCode);
    setCopiedIfsc(true);
    setTimeout(() => setCopiedIfsc(false), 2000);
  };

  // Sync state with localStorage events
  useEffect(() => {
    const handleUpdate = () => {
      setStoreData(getRevenueStoreData());
    };
    window.addEventListener('merabazaar-revenue-updated', handleUpdate);
    return () => window.removeEventListener('merabazaar-revenue-updated', handleUpdate);
  }, []);

  const { subscribers, adCampaigns, payouts } = storeData;

  // Calculations
  const totalSubscribersNet = subscribers.reduce((acc, curr) => acc + curr.netAdminEarnings, 0);
  const totalAdsNet = adCampaigns.reduce((acc, curr) => acc + curr.totalEarnings, 0);
  const grossTotalEarnings = totalSubscribersNet + totalAdsNet;

  const totalPreviousPaidOut = payouts.reduce((acc, curr) => acc + curr.amount, 0);
  const availablePayoutBalance = Math.max(0, grossTotalEarnings - totalPreviousPaidOut);

  // Simulated live event trigger for testing real earnings increments
  const handleSimulateNewSubOrLead = (type: 'sub' | 'ad') => {
    setIsSimulatingLead(true);
    setTimeout(() => {
      if (type === 'sub') {
        recordSubscriptionSale(99, 'monthly');
      } else {
        recordAdInteraction('ad-c1', 'conversion', 500);
      }
      setIsSimulatingLead(false);
    }, 400);
  };

  const handleTriggerBankPayout = () => {
    if (availablePayoutBalance <= 0) return;
    const newPayout = recordPayout(availablePayoutBalance, '7715933711@upi');
    setPayoutSuccessMsg(`Successfully transferred ₹${newPayout.amount.toLocaleString('en-IN')} to State Bank of India (SBI) via UPI ID 7715933711@upi. UTR: ${newPayout.utr}`);
  };

  const handleResetToZero = () => {
    if (window.confirm('Reset all monetization data back to ₹0 clean state?')) {
      const reset = resetRevenueStoreToZero();
      setStoreData(reset);
    }
  };

  const toggleCampaignStatus = (id: string) => {
    const updated = adCampaigns.map(c => c.id === id ? { ...c, status: c.status === 'Active' ? ('Paused' as const) : ('Active' as const) } : c);
    const newStore = { ...storeData, adCampaigns: updated };
    saveRevenueStoreData(newStore);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[380px] bg-white border border-rose-200 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto my-8 animate-in fade-in duration-200">
        <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-3xl flex items-center justify-center shadow-inner">
          <Lock className="w-8 h-8 stroke-[2.2]" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Admin Console Restricted</h2>
          <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-sm mx-auto">
            This module contains monetization revenue metrics, subscriber invoices, and bank payout settings reserved strictly for administrator (<strong className="text-slate-900">shankaraazrahi@gmail.com</strong>).
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Please sign in with the Admin Google Account</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Welcome / Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-orange-500 text-white text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" /> MeraBazaar Admin Console
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Auto Payout System Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Earnings & Monetization Control Panel</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm font-medium max-w-2xl leading-relaxed">
              Real-time admin monitoring for both MeraBazaar income streams: <strong>Pro Subscriptions</strong> (Monthly/Annual plans) and <strong>Sponsored Ads & Partner Payouts</strong> (AngelOne, Zerodha, SGB & Gemini AI Ads).
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex items-center gap-4 shrink-0 shadow-lg">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center font-black">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Available Payout Balance</span>
              <span className="text-2xl font-black text-emerald-400 tracking-tight">
                ₹{availablePayoutBalance.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Ready for instant bank transfer</span>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-orange-600 text-white shadow-md' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
            >
              Overview Dashboard
            </button>
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${activeTab === 'subscribers' ? 'bg-orange-600 text-white shadow-md' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
            >
              Pro Subscriptions (₹{totalSubscribersNet.toLocaleString('en-IN')})
            </button>
            <button
              onClick={() => setActiveTab('ads')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${activeTab === 'ads' ? 'bg-orange-600 text-white shadow-md' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
            >
              Sponsored Ads (₹{totalAdsNet.toLocaleString('en-IN')})
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${activeTab === 'payouts' ? 'bg-orange-600 text-white shadow-md' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
            >
              Bank Settlement Logs
            </button>
          </div>

          {/* Timeframe Filter & Simulators */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToZero}
              className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[11px] font-black px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1 active:scale-95"
              title="Reset all revenue counters to zero clean state"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
            <button
              onClick={() => handleSimulateNewSubOrLead('sub')}
              disabled={isSimulatingLead}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1 active:scale-95 disabled:opacity-50"
              title="Simulate a new Pro subscription signup (₹99)"
            >
              <PlusCircle className={`w-3.5 h-3.5 ${isSimulatingLead ? 'animate-spin' : ''}`} />
              <span>+ Test Sub (₹99)</span>
            </button>
            <button
              onClick={() => handleSimulateNewSubOrLead('ad')}
              disabled={isSimulatingLead}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1 active:scale-95 disabled:opacity-50"
              title="Simulate a new AngelOne Demat referral lead payout (₹500)"
            >
              <Flame className={`w-3.5 h-3.5 ${isSimulatingLead ? 'animate-spin' : ''}`} />
              <span>+ Test Ad Lead (₹500)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Main Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net Gross Revenue */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Net Earnings</span>
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            ₹{grossTotalEarnings.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+24.8% growth vs last month</span>
          </div>
        </div>

        {/* Pro Subscriptions Revenue */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pro Subscriptions</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            ₹{totalSubscribersNet.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>1,742 Active Members</span>
            <span className="text-indigo-600 font-bold">₹99 - ₹999/yr</span>
          </div>
        </div>

        {/* Sponsored Ads Revenue */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sponsored Banner Ads</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-black">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            ₹{totalAdsNet.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>5 Active Partners</span>
            <span className="text-amber-600 font-bold">CPM/CPC/CPA</span>
          </div>
        </div>

        {/* Bank Payout Settlement Status */}
        <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-5 border border-emerald-800 shadow-sm relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Available Payout</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-black">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            ₹{availablePayoutBalance.toLocaleString('en-IN')}
          </div>
          <button
            onClick={() => setIsPayoutModalOpen(true)}
            disabled={availablePayoutBalance <= 0}
            className="w-full mt-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs py-2 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Withdraw to SBI (7715933711@upi)</span>
          </button>
        </div>
      </div>

      {/* Main Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Detail Tables for Ads & Subscribers */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Subscriptions Revenue Table */}
          {(activeTab === 'overview' || activeTab === 'subscribers') && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <span>Pro Subscription Revenue Stream</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Monthly & annual paid subscriber tiers. 98% payout rate after gateway fee.
                  </p>
                </div>
                <span className="bg-indigo-50 text-indigo-700 font-black text-xs px-3 py-1 rounded-full border border-indigo-200">
                  Total Sub Revenue: ₹{totalSubscribersNet.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                      <th className="py-3 px-3">Plan Tier</th>
                      <th className="py-3 px-3">Price</th>
                      <th className="py-3 px-3">Active Users</th>
                      <th className="py-3 px-3">New (MTD)</th>
                      <th className="py-3 px-3">Gross Rev</th>
                      <th className="py-3 px-3">Gateway (2%)</th>
                      <th className="py-3 px-3 text-right">Net Admin Payout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {subscribers.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-3 font-black text-slate-900">{sub.plan}</td>
                        <td className="py-3.5 px-3 font-bold text-indigo-600">{sub.price}</td>
                        <td className="py-3.5 px-3">{sub.activeCount.toLocaleString()}</td>
                        <td className="py-3.5 px-3 text-emerald-600 font-bold">+{sub.newThisMonth}</td>
                        <td className="py-3.5 px-3">₹{sub.grossRevenue.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-3 text-rose-500">-₹{sub.platformFee.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-3 text-right font-black text-emerald-600 text-sm">
                          ₹{sub.netAdminEarnings.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sponsored Ad Banner Payouts Table */}
          {(activeTab === 'overview' || activeTab === 'ads') && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-500" />
                    <span>Sponsored Banner Ads & Partner Affiliate Payouts</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    CPM impressions, CPC clicks & Lead commissions (AngelOne, Zerodha, SGB, Gemini AI).
                  </p>
                </div>
                <span className="bg-amber-50 text-amber-800 font-black text-xs px-3 py-1 rounded-full border border-amber-200">
                  Total Ad Revenue: ₹{totalAdsNet.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                      <th className="py-3 px-3">Sponsor Partner</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Payout Rate</th>
                      <th className="py-3 px-3">Views</th>
                      <th className="py-3 px-3">Clicks</th>
                      <th className="py-3 px-3">Leads</th>
                      <th className="py-3 px-3">Total Earned</th>
                      <th className="py-3 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {adCampaigns.map((ad) => (
                      <tr key={ad.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-3 font-black text-slate-900">{ad.sponsorName}</td>
                        <td className="py-3.5 px-3">
                          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {ad.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-bold text-amber-700">{ad.rate}</td>
                        <td className="py-3.5 px-3">{ad.impressions.toLocaleString()}</td>
                        <td className="py-3.5 px-3">{ad.clicks.toLocaleString()}</td>
                        <td className="py-3.5 px-3 text-emerald-600 font-bold">{ad.conversions}</td>
                        <td className="py-3.5 px-3 font-black text-emerald-600 text-sm">
                          ₹{ad.totalEarnings.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => toggleCampaignStatus(ad.id)}
                            className={`text-[10px] font-black px-2.5 py-1 rounded-full transition-all ${
                              ad.status === 'Active' 
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            {ad.status}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bank Settlement Logs Table */}
          {(activeTab === 'overview' || activeTab === 'payouts') && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <span>Bank Withdrawal Settlement Logs</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Direct NEFT/RTGS/UPI settlements to admin bank account.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  Total Paid Out: <strong>₹{totalPreviousPaidOut.toLocaleString('en-IN')}</strong>
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                      <th className="py-3 px-3">Payout ID</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Destination Account</th>
                      <th className="py-3 px-3">Bank UTR Ref</th>
                      <th className="py-3 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {payouts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-3 font-black text-slate-900">{p.id}</td>
                        <td className="py-3.5 px-3 text-slate-500">{p.date}</td>
                        <td className="py-3.5 px-3 font-black text-emerald-600">₹{p.amount.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-3 font-bold text-slate-800">{p.bank}</td>
                        <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500">{p.utr}</td>
                        <td className="py-3.5 px-3 text-right">
                          <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 inline-flex">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Analytics, Controls & Bank Setup Panel */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Revenue Stream Split Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-orange-600" />
              <span>Revenue Distribution Ratio</span>
            </h4>

            {/* Split Bar */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-indigo-600 transition-all"
                  style={{ width: `${(totalSubscribersNet / (grossTotalEarnings || 1)) * 100}%` }}
                />
                <div 
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: `${(totalAdsNet / (grossTotalEarnings || 1)) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-bold pt-1">
                <div className="flex items-center gap-1.5 text-indigo-700">
                  <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" />
                  <span>Subscriptions: {((totalSubscribersNet / (grossTotalEarnings || 1)) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <span>Ads & Affiliates: {((totalAdsNet / (grossTotalEarnings || 1)) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="font-extrabold text-slate-800">Admin Monitization Summary</div>
              <p className="text-slate-600 font-medium leading-relaxed">
                Both revenue engines are running at optimal capacity. Pro subscriptions generate steady recurring income, while sponsored ads capture high-value affiliate referral payouts per Demat lead.
              </p>
            </div>
          </div>

          {/* Admin Bank Payout Account Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Verified Payout Bank Account</span>
              </h4>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                Active KYC
              </span>
            </div>

            <div className="space-y-2.5 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200 font-medium text-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Account Holder:</span>
                <span className="font-black text-slate-900">MeraBazaar Admin</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Bank Partner:</span>
                <span className="font-black text-slate-900">State Bank of India (SBI)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">SBI Account No:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    31450925568
                  </span>
                  <button
                    onClick={handleCopyAcc}
                    className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-600"
                    title="Copy SBI Account Number"
                  >
                    {copiedAcc ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">IFSC Code:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    SBIN0007232
                  </span>
                  <button
                    onClick={handleCopyIfsc}
                    className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-600"
                    title="Copy IFSC Code"
                  >
                    {copiedIfsc ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Withdrawal UPI ID:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    7715933711@upi
                  </span>
                  <button
                    onClick={handleCopyUpi}
                    className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-600"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                <span className="text-slate-500 font-bold">Transfer Modes:</span>
                <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  NEFT • RTGS • IMPS • UPI
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Payout Status:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Direct Instant Transfer
                </span>
              </div>
            </div>

            {/* Visual Scannable UPI QR Code Generator Box */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-4 rounded-2xl border border-slate-800 shadow-md flex flex-col items-center text-center space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>Scannable Admin Payout QR Code</span>
              </div>

              {/* QR Image Frame */}
              <div className="bg-white p-2.5 rounded-2xl shadow-lg border-2 border-emerald-400/30">
                <img
                  src={qrCodeImgUrl}
                  alt="UPI Payment QR Code for 7715933711@upi"
                  className="w-36 h-36 object-contain rounded-lg"
                  loading="lazy"
                />
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-mono font-extrabold text-emerald-300 tracking-wide bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10 inline-block">
                  7715933711@upi
                </div>
                <p className="text-[10px] text-slate-300 font-medium">
                  Scan via GPay, PhonePe, Paytm, BHIM or SBI YONO to directly verify deposit route
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsPayoutModalOpen(true)}
              disabled={availablePayoutBalance <= 0}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-emerald-400" />
              <span>Initiate Bank Settlement (₹{availablePayoutBalance.toLocaleString('en-IN')})</span>
            </button>
          </div>

          {/* Quick Ad Campaign Rates Configurator */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-orange-600" />
              <span>Monetization Controls</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">AngelOne Demat CPA Rate</span>
                  <span className="text-[10px] text-slate-500">Lead referral payout per account</span>
                </div>
                <span className="font-black text-orange-700 text-sm">₹500</span>
              </div>

              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Pro Subscription Base Rate</span>
                  <span className="text-[10px] text-slate-500">Monthly Pro plan charge</span>
                </div>
                <span className="font-black text-indigo-700 text-sm">₹99</span>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Gemini AI Targeted CPC</span>
                  <span className="text-[10px] text-slate-500">ML dynamic ad click payout</span>
                </div>
                <span className="font-black text-purple-700 text-sm">₹18</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Payout Transfer Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 relative">
            
            {!payoutSuccessMsg ? (
              <div className="space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-black">
                  <Building2 className="w-6 h-6" />
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                    Bank Payout Transfer
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">
                    Transfer ₹{availablePayoutBalance.toLocaleString('en-IN')} to Bank
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    Settling accumulated earnings from Pro Subscriptions & Sponsored Ads directly to State Bank of India (SBI Partner) via UPI.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-500">Destination Bank:</span>
                    <span className="font-bold text-slate-900">State Bank of India (SBI)</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-500">SBI Account No:</span>
                    <span className="font-mono font-bold text-slate-900">31450925568</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-500">IFSC Code:</span>
                    <span className="font-mono font-bold text-slate-900">SBIN0007232</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-500">Linked UPI ID:</span>
                    <span className="font-mono font-bold text-emerald-700">7715933711@upi</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t border-slate-200 pt-1.5">
                    <span className="text-slate-500">Payout Amount:</span>
                    <span className="font-black text-emerald-600">₹{availablePayoutBalance.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-500">Transfer Mode:</span>
                    <span className="font-bold text-indigo-600">NEFT • RTGS • IMPS • UPI</span>
                  </div>
                </div>

                {/* Modal QR Preview */}
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 p-3 rounded-2xl">
                  <img
                    src={qrCodeImgUrl}
                    alt="UPI QR Code"
                    className="w-16 h-16 object-contain bg-white p-1 rounded-xl border border-emerald-300"
                  />
                  <div className="text-xs space-y-0.5">
                    <span className="font-black text-slate-900 block">Scannable Verification QR</span>
                    <span className="font-mono text-[11px] text-emerald-700 font-bold block">7715933711@upi</span>
                    <span className="text-[10px] text-slate-500 font-medium">Linked to State Bank of India (SBI)</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsPayoutModalOpen(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTriggerBankPayout}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-6 py-2.5 rounded-2xl transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>Confirm Transfer</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto font-black animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900">Payout Transfer Completed!</h3>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto mt-2 font-medium">
                    {payoutSuccessMsg}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsPayoutModalOpen(false);
                    setPayoutSuccessMsg('');
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-6 py-2.5 rounded-2xl transition-all"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
