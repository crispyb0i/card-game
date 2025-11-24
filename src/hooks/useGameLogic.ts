"use client";

import { useState, useCallback, useEffect } from 'react';
import { Board, Card, GameState, Player, BOARD_SIZE } from '../lib/types';
import { calculateCapture, checkWinCondition, createDeck } from '../lib/gameEngine';

const INITIAL_BOARD: Board = Array(BOARD_SIZE * BOARD_SIZE).fill(null);

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
        return {
            board: INITIAL_BOARD,
            playerHand: createDeck('player', 5, playerDeckIds),
            opponentHand: createDeck('opponent'),
            currentPlayer: 'player',
            winner: null,
        };
    });

    const [previewCaptures, setPreviewCaptures] = useState<number[]>([]);

    const handleCardDrop = useCallback((card: Card, index: number) => {
        if (gameState.winner || gameState.board[index] !== null) return;

        setGameState((prev) => {
            const newBoard = [...prev.board];
            newBoard[index] = card;

            // Calculate captures
            const capturedIndices = calculateCapture(newBoard, card, index);
            capturedIndices.forEach((capturedIndex) => {
                const capturedCard = newBoard[capturedIndex];
                if (capturedCard) {
                    newBoard[capturedIndex] = { ...capturedCard, owner: card.owner };
                }
            });

            // Remove card from hand
            const newPlayerHand = prev.playerHand.filter((c) => c.id !== card.id);
            const newOpponentHand = prev.opponentHand.filter((c) => c.id !== card.id);

            return {
                ...prev,
                board: newBoard,
                playerHand: newPlayerHand,
                opponentHand: newOpponentHand,
                currentPlayer: prev.currentPlayer === 'player' ? 'opponent' : 'player',
            };
        });

        setPreviewCaptures([]);
    }, [gameState.winner, gameState.board]);

    // Check Win Condition with Delay & Award Credits
    useEffect(() => {
        const winner = checkWinCondition(gameState.board);
        if (winner && !gameState.winner) {
            const timer = setTimeout(() => {
                setGameState(prev => ({ ...prev, winner }));

                // Award Credits
                if (typeof window !== 'undefined') {
                    const currentCredits = parseInt(localStorage.getItem('credits') || '1000');
                    const award = winner === 'player' ? 50 : 10;
                    localStorage.setItem('credits', (currentCredits + award).toString());
                    console.log(`Awarded ${award} credits. New total: ${currentCredits + award}`);
                }
            }, 1500); // 1.5s delay
            return () => clearTimeout(timer);
        }
    }, [gameState.board, gameState.winner]);

    const handleHover = useCallback((card: Card | null, index: number) => {
        if (!card || gameState.board[index] !== null) {
            setPreviewCaptures([]);
            return;
        }

        // Simulate placement to check captures
        // We need to pass a temporary board where the card is placed, 
        // BUT calculateCapture logic only checks neighbors, so we can pass the current board 
        // and the function handles the logic of "if I place here, what happens?"
        // Actually, my calculateCapture implementation expects the card to be ON the board.
        // Let's look at calculateCapture again.
        // "const adjCard = board[adjIndex];"
        // It checks neighbors of the placed card.
        // So if I pass the current board (where index is empty) and the card and the index,
        // it will check neighbors of 'index'.
        // Yes, that works.

        const captures = calculateCapture(gameState.board, card, index);
        setPreviewCaptures(captures);
    }, [gameState.board]);

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

        setGameState({
            board: Array(BOARD_SIZE * BOARD_SIZE).fill(null),
            playerHand: createDeck('player', 5, playerDeckIds),
            opponentHand: createDeck('opponent'),
            currentPlayer: 'player',
            winner: null,
        });
        setPreviewCaptures([]);
    }, []);

    // AI Turn
    const [isAiThinking, setIsAiThinking] = useState(false);

    // AI Turn Logic
    useEffect(() => {
        if (gameState.currentPlayer === 'opponent' && !gameState.winner) {
            console.log("AI Turn: Waiting to move...");
            const timer = setTimeout(() => {
                console.log("AI Turn: Executing move...");

                // Simple AI: Find first empty slot and play first card
                // Improve: Find best move (random for now)
                const emptySlots = gameState.board
                    .map((card, index) => ({ card, index }))
                    .filter(slot => slot.card === null)
                    .map(slot => slot.index);

                if (emptySlots.length > 0 && gameState.opponentHand.length > 0) {
                    const randomSlot = emptySlots[Math.floor(Math.random() * emptySlots.length)];
                    const cardToPlay = gameState.opponentHand[0]; // Play first card

                    console.log(`AI playing card ${cardToPlay.name} to slot ${randomSlot}`);
                    handleCardDrop(cardToPlay, randomSlot);
                } else {
                    console.log("AI cannot move: No slots or no cards");
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
