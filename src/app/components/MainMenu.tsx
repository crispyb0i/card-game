"use client";

import React from 'react';

interface MainMenuProps {
    onStartGame: () => void;
    onOpenShop: () => void;
    onOpenInventory: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onOpenShop, onOpenInventory }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-amber-100 font-serif">
            <h1 className="text-6xl font-black mb-12 tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                MYTHIC TRIAD
            </h1>

            <div className="flex flex-col gap-6 w-64">
                <button
                    onClick={onStartGame}
                    className="w-full py-4 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-bold text-xl rounded-sm border-2 border-emerald-600 shadow-[0_4px_0_#064e3b] active:shadow-none active:translate-y-1 transition-all"
                >
                    PLAY GAME
                </button>

                <button
                    onClick={onOpenShop}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-sm border border-slate-600 hover:border-slate-400"
                >
                    SHOP
                </button>

                <button
                    onClick={onOpenInventory}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-sm border border-slate-600 hover:border-slate-400"
                >
                    INVENTORY
                </button>
            </div>

            <div className="mt-16 text-slate-500 text-sm italic">
                v0.2.0 Fantasy Update
            </div>
        </div>
    );
};
