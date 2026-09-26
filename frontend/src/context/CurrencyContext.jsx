import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CurrencyContext = createContext();

const defaultStoreSettings = {
    storeName: 'RK super',
    phone: '+1 (555) 019-2834',
    email: 'store@rksuper.com',
    address: '100 Innovation Blvd, Tech City, CA 94016',
    currency: 'Rs.',
    exchangeRate: 1.0,
    taxRate: 10.0,
    receiptHeader: 'THANK YOU FOR SHOPPING AT RK SUPER!\nVisit us online: www.rksuper.com',
    receiptFooter: 'Returns accepted within 14 days with receipt.\nHave a wonderful day!',
    showCashierOnReceipt: true,
    autoPrintReceipt: false,
};

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState('Rs.');
    const [exchangeRate, setExchangeRate] = useState(1.0);
    const [taxRate, setTaxRate] = useState(10.0);
    const [storeName, setStoreName] = useState('RK super');
    const [storeSettings, setStoreSettings] = useState(defaultStoreSettings);

    const loadSettings = async () => {
        try {
            // First check local storage for instant render
            const cached = localStorage.getItem('pos_settings');
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (parsed.currencySymbol) setCurrency(parsed.currencySymbol);
                    if (parsed.exchangeRate) setExchangeRate(parsed.exchangeRate);
                    if (parsed.taxRate !== undefined) setTaxRate(parsed.taxRate);
                    if (parsed.storeName) setStoreName(parsed.storeName);
                    setStoreSettings(prev => ({
                        ...prev,
                        storeName: parsed.storeName || prev.storeName,
                        phone: parsed.storePhone || parsed.phone || prev.phone,
                        email: parsed.storeEmail || parsed.email || prev.email,
                        address: parsed.storeAddress || parsed.address || prev.address,
                        currency: parsed.currencySymbol || parsed.currency || prev.currency,
                        taxRate: parsed.taxRate !== undefined ? parsed.taxRate : prev.taxRate,
                        exchangeRate: parsed.exchangeRate || prev.exchangeRate,
                        receiptHeader: parsed.receiptHeader !== undefined ? parsed.receiptHeader : prev.receiptHeader,
                        receiptFooter: parsed.receiptFooter !== undefined ? parsed.receiptFooter : prev.receiptFooter,
                        showCashierOnReceipt: parsed.showCashierOnReceipt !== undefined ? parsed.showCashierOnReceipt : prev.showCashierOnReceipt,
                        autoPrintReceipt: parsed.autoPrintReceipt !== undefined ? parsed.autoPrintReceipt : prev.autoPrintReceipt,
                    }));
                } catch (e) {}
            }

            // Then fetch from backend database
            const res = await api.get('/settings');
            if (res.data) {
                const d = res.data;
                const activeCurrency = d.currency || 'Rs.';
                const activeRate = d.exchangeRate || 1.0;
                const activeTax = d.taxRate !== undefined ? d.taxRate : 10.0;
                setCurrency(activeCurrency);
                setExchangeRate(activeRate);
                setTaxRate(activeTax);
                if (d.storeName) setStoreName(d.storeName);
                setStoreSettings(prev => ({
                    ...prev,
                    storeName: d.storeName || prev.storeName,
                    phone: d.phone || prev.phone,
                    email: d.email || prev.email,
                    address: d.address || prev.address,
                    currency: activeCurrency,
                    taxRate: activeTax,
                    exchangeRate: activeRate,
                    receiptHeader: d.receiptHeader !== undefined ? d.receiptHeader : prev.receiptHeader,
                    receiptFooter: d.receiptFooter !== undefined ? d.receiptFooter : prev.receiptFooter,
                    autoPrintReceipt: d.autoPrintReceipt !== undefined ? d.autoPrintReceipt : prev.autoPrintReceipt,
                }));
            }
        } catch (err) {
            console.warn("Currency load fallback:", err);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const formatPrice = (amount) => {
        const num = Number(amount || 0);
        return `${currency} ${(num * exchangeRate).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const convertAmount = (amount) => {
        return Number(amount || 0) * exchangeRate;
    };

    return (
        <CurrencyContext.Provider value={{
            currency,
            exchangeRate,
            taxRate,
            storeName,
            storeSettings,
            setCurrency,
            setExchangeRate,
            formatPrice,
            convertAmount,
            refreshSettings: loadSettings
        }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => useContext(CurrencyContext);
