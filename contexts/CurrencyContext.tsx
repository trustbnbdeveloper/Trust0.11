
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Currency = 'EUR' | 'USD' | 'ALL' | 'CHF';

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    formatPrice: (priceInEur: number) => string;
    convertPrice: (priceInEur: number) => number;
}

const EXCHANGE_RATES: Record<Currency, number> = {
    EUR: 1,
    USD: 1.08,
    ALL: 95.5,
    CHF: 0.95
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
    EUR: '€',
    USD: '$',
    ALL: 'L',
    CHF: 'Fr'
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currency, setCurrency] = useState<Currency>('EUR');

    const convertPrice = (priceInEur: number) => {
        return priceInEur * EXCHANGE_RATES[currency];
    };

    const formatPrice = (priceInEur: number) => {
        const converted = convertPrice(priceInEur);
        const symbol = CURRENCY_SYMBOLS[currency];

        // Different formatting for ALL (no decimals usually)
        if (currency === 'ALL') {
            return `${Math.round(converted).toLocaleString()} ${symbol}`;
        }

        return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
