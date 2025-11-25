"use client";

import { useState, useCallback, useEffect } from 'react';
import { Board, Card, GameState, BOARD_SIZE } from '../lib/types';
import { calculateCapture, checkWinCondition, createDeck } from '../lib/gameEngine';
import { applyOnRevealAbility } from '../lib/abilities';
import { useSound } from './useSound';

const INITIAL_BOARD: Board = Array(BOARD_SIZE * BOARD_SIZE).fill(null);

// Fisher-Yates Shuffle
const shuffle = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export const useGameLogic = () => {
    const [gameState, setGameState] = useState<GameState>(() => {
        // Lazy init to access localStorage
        let playerDeckIds: string[] | undefined;
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('playerDeck');
            if (saved) {
                try {
                    playerDeckIds = JSON.parse(saved);
                } catch (e) {
                    console.error("Failed to parse deck", e);
                }
            }
        }

        // Create full decks (10 cards for player if saved, otherwise default)
        const fullPlayerDeck = createDeck('player', 10, playerDeckIds);
        const fullOpponentDeck = createDeck('opponent', 10);

        // Shuffle Decks
        const shuffledPlayerDeck = shuffle(fullPlayerDeck);
        const shuffledOpponentDeck = shuffle(fullOpponentDeck);

        // Deal 5 to hand, rest to deck
        const playerHand = shuffledPlayerDeck.slice(0, 5);
        const playerDeck = shuffledPlayerDeck.slice(5);

        const opponentHand = shuffledOpponentDeck.slice(0, 5);
        const opponentDeck = shuffledOpponentDeck.slice(5);

        return {
            board: INITIAL_BOARD,
            playerHand,
            playerDeck,
            opponentHand,
            opponentDeck,
            currentPlayer: 'player',
            winner: null,
        };
    });

    const [previewCaptures, setPreviewCaptures] = useState<number[]>([]);

    // Sound effects
    const playCardPlace = useSound('/sounds/card-place.mp3', 0.8);
    const playCardCapture = useSound('/sounds/card-capture.mp3', 0.85);
    const playWin = useSound('/sounds/win-fanfare.mp3', 0.9);
    const playLose = useSound('/sounds/lose-sting.mp3', 0.9);

    // Helper to check win condition and update state
    const checkAndSetWinner = (currentBoard: Board) => {
        const winner = checkWinCondition(currentBoard);
        if (winner) {
            // Play win/lose jingle
            if (winner === 'player') {
                playWin();
            } else if (winner === 'opponent') {
                playLose();
            }

            // Award Credits
            if (typeof window !== 'undefined') {
                const currentCredits = parseInt(localStorage.getItem('credits') || '1000');
                const award = winner === 'player' ? 50 : 10;
                localStorage.setItem('credits', (currentCredits + award).toString());
                console.log(`Awarded ${award} credits. New total: ${currentCredits + award}`);
            }
            return winner;
        }
        return null;
    };

    const drawCard = (state: GameState, player: 'player' | 'opponent'): Partial<GameState> => {
        if (player === 'player') {
            if (state.playerDeck.length === 0) return {};
            const newDeck = [...state.playerDeck];
            const card = newDeck.shift(); // Draw from top
            if (!card) return {};
            return {
                playerDeck: newDeck,
                playerHand: [...state.playerHand, card]
            };
        } else {
            if (state.opponentDeck.length === 0) return {};
            const newDeck = [...state.opponentDeck];
            const card = newDeck.shift();
            if (!card) return {};
            return {
                opponentDeck: newDeck,
                opponentHand: [...state.opponentHand, card]
            };
        }
    };

    const handleCardDrop = useCallback((card: Card, index: number) => {
        if (gameState.winner || gameState.board[index] !== null) return;

        // Play placement sound once per successful drop
        playCardPlace();

        setGameState((prev) => {
            // 1. Place the card
            let newBoard = [...prev.board];
            // Deep clone the card to avoid mutating the hand/previous state
            // and to ensure abilities modify a fresh object
            const cardClone = {
                ...card,
                stats: { ...card.stats },
                baseStats: card.baseStats ? { ...card.baseStats } : undefined
            };
            newBoard[index] = cardClone;

            // 2. Trigger On Reveal abilities
            const abilityResult = applyOnRevealAbility(
                { ...prev, board: newBoard },
                index
            );

            if (abilityResult.board) {
                newBoard = abilityResult.board;
            }

            // 3. Calculate captures
            const capturedIndices = calculateCapture(newBoard, card, index, prev.currentMapId);
            capturedIndices.forEach((capturedIndex) => {
                const capturedCard = newBoard[capturedIndex];
                if (capturedCard) {
                    newBoard[capturedIndex] = { ...capturedCard, owner: card.owner };
                }
            });

            if (capturedIndices.length > 0) {
                playCardCapture();
            }

            // 4. Remove card from hand
            const newPlayerHand = prev.playerHand.filter((c) => c.id !== card.id);
            const newOpponentHand = prev.opponentHand.filter((c) => c.id !== card.id);

            // 5. Check for winner immediately
            const winner = checkAndSetWinner(newBoard);

            // 6. Draw Card for the player who just played (End of Turn Draw)
            // Actually, usually you draw at start of turn, but user asked for "draw a card at the end of each players turn".
            // So if Player played, Player draws.
            let deckUpdates: Partial<GameState> = {};
            if (!winner) {
                deckUpdates = drawCard({
                    ...prev,
                    playerHand: newPlayerHand,
                    opponentHand: newOpponentHand,
                    // We need to pass the current decks, which are in 'prev'
                    // but we need to make sure we don't use stale state if we modified it (we haven't yet)
                } as GameState, prev.currentPlayer === 'player' ? 'player' : 'opponent');
            }

            return {
                ...prev,
                board: newBoard,
                playerHand: deckUpdates.playerHand || newPlayerHand,
                opponentHand: deckUpdates.opponentHand || newOpponentHand,
                playerDeck: deckUpdates.playerDeck || prev.playerDeck,
                opponentDeck: deckUpdates.opponentDeck || prev.opponentDeck,
                currentPlayer: prev.currentPlayer === 'player' ? 'opponent' : 'player',
                winner: winner || prev.winner,
                lastMove: {
                    player: prev.currentPlayer,
                    card: cardClone,
                    index: index
                },
                ...abilityResult.gameState
            };
        });

        setPreviewCaptures([]);
    }, [gameState.winner, gameState.board]);

    const handleHover = useCallback((card: Card | null, index: number) => {
        if (!card || gameState.board[index] !== null) {
            setPreviewCaptures([]);
            return;
        }

        // Simulate placement to check captures
        // We pass the current board, but calculateCapture will treat the card as if it's at 'index'
        // for the purpose of neighbor checks. 
        // Note: Modifiers might be slightly off if they depend on the card being IN the board array 
        // (like self-buffs from others), but for a preview it's usually close enough.
        // Ideally we'd create a temp board with the card in it.
        const tempBoard = [...gameState.board];
        tempBoard[index] = card;

        const captures = calculateCapture(tempBoard, card, index, gameState.currentMapId);
        setPreviewCaptures(captures);
    }, [gameState.board, gameState.currentMapId]);

    const resetGame = useCallback(() => {
        let playerDeckIds: string[] | undefined;
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('playerDeck');
            if (saved) {
                try {
                    playerDeckIds = JSON.parse(saved);
                } catch (e) { console.error(e); }
            }
        }

        const fullPlayerDeck = createDeck('player', 10, playerDeckIds);
        const fullOpponentDeck = createDeck('opponent', 10);

        // Shuffle Decks
        const shuffledPlayerDeck = shuffle(fullPlayerDeck);
        const shuffledOpponentDeck = shuffle(fullOpponentDeck);

        setGameState({
            board: Array(BOARD_SIZE * BOARD_SIZE).fill(null),
            playerHand: shuffledPlayerDeck.slice(0, 5),
            playerDeck: shuffledPlayerDeck.slice(5),
            opponentHand: shuffledOpponentDeck.slice(0, 5),
            opponentDeck: shuffledOpponentDeck.slice(5),
            currentPlayer: 'player',
            winner: null,
        });
        setPreviewCaptures([]);
    }, []);

    // AI Turn Logic
    useEffect(() => {
        if (gameState.currentPlayer === 'opponent' && !gameState.winner) {
            // console.log("AI Turn: Waiting to move...");
            const timer = setTimeout(() => {
                // console.log("AI Turn: Executing move...");

                // Simple AI: Find first empty slot and play first card
                // Improve: Find best move (random for now)
                const emptySlots = gameState.board
                    .map((card, index) => ({ card, index }))
                    .filter(slot => slot.card === null)
                    .map(slot => slot.index);

                if (emptySlots.length > 0 && gameState.opponentHand.length > 0) {
                    const randomSlot = emptySlots[Math.floor(Math.random() * emptySlots.length)];
                    const cardToPlay = gameState.opponentHand[0]; // Play first card

                    // console.log(`AI playing card ${cardToPlay.name} to slot ${randomSlot}`);
                    handleCardDrop(cardToPlay, randomSlot);
                } else {
                    // console.log("AI cannot move: No slots or no cards");
                }
            }, 1000); // 1 second delay for realism

            return () => clearTimeout(timer);
        }
    }, [gameState.currentPlayer, gameState.winner, gameState.board, gameState.opponentHand, handleCardDrop]);

    return {
        gameState,
        previewCaptures,
        handleCardDrop,
        handleHover,
        resetGame,
    };
};
