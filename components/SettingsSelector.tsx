import React, { useState, useRef, useEffect } from 'react';
import { Globe, DollarSign, ChevronDown } from 'lucide-react';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { useCurrency, Currency } from '../contexts/CurrencyContext';

interface LanguageOption {
    code: Language;
    label: string;
    flag: string;
}

interface CurrencyOption {
    code: Currency;
    symbol: string;
    label: string;
}

const LANGUAGES: LanguageOption[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'sq', label: 'Shqip', flag: '🇦🇱' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' }
];

const CURRENCIES: CurrencyOption[] = [
    { code: 'EUR', symbol: '€', label: 'Euro' },
    { code: 'USD', symbol: '$', label: 'US Dollar' },
    { code: 'ALL', symbol: 'L', label: 'Lek' },
    { code: 'CHF', symbol: 'Fr', label: 'Swiss Franc' }
];

export const SettingsSelector: React.FC = () => {
    const { language, setLanguage } = useLanguage();
    const { currency, setCurrency } = useCurrency();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];
    const currentCurr = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
            >
                <Globe size={16} />
                <span>{currentLang.flag}</span>
                <span className="hidden sm:inline">{currentCurr.code}</span>
                <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="space-y-4">
                        {/* Language Section */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Language</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {LANGUAGES.map(lang => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setLanguage(lang.code);
                                            setIsOpen(false);
                                        }}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${language === lang.code
                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-trust-blue dark:text-blue-400 border border-blue-100 dark:border-blue-800'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        <span className="text-lg">{lang.flag}</span>
                                        <span>{lang.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 dark:bg-gray-800" />

                        {/* Currency Section */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Currency</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {CURRENCIES.map(curr => (
                                    <button
                                        key={curr.code}
                                        onClick={() => {
                                            setCurrency(curr.code);
                                            setIsOpen(false);
                                        }}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${currency === curr.code
                                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        <span className="font-mono font-bold w-4">{curr.symbol}</span>
                                        <span>{curr.code}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
