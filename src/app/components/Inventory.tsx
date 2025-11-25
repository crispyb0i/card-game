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
    const [ownedCards, setOwnedCards] = useState<CardType[]>(() => {
        return CHARACTERS.map((char, i) => ({
            id: `inv-${char.id}-${i}`,
            name: char.name,
            stats: char.stats,
            imageUrl: char.imageUrl,
            owner: 'player',
            rarity: char.rarity,
            variant: 'base',
            characterId: char.id, // Store the base character ID
            ability: char.ability,
        }));
    });

    const [selectedDeck, setSelectedDeck] = useState<string[]>([]); // IDs of selected cards
    const [filter, setFilter] = useState<Rarity | 'all'>('all');
    const [previewCard, setPreviewCard] = useState<CardType | null>(null);

    // Initialize Deck
    useEffect(() => {
        // Load saved deck or default to first 5
        const savedDeck = localStorage.getItem('playerDeck');
        if (savedDeck) {
            try {
                const savedCharacterIds: string[] = JSON.parse(savedDeck);
                // Map character IDs back to inventory IDs
                const loadedDeckIds = savedCharacterIds
                    .map(charId => {
                        const foundCard = ownedCards.find(c => c.characterId === charId);
                        return foundCard ? foundCard.id : null;
                    })
                    .filter((id): id is string => id !== null);

                setSelectedDeck(loadedDeckIds);
            } catch (e) {
                console.error("Failed to load deck", e);
                setSelectedDeck(ownedCards.slice(0, 5).map(c => c.id));
            }
        } else {
            setSelectedDeck(ownedCards.slice(0, 5).map(c => c.id));
        }
    }, [ownedCards]);

    const toggleCard = (cardId: string) => {
        if (selectedDeck.includes(cardId)) {
            setSelectedDeck(prev => prev.filter(id => id !== cardId));
        } else {
            if (selectedDeck.length < 10) {
                setSelectedDeck(prev => [...prev, cardId]);
            } else {
                alert("Deck is full! Remove a card first.");
            }
        }
    };

    const handleSave = () => {
        if (selectedDeck.length !== 10) {
            alert("You must select exactly 10 cards.");
            return;
        }
        const deckCards = ownedCards.filter(c => selectedDeck.includes(c.id));
        // Save character IDs instead of full card IDs
        const characterIds = deckCards.map(c => c.characterId || c.id.replace(/^inv-/, '').replace(/-\d+$/, ''));
        localStorage.setItem('playerDeck', JSON.stringify(characterIds));
        onSaveDeck(deckCards);
        onBack();
    };

    const filteredCards = filter === 'all'
        ? ownedCards
        : ownedCards.filter(c => c.rarity === filter);

    return (
        <div className="min-h-screen bg-slate-950 text-amber-100 font-serif flex">
            {/* Left Column - Card Collection */}
            <div className="flex-1 p-8 overflow-y-auto h-screen">
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
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20">
                    {filteredCards.map((card) => {
                        const isSelected = selectedDeck.includes(card.id);
                        return (
                            <div
                                key={card.id}
                                className="relative cursor-pointer transition-transform duration-200"
                            >
                                <div onClick={() => toggleCard(card.id)}>
                                    <Card
                                        card={card}
                                        className={isSelected
                                            ? 'grayscale opacity-60 ring-2 ring-emerald-500/50'
                                            : 'opacity-90 hover:opacity-100 hover:scale-105'}
                                    />
                                </div>
                                {/* Preview button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPreviewCard(card);
                                    }}
                                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-800/80 hover:bg-slate-700 text-amber-100 text-xs font-bold flex items-center justify-center border border-slate-600 transition-all hover:scale-110 z-10"
                                    title="Preview card"
                                >
                                    👁
                                </button>
                                {isSelected && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                        <div className="bg-black/80 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-500/50 shadow-xl backdrop-blur-sm transform -rotate-6">
                                            ADDED TO DECK
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Column - Deck Sidebar */}
            <div className="w-80 bg-slate-900 border-l border-slate-700 p-6 flex flex-col h-screen shadow-2xl z-20">
                <div className="flex-shrink-0 mb-6">
                    <h2 className="text-2xl font-bold text-amber-100 mb-2">Your Deck</h2>
                    <div className="text-sm text-slate-400 font-sans flex justify-between items-center">
                        <span>Selected Cards</span>
                        <span className={selectedDeck.length === 10 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                            {selectedDeck.length}/10
                        </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${selectedDeck.length === 10 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${(selectedDeck.length / 10) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Selected Cards List - Vertical Stack */}
                {/* Selected Cards List - Grid */}
                <div className="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                    {selectedDeck.length === 0 && (
                        <div className="text-slate-600 italic text-center py-10 border-2 border-dashed border-slate-800 rounded-xl">
                            Select cards from the collection to build your deck.
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pb-4">
                        {/* Render exactly 10 slots */}
                        {Array.from({ length: 10 }).map((_, index) => {
                            const cardId = selectedDeck[index];
                            const card = cardId ? ownedCards.find(c => c.id === cardId) : null;

                            if (card) {
                                return (
                                    <div
                                        key={card.id}
                                        className="relative group animate-fade-in-left w-full aspect-[3/4] flex items-center justify-center cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleCard(card.id);
                                        }}
                                        title="Click to remove from deck"
                                    >
                                        <div className="transform scale-[0.85] origin-center hover:scale-[0.9] transition-transform hover:rotate-1">
                                            <Card card={card} />
                                        </div>
                                        {/* Hover overlay for remove indication */}
                                        <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/10 rounded-lg transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                            <span className="text-red-200 font-bold text-lg drop-shadow-md bg-black/50 px-2 py-1 rounded">REMOVE</span>
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={`empty-${index}`} className="w-full aspect-[3/4] rounded-lg border-2 border-dashed border-slate-800 bg-slate-900/50 flex items-center justify-center">
                                        <span className="text-slate-700 text-xs font-bold">{index + 1}</span>
                                    </div>
                                );
                            }
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 pt-6 mt-4 border-t border-slate-700 flex flex-col gap-3">
                    <button
                        onClick={handleSave}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-md border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:border-b-0 disabled:translate-y-0 shadow-lg text-lg tracking-wide"
                        disabled={selectedDeck.length !== 10}
                    >
                        SAVE DECK
                    </button>
                    <button
                        onClick={onBack}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-md border border-slate-600 transition-colors"
                    >
                        CANCEL
                    </button>
                </div>
            </div>

            {previewCard && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={() => setPreviewCard(null)}
                >
                    <div
                        className="relative transform transition-all animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Card card={previewCard} className="scale-150 shadow-2xl" />

                        {/* Ability Info in Preview */}
                        {previewCard.ability && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-8 w-80 bg-slate-900/90 border border-slate-600 p-4 rounded-xl text-center">
                                <div className="text-amber-300 font-bold mb-1">{previewCard.ability.name}</div>
                                <div className="text-slate-300 text-sm">{previewCard.ability.text}</div>
                            </div>
                        )}

                        <button
                            onClick={() => setPreviewCard(null)}
                            className="absolute -top-8 -right-8 w-10 h-10 rounded-full bg-slate-800 text-white text-lg font-bold flex items-center justify-center border border-slate-600 hover:bg-red-600 hover:border-red-500 transition-all shadow-xl"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
