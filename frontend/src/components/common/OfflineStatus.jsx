import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const OfflineStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleSync = () => {
        setSyncing(true);
        // Simulate sync
        setTimeout(() => setSyncing(false), 2000);
    };

    return (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-[100]"
                >
                    <div className="glass-card bg-red-500/20 border-red-500/50 px-6 py-2 flex items-center gap-3">
                        <WifiOff className="text-red-500 w-5 h-5" />
                        <span className="text-white font-medium">Terminal Offline - Changes stored locally</span>
                    </div>
                </motion.div>
            )}

            {isOnline && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed bottom-4 right-8 z-[100]"
                >
                    <button
                        onClick={handleSync}
                        className="glass-card bg-white/5 px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 text-primary ${syncing ? 'animate-spin' : ''}`} />
                        <span className="text-xs text-slate-400">
                            {syncing ? 'Syncing data...' : 'All systems synced'}
                        </span>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
