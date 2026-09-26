import React, { useState, useEffect } from 'react';
import { Settings, Store, Receipt, Sliders, Save, CheckCircle, RefreshCw, Bell, Coins, ArrowRightLeft } from 'lucide-react';
import { Card, Button, Input } from '../components/ui/Base';
import api from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

const DEFAULT_SETTINGS = {
    storeName: 'RK super',
    storePhone: '+1 (555) 019-2834',
    storeEmail: 'store@rksuper.com',
    storeAddress: '100 Innovation Blvd, Tech City, CA 94016',
    currencySymbol: 'Rs.',
    exchangeRate: 1.0,
    taxRate: 10,
    receiptHeader: 'THANK YOU FOR SHOPPING AT RK SUPER!\nVisit us online: www.rksuper.com',
    receiptFooter: 'Returns accepted within 14 days with receipt.\nHave a wonderful day!',
    showCashierOnReceipt: true,
    autoPrintReceipt: false,
    lowStockThreshold: 10,
    soundOnScan: true,
    barcodeAutoSubmit: true,
};

const SettingsPage = () => {
    const { refreshSettings } = useCurrency();
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [activeTab, setActiveTab] = useState('general');
    const [savedNotice, setSavedNotice] = useState(false);
    const [loading, setLoading] = useState(true);
    const [converting, setConverting] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings');
                if (res.data) {
                    const d = res.data;
                    const loaded = {
                        storeName: d.storeName || DEFAULT_SETTINGS.storeName,
                        storePhone: d.phone || DEFAULT_SETTINGS.storePhone,
                        storeEmail: d.email || DEFAULT_SETTINGS.storeEmail,
                        storeAddress: d.address || DEFAULT_SETTINGS.storeAddress,
                        currencySymbol: d.currency || DEFAULT_SETTINGS.currencySymbol,
                        exchangeRate: d.exchangeRate ?? DEFAULT_SETTINGS.exchangeRate,
                        taxRate: d.taxRate ?? DEFAULT_SETTINGS.taxRate,
                        receiptHeader: d.receiptHeader || DEFAULT_SETTINGS.receiptHeader,
                        receiptFooter: d.receiptFooter || DEFAULT_SETTINGS.receiptFooter,
                        soundOnScan: d.enableSound ?? DEFAULT_SETTINGS.soundOnScan,
                        barcodeAutoSubmit: d.barcodeAutoAdd ?? DEFAULT_SETTINGS.barcodeAutoSubmit,
                        autoPrintReceipt: d.autoPrintReceipt ?? DEFAULT_SETTINGS.autoPrintReceipt,
                        lowStockThreshold: 10,
                        showCashierOnReceipt: true,
                    };
                    setSettings(loaded);
                    localStorage.setItem('pos_settings', JSON.stringify(loaded));
                }
            } catch (err) {
                console.warn("Using local settings fallback:", err);
                const saved = localStorage.getItem('pos_settings');
                if (saved) {
                    try {
                        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
                    } catch (e) {}
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        try {
            const payload = {
                storeName: settings.storeName,
                phone: settings.storePhone,
                email: settings.storeEmail,
                address: settings.storeAddress,
                currency: settings.currencySymbol,
                exchangeRate: parseFloat(settings.exchangeRate) || 1.0,
                taxRate: parseFloat(settings.taxRate),
                receiptHeader: settings.receiptHeader,
                receiptFooter: settings.receiptFooter,
                enableSound: settings.soundOnScan,
                barcodeAutoAdd: settings.barcodeAutoSubmit,
                autoPrintReceipt: settings.autoPrintReceipt
            };

            await api.put('/settings', payload);
            localStorage.setItem('pos_settings', JSON.stringify(settings));
            refreshSettings();
            setSavedNotice(true);
            setTimeout(() => setSavedNotice(false), 3000);
        } catch (error) {
            console.error("Save settings error:", error);
            localStorage.setItem('pos_settings', JSON.stringify(settings));
            refreshSettings();
            setSavedNotice(true);
            setTimeout(() => setSavedNotice(false), 3000);
        }
    };

    const handleConvertDatabasePrices = async () => {
        const rate = parseFloat(settings.exchangeRate);
        if (!rate || rate <= 0) {
            alert("Please enter a valid positive exchange rate.");
            return;
        }
        if (!window.confirm(`Are you sure you want to convert ALL existing product prices in your database by multiplying with ${rate}?\n\nExample: A product priced at 3.00 will become ${(3 * rate).toFixed(2)} ${settings.currencySymbol}.\n\nThis permanently updates product prices in the database.`)) {
            return;
        }
        try {
            setConverting(true);
            const res = await api.post(`/products/convert-currency?rate=${rate}`);
            alert(res.data || "Products updated successfully!");
            refreshSettings();
        } catch (err) {
            console.error("Currency conversion error:", err);
            alert("Failed to convert product prices: " + (err.response?.data?.message || err.message));
        } finally {
            setConverting(false);
        }
    };

    const handleReset = async () => {
        if (window.confirm('Reset all settings to system defaults?')) {
            setSettings(DEFAULT_SETTINGS);
            try {
                await api.put('/settings', {
                    storeName: DEFAULT_SETTINGS.storeName,
                    phone: DEFAULT_SETTINGS.storePhone,
                    email: DEFAULT_SETTINGS.storeEmail,
                    address: DEFAULT_SETTINGS.storeAddress,
                    currency: DEFAULT_SETTINGS.currencySymbol,
                    exchangeRate: DEFAULT_SETTINGS.exchangeRate,
                    taxRate: DEFAULT_SETTINGS.taxRate,
                    receiptHeader: DEFAULT_SETTINGS.receiptHeader,
                    receiptFooter: DEFAULT_SETTINGS.receiptFooter,
                    enableSound: DEFAULT_SETTINGS.soundOnScan,
                    barcodeAutoAdd: DEFAULT_SETTINGS.barcodeAutoSubmit,
                    autoPrintReceipt: DEFAULT_SETTINGS.autoPrintReceipt
                });
            } catch (e) {}
            localStorage.setItem('pos_settings', JSON.stringify(DEFAULT_SETTINGS));
            refreshSettings();
            setSavedNotice(true);
            setTimeout(() => setSavedNotice(false), 3000);
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Settings className="text-primary w-7 h-7" />
                        POS System Settings
                    </h1>
                    <p className="text-slate-400 text-sm">Configure store identity, currency, receipts, and terminal preferences</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={handleReset} className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Defaults
                    </Button>
                    <Button onClick={handleSave} className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Save Changes
                    </Button>
                </div>
            </div>

            {/* Save success toast */}
            {savedNotice && (
                <div className="p-4 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span>Settings & Currency updated and saved to your terminal and database!</span>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-white/10 pb-2">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all text-sm ${activeTab === 'general' ? 'bg-primary/20 text-primary border border-primary/30 shadow-neon-blue' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                    <Store className="w-4 h-4" />
                    Store Profile & Currency
                </button>
                <button
                    onClick={() => setActiveTab('receipt')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all text-sm ${activeTab === 'receipt' ? 'bg-primary/20 text-primary border border-primary/30 shadow-neon-blue' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                    <Receipt className="w-4 h-4" />
                    Receipt & Invoice
                </button>
                <button
                    onClick={() => setActiveTab('terminal')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all text-sm ${activeTab === 'terminal' ? 'bg-primary/20 text-primary border border-primary/30 shadow-neon-blue' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                    <Sliders className="w-4 h-4" />
                    Terminal Controls
                </button>
            </div>

            {/* Settings Form */}
            <form onSubmit={handleSave} className="flex flex-col gap-6">
                {activeTab === 'general' && (
                    <div className="flex flex-col gap-6">
                        <Card className="bg-dark-surface/40 flex flex-col gap-6">
                            <div className="border-b border-white/5 pb-4">
                                <h2 className="text-lg font-bold text-white">Store Identity</h2>
                                <p className="text-slate-400 text-xs">These details will appear on orders, customer bills, and reports</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Input
                                    label="Store Name"
                                    value={settings.storeName}
                                    onChange={e => handleChange('storeName', e.target.value)}
                                    required
                                />
                                <Input
                                    label="Contact Phone"
                                    value={settings.storePhone}
                                    onChange={e => handleChange('storePhone', e.target.value)}
                                />
                                <Input
                                    label="Contact Email"
                                    type="email"
                                    value={settings.storeEmail}
                                    onChange={e => handleChange('storeEmail', e.target.value)}
                                />
                                <Input
                                    label="Physical Address / Branch"
                                    value={settings.storeAddress}
                                    onChange={e => handleChange('storeAddress', e.target.value)}
                                />
                            </div>
                        </Card>

                        {/* Currency & Exchange Rate Card */}
                        <Card className="bg-dark-surface/40 flex flex-col gap-6 border border-primary/20">
                            <div className="border-b border-white/5 pb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Coins className="w-5 h-5 text-primary" />
                                        Currency & Pricing Configuration
                                    </h2>
                                    <p className="text-slate-400 text-xs">Configure your primary currency symbol, tax rate, and optional exchange conversion</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-1">Currency Preset</label>
                                    <select
                                        className="glass-input bg-dark-base/50 text-sm h-10"
                                        value={settings.currencySymbol}
                                        onChange={e => handleChange('currencySymbol', e.target.value)}
                                    >
                                        <option value="Rs.">LKR - Sri Lankan Rupee (Rs.)</option>
                                        <option value="LKR">LKR (Code)</option>
                                        <option value="$">USD - US Dollar ($)</option>
                                        <option value="€">EUR - Euro (€)</option>
                                        <option value="£">GBP - British Pound (£)</option>
                                        <option value="₹">INR - Indian Rupee (₹)</option>
                                        <option value="¥">JPY / CNY (¥)</option>
                                    </select>
                                </div>

                                <Input
                                    label="Active Currency Symbol / Label"
                                    value={settings.currencySymbol}
                                    onChange={e => handleChange('currencySymbol', e.target.value)}
                                    placeholder="e.g. Rs. or LKR or $"
                                    required
                                />

                                <Input
                                    label="Standard Tax Rate (%)"
                                    type="text"
                                    value={settings.taxRate}
                                    onChange={e => handleChange('taxRate', e.target.value)}
                                    placeholder="10"
                                />
                            </div>

                            {/* Exchange Rate Conversion Box */}
                            <div className="p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-4">
                                <div className="flex items-start justify-between flex-wrap gap-4">
                                    <div>
                                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                            <ArrowRightLeft className="w-4 h-4 text-primary" />
                                            Convert Existing Prices in Database (Optional)
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1 max-w-xl">
                                            If your existing products were entered in USD (e.g. $3.00) and you want to convert them into Sri Lankan Rupees, enter your conversion rate (e.g. 1 USD = 300 LKR) and click below to convert all prices permanently.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end pt-2">
                                    <Input
                                        label="Exchange Multiplier (Type rate e.g. 300, 1.5, etc.)"
                                        type="text"
                                        value={settings.exchangeRate}
                                        onChange={e => handleChange('exchangeRate', e.target.value)}
                                        placeholder="e.g. 300"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleConvertDatabasePrices}
                                        disabled={converting}
                                        className="h-10 px-6 rounded-xl font-bold bg-primary text-slate-950 hover:bg-cyan-300 transition-all shadow-neon-blue flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                        {converting ? 'Converting...' : `Convert All Database Prices (× ${settings.exchangeRate || 1})`}
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'receipt' && (
                    <Card className="bg-dark-surface/40 flex flex-col gap-6">
                        <div className="border-b border-white/5 pb-4">
                            <h2 className="text-lg font-bold text-white">Customer Receipt Customization</h2>
                            <p className="text-slate-400 text-xs">Customize headers, footers, and automatic printing behavior</p>
                        </div>
                        <div className="flex flex-col gap-5">
                            <Input
                                label="Receipt Header Text"
                                value={settings.receiptHeader}
                                onChange={e => handleChange('receiptHeader', e.target.value)}
                            />
                            <Input
                                label="Receipt Footer Greeting Message"
                                value={settings.receiptFooter}
                                onChange={e => handleChange('receiptFooter', e.target.value)}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:border-primary/40 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={settings.showCashierOnReceipt}
                                        onChange={e => handleChange('showCashierOnReceipt', e.target.checked)}
                                        className="w-4 h-4 rounded text-primary"
                                    />
                                    <div>
                                        <p className="font-semibold text-white text-sm">Show Cashier Name</p>
                                        <p className="text-xs text-slate-400">Prints current cashier's name on receipts</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:border-primary/40 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={settings.autoPrintReceipt}
                                        onChange={e => handleChange('autoPrintReceipt', e.target.checked)}
                                        className="w-4 h-4 rounded text-primary"
                                    />
                                    <div>
                                        <p className="font-semibold text-white text-sm">Auto-Print on Checkout</p>
                                        <p className="text-xs text-slate-400">Trigger print dialog immediately upon completing sale</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </Card>
                )}

                {activeTab === 'terminal' && (
                    <Card className="bg-dark-surface/40 flex flex-col gap-6">
                        <div className="border-b border-white/5 pb-4">
                            <h2 className="text-lg font-bold text-white">Terminal & Barcode Operations</h2>
                            <p className="text-slate-400 text-xs">Tweak operational controls for cashiers and barcode scanners</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Input
                                label="Low-Stock Alert Level (Units)"
                                type="number"
                                min="1"
                                value={settings.lowStockThreshold}
                                onChange={e => handleChange('lowStockThreshold', parseInt(e.target.value) || 5)}
                            />
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:border-primary/40 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={settings.barcodeAutoSubmit}
                                        onChange={e => handleChange('barcodeAutoSubmit', e.target.checked)}
                                        className="w-4 h-4 rounded text-primary"
                                    />
                                    <div>
                                        <p className="font-semibold text-white text-sm">Auto-Add Scanned Barcode</p>
                                        <p className="text-xs text-slate-400">Instantly appends product to cart on exact barcode match</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:border-primary/40 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={settings.soundOnScan}
                                        onChange={e => handleChange('soundOnScan', e.target.checked)}
                                        className="w-4 h-4 rounded text-primary"
                                    />
                                    <div>
                                        <p className="font-semibold text-white text-sm">Scanner Audio Feedback</p>
                                        <p className="text-xs text-slate-400">Plays an audio beep whenever a product is scanned</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </Card>
                )}


            </form>
        </div>
    );
};

export default SettingsPage;
