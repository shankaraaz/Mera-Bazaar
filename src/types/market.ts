export interface Stock {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  pChange: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  valueCr: number;
  marketCapCr: number;
  pe: number;
  industryPe: number;
  pb: number;
  divYield: number;
  roe: number;
  roce: number;
  debtToEquity: number;
  salesGrowth3Yr: number;
  profitGrowth3Yr: number;
  promoterHolding: number;
  fiiHolding: number;
  diiHolding: number;
  publicHolding: number;
  high52: number;
  low52: number;
  faceValue: number;
  bookValue: number;
  circuitLimit: number;
  upperCircuit: number;
  lowerCircuit: number;
  rsi: number;
  sma20: number;
  sma50: number;
  sma200: number;
  deliverablePercent: number;
  isin: string;
  exchange: 'NSE' | 'BSE' | 'BOTH';
  summary: string;
  historicalPrices: PricePoint[];
  quarterlyResults: FinancialQuarter[];
  annualResults: FinancialAnnual[];
  balanceSheet: BalanceSheet[];
  shareholdingHistory: ShareholdingPoint[];
}

export interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  rsi?: number;
  sma20?: number;
  sma50?: number;
  ema20?: number;
  upperBB?: number;
  lowerBB?: number;
  macd?: number;
  signalLine?: number;
  macdHist?: number;
}

export interface FinancialQuarter {
  quarter: string; // e.g. "Q1 FY25", "Q4 FY24"
  sales: number; // in Cr
  expenses: number;
  opProfit: number;
  opm: number; // percentage
  netProfit: number;
  eps: number;
}

export interface FinancialAnnual {
  year: string; // e.g. "FY24", "FY23"
  sales: number;
  expenses: number;
  opProfit: number;
  netProfit: number;
  eps: number;
}

export interface BalanceSheet {
  year: string;
  equityCapital: number;
  reserves: number;
  borrowings: number;
  otherLiabilities: number;
  totalLiabilities: number;
  fixedAssets: number;
  cwip: number;
  investments: number;
  otherAssets: number;
  totalAssets: number;
}

export interface ShareholdingPoint {
  period: string; // e.g. "Jun 2024"
  promoter: number;
  fii: number;
  dii: number;
  public: number;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  pChange: number;
  high: number;
  low: number;
  previousClose: number;
  history: { time: string; value: number }[];
}

export interface MarketBreadth {
  advances: number;
  declines: number;
  unchanged: number;
  total: number;
  advanceDeclineRatio: number;
}

export interface InstitutionalFlow {
  date: string;
  fiiCashNet: number; // Cr
  diiCashNet: number; // Cr
  fiiFnONet: number;  // Cr
}

export interface IPOCard {
  id: string;
  companyName: string;
  symbol: string;
  issueDates: string; // e.g., "Aug 10 - Aug 12, 2026"
  issueSizeCr: number;
  priceBand: string; // e.g. "₹240 - ₹250"
  lotSize: number;
  gmpAmount: number; // ₹
  gmpPercent: number; // %
  subscription: {
    qib: number;
    nii: number;
    retail: number;
    overall: number;
  };
  status: 'UPCOMING' | 'ONGOING' | 'LISTED';
  listingDate?: string;
  category: 'Mainboard' | 'SME';
}

export interface MutualFund {
  id: string;
  name: string;
  category: 'Large Cap' | 'Flexi Cap' | 'Mid Cap' | 'Small Cap' | 'ELSS Tax Saver' | 'Index Fund';
  nav: number;
  dayChange: number;
  cagr1Y: number;
  cagr3Y: number;
  cagr5Y: number;
  aumCr: number;
  expenseRatio: number;
  rating: number; // 1-5
  minSipAmount: number;
  fundManager: string;
}

export interface CommodityForex {
  symbol: string;
  name: string;
  category: 'Commodity' | 'Forex';
  price: number;
  unit: string;
  change: number;
  pChange: number;
}

export interface MarketNews {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  category: 'Stock News' | 'Economy' | 'Results' | 'Global' | 'IPO';
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  relatedSymbols: string[];
  summary: string;
  url?: string;
}

export interface ScreenerFilters {
  searchQuery: string;
  sector: string;
  marketCapRange: [number, number]; // Cr
  peRange: [number, number];
  pbRange: [number, number];
  minDivYield: number;
  minRoe: number;
  minRoce: number;
  maxDebtToEquity: number;
  minSalesGrowth3Yr: number;
  minProfitGrowth3Yr: number;
  minPromoterHolding: number;
  near52WeekHighOnly: boolean;
  volumeShockersOnly: boolean;
}

export interface PortfolioPosition {
  id: string;
  stockSymbol: string;
  stockName: string;
  quantity: number;
  averageBuyPrice: number;
  buyDate: string;
}

export interface WatchlistItem {
  id: string;
  stockSymbol: string;
  targetHighAlert?: number;
  targetLowAlert?: number;
  addedAt: string;
}

export interface CorporateAction {
  id: string;
  symbol: string;
  companyName: string;
  actionType: 'BONUS' | 'SPLIT' | 'DIVIDEND' | 'RIGHTS' | 'BUYBACK';
  details: string;
  ratioOrAmount: string;
  recordDate: string;
  exDate: string;
  boardMeetingDate: string;
  status: 'UPCOMING' | 'ANNOUNCED' | 'EX_DATE_TODAY' | 'COMPLETED';
  faceValueOld?: number;
  faceValueNew?: number;
  dividendYieldPct?: number;
  remarks: string;
}

export interface EarningsEvent {
  id: string;
  symbol: string;
  companyName: string;
  sector: string;
  date: string; // YYYY-MM-DD e.g. "2026-08-08"
  fiscalQuarter: string; // e.g. "Q1 FY27"
  marketTiming: 'BEFORE_MARKET' | 'AFTER_MARKET' | 'DURING_MARKET';
  consensusEpsEst?: number; // ₹ per share
  consensusRevenueEstCr?: number; // ₹ Cr
  consensusEbitdaMarginPct?: number; // %
  previousEps?: number;
  previousRevenueCr?: number;
  status: 'UPCOMING' | 'TODAY' | 'REPORTED';
  actualEps?: number;
  actualRevenueCr?: number;
  revenueSurprisePct?: number;
  epsSurprisePct?: number;
  remarks?: string;
  importance?: 'HIGH' | 'MEDIUM' | 'NORMAL';
}

export interface AIAnalysisRequest {
  symbol?: string;
  query?: string;
  mode: 'STOCK_ANALYSIS' | 'MARKET_BRIEF' | 'SCREENER_GEN' | 'PORTFOLIO_REVIEW';
  portfolioContext?: PortfolioPosition[];
}

export interface AIAnalysisResponse {
  summary: string;
  verdict?: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'STRONG_BUY' | 'WATCH';
  targetPriceRange?: string;
  keyDrivers?: string[];
  risks?: string[];
  technicalOutlook?: string;
  fundamentalScore?: number; // 1-100
  recommendedActions?: string[];
  suggestedScreenerFilters?: Partial<ScreenerFilters>;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  stockName?: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  type: 'BUY' | 'SELL';
  note?: string;
  triggered: boolean;
  createdAt: string;
  initialPrice?: number;
  triggeredPrice?: number;
  triggeredAt?: string;
  active?: boolean;
  label?: 'Target Profit' | 'Stop Loss' | 'Dip Buy' | 'Breakout' | 'Custom';
}
