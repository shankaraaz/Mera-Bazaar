import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Globe, 
  RefreshCw, 
  ExternalLink, 
  Zap, 
  Tag, 
  Sparkles, 
  Filter,
  Clock,
  Building2,
  X
} from 'lucide-react';
import { MarketNews, Stock } from '../types/market';
import { useLanguage } from '../context/LanguageContext';

interface MarketNewsSegmentProps {
  news: MarketNews[];
  stocks: Stock[];
  onSelectStock: (symbol: string) => void;
}

export const MarketNewsSegment: React.FC<MarketNewsSegmentProps> = ({
  news,
  stocks,
  onSelectStock,
}) => {
  const { t, getTranslatedNews } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [liveNewsList, setLiveNewsList] = useState<MarketNews[]>(news);
  const [isFetchingLive, setIsFetchingLive] = useState<boolean>(false);
  const [selectedNewsDetail, setSelectedNewsDetail] = useState<MarketNews | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');


  // Sync prop news if changed
  useEffect(() => {
    setLiveNewsList(news);
  }, [news]);

  // Fetch real-time Finnhub news from server endpoint
  const handleFetchLiveNews = async () => {
    setIsFetchingLive(true);
    try {
      const res = await fetch('/api/finnhub/news');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // Map finnhub raw items if needed
        const mapped: MarketNews[] = data.map((item: any, idx: number) => {
          if (item.title && item.id) return item; // already formatted
          return {
            id: `finnhub-${item.id || idx}`,
            title: item.headline || item.title || 'Market Update',
            source: item.source || 'Finnhub Live',
            timeAgo: item.datetime ? new Date(item.datetime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live',
            category: item.category === 'technology' ? 'Stock News' : 'Global',
            sentiment: (item.headline || '').toLowerCase().includes('surge') || (item.headline || '').toLowerCase().includes('gain') ? 'Bullish' : 'Neutral',
            relatedSymbols: item.related ? [item.related] : ['NIFTY50'],
            summary: item.summary || 'Real-time market feed from global exchanges and news desks.',
            url: item.url
          };
        });

        // Merge without duplicates
        setLiveNewsList(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newItems = mapped.filter(m => !existingIds.has(m.id));
          return [...newItems, ...prev];
        });
        setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err) {
      console.error('Error fetching live news feed', err);
    } finally {
      setIsFetchingLive(false);
    }
  };

  // Filtered News items
  const filteredNews = liveNewsList.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSentiment = selectedSentiment === 'All' || item.sentiment === selectedSentiment;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery = !q || 
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.source.toLowerCase().includes(q) ||
      item.relatedSymbols.some(s => s.toLowerCase().includes(q));

    return matchesCategory && matchesSentiment && matchesQuery;
  });

  // Sentiment counts
  const bullishCount = liveNewsList.filter(n => n.sentiment === 'Bullish').length;
  const bearishCount = liveNewsList.filter(n => n.sentiment === 'Bearish').length;
  const neutralCount = liveNewsList.filter(n => n.sentiment === 'Neutral').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-zinc-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold border border-orange-500/30">
              <Newspaper className="w-3.5 h-3.5" />
              <span>{t('newsTitle')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t('newsTitle')}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-medium">
              {t('newsSubtitle')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
            <button
              onClick={handleFetchLiveNews}
              disabled={isFetchingLive}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isFetchingLive ? 'animate-spin' : ''}`} />
              <span>{isFetchingLive ? t('syncingNews') : t('fetchLiveNews')}</span>
            </button>
            <div className="text-[11px] text-slate-400 font-semibold text-center md:text-right">
              Updated: <span className="text-slate-200">{lastUpdated}</span>
            </div>
          </div>
        </div>

        {/* Market Sentiment Stats Bar */}
        <div className="mt-6 pt-6 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            <div className="text-[10px] text-slate-400 font-bold uppercase">{t('totalArticles')}</div>
            <div className="text-lg font-black text-white mt-0.5">{liveNewsList.length}</div>
          </div>
          <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-800/50">
            <div className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {t('bullishDrivers')}
            </div>
            <div className="text-lg font-black text-emerald-300 mt-0.5">{bullishCount}</div>
          </div>
          <div className="bg-rose-950/40 p-3 rounded-2xl border border-rose-800/50">
            <div className="text-[10px] text-rose-400 font-bold uppercase flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> {t('bearishDrivers')}
            </div>
            <div className="text-lg font-black text-rose-300 mt-0.5">{bearishCount}</div>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
              <Minus className="w-3 h-3" /> {t('neutralPolicy')}
            </div>
            <div className="text-lg font-black text-slate-200 mt-0.5">{neutralCount}</div>
          </div>
        </div>
      </div>

      {/* Gemini AI Daily Market Pulse Summary */}
      <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border border-orange-200 rounded-3xl p-5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-black text-orange-900 uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-orange-600 animate-pulse" />
          <span>{t('geminiPulseTitle')}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium text-slate-700 mt-3">
          <div className="bg-white p-3.5 rounded-2xl border border-orange-100 flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <div>
              <strong className="text-slate-900 font-bold block mb-0.5">Vedanta Demerger & Metals Surge</strong>
              Vedanta board approval for 6 listed entities unlocks value in Zinc and Aluminium businesses; Metal index up +2.4%.
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-orange-100 flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <div>
              <strong className="text-slate-900 font-bold block mb-0.5">RBI Repo Status Quo at 6.50%</strong>
              Steady interest rates support banking & auto liquidity. FIIs injected ₹1,420 Cr into cash equities.
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-orange-100 flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
            <div>
              <strong className="text-slate-900 font-bold block mb-0.5">Renewable Order Momentum</strong>
              Suzlon Energy secured 400 MW order book expansion, maintaining clean energy investor interest.
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-orange-100 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          {[
            { id: 'All', label: t('allCategories') },
            { id: 'Stock News', label: t('categoryStockNews') },
            { id: 'Economy', label: t('categoryEconomy') },
            { id: 'Results', label: t('categoryResults') },
            { id: 'Global', label: t('categoryGlobal') },
            { id: 'IPO', label: t('categoryIPO') },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Right Search & Sentiment Filter */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Sentiment dropdown */}
          <select
            value={selectedSentiment}
            onChange={(e) => setSelectedSentiment(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-2xl outline-none focus:border-orange-500"
          >
            <option value="All">{t('allSentiments')}</option>
            <option value="Bullish">{t('sentimentBullish')}</option>
            <option value="Bearish">{t('sentimentBearish')}</option>
            <option value="Neutral">{t('sentimentNeutral')}</option>
          </select>

          {/* Search box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder={t('searchNewsPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2 text-xs font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* News List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNews.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 p-12 text-center rounded-3xl text-slate-500">
            <Newspaper className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <div className="font-bold text-slate-800 text-sm">No news found matching filters</div>
            <p className="text-xs text-slate-500 mt-1">Try changing your search term or category filters.</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSelectedSentiment('All'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 bg-orange-100 text-orange-800 font-bold text-xs rounded-xl hover:bg-orange-200"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredNews.map((rawItem) => {
            const item = getTranslatedNews(rawItem);
            const isBullish = item.sentiment === 'Bullish';
            const isBearish = item.sentiment === 'Bearish';

            return (
              <div
                key={item.id}
                className="bg-white border border-orange-100/80 rounded-3xl p-5 shadow-xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                        {item.category}
                      </span>

                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isBullish 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                          : isBearish 
                            ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {isBullish && <TrendingUp className="w-3 h-3 text-emerald-600" />}
                        {isBearish && <TrendingDown className="w-3 h-3 text-rose-600" />}
                        {!isBullish && !isBearish && <Minus className="w-3 h-3 text-slate-500" />}
                        {isBullish ? t('sentimentBullish') : isBearish ? t('sentimentBearish') : t('sentimentNeutral')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
                      <Clock className="w-3 h-3" />
                      <span>{item.timeAgo}</span>
                    </div>
                  </div>

                  {/* Headline */}
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-orange-600 transition-colors">
                    {item.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-slate-600 text-xs font-medium mt-2 leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>
                </div>

                {/* Footer Section */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Related Tickers */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{t('tags')}:</span>
                    {item.relatedSymbols.map((sym) => (
                      <button
                        key={sym}
                        onClick={() => onSelectStock(sym)}
                        className="text-[11px] font-extrabold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 hover:bg-orange-100 hover:text-orange-800 border border-slate-200 transition-colors"
                        title={`Analyze ${sym}`}
                      >
                        #{sym}
                      </button>
                    ))}
                  </div>

                  {/* Read detail button */}
                  <button
                    onClick={() => setSelectedNewsDetail(item)}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 shrink-0 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200 hover:bg-orange-100 transition-all"
                  >
                    <span>{t('readAnalysis')}</span>
                    <Zap className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detailed News Modal / Analysis Drawer */}
      {selectedNewsDetail && (() => {
        const modalNews = getTranslatedNews(selectedNewsDetail);
        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-orange-100 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedNewsDetail(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-orange-100 text-orange-800">
                    {modalNews.category}
                  </span>
                  <span className="text-xs font-extrabold text-slate-500">
                    • Source: {modalNews.source}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    ({modalNews.timeAgo})
                  </span>
                </div>

                <h2 className="text-xl font-black text-slate-900 leading-snug">
                  {modalNews.title}
                </h2>

                <div className="bg-orange-50/70 border border-orange-200 p-4 rounded-2xl space-y-2">
                  <div className="text-xs font-black text-orange-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    Gemini AI Executive Summary & Trading Impact
                  </div>
                  <p className="text-xs font-medium text-slate-800 leading-relaxed">
                    {modalNews.summary}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-slate-700">{t('affectedStocks')}</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {modalNews.relatedSymbols.map(sym => (
                      <button
                        key={sym}
                        onClick={() => {
                          setSelectedNewsDetail(null);
                          onSelectStock(sym);
                        }}
                        className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-orange-600 text-white hover:bg-orange-700 shadow-xs transition-all"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        {t('viewStockDetails')} ({sym}) →
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">
                    MeraBazaar Real-Time Market Intelligence
                  </span>
                  <button
                    onClick={() => setSelectedNewsDetail(null)}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
                  >
                    {t('closeWindow')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

