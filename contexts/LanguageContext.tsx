
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { TRANSLATIONS } from '../constants/translations';

export type Language = 'en' | 'sq' | 'de' | 'it';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');

    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = TRANSLATIONS[language];

        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                // Fallback to English
                let fallback: any = TRANSLATIONS['en'];
                for (const subK of keys) {
                    if (fallback && fallback[subK]) fallback = fallback[subK];
                    else return key; // Return key if not found
                }
                return typeof fallback === 'string' ? fallback : key;
            }
        }

        return typeof value === 'string' ? value : key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
