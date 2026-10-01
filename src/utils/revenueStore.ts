// Utility for managing real MeraBazaar revenue and payout tracking.
// Starts strictly at 0 (no fake demo figures). Increments dynamically upon actual user activity.

export interface AdCampaignRevenue {
  id: string;
  sponsorName: string;
  category: 'Affiliate Brokerage' | 'Pro Subscriptions' | 'Sovereign Debt' | 'IPO Desk' | 'AI Targeted Ads';
  pricingModel: string;
  rate: string;
  impressions: number;
  clicks: number;
  conversions: number;
  totalEarnings: number;
  status: 'Active' | 'Paused';
}

export interface SubscriberMetric {
  plan: string;
  price: string;
  activeCount: number;
  newThisMonth: number;
  grossRevenue: number;
  platformFee: number;
  netAdminEarnings: number;
}

export interface PayoutRecord {
  id: string;
  date: string;
  amount: number;
  bank: string;
  status: 'Completed' | 'Pending';
  utr: string;
}

export interface RevenueStoreData {
  subscribers: SubscriberMetric[];
  adCampaigns: AdCampaignRevenue[];
  payouts: PayoutRecord[];
}

const STORAGE_KEY = 'merabazaar_real_monetization_store_v1';

const INITIAL_SUBSCRIBERS_ZERO: SubscriberMetric[] = [
  {
    plan: 'Pro Monthly (₹99/mo)',
    price: '₹99 / mo',
    activeCount: 0,
    newThisMonth: 0,
    grossRevenue: 0,
    platformFee: 0,
    netAdminEarnings: 0
  },
  {
    plan: 'Pro Annual (₹999/yr)',
    price: '₹999 / yr',
    activeCount: 0,
    newThisMonth: 0,
    grossRevenue: 0,
    platformFee: 0,
    netAdminEarnings: 0
  },
  {
    plan: 'Enterprise API Desk',
    price: '₹4,999 / mo',
    activeCount: 0,
    newThisMonth: 0,
    grossRevenue: 0,
    platformFee: 0,
    netAdminEarnings: 0
  }
];

const INITIAL_ADS_ZERO: AdCampaignRevenue[] = [
  {
    id: 'ad-c1',
    sponsorName: 'AngelOne / Zerodha Demat Partner',
    category: 'Affiliate Brokerage',
    pricingModel: 'Lead Referral (CPA)',
    rate: '₹500 / Account Opened',
    impressions: 0,
    clicks: 0,
    conversions: 0,
    totalEarnings: 0,
    status: 'Active'
  },
  {
    id: 'ad-c2',
    sponsorName: 'MeraBazaar AI Pro Promotion Banner',
    category: 'Pro Subscriptions',
    pricingModel: 'Internal In-App Conversion',
    rate: '₹99 - ₹999 per Sub',
    impressions: 0,
    clicks: 0,
    conversions: 0,
    totalEarnings: 0,
    status: 'Active'
  },
  {
    id: 'ad-c3',
    sponsorName: 'Govt Sovereign Gold Bond Issue 2026',
    category: 'Sovereign Debt',
    pricingModel: 'Click & Lead Hybrid',
    rate: '₹150 / Inquiry Lead',
    impressions: 0,
    clicks: 0,
    conversions: 0,
    totalEarnings: 0,
    status: 'Active'
  },
  {
    id: 'ad-c4',
    sponsorName: 'MeraBazaar Prime IPO Desk Sponsor',
    category: 'IPO Desk',
    pricingModel: 'CPM (Per 1k Views)',
    rate: '₹85 / 1,000 Views',
    impressions: 0,
    clicks: 0,
    conversions: 0,
    totalEarnings: 0,
    status: 'Active'
  },
  {
    id: 'ad-c5',
    sponsorName: 'Gemini 3.6 ML Dynamic Targeted Ads',
    category: 'AI Targeted Ads',
    pricingModel: 'Dynamic Smart CPC',
    rate: '₹18 / Click',
    impressions: 0,
    clicks: 0,
    conversions: 0,
    totalEarnings: 0,
    status: 'Active'
  }
];

// Helper to load data
export function getRevenueStoreData(): RevenueStoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.subscribers) && Array.isArray(parsed.adCampaigns)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading revenue store:', err);
  }

  // Return zeroed out initial structure
  return {
    subscribers: INITIAL_SUBSCRIBERS_ZERO,
    adCampaigns: INITIAL_ADS_ZERO,
    payouts: []
  };
}

// Helper to save data and broadcast change event
export function saveRevenueStoreData(data: RevenueStoreData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('merabazaar-revenue-updated', { detail: data }));
    }, 0);
  } catch (err) {
    console.error('Error saving revenue store:', err);
  }
}

// Record a new Pro Subscription sale
export function recordSubscriptionSale(price: number = 99, planTier: 'monthly' | 'annual' | 'enterprise' = 'monthly') {
  const store = getRevenueStoreData();
  const fee = Math.round(price * 0.02);
  const net = price - fee;

  const planIndex = planTier === 'annual' ? 1 : planTier === 'enterprise' ? 2 : 0;
  
  store.subscribers[planIndex].activeCount += 1;
  store.subscribers[planIndex].newThisMonth += 1;
  store.subscribers[planIndex].grossRevenue += price;
  store.subscribers[planIndex].platformFee += fee;
  store.subscribers[planIndex].netAdminEarnings += net;

  // Also count as conversion for internal promotion ad
  store.adCampaigns[1].conversions += 1;
  store.adCampaigns[1].totalEarnings += net;

  saveRevenueStoreData(store);
}

// Record an ad click / lead conversion
export function recordAdInteraction(adId: string, actionType: 'impression' | 'click' | 'conversion', customEarn: number = 0) {
  const store = getRevenueStoreData();
  const targetIndex = store.adCampaigns.findIndex(a => a.id === adId || a.sponsorName.includes(adId));

  const idx = targetIndex >= 0 ? targetIndex : 0;
  const campaign = store.adCampaigns[idx];

  if (actionType === 'impression') {
    campaign.impressions += 1;
  } else if (actionType === 'click') {
    campaign.clicks += 1;
    // For CPC campaigns (like Gemini AI Ads ₹18/click)
    if (campaign.category === 'AI Targeted Ads') {
      campaign.totalEarnings += 18;
    }
  } else if (actionType === 'conversion') {
    campaign.conversions += 1;
    const earnToAdd = customEarn > 0 ? customEarn : (campaign.category === 'Affiliate Brokerage' ? 500 : 150);
    campaign.totalEarnings += earnToAdd;
  }

  saveRevenueStoreData(store);
}

// Record a bank withdrawal payout
export function recordPayout(amount: number, upiId: string = '7715933711@upi'): PayoutRecord {
  const store = getRevenueStoreData();
  const newPayout: PayoutRecord = {
    id: `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
    date: new Date().toISOString().split('T')[0],
    amount,
    bank: `SBI A/C 31450925568 (IFSC: SBIN0007232) - ${upiId}`,
    status: 'Completed',
    utr: `UTR${Date.now().toString().slice(-10)}`
  };

  store.payouts.unshift(newPayout);
  saveRevenueStoreData(store);
  return newPayout;
}

// Reset all revenue data to 0 (Clean slate)
export function resetRevenueStoreToZero() {
  const zeroData: RevenueStoreData = {
    subscribers: INITIAL_SUBSCRIBERS_ZERO.map(s => ({ ...s })),
    adCampaigns: INITIAL_ADS_ZERO.map(a => ({ ...a })),
    payouts: []
  };
  saveRevenueStoreData(zeroData);
  return zeroData;
}
