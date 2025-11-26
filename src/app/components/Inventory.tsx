"use client";

import React, { useState, useEffect } from 'react';
import { Card as CardType, Rarity } from '../../lib/types';
import { CHARACTERS } from '../../lib/cards';
import { Card } from './Card';
import { Toast } from './Toast';
import { useStore } from '../../store/useStore';

const DECK_SIZE = 10;

// Define slot structure: 1 legendary, 2 epic, 3 rare, 4 common
const SLOT_STRUCTURE: Rarity[] = [
    'legendary',    // Slot 0
    'epic',         // Slot 1
    'epic',         // Slot 2
    'rare',         // Slot 3
    'rare',         // Slot 4
    'rare',         // Slot 5
    'common',       // Slot 6
    'common',       // Slot 7
    'common',       // Slot 8
    'common',       // Slot 9
];

const RARITY_COLORS: Record<Rarity, string> = {
    legendary: 'border-yellow-500',
    epic: 'border-purple-500',
    rare: 'border-blue-500',
    common: 'border-slate-600',
};

const RARITY_LIMITS: Partial<Record<Rarity, number>> = {
    legendary: 1,
    epic: 2,
    rare: 3,
};

interface InventoryProps {
    onBack: () => void;
    onSaveDeck: (deck: CardType[]) => void;
}

// Helper function to map character IDs to deck slots
const mapCharacterIdsToDeck = (characterIds: string[], cards: CardType[]): (string | null)[] => {
    const newDeck: (string | null)[] = Array(DECK_SIZE).fill(null);

    // We need to match the character IDs in the deck to the specific Card instances we created above
    // This is a bit tricky because we might have multiple of the same character
    // For now, we'll just take the first available one of that type

    const usedCardIds = new Set<string>();

    characterIds.forEach(charId => {
        // Find a card instance of this character that hasn't been used yet
        const foundCard = cards.find(c => c.characterId === charId && !usedCardIds.has(c.id));

        if (foundCard) {
            // Find first available slot for this rarity
            for (let i = 0; i < SLOT_STRUCTURE.length; i++) {
                if (SLOT_STRUCTURE[i] === foundCard.rarity && newDeck[i] === null) {
                    newDeck[i] = foundCard.id;
                    usedCardIds.add(foundCard.id);
                    break;
                }
            }
        }
    });

    return newDeck;
};

