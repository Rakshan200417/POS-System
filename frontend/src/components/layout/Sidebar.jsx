import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    BarChart3,
    Settings,
    ShieldCheck,
    LogOut,
    Sun,
    Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../ui/Base';

const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) => cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
            isActive
                ? 'bg-primary/20 text-primary shadow-neon-blue border border-primary/30'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
        )}
    >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
    </NavLink>
);

export const Sidebar = () => {
    const { logout, user } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const isAdmin = user?.role === 'admin' 
        || user?.roles?.some(r => r.toUpperCase() === 'ROLE_ADMIN' || r.toUpperCase() === 'ADMIN')
        || user?.name?.toLowerCase() === 'admin';

    return (
        <aside className="w-64 h-screen flex flex-col p-4 border-r border-white/5 bg-dark-base/50 backdrop-blur-xl">
            <div className="flex items-center gap-3 px-4 py-8">
                <div className="w-10 h-10 rounded-xl bg-neon-gradient shadow-neon-blue flex items-center justify-center">
                    <ShoppingCart className="text-white w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold bg-neon-gradient bg-clip-text text-transparent">
                    RK super
                </h1>
            </div>

            <nav className="flex-1 flex flex-col gap-2 overflow-y-auto no-scrollbar">
                <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                <NavItem to="/pos" icon={ShoppingCart} label="Point of Sale" />
                <NavItem to="/products" icon={Package} label="Products" />
                <NavItem to="/customers" icon={Users} label="Customers" />
                <NavItem to="/reports" icon={BarChart3} label="Sales History" />

                {isAdmin && (
                    <>
                        <div className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Admin Controls
                        </div>
                        <NavItem to="/users" icon={ShieldCheck} label="User Management" />
                        <NavItem to="/settings" icon={Settings} label="Settings" />
                    </>
                )}
            </nav>

            <div className="mt-auto pt-6 flex flex-col gap-4">
                <div className="glass-card p-4 flex items-center gap-3 bg-white/5 border-white/10">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-primary font-bold">
                        {user?.name?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user?.name || 'Admin'}</p>
                        <p className="text-xs text-slate-400 truncate capitalize">{isAdmin ? 'Administrator' : 'Cashier'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition-all font-medium border border-white/5"
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        <span>{isDarkMode ? 'Light' : 'Dark'}</span>
                    </button>
                    <button
                        onClick={logout}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-medium border border-red-500/10"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};
