import React, { useState, useEffect, useMemo } from 'react';
import { History, Search, ArrowRight, Calendar, Tag, CheckCircle, Filter } from 'lucide-react';
import { Card, Button, Badge } from '../components/ui/Base';
import api from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { formatDate } from '../utils/dateFormatter';
import { useAuth } from '../context/AuthContext';

const SalesHistoryPage = () => {
    const { formatPrice } = useCurrency();
    const { user } = useAuth();
    
    const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' or 'daily-summaries'
    
    const [sales, setSales] = useState([]);
    const [loadingSales, setLoadingSales] = useState(true);
    const [search, setSearch] = useState('');
    const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'today', 'week', 'month'
    
    const [todaySummary, setTodaySummary] = useState(null);
    const [historicalSummaries, setHistoricalSummaries] = useState([]);
    const [loadingSummaries, setLoadingSummaries] = useState(false);
    const [summaryTimeFilter, setSummaryTimeFilter] = useState('all'); // 'all', 'today', 'week', 'month'
    const [finalizing, setFinalizing] = useState(false);

    const isAdmin = user?.role === 'admin';

    const fetchSales = async () => {
        setLoadingSales(true);
        try {
            const response = await api.get('/sales').catch(() => api.get('/orders'));
            const data = Array.isArray(response.data) ? response.data : [];
            setSales(data.reverse()); // Newest first
        } catch (error) {
            console.error("Fetch sales error:", error);
            setSales([]);
        } finally {
            setLoadingSales(false);
        }
    };

    const fetchSummaries = async () => {
        setLoadingSummaries(true);
        try {
            const todayRes = await api.get('/reports/daily/today');
            setTodaySummary(todayRes.data);

            if (isAdmin) {
                const historyRes = await api.get('/reports/daily/history');
                const historyData = Array.isArray(historyRes.data) ? historyRes.data : [];
                setHistoricalSummaries(historyData.reverse());
            }
        } catch (error) {
            console.error("Fetch summaries error:", error);
        } finally {
            setLoadingSummaries(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'transactions') {
            fetchSales();
        } else if (activeTab === 'daily-summaries') {
            fetchSummaries();
        }
    }, [activeTab]);

    const handleFinalizeDay = async () => {
        if (!window.confirm("Are you sure you want to finalize today's bill? This action cannot be undone.")) return;
        
        setFinalizing(true);
        try {
            await api.post('/reports/daily/finalize');
            alert("Day successfully finalized!");
            fetchSummaries(); // Refresh
        } catch (error) {
            alert(error.response?.data || "Failed to finalize day.");
        } finally {
            setFinalizing(false);
        }
    };

    const filteredSales = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfWeek = startOfToday - (7 * 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        return sales.filter(s => {
            // Search filter
            const orderIdStr = (s.invoiceNumber || s.id || '').toString();
            const hasItem = s.items?.some(item => (item.product?.name || item.name || '').toLowerCase().includes(search.toLowerCase()));
            const matchesSearch = orderIdStr.toLowerCase().includes(search.toLowerCase()) || hasItem;

            if (!matchesSearch) return false;

            // Time filter
            const saleDate = new Date(s.orderDate || s.timestamp || s.createdAt || Date.now()).getTime();
            
            if (timeFilter === 'today') return saleDate >= startOfToday;
            if (timeFilter === 'week') return saleDate >= startOfWeek;
            if (timeFilter === 'month') return saleDate >= startOfMonth;
            
            return true; // 'all'
        });
    }, [sales, search, timeFilter]);

    const filteredSummaries = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfWeek = startOfToday - (7 * 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        return historicalSummaries.filter(s => {
            if (!s.summaryDate) return true;
            
            // summaryDate is usually "YYYY-MM-DD"
            const [year, month, day] = s.summaryDate.split('-').map(Number);
            const summaryDate = new Date(year, month - 1, day).getTime();
            
            if (summaryTimeFilter === 'today') return summaryDate >= startOfToday;
            if (summaryTimeFilter === 'week') return summaryDate >= startOfWeek;
            if (summaryTimeFilter === 'month') return summaryDate >= startOfMonth;
            
            return true; // 'all'
        });
    }, [historicalSummaries, summaryTimeFilter]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Sales & Daily Records</h1>
                    <p className="text-slate-400 text-sm">Review past transactions and day-end logs</p>
                </div>
                {activeTab === 'transactions' && (
                    <Button onClick={fetchSales} variant="secondary" className="flex items-center gap-2">
                        Refresh Logs
                    </Button>
                )}
            </div>
            
            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-2">
                <button 
                    onClick={() => setActiveTab('transactions')}
                    className={`pb-2 px-2 text-sm font-medium transition-colors ${activeTab === 'transactions' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-white'}`}
                >
                    Transactions
                </button>
                <button 
                    onClick={() => setActiveTab('daily-summaries')}
                    className={`pb-2 px-2 text-sm font-medium transition-colors ${activeTab === 'daily-summaries' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-white'}`}
                >
                    Daily Summaries (Day Close)
                </button>
            </div>

            {activeTab === 'transactions' ? (
                <>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by Order ID or Product name..."
                                className="glass-input w-full pl-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="relative md:w-48">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <select 
                                className="glass-input w-full pl-10 appearance-none bg-black/50 text-white"
                                value={timeFilter}
                                onChange={(e) => setTimeFilter(e.target.value)}
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">Last 7 Days</option>
                                <option value="month">This Month</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {filteredSales.map((sale) => (
                            <Card key={sale.id} className="hover:bg-white/5 transition-colors border-white/5">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <History className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">Order #{sale.invoiceNumber || sale.id}</h3>
                                            <p className="text-slate-400 text-sm flex items-center gap-2">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(sale.orderDate || sale.timestamp || Date.now())}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="hidden md:block">
                                            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Products</p>
                                            <div className="flex gap-1">
                                                {sale.items?.map((item, idx) => (
                                                    <Badge key={idx} variant="info" className="text-[10px]">
                                                        {item.quantity}x {item.product?.name || item.name || 'Item'}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Grand Total</p>
                                            <p className="text-xl font-bold text-primary">{formatPrice(sale.totalAmount ?? sale.totals?.total ?? 0)}</p>
                                        </div>
                                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                        {filteredSales.length === 0 && !loadingSales && (
                            <div className="text-center py-20 text-slate-500">
                                No transactions found for the selected filter
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex flex-col gap-8">
                    {/* Today's Summary Section */}
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">Today's Summary (Live)</h2>
                        {loadingSummaries ? (
                            <p className="text-slate-400">Loading today's data...</p>
                        ) : todaySummary ? (
                            <Card className="border-primary/20 bg-primary/5">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase">Date</p>
                                        <p className="text-lg font-bold text-white">{todaySummary.summaryDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase">Total Orders</p>
                                        <p className="text-lg font-bold text-white">{todaySummary.totalOrdersCount}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase">Cash Income</p>
                                        <p className="text-lg font-bold text-emerald-400">{formatPrice(todaySummary.totalCash || 0)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase">Card Income</p>
                                        <p className="text-lg font-bold text-blue-400">{formatPrice(todaySummary.totalCard || 0)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                                    <div>
                                        <p className="text-sm text-slate-400 uppercase tracking-wide">Total Revenue</p>
                                        <p className="text-3xl font-black text-primary">{formatPrice(todaySummary.totalRevenue || 0)}</p>
                                    </div>
                                    <Button onClick={handleFinalizeDay} disabled={finalizing} className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5" />
                                        {finalizing ? 'Finalizing...' : "Finalize Today's Bill"}
                                    </Button>
                                </div>
                            </Card>
                        ) : null}
                    </div>

                    {/* Historical Summaries Section (Admin Only) */}
                    {isAdmin && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white">Past Daily Records</h2>
                                <div className="relative md:w-48">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <select 
                                        className="glass-input w-full pl-10 appearance-none bg-black/50 text-white"
                                        value={summaryTimeFilter}
                                        onChange={(e) => setSummaryTimeFilter(e.target.value)}
                                    >
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="week">Last 7 Days</option>
                                        <option value="month">This Month</option>
                                    </select>
                                </div>
                            </div>
                            
                            {filteredSummaries.length === 0 ? (
                                <p className="text-slate-400">No past records found for the selected filter.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredSummaries.map((hist) => (
                                        <Card key={hist.id} className="border-white/5 bg-black/20">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-bold text-white text-lg">{hist.summaryDate}</h3>
                                                    <p className="text-xs text-slate-500">Closed by {hist.finalizedBy}</p>
                                                </div>
                                                <Badge variant="success">Finalized</Badge>
                                            </div>
                                            <div className="space-y-2 text-sm text-slate-300">
                                                <div className="flex justify-between">
                                                    <span>Total Orders:</span>
                                                    <span className="font-medium text-white">{hist.totalOrdersCount}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Cash:</span>
                                                    <span className="font-medium text-emerald-400">{formatPrice(hist.totalCash || 0)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Card:</span>
                                                    <span className="font-medium text-blue-400">{formatPrice(hist.totalCard || 0)}</span>
                                                </div>
                                            </div>
                                            <div className="border-t border-white/10 mt-4 pt-3 flex justify-between items-center">
                                                <span className="text-xs uppercase text-slate-500 font-bold">Total</span>
                                                <span className="font-black text-primary text-lg">{formatPrice(hist.totalRevenue || 0)}</span>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SalesHistoryPage;
