import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  Zap, 
  RotateCcw,
  BarChart2
} from 'lucide-react';
import { AIAnalysisResponse, PortfolioPosition, Stock } from '../types/market';

interface AIAnalystProps {
  portfolio: PortfolioPosition[];
  stocks: Stock[];
  onSelectStock: (symbol: string) => void;
}

export const AIAnalyst: React.FC<AIAnalystProps> = ({
  portfolio,
  stocks,
  onSelectStock,
}) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text?: string; data?: AIAnalysisResponse }>>([
    {
      sender: 'ai',
      text: 'Namaste! I am your MeraBazaar AI Equity Research Desk powered by Gemini 3.6 Flash. Ask me anything about stock valuations, technical breakouts, quarterly results, or portfolio diversification.',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const samplePrompts = [
    'Analyze Reliance Industries fundamentals & Q1 earnings',
    'Which IT stock is better positioned: TCS or Infosys?',
    'Provide top 3 undervalued midcap picks in Automotive sector',
    'Review my portfolio risk exposure and recommend rebalancing',
    'NIFTY 50 technical setup: Key support and resistance levels',
  ];

  const handleSend = async (customPrompt?: string) => {
    const textToSubmit = customPrompt || query;
    if (!textToSubmit.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: textToSubmit }]);
    if (!customPrompt) setQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'MARKET_BRIEF',
          query: textToSubmit,
          portfolioContext: portfolio,
        }),
      });

      const data: AIAnalysisResponse = await res.json();
      setMessages(prev => [...prev, { sender: 'ai', data }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'Apologies, I encountered an issue connecting to the research model. Please retry in a moment.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="tour-view-ai" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600">
            <Bot className="w-7 h-7 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">Gemini 3.6 Research Desk</h2>
              <span className="text-[10px] bg-orange-100 text-orange-800 font-extrabold px-2.5 py-0.5 rounded-full border border-orange-200 uppercase">
                AI Agent
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold">
              Institutional-grade market intelligence, fundamental ratio analysis, and real-time news summarization.
            </p>
          </div>
        </div>

        {/* Quick Sample Query Chips */}
        <div className="pt-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs font-bold text-slate-500 shrink-0">Quick Ideas:</span>
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              disabled={isLoading}
              className="text-xs bg-orange-50/60 hover:bg-orange-100 text-slate-800 border border-orange-200 font-bold px-3.5 py-1.5 rounded-2xl transition-all whitespace-nowrap shrink-0 shadow-2xs"
            >
              ⚡ {p}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-6 min-h-[400px] flex flex-col justify-between">
        <div className="space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              {m.sender === 'user' ? (
                <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-3.5 rounded-2xl rounded-tr-none text-xs font-extrabold max-w-lg shadow-sm">
                  {m.text}
                </div>
              ) : m.text ? (
                <div className="bg-orange-50/50 border border-orange-200/80 text-slate-800 p-4 rounded-2xl rounded-tl-none text-xs leading-relaxed font-semibold max-w-xl shadow-2xs">
                  {m.text}
                </div>
              ) : m.data ? (
                <div className="bg-white border border-orange-200 rounded-3xl p-5 shadow-sm max-w-2xl space-y-4 text-xs font-semibold">
                  {/* Header & Verdict */}
                  <div className="flex items-center justify-between border-b border-orange-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-600" />
                      <span className="font-black text-slate-900 text-sm">AI Research Analysis</span>
                    </div>

                    {m.data.verdict && (
                      <span
                        className={`font-black px-3 py-1 rounded-full text-[11px] border ${
                          m.data.verdict === 'BULLISH' || m.data.verdict === 'STRONG_BUY'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {m.data.verdict}
                      </span>
                    )}
                  </div>

                  {/* Summary */}
                  <p className="text-slate-800 text-xs leading-relaxed font-semibold">{m.data.summary}</p>

                  {/* Key Stats Bar */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-orange-50/40 p-3 rounded-2xl border border-orange-100">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Target Range</span>
                      <span className="text-orange-700 font-black text-xs">{m.data.targetPriceRange || 'N/A'}</span>
                    </div>

                    <div className="bg-orange-50/40 p-3 rounded-2xl border border-orange-100">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Fundamental Health</span>
                      <span className="text-emerald-700 font-black text-xs">{m.data.fundamentalScore || 80}/100</span>
                    </div>
                  </div>

                  {/* Drivers & Risks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {m.data.keyDrivers && m.data.keyDrivers.length > 0 && (
                      <div className="bg-emerald-50/40 p-3 rounded-2xl border border-emerald-100 space-y-1">
                        <span className="text-emerald-800 font-black block text-[11px]">Key Growth Drivers:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-700 font-medium">
                          {m.data.keyDrivers.map((d, i) => <li key={i}>{d}</li>)}
                        </ul>
                      </div>
                    )}

                    {m.data.risks && m.data.risks.length > 0 && (
                      <div className="bg-rose-50/40 p-3 rounded-2xl border border-rose-100 space-y-1">
                        <span className="text-rose-800 font-black block text-[11px]">Risks & Watchouts:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-700 font-medium">
                          {m.data.risks.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Recommended Actions */}
                  {m.data.recommendedActions && (
                    <div className="pt-2 border-t border-orange-100">
                      <span className="text-orange-800 font-black block text-[11px] mb-1">Actionable Analyst Recommendations:</span>
                      <div className="flex flex-wrap gap-2">
                        {m.data.recommendedActions.map((act, i) => (
                          <span key={i} className="bg-orange-100 text-orange-900 border border-orange-200 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                            ✓ {act}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-orange-900 font-black bg-orange-100 border border-orange-200 p-3.5 rounded-2xl max-w-xs animate-pulse">
              <Bot className="w-4 h-4 text-orange-600 animate-spin" />
              Gemini AI is analyzing financial statements & market data...
            </div>
          )}
        </div>

        {/* Input Control Box */}
        <div className="bg-orange-50/50 border border-orange-200 rounded-2xl p-2.5 flex items-center gap-2 mt-4">
          <input
            type="text"
            placeholder="Ask AI Analyst e.g. 'Compare Reliance vs ONGC dividend yields'..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="w-full bg-white border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 font-semibold outline-none px-3 py-2 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />

          <button
            onClick={() => handleSend()}
            disabled={isLoading || !query.trim()}
            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 shrink-0 shadow-sm shadow-orange-500/20"
          >
            <Send className="w-3.5 h-3.5" />
            Send Query
          </button>
        </div>
      </div>
    </div>
  );
};
