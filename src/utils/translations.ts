export type Language = 'en' | 'hi' | 'hinglish' | 'gu' | 'mr';

export interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'hinglish', name: 'Hinglish', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
];

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Header & Nav
    appName: 'MeraBazaar',
    appTagline: 'Indian Stock Screener & Growth Investments',
    marketOverview: 'Overview',
    marketNews: 'News',
    stockScreener: 'Screener',
    chartsFinancials: 'Charts',
    geminiAnalyst: 'AI Analyst',
    portfolioWatchlist: 'Portfolio',
    iposMutualFunds: 'IPOs & Funds',
    bonusActions: 'Corporate Actions',
    adminRevenue: 'Admin Payouts',
    searchPlaceholder: 'Search TCS, Reliance, Vedanta, Nifty, IT...',
    marketLive: 'Market Live',
    marketClosed: 'Market Closed',
    liveDataActive: 'Live Data Active',
    afterHoursClose: 'After Hours Close',
    login: 'Sign In',
    logout: 'Log Out',
    
    // News Segment
    newsTitle: 'Indian Share Market Live News',
    newsSubtitle: 'Stay ahead with breaking headlines, RBI policy announcements, quarterly earnings results, corporate developments, and global macroeconomic triggers.',
    fetchLiveNews: 'Fetch Live Market News',
    syncingNews: 'Syncing Feeds...',
    totalArticles: 'Total News Stories',
    bullishDrivers: 'Bullish Drivers',
    bearishDrivers: 'Bearish Drivers',
    neutralPolicy: 'Neutral / Policy',
    geminiPulseTitle: 'Gemini AI Equity Analyst • Today\'s Top Market Drivers',
    allCategories: 'All',
    categoryStockNews: 'Stock News',
    categoryEconomy: 'Economy',
    categoryResults: 'Results',
    categoryGlobal: 'Global',
    categoryIPO: 'IPO',
    allSentiments: 'All Sentiments',
    sentimentBullish: 'Bullish 🟢',
    sentimentBearish: 'Bearish 🔴',
    sentimentNeutral: 'Neutral ⚪',
    searchNewsPlaceholder: 'Search news by company or topic...',
    readAnalysis: 'Read Analysis',
    matchingStories: 'Matching Stories',
    tags: 'Tags',
    closeWindow: 'Close Window',
    affectedStocks: 'Affected Stocks & Indices:',
    viewStockDetails: 'View Stock Details',
    
    // Market Banner
    marketClosedBannerTitle: 'NSE / BSE Indian Markets Closed',
    marketClosedBannerSub: 'Standard Trading Hours: 09:15 AM to 03:30 PM IST (Mon-Fri). Showing official last market close prices.',

    // Subscription & Pro Plan
    proPlan: 'MeraBazaar Pro Plan',
    subscriptionPrice: '₹99/month',
    upgradeToPro: 'Subscribe Pro ₹99/mo',
    proActive: 'Pro Active',
    adminFullAccess: 'Admin Full Access',
    unlockAllSegments: 'Unlock All Segments for ₹99/Month',
    selectPaymentMethod: 'Select Payment Method',
    payWithGooglePay: 'Pay with Google Pay',
    payWithRazorpay: 'Pay with Razorpay',
    gpayDescription: 'Instant UPI Payment via Google Pay App',
    razorpayDescription: 'UPI, Debit/Credit Card, NetBanking & Wallets',
    subscribeNow: 'Pay ₹99 & Unlock All Features',
    processingPayment: 'Securing Payment...',
    paymentSuccess: 'Payment Successful! Pro Subscription Activated.',
    cancelAnytime: 'Cancel anytime. 100% money-back guarantee within 7 days.',
    lockedFeatureTitle: 'Pro Segment - ₹99/Mo Subscription Required',
    lockedFeatureDesc: 'Get full unlimited access to live news, AI analyst, screeners, charts, portfolio tracking, and corporate action alerts.',
  },

  hi: {
    // Header & Nav
    appName: 'मेराबाजार',
    appTagline: 'भारतीय शेयर बाज़ार स्क्रीनर एवं ग्रोथ निवेश',
    marketOverview: 'अवलोकन',
    marketNews: 'न्यूज़',
    stockScreener: 'स्क्रीनर',
    chartsFinancials: 'चार्ट्स',
    geminiAnalyst: 'AI एनालिस्ट',
    portfolioWatchlist: 'पोर्टफोलियो',
    iposMutualFunds: 'आईपीओ व फंड्स',
    bonusActions: 'कॉर्पोरेट एक्शंस',
    searchPlaceholder: 'TCS, Reliance, Vedanta, Nifty खोजें...',
    marketLive: 'मार्केट लाइव चालू है',
    marketClosed: 'बाजार बंद है',
    liveDataActive: 'लाइव डेटा एक्टिव',
    afterHoursClose: 'ट्रेडिंग समय समाप्त',
    login: 'साइन इन करें',
    logout: 'लॉग आउट',

    // News Segment
    newsTitle: 'भारतीय शेयर बाजार लाइव समाचार',
    newsSubtitle: 'ताज़ा ब्रेकिंग न्यूज़, आरबीआई नीति घोषणाएं, तिमाही नतीजे, कॉर्पोरेट अपडेट और ग्लोबल शेयर बाज़ार के ट्रिगर्स से अपडेट रहें।',
    fetchLiveNews: 'लाइव मार्केट न्यूज़ अपडेट करें',
    syncingNews: 'न्यूज़ सिंक हो रही है...',
    totalArticles: 'कुल समाचार लेख',
    bullishDrivers: 'तेजी (Bullish) के कारण',
    bearishDrivers: 'मंदी (Bearish) के कारण',
    neutralPolicy: 'न्यूट्रल / नीति',
    geminiPulseTitle: 'जेमिनी AI शेयर विश्लेषक • आज के मुख्य बाजार ट्रिगर्स',
    allCategories: 'सभी',
    categoryStockNews: 'स्टॉक समाचार',
    categoryEconomy: 'अर्थव्यवस्था',
    categoryResults: 'तिमाही परिणाम',
    categoryGlobal: 'ग्लोबल मार्केट',
    categoryIPO: 'आईपीओ',
    allSentiments: 'सभी भावनाएं',
    sentimentBullish: 'तेजी 🟢',
    sentimentBearish: 'मंदी 🔴',
    sentimentNeutral: 'न्यूट्रल ⚪',
    searchNewsPlaceholder: 'कंपनी या विषय द्वारा समाचार खोजें...',
    readAnalysis: 'विश्लेषण पढ़ें',
    matchingStories: 'मिलती-जुलती खबरें',
    tags: 'टैग्स',
    closeWindow: 'विंडो बंद करें',
    affectedStocks: 'प्रभावित स्टॉक्स एवं इंडेक्स:',
    viewStockDetails: 'स्टॉक विवरण देखें',

    // Market Banner
    marketClosedBannerTitle: 'NSE / BSE भारतीय शेयर बाजार बंद है',
    marketClosedBannerSub: 'मानक ट्रेडिंग समय: सुबह 09:15 से दोपहर 03:30 IST (सोम-शुक्र)। अंतिम आधिकारिक क्लोजिंग प्राइस दिखाए जा रहे हैं।',
  },

  hinglish: {
    // Header & Nav
    appName: 'MeraBazaar',
    appTagline: 'Indian Share Market Screener & Growth Investment',
    marketOverview: 'Overview',
    marketNews: 'News',
    stockScreener: 'Screener',
    chartsFinancials: 'Charts',
    geminiAnalyst: 'AI Analyst',
    portfolioWatchlist: 'Portfolio',
    iposMutualFunds: 'IPOs & Funds',
    bonusActions: 'Corporate Actions',
    searchPlaceholder: 'Search TCS, Reliance, Vedanta, Nifty, IT...',
    marketLive: 'Market Live Hai',
    marketClosed: 'Market Band Hai',
    liveDataActive: 'Live Feed Chal Raha Hai',
    afterHoursClose: 'Market Closed (After Hours)',
    login: 'Sign In Karein',
    logout: 'Log Out',

    // News Segment
    newsTitle: 'Indian Share Market Live News & Updates',
    newsSubtitle: 'Breaking headlines, RBI policy, quarterly results, aur global market updates ke saath hamesha aage rahein.',
    fetchLiveNews: 'Live Market News Sync Karein',
    syncingNews: 'Feeds Update Ho Rahe Hain...',
    totalArticles: 'Total News Stories',
    bullishDrivers: 'Tezi (Bullish) Drivers',
    bearishDrivers: 'Mandi (Bearish) Drivers',
    neutralPolicy: 'Neutral / Policy Updates',
    geminiPulseTitle: 'Gemini AI Analyst • Aaj Ke Main Market Catalysts',
    allCategories: 'Sabhi',
    categoryStockNews: 'Stock News',
    categoryEconomy: 'Economy',
    categoryResults: 'Results',
    categoryGlobal: 'Global',
    categoryIPO: 'IPO',
    allSentiments: 'All Sentiments',
    sentimentBullish: 'Tezi 🟢',
    sentimentBearish: 'Mandi 🔴',
    sentimentNeutral: 'Neutral ⚪',
    searchNewsPlaceholder: 'Company ya topic search karein...',
    readAnalysis: 'Full Analysis Padhne Ke Liye Click Karein',
    matchingStories: 'Matching Stories',
    tags: 'Tags',
    closeWindow: 'Close Karein',
    affectedStocks: 'Affected Stocks & Indices:',
    viewStockDetails: 'Stock Details Dekhein',

    // Market Banner
    marketClosedBannerTitle: 'NSE / BSE Indian Markets Band Hain',
    marketClosedBannerSub: 'Standard Trading Hours: Subah 09:15 AM se Dopehar 03:30 PM IST (Mon-Fri). Official last close prices show ho rahe hain.',
  },

  gu: {
    // Header & Nav
    appName: 'મેરાબજાર',
    appTagline: 'ભારતીય શેરબજાર સ્ક્રીનર અને ગ્રોથ ઇન્વેસ્ટમેન્ટ',
    marketOverview: 'અવલોકન',
    marketNews: 'ન્યૂઝ',
    stockScreener: 'સ્ક્રીનર',
    chartsFinancials: 'ચાર્ટ્સ',
    geminiAnalyst: 'AI એનાલિસ્ટ',
    portfolioWatchlist: 'પોર્ટફોલિયો',
    iposMutualFunds: 'આઈપીઓ અને ફંડ્સ',
    bonusActions: 'કોર્પોરેટ એક્શન્સ',
    searchPlaceholder: 'TCS, Reliance, Vedanta, Nifty શોધો...',
    marketLive: 'માર્કેટ લાઈવ ચાલુ છે',
    marketClosed: 'બજાર બંધ છે',
    liveDataActive: 'લાઈવ ડેટા સક્રિય',
    afterHoursClose: 'ટ્રેડિંગ સમય સમાપ્ત',
    login: 'સાઇન ઇન કરો',
    logout: 'લોગ આઉટ',

    // News Segment
    newsTitle: 'ભારતીય શેરબજારના લાઈવ સમાચાર',
    newsSubtitle: 'તાજા બ્રેકિંગ ન્યૂઝ, આરબીઆઈ પોલિસી, ત્રિમાસિક પરિણામો અને વૈશ્વિક શેરબજારના અપડેટ્સ મેળવો.',
    fetchLiveNews: 'લાઈવ માર્કેટ ન્યૂઝ અપડેટ કરો',
    syncingNews: 'સમાચાર સિંક થઈ રહ્યા છે...',
    totalArticles: 'કુલ સમાચાર લેખો',
    bullishDrivers: 'તેજીના કારણો (Bullish)',
    bearishDrivers: 'મંદીના કારણો (Bearish)',
    neutralPolicy: 'ન્યુટ્રલ / પોલિસી',
    geminiPulseTitle: 'જેમિની AI એનાલિસ્ટ • આજના મુખ્ય માર્કેટ ડ્રાઇવરો',
    allCategories: 'બધા',
    categoryStockNews: 'સ્ટોક સમાચાર',
    categoryEconomy: 'અર્થતંત્ર',
    categoryResults: 'ત્રિમાસિક પરિણામો',
    categoryGlobal: 'ગ્લોબલ માર્કેટ',
    categoryIPO: 'આઈપીઓ',
    allSentiments: 'બધી લાગણીઓ',
    sentimentBullish: 'તેજી 🟢',
    sentimentBearish: 'મંદી 🔴',
    sentimentNeutral: 'ન્યુટ્રલ ⚪',
    searchNewsPlaceholder: 'કંપની અથવા વિષય દ્વારા સમાચાર શોધો...',
    readAnalysis: 'વિશ્લેષણ વાંચો',
    matchingStories: 'મળતા આવતા સમાચાર',
    tags: 'ટેગ્સ',
    closeWindow: 'વિન્ડો બંધ કરો',
    affectedStocks: 'અસરગ્રસ્ત સ્ટોક્સ અને ઇન્ડેક્સ:',
    viewStockDetails: 'સ્ટોક વિગતો જુઓ',

    // Market Banner
    marketClosedBannerTitle: 'NSE / BSE ભારતીય શેરબજાર બંધ છે',
    marketClosedBannerSub: 'ટ્રેડિંગ સમય: સવારે 09:15 થી બપોરે 03:30 IST (સોમ-શુક્ર). બંધ ભાવ બતાવી રહ્યા છે.',
  },

  mr: {
    // Header & Nav
    appName: 'मेराबाजार',
    appTagline: 'भारतीय शेअर बाजार स्क्रीनर आणि ग्रोथ गुंतवणूक',
    marketOverview: 'आढावा',
    marketNews: 'न्यूज',
    stockScreener: 'स्क्रीनर',
    chartsFinancials: 'चार्ट्स',
    geminiAnalyst: 'AI ॲनालिस्ट',
    portfolioWatchlist: 'पोर्टफोलिओ',
    iposMutualFunds: 'आयपीओ व फंड्स',
    bonusActions: 'कॉर्पोरेट ॲक्शन्स',
    searchPlaceholder: 'TCS, Reliance, Vedanta, Nifty शोधा...',
    marketLive: 'मार्केट लाइव्ह चालू आहे',
    marketClosed: 'बाजार बंद आहे',
    liveDataActive: 'लाइव्ह डेटा सक्रिय',
    afterHoursClose: 'ट्रेडिंग वेळ संपली',
    login: 'साइन इन करा',
    logout: 'लॉग आऊट',

    // News Segment
    newsTitle: 'भारतीय शेअर बाजार लाइव्ह बातम्या',
    newsSubtitle: 'ताजी ब्रेकिंग न्यूज, आरबीआय धोरण, तिमाही निकाल आणि जागतिक शेअर बाजाराचे अपडेट्स मिळवा.',
    fetchLiveNews: 'लाइव्ह मार्केट न्यूज अपडेट करा',
    syncingNews: 'बातम्या सिंक होत आहेत...',
    totalArticles: 'एकूण बातम्या',
    bullishDrivers: 'तेजीची कारणे (Bullish)',
    bearishDrivers: 'मंदीची कारणे (Bearish)',
    neutralPolicy: 'न्यूट्रल / धोरण',
    geminiPulseTitle: 'जेमिनी AI ॲनालिस्ट • आजचे मुख्य मार्केट ट्रिगर्स',
    allCategories: 'सर्व',
    categoryStockNews: 'स्टॉक बातम्या',
    categoryEconomy: 'अर्थव्यवस्था',
    categoryResults: 'तिमाही निकाल',
    categoryGlobal: 'ग्लोबल मार्केट',
    categoryIPO: 'आयपीओ',
    allSentiments: 'सर्व भावना',
    sentimentBullish: 'तेजी 🟢',
    sentimentBearish: 'मंदी 🔴',
    sentimentNeutral: 'न्यूट्रल ⚪',
    searchNewsPlaceholder: 'कंपनी किंवा विषयानुसार बातमी शोधा...',
    readAnalysis: 'विश्लेषण वाचा',
    matchingStories: 'संबंधित बातम्या',
    tags: 'टॅग्स',
    closeWindow: 'विंडो बंद करा',
    affectedStocks: 'प्रभावित शेअर्स आणि निर्देशांक:',
    viewStockDetails: 'शेअर तपशील पहा',

    // Market Banner
    marketClosedBannerTitle: 'NSE / BSE भारतीय शेअर बाजार बंद आहे',
    marketClosedBannerSub: 'ट्रेडिंग वेळ: सकाळी 09:15 ते दुपारी 03:30 IST (सोम-शुक्र). शेवटचे अधिकृत क्लोजिंग भाव दाखवले आहेत.',
  }
};

