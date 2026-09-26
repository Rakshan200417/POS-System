import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs) => twMerge(clsx(inputs));

export const Card = ({ children, className, ...props }) => (
    <div className={cn('glass-card p-6', className)} {...props}>
        {children}
    </div>
);

export const Button = ({ children, variant = 'primary', className, ...props }) => (
    <button
        className={cn(
            'btn-neon',
            variant === 'primary' ? 'btn-primary' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10',
            className
        )}
        {...props}
    >
        {children}
    </button>
);

export const Input = ({ label, className, ...props }) => (
    <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-medium text-slate-400 ml-1">{label}</label>}
        <input
            className={cn('glass-input text-white placeholder:text-slate-500', className)}
            {...props}
        />
    </div>
);

export const Badge = ({ children, variant = 'info' }) => {
    const styles = {
        info: 'bg-primary/20 text-primary border-primary/30',
        success: 'bg-green-500/20 text-green-400 border-green-500/30',
        warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        danger: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return (
        <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold border', styles[variant])}>
            {children}
        </span>
    );
};
