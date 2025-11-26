"use client";

import React from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    const colors = {
        success: 'bg-emerald-900/90 border-emerald-500 text-emerald-100',
        error: 'bg-red-900/90 border-red-500 text-red-100',
        info: 'bg-blue-900/90 border-blue-500 text-blue-100',
        warning: 'bg-amber-900/90 border-amber-500 text-amber-100',
    };

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠',
    };

    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-slide-down">
            <div className={`${colors[type]} border-2 rounded-lg shadow-2xl backdrop-blur-sm px-6 py-4 flex items-center gap-4 min-w-[320px] max-w-[480px]`}>
                <div className="text-2xl font-bold">
                    {icons[type]}
                </div>
                <div className="flex-1 font-sans text-sm font-medium">
                    {message}
                </div>
                <button
                    onClick={onClose}
                    className="text-xl opacity-60 hover:opacity-100 transition-opacity leading-none"
                >
                    ×
                </button>
            </div>
        </div>
    );
};
