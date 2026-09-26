import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    TrendingUp,
    Users,
    ShoppingBag,
    DollarSign,
    ArrowUp,
    ArrowDown,
    Activity,
    Calendar,
    Package,
    LogOut,
    Search,
    CheckCircle2
} from 'lucide-react';
import { Card, Button, Badge } from '../components/ui/Base';
import { motion } from 'framer-motion';
import { useCurrency } from '../context/CurrencyContext';

const StatCard = ({ title, value, trend, icon: Icon, color }) => (
    <Card className="flex flex-col gap-4 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500 ${color}`}>
            <Icon className="w-24 h-24" />
        </div>
        <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-opacity-20 ${color} bg-current`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <span className="text-slate-400 font-medium">{title}</span>
        </div>
        <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-white">{value}</span>
            <div className={`flex items-center gap-1 text-sm font-bold ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {trend.startsWith('+') ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {trend}
            </div>
        </div>
    </Card>
);

const DashboardPage = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const { currency, formatPrice } = useCurrency();
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState([]);
    const [productsList, setProductsList] = useState([]);
    const [searchBarcode, setSearchBarcode] = useState('');
    const [scannedProduct, setScannedProduct] = useState(null);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [salesRes, productsRes, customersRes] = await Promise.all([
                api.get('/sales').catch(() => api.get('/orders')),
                api.get('/products'),
                api.get('/customers')
            ]);

            const sales = salesRes.data || [];
            const products = productsRes.data || [];
            const customers = customersRes.data || [];

            setProductsList(products);

            const totalRevenue = sales.reduce((acc, sale) => acc + (sale.totalAmount ?? sale.totals?.total ?? 0), 0);
            const totalSales = sales.length;
            const newCustomers = customers.length;
            const avgTransaction = totalSales > 0 ? totalRevenue / totalSales : 0;

            const computedStats = [
                { title: "Total Revenue", value: formatPrice(totalRevenue), trend: "+0%", icon: DollarSign, color: "text-primary" },
                { title: "Total Sales", value: totalSales.toString(), trend: "+0%", icon: ShoppingBag, color: "text-secondary" },
                { title: "New Customers", value: newCustomers.toString(), trend: "+0%", icon: Users, color: "text-green-400" },
                { title: "Avg. Transaction", value: formatPrice(avgTransaction), trend: "+0%", icon: TrendingUp, color: "text-yellow-400" }
            ];

            setStats(computedStats);
            setRecentActivity(sales.slice(-5).reverse());
        } catch (error) {
            console.error("Dashboard error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleBarcodeSearch = (val) => {
        setSearchBarcode(val);
        const q = val.trim().toLowerCase();
        if (!q) {
            setScannedProduct(null);
            return;
        }
        const match = productsList.find(p => 
            (p.sku && p.sku.toLowerCase() === q) ||
            (p.barcode && p.barcode.toLowerCase() === q) ||
            (p.name && p.name.toLowerCase().includes(q)) ||
            String(p.id) === q
        );
        setScannedProduct(match || null);
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">System Overview</h1>
                    <p className="text-slate-400 text-sm">Real-time performance analytics</p>
                </div>

                {/* Quick Barcode / Product Search */}
                <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Quick scan barcode, SKU or search product..."
                        className="glass-input w-full pl-10 pr-4 text-sm"
                        value={searchBarcode}
                        onChange={(e) => handleBarcodeSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-3">
                    <Button variant="secondary" className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Last 30 Days
                    </Button>
                    <Button onClick={fetchDashboardData} className="flex items-center gap-2">
                        Refresh Data
                    </Button>
                    <Button onClick={logout} className="flex items-center gap-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30">
                        <LogOut className="w-4 h-4" />
                        Logout
                    </Button>
                </div>
            </div>

            {/* Scanned Product Banner (if matched) */}
            {scannedProduct && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between flex-wrap gap-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-lg">{scannedProduct.name}</span>
                                <Badge variant="success">SKU: {scannedProduct.sku || scannedProduct.barcode || `#${scannedProduct.id}`}</Badge>
                            </div>
                            <p className="text-xs text-slate-400">
                                Price: <span className="text-white font-semibold">{formatPrice(scannedProduct.price)}</span> • 
                                Stock: <span className="text-white font-semibold">{scannedProduct.stock} units</span> • 
                                Category: <span className="text-white font-semibold">{scannedProduct.description || 'General'}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={() => navigate('/pos')} className="flex items-center gap-2 text-xs">
                            <ShoppingBag className="w-4 h-4" />
                            Open in POS
                        </Button>
                        <Button variant="secondary" onClick={() => navigate('/products')} className="flex items-center gap-2 text-xs">
                            View in Inventory
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.length > 0 ? stats.map((stat, index) => (
                    <StatCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        trend={stat.trend}
                        icon={stat.icon}
                        color={stat.color}
                    />
                )) : (
                    [1, 2, 3, 4].map(i => <div key={i} className="h-32 glass-card animate-pulse bg-white/5" />)
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                    variant="secondary"
                    className="flex flex-col items-center gap-3 p-6 h-auto bg-white/5 border-white/10 hover:border-primary/50 transition-all group"
                    onClick={() => navigate('/pos')}
                >
                    <div className="p-3 rounded-xl bg-primary/20 text-primary group-hover:scale-110 transition-transform">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <span className="font-bold">New Sale</span>
                </Button>
                <Button
                    variant="secondary"
                    className="flex flex-col items-center gap-3 p-6 h-auto bg-white/5 border-white/10 hover:border-secondary/50 transition-all group"
                    onClick={() => navigate('/customers')}
                >
                    <div className="p-3 rounded-xl bg-secondary/20 text-secondary group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6" />
                    </div>
                    <span className="font-bold">Customers</span>
                </Button>
                <Button
                    variant="secondary"
                    className="flex flex-col items-center gap-3 p-6 h-auto bg-white/5 border-white/10 hover:border-green-400/50 transition-all group"
                    onClick={() => navigate('/products')}
                >
                    <div className="p-3 rounded-xl bg-green-400/20 text-green-400 group-hover:scale-110 transition-transform">
                        <Package className="w-6 h-6" />
                    </div>
                    <span className="font-bold">Inventory</span>
                </Button>
                <Button
                    variant="secondary"
                    className="flex flex-col items-center gap-3 p-6 h-auto bg-white/5 border-white/10 hover:border-yellow-400/50 transition-all group"
                    onClick={() => navigate('/reports')}
                >
                    <div className="p-3 rounded-xl bg-yellow-400/20 text-yellow-400 group-hover:scale-110 transition-transform">
                        <Activity className="w-6 h-6" />
                    </div>
                    <span className="font-bold">Analytics</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Chart Placeholder */}
                <Card className="lg:col-span-2 min-h-[400px] flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            Sales Performance
                        </h3>
                        <div className="flex gap-2">
                            <Badge>Revenue</Badge>
                            <Badge variant="info">Transactions</Badge>
                        </div>
                    </div>
                    <div className="flex-1 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden">
                        <svg className="w-full h-full p-8" viewBox="0 0 800 300">
                            <motion.path
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                                d="M 0 250 Q 100 200 200 230 T 400 150 T 600 180 T 800 50"
                                fill="none"
                                stroke="url(#neonGradient)"
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                            <defs>
                                <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#00f2fe" />
                                    <stop offset="100%" stopColor="#f093fb" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-surface/50 to-transparent pointer-events-none" />
                    </div>
                </Card>

                {/* Recent Activity */}
                <Card className="flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6">Live Activity</h3>
                    <div className="flex flex-col gap-4">
                        {recentActivity.length > 0 ? recentActivity.map((sale, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                <div className="w-10 h-10 rounded-full bg-neon-gradient p-0.5">
                                    <div className="w-full h-full rounded-full bg-dark-surface flex items-center justify-center text-xs font-bold text-white">
                                        JD
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">New Sale: #{sale.invoiceNumber || sale.id}</p>
                                    <p className="text-xs text-slate-400">{new Date(sale.orderDate || sale.timestamp || Date.now()).toLocaleTimeString()}</p>
                                </div>
                                <span className="text-sm font-bold text-primary">+{formatPrice(sale.totalAmount ?? sale.totals?.total ?? 0)}</span>
                            </div>
                        )) : (
                            <p className="text-slate-500 text-center py-10">No recent transactions</p>
                        )}
                    </div>
                    <Button variant="secondary" className="mt-8">View All Activity</Button>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;
