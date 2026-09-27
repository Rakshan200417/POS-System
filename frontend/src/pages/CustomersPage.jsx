import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Mail, Phone, Calendar, ArrowRight, Trash2 } from 'lucide-react';
import { Card, Button, Input, Badge } from '../components/ui/Base';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { formatDate } from '../utils/dateFormatter';

const CustomersPage = () => {
    const [search, setSearch] = useState('');
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', address: '' });

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/customers');
            setCustomers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Fetch customers error:", error);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/customers', {
                name: newCustomer.name,
                email: newCustomer.email,
                phone: newCustomer.phone,
                address: newCustomer.address || 'Walk-in Customer',
                loyaltyPoints: 0
            });
            setShowAddForm(false);
            setNewCustomer({ name: '', email: '', phone: '', address: '' });
            fetchCustomers();
        } catch (error) {
            console.error("Add customer error:", error);
            alert('Failed to add customer: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this customer?')) return;
        try {
            await api.delete(`/customers/${id}`);
            fetchCustomers();
        } catch (error) {
            console.error("Delete customer error:", error);
            alert('Failed to delete customer: ' + (error.response?.data?.message || error.message));
        }
    };

    const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Customer Hub</h1>
                    <p className="text-slate-400 text-sm">Loyalty points and purchase history</p>
                </div>
                <Button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    {showAddForm ? 'Cancel' : 'Add Customer'}
                </Button>
            </div>

            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="bg-white/5">
                            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input label="Full Name" value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} required />
                                <Input label="Email" type="email" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} required />
                                <Input label="Phone Number" value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} required />
                                <div className="md:col-span-3 flex justify-end">
                                    <Button type="submit">Register Customer</Button>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search customers by name, phone or email..."
                    className="glass-input w-full pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((customer) => (
                    <Card key={customer.id} className="group hover:border-primary/50 transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={(customer.loyaltyPoints || customer.points || 0) > 100 ? 'success' : 'info'}>
                                    {customer.loyaltyPoints ?? customer.points ?? 0} XP Points
                                </Badge>
                                <button
                                    onClick={() => handleDelete(customer.id)}
                                    className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                    title="Delete Customer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-4 group-hover:text-primary transition-colors">
                            {customer.name}
                        </h3>

                        <div className="flex flex-col gap-3 mb-6">
                            <div className="flex items-center gap-3 text-slate-400 text-sm">
                                <Mail className="w-4 h-4" />
                                <span>{customer.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400 text-sm">
                                <Phone className="w-4 h-4" />
                                <span>{customer.phone}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400 text-sm">
                                <Calendar className="w-4 h-4" />
                                <span>Last Activity: {customer.lastOrder || (customer.createdAt ? formatDate(customer.createdAt) : 'Recent')}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                            <span className="text-xs text-slate-400">
                                {customer.address || 'Walk-in Customer'}
                            </span>
                            <span className="text-xs text-slate-600 font-mono">UID: #{customer.id}</span>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default CustomersPage;
