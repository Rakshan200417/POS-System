import React, { useState, useEffect } from 'react';
import { Shield, UserPlus, Users, Trash2, Mail, Key, ShieldCheck, UserCheck, Search, AlertCircle } from 'lucide-react';
import { Card, Button, Input, Badge } from '../components/ui/Base';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const UserManagementPage = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'cashier' });
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users');
            setUsers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Fetch users error:", error);
            // Mock fallback if offline
            setUsers([
                { id: 1, username: 'admin', email: 'admin@pos.com', roles: ['ROLE_ADMIN', 'ROLE_CASHIER'] },
                { id: 2, username: 'cashier', email: 'cashier@pos.com', roles: ['ROLE_CASHIER'] }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setStatusMessage({ type: '', text: '' });
        try {
            await api.post('/users', newUser);
            setStatusMessage({ type: 'success', text: `Staff member "${newUser.username}" created successfully!` });
            setShowForm(false);
            setNewUser({ username: '', email: '', password: '', role: 'cashier' });
            fetchUsers();
        } catch (error) {
            console.error("Create user error:", error);
            const msg = error.response?.data?.message || error.message || 'Failed to create user';
            setStatusMessage({ type: 'error', text: msg });
        }
    };

    const handleDelete = async (id, username) => {
        if (id === 1 || username === 'admin') {
            alert('The primary administrator account cannot be deleted.');
            return;
        }
        if (!window.confirm(`Are you sure you want to remove user "${username}"?`)) return;

        try {
            await api.delete(`/users/${id}`);
            setStatusMessage({ type: 'success', text: `User "${username}" removed successfully!` });
            fetchUsers();
        } catch (error) {
            console.error("Delete user error:", error);
            alert('Failed to delete user: ' + (error.response?.data?.message || error.message));
        }
    };

    const filteredUsers = users.filter(u =>
        (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase())
    );

    const cashierCount = users.filter(u => u.roles?.includes('ROLE_CASHIER') && !u.roles?.includes('ROLE_ADMIN')).length;
    const adminCount = users.filter(u => u.roles?.includes('ROLE_ADMIN')).length;

    return (
        <div className="flex flex-col gap-6">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <ShieldCheck className="text-primary w-7 h-7" />
                        Staff & User Management
                    </h1>
                    <p className="text-slate-400 text-sm">Control terminal access, assign cashier roles, and manage accounts</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    {showForm ? 'Cancel' : 'Add New Staff'}
                </Button>
            </div>

            {/* Notification alert */}
            {statusMessage.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${statusMessage.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{statusMessage.text}</span>
                </div>
            )}

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex items-center gap-4 bg-white/5 border-white/5">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">Total Accounts</p>
                        <h3 className="text-2xl font-bold text-white">{users.length}</h3>
                    </div>
                </Card>
                <Card className="flex items-center gap-4 bg-white/5 border-white/5">
                    <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary">
                        <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">Active Cashiers</p>
                        <h3 className="text-2xl font-bold text-white">{cashierCount}</h3>
                    </div>
                </Card>
                <Card className="flex items-center gap-4 bg-white/5 border-white/5">
                    <div className="w-12 h-12 rounded-xl bg-neon-purple/20 flex items-center justify-center text-purple-400">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">Administrators</p>
                        <h3 className="text-2xl font-bold text-white">{adminCount}</h3>
                    </div>
                </Card>
            </div>

            {/* Add User Modal / Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="bg-white/5 border-primary/30">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-primary" />
                                Register New Staff Member
                            </h3>
                            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Input
                                    label="Username"
                                    placeholder="e.g. cashier_john"
                                    value={newUser.username}
                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    placeholder="john@pos.com"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Initial Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    required
                                />
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-1">Role</label>
                                    <select
                                        className="glass-input bg-dark-base/50 text-sm h-10"
                                        value={newUser.role}
                                        onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                    >
                                        <option value="cashier">Cashier (POS & Sales only)</option>
                                        <option value="admin">Administrator (Full System Access)</option>
                                    </select>
                                </div>
                                <div className="md:col-span-4 flex justify-end gap-3 mt-2">
                                    <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        Save Staff Account
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search filter */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search staff by username or email..."
                    className="glass-input w-full pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Users List Table */}
            <Card className="p-0 overflow-hidden bg-dark-surface/30">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-slate-400 text-sm uppercase tracking-wider">
                            <th className="px-6 py-4 font-semibold text-[10px]">Staff Member</th>
                            <th className="px-6 py-4 font-semibold text-[10px]">Email Address</th>
                            <th className="px-6 py-4 font-semibold text-[10px]">Assigned Role</th>
                            <th className="px-6 py-4 font-semibold text-[10px]">Terminal Access</th>
                            <th className="px-6 py-4 font-semibold text-[10px] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredUsers.map((u) => {
                            const isAdmin = u.roles?.includes('ROLE_ADMIN');
                            return (
                                <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-primary font-bold">
                                                {u.username?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white capitalize">{u.username}</p>
                                                <p className="text-[10px] text-slate-500 font-mono">UID: #{u.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-slate-500" />
                                            <span>{u.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={isAdmin ? 'danger' : 'info'}>
                                            {isAdmin ? 'Administrator' : 'Cashier'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        {isAdmin ? 'Full System & Inventory' : 'POS Terminal & Customers'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {u.id !== 1 && u.username !== currentUser?.name ? (
                                            <button
                                                onClick={() => handleDelete(u.id, u.username)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                                title="Remove Staff Member"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <span className="text-xs text-slate-600 italic">Protected</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default UserManagementPage;
