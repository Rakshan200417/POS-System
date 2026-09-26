import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';

export const LoadingOverlay = ({ visible }) => (
    <AnimatePresence>
        {visible && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            >
                <div className="glass-card p-8 flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="text-xl font-medium text-white">Loading Systems...</p>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

export const ErrorToast = ({ message, onClose }) => (
    <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="fixed bottom-8 right-8 z-50"
    >
        <div className="glass-card border-red-500/50 bg-red-500/10 p-4 flex items-center gap-3">
            <AlertCircle className="text-red-500" />
            <p className="text-white">{message}</p>
            <button onClick={onClose} className="ml-4 text-white/50 hover:text-white">✕</button>
        </div>
    </motion.div>
);
