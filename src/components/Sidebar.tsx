import React from 'react';
import {
  BarChart3,
  Filter,
  Activity,
  Bot,
  Briefcase,
  Layers,
  Gift,
  Newspaper,
  Wallet,
  Sparkles,
  Compass,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  X,
  LineChart,
  Bell
} from 'lucide-react';
import { UserProfile } from './GoogleAuthModal';
import { useLanguage } from '../context/LanguageContext';

export interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  user: UserProfile | null;
  isSubscribed: boolean;
  onOpenSubscription: () => void;
  onOpenAppTour?: () => void;
  portfolioCount?: number;
  watchlistCount?: number;
  alertsCount?: number;
  onOpenAlerts?: () => void;
}

interface NavItem {
  id: string;
  labelKey: string;
  fallbackLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  category: 'core' | 'intelligence' | 'opportunities' | 'admin';
  adminOnly?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  user,
  isSubscribed,
  onOpenSubscription,
  onOpenAppTour,
  portfolioCount = 0,
  watchlistCount = 0,
  alertsCount = 0,
  onOpenAlerts,
}) => {
  const { t } = useLanguage();
  const isAdmin = user?.email?.toLowerCase() === 'shankaraazrahi@gmail.com';
  const hasFullAccess = isAdmin || isSubscribed;

  const navItems: NavItem[] = [
    // Core Markets
    {
      id: 'overview',
      labelKey: 'marketOverview',
      fallbackLabel: 'Market Overview',
      description: 'Indices, Heatmap & Breadth',
      icon: BarChart3,
      badge: 'Live',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      category: 'core',
    },
    {
      id: 'screener',
      labelKey: 'stockScreener',
      fallbackLabel: 'Stock Screener',
      description: '1,000+ Metrics & Presets',
      icon: Filter,
      category: 'core',
    },
    {
      id: 'detail',
      labelKey: 'chartsFinancials',
      fallbackLabel: 'Charts & Financials',
      description: 'Technicals & Balance Sheet',
      icon: Activity,
      category: 'core',
    },

    // Intelligence & Portfolios
    {
      id: 'ai',
      labelKey: 'geminiAnalyst',
      fallbackLabel: 'Gemini AI Analyst',
      description: 'Live Research & Stock Thesis',
      icon: Bot,
      badge: 'AI',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 font-black',
      category: 'intelligence',
    },
    {
      id: 'portfolio',
      labelKey: 'portfolioWatchlist',
      fallbackLabel: 'Portfolio & Watchlist',
      description: 'P&L, Capital Gains & Export',
      icon: Briefcase,
      badge: portfolioCount > 0 ? `${portfolioCount}` : undefined,
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
      category: 'intelligence',
    },

    // Opportunities & Corporate Actions
    {
      id: 'ipos-funds',
      labelKey: 'iposMutualFunds',
      fallbackLabel: 'IPOs & Mutual Funds',
      description: 'Grey Market GMP & Top NAVs',
      icon: Layers,
      badge: 'GMP',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      category: 'opportunities',
    },
    {
      id: 'bonus',
      labelKey: 'bonusActions',
      fallbackLabel: 'Bonus & Dividends',
      description: 'Splits, Buybacks & Rights',
      icon: Gift,
      badge: 'Bonus',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      category: 'opportunities',
    },
    {
      id: 'news',
      labelKey: 'marketNews',
      fallbackLabel: 'Market News Wire',
      description: 'RBI Policy & Earnings Live',
      icon: Newspaper,
      category: 'opportunities',
    },

    // Admin Only
    {
      id: 'admin-revenue',
      labelKey: 'adminRevenue',
      fallbackLabel: 'Admin Revenue',
      description: 'Bank Payouts & Invoices',
      icon: Wallet,
      badge: 'Admin',
      badgeColor: 'bg-emerald-600 text-white font-bold',
      category: 'admin',
      adminOnly: true,
    },
  ];

  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin);

  const handleItemClick = (id: string) => {
    setActiveTab(id);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed bottom-0 left-0 z-40 bg-white border-r border-orange-100/90 shadow-lg md:shadow-none transition-all duration-300 flex flex-col justify-between ${
          isMobileOpen
            ? 'top-0 translate-x-0 w-72 z-50'
            : '-translate-x-full md:translate-x-0 md:top-[138px]'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'} ${isMobileOpen ? 'h-full' : 'md:h-[calc(100vh-138px)]'}`}
      >
        {/* Top Control Header in Sidebar */}
        <div>
          {/* Mobile Only: Top Branding Header with Close Button */}
          {isMobileOpen && (
            <div className="h-16 px-4 border-b border-orange-100/80 flex items-center justify-between bg-gradient-to-r from-orange-50/80 via-white to-orange-50/40 md:hidden">
              <div
                onClick={() => handleItemClick('overview')}
                className="flex items-center gap-3 cursor-pointer group overflow-hidden"
              >
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-emerald-500 flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-900 text-base tracking-tight">
                      Mera<span className="text-orange-600">Bazaar</span>
                    </span>
                    <span className="text-[9px] bg-orange-100 text-orange-800 font-extrabold px-1.5 py-0.5 rounded-md border border-orange-200">
                      PRO
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold truncate">Stock Screener & AI</p>
                </div>
              </div>

              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-orange-50 rounded-xl transition-colors"
                title="Close Navigation Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Desktop Top Mini-Header: Clean Collapse/Expand Controls */}
          <div className="hidden md:flex items-center justify-between px-3.5 py-2.5 border-b border-orange-100/60 bg-orange-50/30">
            {!isCollapsed ? (
              <>
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-orange-600" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Explore Segments
                  </span>
                </div>
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="p-1 text-slate-400 hover:text-orange-600 hover:bg-orange-100/70 rounded-lg transition-colors"
                  title="Collapse Sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsCollapsed(false)}
                className="w-full flex items-center justify-center p-1 text-slate-400 hover:text-orange-600 hover:bg-orange-100/70 rounded-lg transition-colors"
                title="Expand Sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Navigation Items List */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-270px)] scrollbar-none">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const label = t(item.labelKey) || item.fallbackLabel;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  title={isCollapsed ? `${label} - ${item.description}` : undefined}
                  className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-2xl font-bold text-xs transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-orange-50/70 active:scale-[0.98]'
                  } ${isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''}`}
                >
                  {/* Icon with styled background/glow */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100/80 text-slate-700 group-hover:bg-orange-100 group-hover:text-orange-600 group-hover:scale-105'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Text & Badge (When Expanded) */}
                  {(!isCollapsed || isMobileOpen) && (
                    <div className="flex-1 text-left truncate flex items-center justify-between">
                      <div className="truncate">
                        <span className={`block truncate ${isActive ? 'text-white font-extrabold' : 'text-slate-800'}`}>
                          {label}
                        </span>
                        <span
                          className={`text-[10px] block truncate font-medium ${
                            isActive ? 'text-orange-100' : 'text-slate-400 group-hover:text-slate-500'
                          }`}
                        >
                          {item.description}
                        </span>
                      </div>

                      {item.badge && (
                        <span
                          className={`ml-2 text-[9px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${
                            isActive
                              ? 'bg-white/25 text-white border-white/30'
                              : item.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tooltip on Collapsed Desktop View */}
                  {isCollapsed && !isMobileOpen && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-[11px] font-semibold rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-xl">
                      <div className="font-bold">{label}</div>
                      <div className="text-[10px] text-slate-300 font-normal">{item.description}</div>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Status / Pro Card / Quick Action */}
        <div className="p-3 border-t border-orange-100/80 bg-slate-50/50 space-y-2">
          {/* Price Alerts Trigger */}
          {onOpenAlerts && (
            <button
              onClick={onOpenAlerts}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-orange-950 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-all ${
                isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''
              }`}
              title="Stock Price Alerts & Thresholds"
            >
              <Bell className="w-4 h-4 text-orange-600 shrink-0" />
              {(!isCollapsed || isMobileOpen) && (
                <div className="flex items-center justify-between w-full">
                  <span className="truncate">Price Alerts</span>
                  {alertsCount > 0 && (
                    <span className="text-[10px] bg-orange-600 text-white font-black px-1.5 py-0.2 rounded-full">
                      {alertsCount}
                    </span>
                  )}
                </div>
              )}
            </button>
          )}

          {/* Guided Tour Trigger */}
          {onOpenAppTour && (
            <button
              onClick={onOpenAppTour}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all ${
                isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''
              }`}
              title="Launch App Tour Walkthrough"
            >
              <Compass className="w-4 h-4 text-orange-600 shrink-0 animate-spin-slow" />
              {(!isCollapsed || isMobileOpen) && (
                <span className="truncate">Guided App Tour</span>
              )}
            </button>
          )}

          {/* Pro Status or Upgrade CTA */}
          {(!isCollapsed || isMobileOpen) ? (
            <div
              onClick={onOpenSubscription}
              className={`p-3 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] ${
                isAdmin
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : hasFullAccess
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-gradient-to-br from-orange-500 to-amber-600 text-white border-transparent shadow-md shadow-orange-500/20'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    hasFullAccess ? 'bg-white/60' : 'bg-white/20'
                  }`}>
                    {isAdmin ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    )}
                  </div>
                  <span className="font-extrabold text-[11px] truncate">
                    {isAdmin ? 'Admin Full Access' : hasFullAccess ? 'Pro Member Active' : 'Upgrade to Pro'}
                  </span>
                </div>
                {!hasFullAccess && (
                  <span className="text-[9px] bg-white/25 px-1.5 py-0.5 rounded font-black">₹99/M</span>
                )}
              </div>
              <p className={`text-[10px] mt-1 line-clamp-1 font-medium ${hasFullAccess ? 'text-slate-600' : 'text-orange-100'}`}>
                {isAdmin
                  ? 'shankaraazrahi@gmail.com'
                  : hasFullAccess
                  ? 'Unlimited AI & Analytics'
                  : 'Unlock All Segments'}
              </p>
            </div>
          ) : (
            <button
              onClick={onOpenSubscription}
              className="w-full flex items-center justify-center p-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              title="MeraBazaar Pro Access"
            >
              <Zap className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
