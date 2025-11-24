"use client";

import React, { useState, useEffect } from 'react';
import { Card as CardType, Rarity } from '../../lib/types';
import { CHARACTERS } from '../../lib/cards';
import { Card } from './Card';

interface InventoryProps {
    onBack: () => void;
    onSaveDeck: (deck: CardType[]) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ onBack, onSaveDeck }) => {
    const [ownedCards, setOwnedCards] = useState<CardType[]>([]);
    const [selectedDeck, setSelectedDeck] = useState<string[]>([]); // IDs of selected cards
    const [filter, setFilter] = useState<Rarity | 'all'>('all');
    const [previewCard, setPreviewCard] = useState<CardType | null>(null);

    // Initialize Inventory (Mock: Give user all characters for now)
    useEffect(() => {
        // In a real app, load from localStorage or DB
        const initialCards: CardType[] = CHARACTERS.map((char, i) => ({
            id: `inv-${char.id}-${i}`,
            name: char.name,
            stats: char.stats,
            imageUrl: char.imageUrl,
            owner: 'player',
            rarity: char.rarity,
            variant: 'base',
        }));
        setOwnedCards(initialCards);

        // Load saved deck or default to first 5
        const savedDeck = localStorage.getItem('playerDeck');
        if (savedDeck) {
            setSelectedDeck(JSON.parse(savedDeck));
        } else {
            setSelectedDeck(initialCards.slice(0, 5).map(c => c.id));
        }
    }, []);

    const toggleCard = (cardId: string) => {
        if (selectedDeck.includes(cardId)) {
            setSelectedDeck(prev => prev.filter(id => id !== cardId));
        } else {
            if (selectedDeck.length < 5) {
                setSelectedDeck(prev => [...prev, cardId]);
            } else {
                alert("Deck is full! Remove a card first.");
            }
        }
    };

    const handleSave = () => {
        if (selectedDeck.length !== 5) {
            alert("You must select exactly 5 cards.");
            return;
        }
        const deckCards = ownedCards.filter(c => selectedDeck.includes(c.id));
        localStorage.setItem('playerDeck', JSON.stringify(selectedDeck));
        onSaveDeck(deckCards);
        onBack();
    };

    const filteredCards = filter === 'all'
        ? ownedCards
        : ownedCards.filter(c => c.rarity === filter);

    return (
        <div className="min-h-screen bg-slate-950 text-amber-100 font-serif flex">
            {/* Main Content - Card Grid */}
            <div className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                        Card Collection
                    </h1>

                    {/* Filters */}
                    <div className="flex gap-2">
                        {(['all', 'common', 'rare', 'epic', 'legendary'] as const).map((r) => (
                            <button
                                key={r}
                                onClick={() => setFilter(r)}
                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition-all
                  ${filter === r
                                        ? 'bg-amber-600 border-amber-400 text-white'
                                        : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'}
                `}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-24">
                    {filteredCards.map((card) => {
                        const isSelected = selectedDeck.includes(card.id);
                        return (
                            <div
                                key={card.id}
                                onClick={() => {
                                    toggleCard(card.id);
                                    setPreviewCard(card);
                                }}
                                className="relative cursor-pointer transition-transform duration-200"
                            >
                                <Card
                                    card={card}
                                    className={isSelected
                                        ? 'ring-4 ring-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.7)] scale-105 z-10'
                                        : 'opacity-90 hover:opacity-100 hover:scale-105'}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Side Column - Selected Deck */}
            <div className="w-80 bg-slate-900 border-l border-slate-700 p-6 flex flex-col shadow-2xl z-10">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-amber-100 mb-2">Your Deck</h2>
                    <div className="text-sm text-slate-400 font-sans">
                        <span className={selectedDeck.length === 5 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                            {selectedDeck.length}/5
                        </span> Cards Selected
                    </div>
                </div>

                {/* Selected Cards List */}
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
                    {selectedDeck.length === 0 && (
                        <div className="text-slate-600 italic text-center mt-10">
                            Select cards from your collection to build your deck.
                        </div>
                    )}

                    {selectedDeck.map((cardId) => {
                        const card = ownedCards.find(c => c.id === cardId);
                        if (!card) return null;
                        return (
                            <div key={cardId} className="flex items-center gap-2 bg-slate-800/50 p-1.5 rounded-lg border border-slate-700 animate-fade-in-left group">
                                <div
                                    className="scale-75 origin-left cursor-pointer"
                                    onClick={() => setPreviewCard(card)}
                                >
                                    <Card card={card} />
                                </div>
                                <button
                                    onClick={() => toggleCard(cardId)}
                                    className="text-slate-500 hover:text-red-400 transition-colors p-1 ml-auto"
                                >
                                    ✕
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-col gap-3">
                    <button
                        onClick={handleSave}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-md border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:border-b-0 disabled:translate-y-0"
                        disabled={selectedDeck.length !== 5}
                    >
                        SAVE & PLAY
                    </button>
                    <button
                        onClick={onBack}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-md border border-slate-600"
                    >
                        CANCEL
                    </button>
                </div>
            </div>

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
