import React, { useState } from 'react';
import { Package, Plus, Search, Filter, Edit3, Trash2, ArrowUpRight } from 'lucide-react';
import { Card, Button, Input, Badge } from '../components/ui/Base';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

const ProductsPage = () => {
    const { user } = useAuth();
    const { currency, formatPrice } = useCurrency();
    const isAdmin = user?.role === 'admin' 
        || user?.roles?.some(r => r.toUpperCase() === 'ROLE_ADMIN' || r.toUpperCase() === 'ADMIN')
        || user?.name?.toLowerCase() === 'admin';

    const [search, setSearch] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', stock: '', barcode: '', unit: 'pcs', memberDiscountPercentage: 0 });

    const mockProducts = [
        { id: 1, name: 'Fresh Fuji Apples', price: 3.99, category: 'Fresh Produce', stock: 150, sku: '50001', barcode: '50001', unit: 'kg' },
        { id: 2, name: 'Organic Whole Milk', price: 4.50, category: 'Dairy', stock: 45, sku: '50002', barcode: '50002', unit: 'pack' },
        { id: 3, name: 'Artisan Sourdough', price: 5.20, category: 'Bakery', stock: 20, sku: '50003', barcode: '50003', unit: 'pcs' },
        { id: 4, name: 'Premium Ground Coffee', price: 12.00, category: 'Pantry', stock: 35, sku: '50004', barcode: '50004', unit: 'pack' },
    ];

    const [stockModalProduct, setStockModalProduct] = useState(null);
    const [stockDelta, setStockDelta] = useState(10);
    const [actionNotice, setActionNotice] = useState(null);

    const showToast = (msg) => {
        setActionNotice(msg);
        setTimeout(() => setActionNotice(null), 3000);
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/products');
            setProducts(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Fetch products error:", error);
            setProducts(mockProducts);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete product "${name || id}"?`)) return;
        try {
            await api.delete(`/products/${id}`);
            showToast(`Product "${name}" deleted successfully`);
            fetchProducts();
        } catch (error) {
            console.error("Delete product error:", error);
            alert('Failed to delete product: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: newProduct.name,
                sku: newProduct.barcode || newProduct.sku || ('SKU-' + Date.now()),
                description: newProduct.category || newProduct.description || 'General',
                price: parseFloat(newProduct.price),
                stock: parseInt(newProduct.stock),
                memberDiscountPercentage: parseFloat(newProduct.memberDiscountPercentage || 0),
                minStockLevel: 5
            };

            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, payload);
                showToast(`Product "${payload.name}" updated successfully!`);
            } else {
                await api.post('/products', payload);
                showToast(`Product "${payload.name}" created successfully!`);
            }

            setShowAddForm(false);
            setEditingProduct(null);
            setNewProduct({ name: '', price: '', category: '', stock: '', barcode: '', unit: 'pcs', memberDiscountPercentage: 0 });
            fetchProducts();
        } catch (error) {
            console.error("Save product error:", error);
            alert('Failed to save product: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleQuickStockUpdate = async (e) => {
        e.preventDefault();
        if (!stockModalProduct) return;
        const newTotal = Number(stockModalProduct.stock) + Number(stockDelta);
        try {
            // Update stock
            await api.patch(`/products/${stockModalProduct.id}/stock?stock=${newTotal}`).catch(async () => {
                await api.put(`/products/${stockModalProduct.id}`, {
                    ...stockModalProduct,
                    stock: newTotal
                });
            });
            showToast(`Added ${stockDelta} units to "${stockModalProduct.name}". New Stock: ${newTotal}`);
            setStockModalProduct(null);
            setStockDelta(10);
            fetchProducts();
        } catch (err) {
            console.error("Stock update error:", err);
            alert("Failed to update stock: " + (err.response?.data?.message || err.message));
        }
    };

    const startEdit = (product) => {
        setEditingProduct(product);
        setNewProduct({
            name: product.name,
            price: product.price,
            category: product.description || product.category || '',
            stock: product.stock,
            barcode: product.sku || product.barcode || '',
            unit: product.unit || 'pcs',
            memberDiscountPercentage: product.memberDiscountPercentage || 0
        });
        setShowAddForm(true);
    };

    const cancelForm = () => {
        setShowAddForm(false);
        setEditingProduct(null);
        setNewProduct({ name: '', price: '', category: '', stock: '', barcode: '', unit: 'pcs', memberDiscountPercentage: 0 });
    };

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

    return (
        <div className="flex flex-col gap-6 relative">
            {/* Action notification toast */}
            {actionNotice && (
                <div className="fixed top-6 right-6 z-50 bg-primary/20 border border-primary text-white px-5 py-3 rounded-xl shadow-neon-blue backdrop-blur-md flex items-center gap-3 animate-bounce">
                    <Package className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-sm">{actionNotice}</span>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
                    <p className="text-slate-400 text-sm">Monitor stock levels, scan barcodes, and restock products</p>
                </div>
                {isAdmin && (
                    <Button onClick={() => { setEditingProduct(null); setNewProduct({ name: '', price: '', category: '', stock: '', barcode: '', unit: 'pcs', memberDiscountPercentage: 0 }); setShowAddForm(true); }} className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Add New Product
                    </Button>
                )}
            </div>

            {/* Centered Modal for Add / Edit Product */}
            <AnimatePresence>
                {isAdmin && showAddForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-2xl"
                        >
                            <Card className="bg-dark-surface/95 border-white/20 shadow-2xl p-6">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Package className="w-6 h-6 text-primary" />
                                        {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}
                                    </h3>
                                    <button onClick={cancelForm} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
                                </div>

                                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <Input label="Product Name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="e.g. Organic Avocados" required />
                                    </div>
                                    <Input label="Barcode / SKU" value={newProduct.barcode} onChange={e => setNewProduct({ ...newProduct, barcode: e.target.value })} placeholder="e.g. 50001 or SCAN" required />
                                    <Input label="Category / Description" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} placeholder="e.g. Produce, Dairy" />
                                    <Input label={`Price (${currency})`} type="number" step="0.01" min="0" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="0.00" required />
                                    <Input label="Product Discount (%)" type="number" step="1" min="0" max="100" value={newProduct.memberDiscountPercentage} onChange={e => setNewProduct({ ...newProduct, memberDiscountPercentage: e.target.value })} placeholder="0" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input label="Stock Units" type="number" min="0" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} placeholder="0" required />
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-1">Unit</label>
                                            <select
                                                className="glass-input bg-dark-base/50 text-sm h-10"
                                                value={newProduct.unit}
                                                onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
                                            >
                                                <option value="pcs">Pcs</option>
                                                <option value="kg">Kg</option>
                                                <option value="g">Grams</option>
                                                <option value="pack">Pack</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">
                                        <Button type="button" variant="secondary" onClick={cancelForm}>Cancel</Button>
                                        <Button type="submit">{editingProduct ? 'Save Changes' : 'Create Product'}</Button>
                                    </div>
                                </form>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Centered Modal for Quick Restock */}
            <AnimatePresence>
                {isAdmin && stockModalProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md"
                        >
                            <Card className="bg-dark-surface/95 border-white/20 shadow-2xl p-6">
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                                    <div>
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Plus className="w-5 h-5 text-primary" />
                                            Restock Inventory
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1">{stockModalProduct.name} (SKU: {stockModalProduct.sku || stockModalProduct.barcode})</p>
                                    </div>
                                    <button onClick={() => setStockModalProduct(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
                                </div>

                                <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                                    <span className="text-xs text-slate-400">Current In Stock:</span>
                                    <span className="text-lg font-bold text-primary">{stockModalProduct.stock} units</span>
                                </div>

                                <form onSubmit={handleQuickStockUpdate} className="flex flex-col gap-4">
                                    <div>
                                        <label className="text-xs text-slate-300 font-semibold mb-1 block">Quick Add Amount:</label>
                                        <div className="grid grid-cols-5 gap-2 mb-3">
                                            {[5, 10, 20, 50, 100].map(val => (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onClick={() => setStockDelta(val)}
                                                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${stockDelta === val ? 'bg-primary text-black' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                                                >
                                                    +{val}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <Input
                                        label="Or Enter Custom Quantity to Add"
                                        type="number"
                                        value={stockDelta}
                                        onChange={e => setStockDelta(parseInt(e.target.value) || 0)}
                                        required
                                    />

                                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-slate-300">
                                        New stock after update: <strong className="text-white text-sm">{Number(stockModalProduct.stock) + Number(stockDelta)}</strong> units
                                    </div>

                                    <div className="flex justify-end gap-3 mt-2">
                                        <Button type="button" variant="secondary" onClick={() => setStockModalProduct(null)}>Cancel</Button>
                                        <Button type="submit">Confirm Restock</Button>
                                    </div>
                                </form>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search products, SKU or scan barcode..."
                        className="glass-input w-full pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="secondary" className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filters
                </Button>
            </div>

            <Card className="p-0 overflow-hidden bg-dark-surface/30">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-slate-400 text-sm uppercase tracking-wider">
                            <th className="px-6 py-4 font-semibold text-[10px]">Product / Barcode (SKU)</th>
                            <th className="px-6 py-4 font-semibold text-[10px]">Category</th>
                            <th className="px-6 py-4 font-semibold text-[10px]">Price</th>
                            <th className="px-6 py-4 font-semibold text-[10px]">Stock / Restock</th>
                            <th className="px-6 py-4 font-semibold text-[10px]">Status</th>
                            {isAdmin && <th className="px-6 py-4 font-semibold text-[10px] text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-primary border border-white/10">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">{product.name}</p>
                                            <p className="text-[10px] text-primary/80 font-mono tracking-widest">{product.sku || product.barcode || `#${product.id}`}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-300">{product.description || product.category || 'General'}</td>
                                <td className="px-6 py-4 font-bold text-white">{formatPrice(product.price)}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-3">
                                            <span className={`font-bold ${product.stock < 10 ? 'text-red-400' : 'text-slate-200'}`}>
                                                {product.stock} <span className="text-[10px] text-slate-500 uppercase">{product.unit || 'units'}</span>
                                            </span>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => { setStockModalProduct(product); setStockDelta(10); }}
                                                    className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-black transition-all"
                                                    title="Add stock immediately"
                                                >
                                                    + Restock
                                                </button>
                                            )}
                                        </div>
                                        <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${product.stock < 10 ? 'bg-red-500 shadow-neon-purple' : 'bg-primary shadow-neon-blue'}`}
                                                style={{ width: `${Math.min(product.stock * 2, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant={product.stock < 10 ? 'danger' : 'success'}>
                                        {product.stock < 10 ? 'Low Stock' : 'In Stock'}
                                    </Badge>
                                </td>
                                {isAdmin && (
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => startEdit(product)}
                                                className="p-2 bg-white/5 hover:bg-primary/20 rounded-lg text-slate-300 hover:text-primary transition-all border border-white/5"
                                                title="Edit Product Details"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id, product.name)}
                                                className="p-2 bg-white/5 hover:bg-red-500/20 rounded-lg text-slate-300 hover:text-red-400 transition-all border border-white/5"
                                                title="Delete Product"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default ProductsPage;
