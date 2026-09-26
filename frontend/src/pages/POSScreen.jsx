import React, { useState, useEffect } from 'react';
import {
    Search,
    Trash2,
    Plus,
    Minus,
    CreditCard,
    User,
    Tag,
    Zap,
    ShoppingCart,
    Printer,
    CheckCircle2,
    DollarSign,
    X,
    Receipt,
    ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Card, Button, Input, Badge } from '../components/ui/Base';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';

const POSScreen = () => {
    const { cart, addToCart, removeFromCart, updateQuantity, totals, clearCart, selectedCustomer, setSelectedCustomer } = useCart();
    const { currency, formatPrice, taxRate, storeSettings } = useCurrency();
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    // selectedCustomer and setSelectedCustomer are now in CartContext
    const [search, setSearch] = useState('');
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Checkout & Calculator States
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [paymentType, setPaymentType] = useState('CASH');
    const [amountTendered, setAmountTendered] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Receipt Modal States
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

    // Mock products for demonstration if API fails or isn't set up
    const mockProducts = [
        { id: 1, name: 'Quantum Processor X1', price: 599.99, category: 'Hardware', stock: 12 },
        { id: 2, name: 'Neural Link V2', price: 299.00, category: 'Interface', stock: 5 },
        { id: 3, name: 'Neon Keyboard', price: 149.50, category: 'Peripherals', stock: 25 },
        { id: 4, name: 'Holographic Monitor', price: 899.00, category: 'Hardware', stock: 3 },
        { id: 5, name: 'Cortex Cooler', price: 75.00, category: 'Hardware', stock: 50 },
        { id: 6, name: 'Fusion Drive', price: 450.00, category: 'Storage', stock: 8 },
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prodRes, custRes] = await Promise.all([
                api.get('/products'),
                api.get('/customers')
            ]);
            setProducts(prodRes.data);
            setCustomers(custRes.data);
        } catch (error) {
            setProducts(mockProducts);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredProducts = products.filter(p => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (p.name || '').toLowerCase().includes(q) ||
            (p.sku || '').toLowerCase().includes(q) ||
            (p.barcode || '').toLowerCase().includes(q) ||
            (p.description || '').toLowerCase().includes(q) ||
            (p.category || '').toLowerCase().includes(q) ||
            String(p.id) === q;
    });

    // Auto-scan logic for supermarket barcodes / SKU scanner
    useEffect(() => {
        const query = search.trim().toLowerCase();
        if (query.length >= 3) {
            const exactMatch = products.find(p => 
                (p.sku && p.sku.toLowerCase() === query) ||
                (p.barcode && p.barcode.toLowerCase() === query)
            );
            if (exactMatch) {
                addToCart(exactMatch);
                setSearch(''); // Clear search for next scan
            }
        }
    }, [search, products]);

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = search.trim().toLowerCase();
            if (!query) return;
            const match = products.find(p => 
                (p.sku && p.sku.toLowerCase() === query) ||
                (p.barcode && p.barcode.toLowerCase() === query) ||
                (p.name && p.name.toLowerCase() === query) ||
                String(p.id) === query
            ) || filteredProducts[0];
            if (match) {
                addToCart(match);
                setSearch('');
            }
        }
    };

    // Calculate customer change
    const tenderedVal = parseFloat(amountTendered) || 0;
    const balanceAmount = tenderedVal - totals.total;

    // Open checkout tool
    const handleOpenCheckout = () => {
        if (cart.length === 0) return;
        setAmountTendered('');
        setPaymentType('CASH');
        setIsCheckoutOpen(true);
    };

    // Process order & save payment with amount_tendered and change_amount
    const handleConfirmPayment = async () => {
        if (cart.length === 0) return;
        if (paymentType === 'CASH' && tenderedVal < totals.total) {
            alert('Customer given amount is less than total price!');
            return;
        }

        setIsSubmitting(true);
        const finalTendered = paymentType === 'CASH' ? tenderedVal : totals.total;
        const finalChange = paymentType === 'CASH' ? Math.max(0, balanceAmount) : 0.0;

        try {
            const orderPayload = {
                customerId: selectedCustomer ? selectedCustomer.id : null,
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                })),
                payments: [
                    {
                        paymentType: paymentType,
                        amount: totals.total,
                        amountTendered: finalTendered,
                        changeAmount: finalChange,
                        transactionReference: 'TXN-' + Date.now()
                    }
                ]
            };

            let response;
            try {
                response = await api.post('/orders', orderPayload);
            } catch (err) {
                response = await api.post('/sales', orderPayload);
            }

            const savedOrder = response.data || {};

            // Prepare receipt data
            setReceiptData({
                invoiceNumber: savedOrder.invoiceNumber || ('INV-' + Date.now().toString().slice(-6)),
                orderDate: new Date().toLocaleString(),
                cashierName: user?.name || user?.username || 'Staff Cashier',
                customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
                items: [...cart],
                subtotal: totals.subtotal,
                tax: totals.tax,
                total: totals.total,
                amountTendered: finalTendered,
                changeAmount: finalChange,
                paymentType: paymentType,
                savings: totals.savings || 0
            });

            // Close checkout modal & open receipt modal
            setIsCheckoutOpen(false);
            setIsReceiptOpen(true);

            // Clear current cart
            clearCart();
            setSelectedCustomer(null);
            setCustomerSearchTerm('');
            fetchData(); // Refresh product stock levels
        } catch (error) {
            console.error("Checkout error:", error);
            alert('Payment & Order failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePrintReceipt = () => {
        window.print();
    };

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Terminal POS</h1>
                    <p className="text-slate-400 text-sm">Ready for transactions • Scan barcode or press Enter to add item</p>
                </div>
                <div className="flex gap-4 w-1/3">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Scan barcode, SKU or search..."
                            className="glass-input w-full pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            autoFocus
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-6 min-h-0">
                {/* Products Grid */}
                <div className="flex-[2] overflow-auto custom-scrollbar pr-2 flex flex-col gap-6">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence mode='popLayout'>
                            {filteredProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    whileHover={{ y: -5 }}
                                    onClick={() => addToCart(product)}
                                >
                                    <Card className="h-full cursor-pointer hover:border-primary/50 transition-colors flex flex-col justify-between group">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <Badge variant={product.stock < 10 ? 'warning' : 'info'}>
                                                    {product.description || product.category || 'General'}
                                                </Badge>
                                                <span className="text-[10px] text-primary font-mono tracking-widest">{product.sku || product.barcode || `#${product.id}`}</span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                                                {product.name}
                                            </h3>
                                            <p className="text-2xl font-bold bg-neon-gradient bg-clip-text text-transparent mt-2">
                                                {formatPrice(product.price)}
                                            </p>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                            <span className="text-xs text-slate-400">Stock: {product.stock} {product.unit || 'units'}</span>
                                            <Plus className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Cart Sidebar */}
                <div className="flex-1 min-w-[400px]">
                    <Card className="h-full flex flex-col p-0 overflow-hidden bg-dark-surface/30">
                        <div className="p-6 border-b border-white/5 bg-white/5">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5 text-primary" />
                                    Current Order
                                </h2>
                                <Badge variant="success">{cart.length} items</Badge>
                            </div>

                            <div className="mt-4 flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Assign Customer (Search Mobile or Name)</label>
                                <input
                                    list="customer-list"
                                    className="glass-input bg-dark-base/50 text-sm py-1.5"
                                    placeholder="Type mobile no. or name..."
                                    value={customerSearchTerm}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setCustomerSearchTerm(val);
                                        // Try to find the exact match from the datalist
                                        const cust = customers.find(c => `${c.name} - ${c.phone}` === val);
                                        setSelectedCustomer(cust || null);
                                    }}
                                />
                                <datalist id="customer-list">
                                    {customers.map(c => (
                                        <option key={c.id} value={`${c.name} - ${c.phone}`} />
                                    ))}
                                </datalist>
                                {selectedCustomer && (
                                    <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                                        ✓ Customer Assigned
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto custom-scrollbar p-6 flex flex-col gap-4">
                            <AnimatePresence>
                                {cart.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4 opacity-50">
                                        <Zap className="w-12 h-12" />
                                        <p>Order is empty</p>
                                    </div>
                                ) : (
                                    cart.map((item) => {
                                        const hasDiscount = item.memberDiscountPercentage > 0;
                                        const effectivePrice = hasDiscount 
                                            ? item.price * (1 - (item.memberDiscountPercentage / 100))
                                            : item.price;
                                        
                                        return (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-semibold text-white truncate">{item.name}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs text-primary font-mono">{formatPrice(effectivePrice)}</p>
                                                        {hasDiscount && (
                                                            <p className="text-[10px] text-slate-500 line-through font-mono">{formatPrice(item.price)}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 bg-dark-base rounded-lg p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 text-white"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="text-sm font-bold text-white w-6 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 text-white"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    );
                                })
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="p-6 bg-white/5 border-t border-white/5 flex flex-col gap-3">
                            <div className="flex justify-between text-slate-400 text-sm">
                                <span>Subtotal</span>
                                <span>{formatPrice(totals.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-slate-400 text-sm">
                                <span>Tax ({taxRate}%)</span>
                                <span>{formatPrice(totals.tax)}</span>
                            </div>
                            <div className="flex justify-between text-white font-bold text-xl mt-2">
                                <span>Total</span>
                                <span className="text-primary">{formatPrice(totals.total)}</span>
                            </div>
                            <Button
                                onClick={handleOpenCheckout}
                                disabled={cart.length === 0}
                                className="w-full mt-4 py-4 text-lg flex items-center justify-center gap-3"
                            >
                                <CreditCard className="w-6 h-6" />
                                Proceed to Checkout
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* 1. CHECKOUT & TENDERED CALCULATOR MODAL */}
            <AnimatePresence>
                {isCheckoutOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="w-full max-w-lg"
                        >
                            <Card className="border border-white/20 shadow-2xl bg-dark-surface/95 overflow-hidden">
                                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                            <DollarSign className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">Payment & Cash Calculator</h2>
                                            <p className="text-xs text-slate-400">Calculate customer tendered cash and change balance</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsCheckoutOpen(false)}
                                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="mt-6 flex flex-col gap-5">
                                    {/* Order Total Display */}
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center">
                                        <div>
                                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Amount Due</span>
                                            <div className="text-xs text-slate-500">{cart.length} items • Tax included</div>
                                        </div>
                                        <span className="text-3xl font-extrabold bg-neon-gradient bg-clip-text text-transparent">
                                            {formatPrice(totals.total)}
                                        </span>
                                    </div>

                                    {/* Payment Method Selector */}
                                    <div>
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Payment Method</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPaymentType('CASH');
                                                    setAmountTendered(totals.total);
                                                }}
                                                className={`py-3 px-4 rounded-xl border font-semibold flex items-center justify-center gap-2 transition-all ${
                                                    paymentType === 'CASH'
                                                        ? 'bg-primary/20 border-primary text-primary shadow-neon-blue'
                                                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                                }`}
                                            >
                                                <DollarSign className="w-5 h-5" />
                                                Cash Payment
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPaymentType('CARD');
                                                    setAmountTendered(totals.total);
                                                }}
                                                className={`py-3 px-4 rounded-xl border font-semibold flex items-center justify-center gap-2 transition-all ${
                                                    paymentType === 'CARD'
                                                        ? 'bg-primary/20 border-primary text-primary shadow-neon-blue'
                                                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                                }`}
                                            >
                                                <CreditCard className="w-5 h-5" />
                                                Card / Digital
                                            </button>
                                        </div>
                                    </div>

                                    {/* Cash Tendered Input & Calculator */}
                                    {paymentType === 'CASH' ? (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                                    Customer Giving Money (Tendered)
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold text-lg">
                                                        {currency}
                                                    </span>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        min="0"
                                                        autoFocus
                                                        placeholder="0.00"
                                                        value={amountTendered}
                                                        onChange={(e) => setAmountTendered(e.target.value)}
                                                        className="w-full bg-dark-base border border-white/20 rounded-xl pl-16 pr-4 py-3 text-2xl font-bold text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 transition-all font-mono"
                                                    />
                                                </div>
                                            </div>

                                            {/* Quick Cash Buttons */}
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setAmountTendered(totals.total)}
                                                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/50 text-xs font-semibold text-white transition-colors"
                                                >
                                                    Exact ({formatPrice(totals.total)})
                                                </button>
                                                {[100, 500, 1000, 5000].map(add => (
                                                    <button
                                                        key={add}
                                                        type="button"
                                                        onClick={() => setAmountTendered((prev) => (parseFloat(prev) || 0) + add)}
                                                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition-colors"
                                                    >
                                                        +{add}
                                                    </button>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => setAmountTendered('')}
                                                    className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-semibold text-red-400 transition-colors"
                                                >
                                                    Clear
                                                </button>
                                            </div>

                                            {/* Real-Time Balance / Change Display */}
                                            <div
                                                className={`p-4 rounded-2xl border transition-all ${
                                                    balanceAmount >= 0
                                                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                                                        : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                                                }`}
                                            >
                                                <div className="flex justify-between items-center text-xs opacity-80 mb-1">
                                                    <span>Calculation (Giving - Total)</span>
                                                    <span>{tenderedVal > 0 ? `${formatPrice(tenderedVal)} - ${formatPrice(totals.total)}` : 'Awaiting cash'}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-base font-bold">
                                                        {balanceAmount >= 0 ? 'Balance to Return (Change):' : 'Remaining Money Due:'}
                                                    </span>
                                                    <span className="text-2xl font-extrabold font-mono">
                                                        {balanceAmount >= 0 ? formatPrice(balanceAmount) : formatPrice(Math.abs(balanceAmount))}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-sm text-primary flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                            <span>Card transaction will charge exact order total of <strong>{formatPrice(totals.total)}</strong>. Balance will be 0.00.</span>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-3 border-t border-white/10">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => setIsCheckoutOpen(false)}
                                            className="flex-1 py-3"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleConfirmPayment}
                                            disabled={isSubmitting || (paymentType === 'CASH' && balanceAmount < 0)}
                                            className="flex-[2] py-3 text-base flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                'Saving Payment...'
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    Submit & Generate Receipt
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 2. SUPERPOS OFFICIAL THERMAL RECEIPT MODAL */}
            <AnimatePresence>
                {isReceiptOpen && receiptData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md my-8"
                        >
                            {/* Actions Header (Not printed) */}
                            <div className="flex justify-between items-center mb-3 no-print">
                                <div className="flex items-center gap-2 text-white font-bold text-lg">
                                    <Receipt className="w-5 h-5 text-primary" />
                                    Transaction Receipt
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsReceiptOpen(false)}
                                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                    title="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Thermal Printable Receipt Card */}
                            <div
                                id="printable-receipt"
                                className="bg-white text-black p-6 rounded-2xl shadow-2xl font-mono text-xs select-text border border-slate-300"
                            >
                                {/* Store Header */}
                                <div className="text-center pb-3 border-b border-dashed border-gray-400">
                                    <h1 className="text-xl font-extrabold tracking-wider mb-1 text-black uppercase">
                                        {storeSettings?.storeName || 'RK SUPER'}
                                    </h1>
                                    {storeSettings?.address && (
                                        <p className="text-[11px] text-gray-700 whitespace-pre-line leading-tight">
                                            {storeSettings.address}
                                        </p>
                                    )}
                                    <div className="text-[10px] text-gray-600 mt-1 flex flex-wrap justify-center gap-x-3">
                                        {storeSettings?.phone && <span>Tel: {storeSettings.phone}</span>}
                                        {storeSettings?.email && <span>{storeSettings.email}</span>}
                                    </div>
                                </div>

                                {/* Order & Cashier Info */}
                                <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1 text-[11px] text-gray-800">
                                    <div className="flex justify-between">
                                        <span>Invoice:</span>
                                        <strong className="text-black">{receiptData.invoiceNumber}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Date:</span>
                                        <span>{receiptData.orderDate}</span>
                                    </div>
                                    {storeSettings?.showCashierOnReceipt !== false && (
                                        <div className="flex justify-between">
                                            <span>Cashier:</span>
                                            <span>{receiptData.cashierName}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Customer:</span>
                                        <span>{receiptData.customerName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Payment:</span>
                                        <span className="font-semibold uppercase">{receiptData.paymentType}</span>
                                    </div>
                                </div>

                                {/* Items Breakdown Table */}
                                <div className="py-3 border-b border-dashed border-gray-400">
                                    <div className="grid grid-cols-12 font-bold text-gray-700 pb-1 mb-1 border-b border-gray-200 text-[11px]">
                                        <span className="col-span-6">Item</span>
                                        <span className="col-span-2 text-center">Qty</span>
                                        <span className="col-span-2 text-right">Price</span>
                                        <span className="col-span-2 text-right">Total</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {receiptData.items.map((item, idx) => {
                                            const hasDiscount = item.memberDiscountPercentage > 0;
                                            const effectivePrice = hasDiscount 
                                                ? item.price * (1 - (item.memberDiscountPercentage / 100))
                                                : item.price;
                                            return (
                                                <div key={idx} className="grid grid-cols-12 text-[11px] leading-tight items-center py-1">
                                                    <span className="col-span-6 font-semibold text-black truncate pr-1">
                                                        {item.name}
                                                        {hasDiscount && <span className="text-emerald-700 ml-1">(-{item.memberDiscountPercentage}%)</span>}
                                                    </span>
                                                    <span className="col-span-2 text-center text-gray-700">{item.quantity}</span>
                                                    <span className="col-span-2 text-right text-gray-700 flex flex-col items-end">
                                                        {hasDiscount && <span className="line-through text-[9px] text-gray-500">{formatPrice(item.price)}</span>}
                                                        <span>{formatPrice(effectivePrice)}</span>
                                                    </span>
                                                    <span className="col-span-2 text-right font-semibold text-black">
                                                        {formatPrice(effectivePrice * item.quantity)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Financial Summary */}
                                <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1.5 text-[11px]">
                                    <div className="flex justify-between text-gray-700">
                                        <span>Subtotal:</span>
                                        <span>{formatPrice(receiptData.subtotal)}</span>
                                    </div>
                                    {receiptData.savings > 0 && (
                                        <div className="flex justify-between font-bold text-emerald-700">
                                            <span>Discount Applied:</span>
                                            <span>-{formatPrice(receiptData.savings)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-gray-700">
                                        <span>Tax ({taxRate}%):</span>
                                        <span>{formatPrice(receiptData.tax)}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-extrabold pt-1 border-t border-gray-300 text-black">
                                        <span>TOTAL PRICE:</span>
                                        <span>{formatPrice(receiptData.total)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-800 pt-1">
                                        <span>Customer Giving Price:</span>
                                        <span className="font-bold">{formatPrice(receiptData.amountTendered)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span>Minus Total:</span>
                                        <span>-{formatPrice(receiptData.total)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-extrabold text-black pt-1 border-t border-gray-200">
                                        <span>BALANCE PRICE:</span>
                                        <span className="text-emerald-700">{formatPrice(receiptData.changeAmount)}</span>
                                    </div>
                                </div>

                                {/* Custom Store Receipt Footer Message */}
                                <div className="pt-4 text-center space-y-1.5 text-[11px] text-gray-700">
                                    {storeSettings?.receiptHeader ? (
                                        <div className="font-extrabold text-black tracking-wide whitespace-pre-line leading-snug">
                                            {storeSettings.receiptHeader}
                                        </div>
                                    ) : (
                                        <p className="font-extrabold text-black tracking-wide">
                                            THANK YOU FOR SHOPPING AT {storeSettings?.storeName?.toUpperCase() || 'RK SUPER'}!
                                        </p>
                                    )}
                                    {storeSettings?.receiptFooter ? (
                                        <div className="text-[10px] text-gray-600 whitespace-pre-line leading-relaxed pt-1">
                                            {storeSettings.receiptFooter}
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-[10px] text-gray-500">
                                                Returns accepted within 14 days with receipt.
                                            </p>
                                            <p className="font-semibold text-gray-800 text-[10px] pt-1">
                                                Have a wonderful day!
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Modal Close / New Sale Button (Not printed) */}
                            <div className="mt-4 no-print flex gap-3">
                                <Button
                                    onClick={handlePrintReceipt}
                                    className="flex-1 py-3 flex items-center justify-center gap-2"
                                >
                                    <Printer className="w-5 h-5" />
                                    Print Receipt
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => setIsReceiptOpen(false)}
                                    className="flex-1 py-3"
                                >
                                    Close & New Sale
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default POSScreen;
