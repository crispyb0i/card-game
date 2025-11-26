"use client";

import React, { useState } from 'react';
import { Card as CardType } from '../../lib/types';
import { CHARACTERS } from '../../lib/cards';
import { Card } from './Card';
import { useStore } from '../../store/useStore';

interface ShopProps {
    onBack: () => void;
}

export const Shop: React.FC<ShopProps> = ({ onBack }) => {
    // Access Store
    const credits = useStore((state) => state.credits);
    const spendCredits = useStore((state) => state.spendCredits);
    const addCard = useStore((state) => state.addCard);

    const [openedCards, setOpenedCards] = useState<CardType[] | null>(null);
    const [isOpening, setIsOpening] = useState(false);
    const [previewCard, setPreviewCard] = useState<CardType | null>(null);

    const buyPack = () => {
        // Use store action to check and spend credits
        const success = spendCredits(100);

        if (!success) {
            alert("Not enough credits!");
            return;
        }

        setIsOpening(true);

        // Generate 3 cards
        setTimeout(() => {
            const newCards = Array.from({ length: 3 }).map((_, i) => {
                // Rarity Weights: Common 60%, Rare 30%, Epic 9%, Legendary 1%
                const rand = Math.random();
                let rarity = 'common';
                if (rand > 0.99) rarity = 'legendary';
                else if (rand > 0.90) rarity = 'epic';
                else if (rand > 0.60) rarity = 'rare';

                const pool = CHARACTERS.filter(c => c.rarity === rarity);
                const char = pool[Math.floor(Math.random() * pool.length)] || CHARACTERS[0];

                // Add to Store Inventory
                addCard(char.id);

                return {
                    id: `new-${char.id}-${Date.now()}-${i}`,
                    name: char.name,
                    stats: { ...char.stats },
                    baseStats: { ...char.stats },
                    imageUrl: char.imageUrl,
                    owner: 'player',
                    rarity: char.rarity,
                    variant: 'base',
                    characterId: char.id,
                    ability: char.ability,
                } as CardType;
            });

            setOpenedCards(newCards);
            setIsOpening(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-amber-100 p-8 font-serif flex flex-col items-center">
            <header className="w-full max-w-4xl flex justify-between items-center mb-12">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                    Card Shop
                </h1>
                <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-amber-400">
                        {credits} <span className="text-sm text-amber-200">CREDITS</span>
                    </div>
                    <button
                        onClick={onBack}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-sm"
                    >
                        EXIT
                    </button>
                </div>
            </header>

            {!openedCards && !isOpening && (
                <div className="flex flex-col items-center gap-8 animate-fade-in">
                    <div className="w-64 h-80 bg-gradient-to-br from-amber-700 to-amber-900 rounded-lg border-4 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform" onClick={buyPack}>
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-amber-100 mb-2">MYTHIC PACK</h2>
                            <p className="text-amber-300 font-bold">100 CREDITS</p>
                            <p className="text-xs text-amber-400 mt-4">Contains 3 Cards</p>
                        </div>
                    </div>
                    <p className="text-slate-400 italic">Click to purchase a pack</p>
                </div>
            )}

            {isOpening && (
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-amber-400 font-bold animate-pulse">OPENING PACK...</p>
                </div>
            )}

            {openedCards && (
                <div className="flex flex-col items-center gap-8 animate-fade-in-up">
                    <h2 className="text-3xl font-bold text-white">PACK OPENED!</h2>
                    <div className="flex gap-6">
                        {openedCards.map((card) => (
                            <div
                                key={card.id}
                                className="animate-flip cursor-pointer"
                                onClick={() => setPreviewCard(card)}
                            >
                                <Card card={card} />
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => setOpenedCards(null)}
                        className="px-8 py-3 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-bold rounded-sm border border-emerald-600"
                    >
                        OPEN ANOTHER
                    </button>
                </div>
            )}

            {previewCard && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
                    onClick={() => setPreviewCard(null)}
                >
                    <div
                        className="relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Card card={previewCard} className="scale-150 shadow-2xl" />
                        <button
                            onClick={() => setPreviewCard(null)}
                            className="absolute -top-6 -right-6 w-8 h-8 rounded-full bg-black/80 text-amber-100 text-sm font-bold flex items-center justify-center border border-amber-400 hover:bg-amber-600 hover:text-black transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