// Translated News Content Map for Indian Market Articles
export const TRANSLATED_NEWS_MAP: Record<Language, Record<string, { title: string; summary: string }>> = {
  en: {},
  hi: {
    'news-1': {
      title: 'RBI MPC बैठक: रेपो रेट 6.50% पर यथावत; विकास दर अनुमान 7.2% बरकरार',
      summary: 'भारतीय रिजर्व बैंक की मौद्रिक नीति समिति ने प्रमुख नीतिगत ब्याज दरों को 6.50% पर स्थिर रखने का निर्णय लिया है। मुद्रास्फीति नियंत्रण एवं बैंकिंग लिक्विडिटी में मजबूती से बैंकिंग शेयर हरे निशान में बंद हुए।'
    },
    'news-2': {
      title: 'TCS को मिला $1.2 बिलियन का बड़ा ग्लोबल डील; AI-क्लाउड प्लेटफॉर्म माइग्रेशन का करार',
      summary: 'टाटा कंसल्टेंसी सर्विसेज (TCS) ने 12 देशों में फैला बहु-वर्षीय डिजिटल परिवर्तन अनुबंध हासिल किया है, जिसमें जनरेटिव AI टेक्नोलॉजी और क्लाउड स्वचालन शामिल है।'
    },
    'news-5': {
      title: 'वेदांता बोर्ड ने 6 स्वतंत्र सूचीबद्ध कंपनियों में डिमर्जर को दी मंजूरी; जिंक व एल्युमीनियम यूनिट्स में उछाल',
      summary: 'वेदांता के निदेशक मंडल ने अपने तेल, एल्युमीनियम, पावर, स्टील और सेमीकंडक्टर व्यवसायों को 6 अलग-अलग सूचीबद्ध कंपनियों में विभाजित करने के पुनर्गठन प्रस्ताव को मंजूरी दे दी है।'
    },
    'news-3': {
      title: 'FIIs फिर बने शुद्ध खरीदार; भारतीय कैश मार्केट में ₹1,420 करोड़ का किया निवेश',
      summary: 'विदेशी संस्थागत निवेशकों (FIIs) ने लगातार तीन सत्रों की बिकवाली के बाद भारतीय शेयर बाजार में वापसी की है। वैश्विक बाजार में स्थिरता से घरेलू सेंटिमेंट मजबूत हुआ है।'
    },
    'news-6': {
      title: 'सुजलॉन एनर्जी को गुजरात में 400 मेगावॉट विंड एनर्जी प्रोजेक्ट का बड़ा ऑर्डर मिला',
      summary: 'सुजलॉन एनर्जी 3 मेगावॉट सीरीज की 134 पवन टर्बाइन की आपूर्ति करेगी। इस ऑर्डर से सुजलॉन की कुल ऑर्डर बुक बढ़कर 3.8 गीगावॉट से अधिक हो गई है।'
    },
    'news-7': {
      title: 'टाटा स्टील Q1 शुद्ध लाभ 28% बढ़ा; घरेलू स्टील डिलीवरी 5.4 मिलियन टन के ऑल-टाइम हाई पर',
      summary: 'मजबूत घरेलू बुनियादी ढांचे की मांग ने यूरोपीय बाजार के पुनर्गठन दबाव को कम किया। कोकिंग कोल की कीमतों में गिरावट से प्रति टन एबिटडा में सुधार हुआ।'
    },
    'news-4': {
      title: 'जोमैटो ब्लिंकिट क्विक कॉमर्स ऑर्डर वॉल्यूम 40% बढ़ा; डार्क स्टोर्स की संख्या 600 के पार',
      summary: 'जोमैटो के क्विक-कॉमर्स प्लेटफॉर्म ब्लिंकिट ने किराना डिलीवरी बाजार में आक्रामक विस्तार जारी रखा है। नए शहरों में डार्क स्टोर खुलने से रेवेन्यू में मजबूत उछाल देखा गया।'
    },
    'news-8': {
      title: 'रिलायंस रिटेल ने FMCG पोर्टफोलियो का किया विस्तार; D2C ब्रांड में खरीदी नियंत्रण हिस्सेदारी',
      summary: 'रिलायंस कंज्यूमर प्रोडक्ट्स ने उपभोक्ता वस्तु क्षेत्र में अपनी उपस्थिति मजबूत करने के लिए डी2सी ब्रांड अधिग्रहण पूरा किया है।'
    },
    'news-9': {
      title: 'अमेरिकी फेडरल रिजर्व के ब्याज दर कटौती के संकेतों से वैश्विक शेयर बाजारों में तेजी',
      summary: 'अमरीकी मुद्रास्फीति घटकर 2.8% पर आने के बाद फेडरल रिजर्व द्वारा दर कटौती की उम्मीदें बढ़ गई हैं, जिससे वैश्विक इक्विटी इंडेक्स में तेजी देखी जा रही है।'
    },
    'news-10': {
      title: 'अगले सप्ताह खुलेंगे 3 मेनबोर्ड आईपीओ; प्राइमरी मार्केट से ₹4,500 करोड़ जुटाने की तैयारी',
      summary: 'ग्रे मार्केट प्रीमियम (GMP) 35% से ऊपर रहने से रिटेल और एचएनआई निवेशकों में नए टेक्नोलॉजी व ग्रीन एनर्जी आईपीओ के प्रति भारी उत्साह देखा जा रहा है।'
    }
  },
  hinglish: {
    'news-1': {
      title: 'RBI MPC Meeting: Repo Rate 6.50% Par Unchanged; GDP Growth Estimate 7.2% Retain',
      summary: 'Reserve Bank of India ne key interest rate ko 6.50% par hold rakha hai. Inflation control aur banking liquidity strong hone se Banking stocks mein tezi dekhi gayi.'
    },
    'news-5': {
      title: 'Vedanta Demerger Approved: 6 Alag Listed Companies Banegi; Metals & Zinc Stocks Mein Tezi',
      summary: 'Vedanta Board ne apne Oil, Aluminium, Power, Steel aur Semiconductor business ko 6 pure-play listed entities mein split karne ka plan approve kar diya hai.'
    },
    'news-6': {
      title: 'Suzlon Energy Ko Gujarat Mein 400 MW Wind Power Project Ka Milla Bada Order',
      summary: 'Suzlon total 134 wind turbines supply karega. Is order ke saath Suzlon ki order book 3.8 GW ke paar pahunch gayi hai.'
    }
  },
  gu: {
    'news-1': {
      title: 'RBI MPC બેઠક: રેપો રેટ 6.50% પર યથાવત; જીડીપી વૃદ્ધિ દર 7.2% રહેવાનો અંદાજ',
      summary: 'ભારતીય રિઝર્વ બેંકે વ્યાજ દરો 6.50% પર સ્થિર રાખવાનો નિર્ણય લીધો છે. ફુગાવા પર નિયંત્રણ અને બેંકિંગ પ્રવાહિતાથી શેરબજારમાં ઉત્સાહ જોવા મળ્યો.'
    },
    'news-5': {
      title: 'વેદાંત બોર્ડે 6 સ્વતંત્ર લિસ્ટેડ કંપનીઓમાં ડીમર્જરને મંજૂરી આપી; ઝિંક અને એલોય શેરોમાં ઉછાળો',
      summary: 'વેદાંત બોર્ડે ઓઇલ, એલ્યુમિનિયમ, પાવર, સ્ટીલ અને સેમિકન્ડક્ટર વ્યવસાયોને 6 અલગ-અલગ લિસ્ટેડ કંપનીઓમાં વિભાજિત કરવાનો નિર્ણય લીધો છે.'
    }
  },
  mr: {
    'news-1': {
      title: 'RBI MPC बैठक: रेपो दर 6.50% वर स्थिर; विकास दर अंदाज 7.2% कायम',
      summary: 'रिझर्व्ह बँकेने व्याजदरात कोणताही बदल न करता तो 6.50% वर कायम ठेवला आहे. बँकिंग क्षेत्रातील चांगल्या पतपुरवठ्यामुळे शेअर बाजारात तेजी राहिली.'
    },
    'news-5': {
      title: 'वेदांत डिमर्जरला मंजुरी: 6 स्वतंत्र सूचीबद्ध कंपन्या तयार होणार; शेअर्समध्ये जोरदार तेजी',
      summary: 'वेदांत बोर्डाने तेल, ॲल्युमिनियम, पॉवर आणि स्टील व्यवसाय 6 स्वतंत्र सूचीबद्ध संस्थांमध्ये विभाजित करण्याच्या योजनेला मंजुरी दिली आहे.'
    }
  }
};
