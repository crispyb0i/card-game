import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
    GameState,
    Card,
    Player,
    Board,
    MapId,
    AIDifficulty,
    BOARD_SIZE
} from '../lib/types';
import { CHARACTERS } from '../lib/cards';
import { v4 as uuidv4 } from 'uuid';

// --- Slice Interfaces ---

interface GameSlice {
    gameState: GameState;
    setGameState: (state: Partial<GameState>) => void;
    resetGame: () => void;
    // Actions that modify game state will be added here or in a separate controller
    setBoard: (board: Board) => void;
    setPlayerHand: (hand: Card[]) => void;
    setOpponentHand: (hand: Card[]) => void;
    setTurn: (player: Player) => void;
    setWinner: (winner: Player | 'draw' | null) => void;
}

interface InventorySlice {
    ownedCards: string[]; // List of Character IDs
    selectedDeck: string[]; // List of Character IDs (max 5)
    credits: number;

    // Actions
    addCard: (characterId: string) => void;
    removeCard: (characterId: string) => void; // Optional, maybe for selling
    addToDeck: (characterId: string) => void;
    removeFromDeck: (characterId: string) => void;
    setDeck: (characterIds: string[]) => void;
    addCredits: (amount: number) => void;
    spendCredits: (amount: number) => boolean; // Returns true if successful
}

interface SettingsSlice {
    volume: number; // 0.0 to 1.0
    difficulty: AIDifficulty;

    // Actions
    setVolume: (volume: number) => void;
    setDifficulty: (difficulty: AIDifficulty) => void;
}

// --- Combined Store Interface ---

type StoreState = GameSlice & InventorySlice & SettingsSlice;

// --- Initial States ---

const initialGameState: GameState = {
    board: Array(BOARD_SIZE * BOARD_SIZE).fill(null),
    playerHand: [],
    playerDeck: [],
    opponentHand: [],
    opponentDeck: [],
    currentPlayer: 'player', // Coin flip will determine this later
    startingPlayer: 'player',
    winner: null,
    currentMapId: 'none',
};

const initialInventoryState = {
    // Start with ALL cards owned for now (sandbox mode)
    ownedCards: CHARACTERS.map(c => c.id),
    // Default valid starter deck
    selectedDeck: [
        'dragon',        // Legendary
        'wizard',        // Epic
        'golem',         // Epic
        'knight',        // Rare
        'ranger',        // Rare
        'battle-priest', // Rare
        'squire',        // Common
        'shield-bearer', // Common
        'sky-scout',     // Common
        'river-wisp',    // Common
    ],
    credits: 1000, // Give enough credits to buy some packs
};

const initialSettingsState = {
    volume: 0.3,
    difficulty: 'normal' as AIDifficulty,
};

// --- Store Creation ---

export const useStore = create<StoreState>()(
    persist(
        (set, get) => ({
            // ... Game Slice ...
            gameState: initialGameState,
            setGameState: (newState) => set((state) => ({
                gameState: { ...state.gameState, ...newState }
            })),
            resetGame: () => set({ gameState: initialGameState }),
            setBoard: (board) => set((state) => ({
                gameState: { ...state.gameState, board }
            })),
            setPlayerHand: (playerHand) => set((state) => ({
                gameState: { ...state.gameState, playerHand }
            })),
            setOpponentHand: (opponentHand) => set((state) => ({
                gameState: { ...state.gameState, opponentHand }
            })),
            setTurn: (currentPlayer) => set((state) => ({
                gameState: { ...state.gameState, currentPlayer }
            })),
            setWinner: (winner) => set((state) => ({
                gameState: { ...state.gameState, winner }
            })),

            // ... Inventory Slice ...
            ownedCards: initialInventoryState.ownedCards,
            selectedDeck: initialInventoryState.selectedDeck,
            credits: initialInventoryState.credits,

            addCard: (characterId) => set((state) => ({
                ownedCards: [...state.ownedCards, characterId]
            })),
            removeCard: (characterId) => set((state) => ({
                ownedCards: state.ownedCards.filter(id => id !== characterId)
            })),
            addToDeck: (characterId) => set((state) => {
                if (state.selectedDeck.length >= 5) return state; // Max 5
                if (state.selectedDeck.includes(characterId)) return state; // No duplicates in deck (for now)
                return { selectedDeck: [...state.selectedDeck, characterId] };
            }),
            removeFromDeck: (characterId) => set((state) => ({
                selectedDeck: state.selectedDeck.filter(id => id !== characterId)
            })),
            setDeck: (selectedDeck) => set({ selectedDeck }),
            addCredits: (amount) => set((state) => ({
                credits: state.credits + amount
            })),
            spendCredits: (amount) => {
                const state = get();
                if (state.credits >= amount) {
                    set({ credits: state.credits - amount });
                    return true;
                }
                return false;
            },

            // ... Settings Slice ...
            volume: initialSettingsState.volume,
            difficulty: initialSettingsState.difficulty,

            setVolume: (volume) => set({ volume }),
            setDifficulty: (difficulty) => set({ difficulty }),
        }),
        {
            name: 'card-game-storage-v2', // Changed key to force fresh state for this update
            storage: createJSONStorage(() => localStorage), // use localStorage
            partialize: (state) => ({
                // Only persist Inventory and Settings, NOT GameState
                ownedCards: state.ownedCards,
                selectedDeck: state.selectedDeck,
                credits: state.credits,
                volume: state.volume,
                difficulty: state.difficulty,
            }),
        }
    )
);