export const Inventory: React.FC<InventoryProps> = ({ onBack, onSaveDeck }) => {
    // Access Store
    const ownedCardIds = useStore((state) => state.ownedCards);
    const selectedDeckIds = useStore((state) => state.selectedDeck);
    const setDeck = useStore((state) => state.setDeck);

    // Local state for UI
    const [filter, setFilter] = useState<Rarity | 'all'>('all');
    const [previewCard, setPreviewCard] = useState<CardType | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

    // Hydrate full card objects from IDs
    const ownedCards = React.useMemo(() => {
        return ownedCardIds.map((id, i): CardType | null => {
            // Handle both "inv-charId-index" and "charId" formats
            // The store might just store "charId" for simplicity, but let's support unique IDs if we want duplicates later
            // For now, let's assume the store holds CHARACTER IDs (e.g., 'squire', 'dragon')
            // But to make them unique Card objects, we need to generate unique IDs
            const charId = id.includes('inv-') ? id.split('-')[1] : id;
            const char = CHARACTERS.find(c => c.id === charId);

            if (!char) return null;

            return {
                id: `inv-${char.id}-${i}`, // Generate a unique ID for the UI instance
                name: char.name,
                imageUrl: char.imageUrl,
                stats: { ...char.stats },
                baseStats: { ...char.stats },
                owner: 'player' as const,
                rarity: char.rarity,
                variant: 'base' as const,
                characterId: char.id,
                ability: char.ability,
            };
        }).filter((c): c is CardType => c !== null);
    }, [ownedCardIds]);

    // Initialize local deck state from store
    const [localDeck, setLocalDeck] = useState<(string | null)[]>(() => {
        return mapCharacterIdsToDeck(selectedDeckIds, ownedCards);
    });

    // Update local deck when store changes (e.g. initial load)
    useEffect(() => {
        setLocalDeck(mapCharacterIdsToDeck(selectedDeckIds, ownedCards));
    }, [selectedDeckIds, ownedCards]);

    const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const toggleCard = (cardId: string) => {
        const card = ownedCards.find(c => c.id === cardId);
        if (!card) return;

        // Check if card is already in deck
        const existingSlotIndex = localDeck.indexOf(cardId);

        if (existingSlotIndex !== -1) {
            // Remove card
            setLocalDeck(prev => {
                const newDeck = [...prev];
                newDeck[existingSlotIndex] = null;
                return newDeck;
            });
        } else {
            // Find first available slot for this rarity
            let targetSlot = -1;
            for (let i = 0; i < SLOT_STRUCTURE.length; i++) {
                if (SLOT_STRUCTURE[i] === card.rarity && localDeck[i] === null) {
                    targetSlot = i;
                    break;
                }
            }

            if (targetSlot === -1) {
                showToast(`No available ${card.rarity} slots. Remove a ${card.rarity} card first.`, 'warning');
                return;
            }

            setLocalDeck(prev => {
                const newDeck = [...prev];
                newDeck[targetSlot] = cardId;
                return newDeck;
            });
        }
    };

    const handleSave = () => {
        // Filter out nulls to get actual selected cards
        const currentDeckCardIds = localDeck.filter((id): id is string => id !== null);

        if (currentDeckCardIds.length !== DECK_SIZE) {
            showToast(`You must select exactly ${DECK_SIZE} cards.`, 'warning');
            return;
        }
        const deckCards = ownedCards.filter(c => currentDeckCardIds.includes(c.id));

        // Enforce rarity limits (e.g., 1 legendary, 2 epic, 3 rare)
        const rarityCounts: Record<Rarity, number> = {
            common: 0,
            rare: 0,
            epic: 0,
            legendary: 0,
        };

        deckCards.forEach((card) => {
            rarityCounts[card.rarity] += 1;
        });

        for (const [rarity, limit] of Object.entries(RARITY_LIMITS)) {
            const typedRarity = rarity as Rarity;
            const maxAllowed = limit as number | undefined;
            if (maxAllowed !== undefined && rarityCounts[typedRarity] > maxAllowed) {
                showToast(`Too many ${typedRarity.toUpperCase()} cards. Maximum allowed is ${maxAllowed}.`, 'error');
                return;
            }
        }

        // Save character IDs to Store
        const characterIds = deckCards.map(c => c.characterId || c.id.replace(/^inv-/, '').replace(/-\d+$/, ''));
        setDeck(characterIds);

        onSaveDeck(deckCards);
        showToast('Deck saved successfully!', 'success');
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
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-md border border-slate-600 hover:border-slate-400 transition-colors"
                            title="Back to main menu"
                        >
                            <span className="text-lg">←</span>
                            <span>Back</span>
                        </button>
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                            Card Collection
                        </h1>
                    </div>

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
                        const isSelected = localDeck.includes(card.id);
                        return (
                            <div
                                key={card.id}
                                className="relative cursor-pointer transition-transform duration-200"
                            >
                                <div onClick={() => toggleCard(card.id)} className="relative inline-block">
                                    <Card
                                        card={card}
                                        className={isSelected
                                            ? 'ring-2 ring-emerald-500/50 opacity-50 grayscale hover:opacity-60'
                                            : 'opacity-90 hover:opacity-100 hover:scale-105'}
                                    />
                                    {/* Preview button - positioned on top-left, below stats */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewCard(card);
                                        }}
                                        className="absolute top-6 -right-4 w-8 h-8 -translate-x-0.5 rounded-full bg-slate-900/95 hover:bg-amber-600/90 text-amber-200 text-xs font-bold flex items-center justify-center border border-amber-500/60 hover:border-amber-400 transition-all hover:scale-110 shadow-md z-20 backdrop-blur-sm"
                                        title="Preview card"
                                    >
                                        👁
                                    </button>
                                </div>
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
                        <span className={localDeck.filter(id => id !== null).length === DECK_SIZE ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                            {localDeck.filter(id => id !== null).length}/{DECK_SIZE}
                        </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                        Deck rules: up to 1 Legendary, 2 Epic, 3 Rare cards (rest Common).
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${localDeck.filter(id => id !== null).length === DECK_SIZE ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${(localDeck.filter(id => id !== null).length / DECK_SIZE) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Selected Cards List - Grid */}
                <div className="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                    {localDeck.every(id => id === null) && (
                        <div className="text-slate-600 italic text-center py-10 border-2 border-dashed border-slate-800 rounded-xl">
                            Select cards from the collection to build your deck.
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pb-4">
                        {/* Render exactly DECK_SIZE slots with rarity-based colors */}
                        {localDeck.map((cardId, index) => {
                            const card = cardId ? ownedCards.find(c => c.id === cardId) : null;
                            const slotRarity = SLOT_STRUCTURE[index];
                            const borderColor = RARITY_COLORS[slotRarity];

                            if (card) {
                                return (
                                    <div
                                        key={`slot-${index}-${card.id}`}
                                        className={`relative group animate-fade-in-left w-full aspect-[3/4] flex items-center justify-center cursor-pointer border-4 ${borderColor} rounded-lg`}
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
                                // Empty slot with colored border
                                return (
                                    <div
                                        key={`empty-${index}`}
                                        className={`w-full aspect-[3/4] rounded-lg border-4 border-dashed ${borderColor} bg-slate-900/50 flex flex-col items-center justify-center`}
                                    >
                                        <span className="text-slate-700 text-xs font-bold mb-1">{index + 1}</span>
                                        <span className="text-slate-600 text-[10px] uppercase tracking-wider">
                                            {slotRarity}
                                        </span>
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
                        disabled={localDeck.filter(id => id !== null).length !== DECK_SIZE}
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
                        className="flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-24">
                            <Card card={previewCard} className="scale-[2] shadow-2xl" />
                        </div>

                        {/* Description */}
                        {previewCard.characterId && (() => {
                            const character = CHARACTERS.find(c => c.id === previewCard.characterId);
                            return character?.description ? (
                                <div className="w-80 mb-4 text-center">
                                    <div className="text-slate-400 text-sm italic">{character.description}</div>
                                </div>
                            ) : null;
                        })()}

                        {/* Ability Info below card */}
                        {previewCard.ability && (
                            <div className="w-80 bg-slate-900/90 border border-slate-600 p-4 rounded-xl text-center">
                                <div className="text-amber-300 font-bold mb-1">{previewCard.ability.name}</div>
                                <div className="text-slate-300 text-sm">{previewCard.ability.text}</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};
