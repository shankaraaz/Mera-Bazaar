import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, LANGUAGES, TRANSLATIONS, TRANSLATED_NEWS_MAP, LanguageOption } from '../utils/translations';
import { MarketNews } from '../types/market';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  getTranslatedNews: (article: MarketNews) => MarketNews;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('merabazaar_language') as Language;
      return saved && TRANSLATIONS[saved] ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('merabazaar_language', lang);
    } catch (e) {
      console.error('Failed to save language setting', e);
    }
  };

  const t = (key: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS['en'];
    return langDict[key] || TRANSLATIONS['en'][key] || key;
  };

  const getTranslatedNews = (article: MarketNews): MarketNews => {
    if (language === 'en') return article;

    const langMap = TRANSLATED_NEWS_MAP[language];
    if (langMap && langMap[article.id]) {
      return {
        ...article,
        title: langMap[article.id].title || article.title,
        summary: langMap[article.id].summary || article.summary,
      };
    }

    return article;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        getTranslatedNews,
        languages: LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
