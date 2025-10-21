'use client'
import { NextIntlClientProvider } from "next-intl";
import { useContext, useEffect, useState, createContext } from "react";

type Locale = 'vi' | 'en';

interface I18nContextType {
  locale: Locale;
  changeLanguage: (lang: Locale) => void;
}

export const I18nContext = createContext<I18nContextType>({
  locale: 'vi',
  changeLanguage: () => {},
});

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('vi');
  const [messages, setMessages] = useState<any>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Locale | null;
    const defaultLang = savedLang || 'vi';
    changeLanguage(defaultLang);
  }, []);

  const changeLanguage = async (lang: Locale) => {
    const msgs = (await import(`../../messages/${lang}.json`)).default;
    setLocale(lang);
    setMessages(msgs);
    localStorage.setItem('lang', lang);
  };

  if (!messages) return <div>Loading...</div>; // tránh null gây trắng màn

  return (
    <I18nContext.Provider value={{ locale, changeLanguage }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);