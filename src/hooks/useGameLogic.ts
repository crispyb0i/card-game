"use client";

import { useState, useCallback, useEffect } from 'react';
import { Board, Card, GameState, Player, AIDifficulty, BOARD_SIZE } from '../lib/types';
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

export const useGameLogic = (difficulty: AIDifficulty = 'normal') => {
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
            startingPlayer: 'player',
            winner: null,
        };
    });

    const [previewCaptures, setPreviewCaptures] = useState<number[]>([]);

    // Sound effects
    const { play: playCardPlace } = useSound('/sounds/card-place.mp3', 0.8);
    const { play: playCardCapture } = useSound('/sounds/card-capture.mp3', 0.85);
    const { play: playWin } = useSound('/sounds/win-fanfare.mp3', 0.9);
    const { play: playLose } = useSound('/sounds/lose-sting.mp3', 0.9);

    // Helper to check win condition and update state
    const checkAndSetWinner = (currentBoard: Board, startingPlayer: Player) => {
        const winner = checkWinCondition(currentBoard, startingPlayer);
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
            const winner = checkAndSetWinner(newBoard, prev.startingPlayer);

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

    const resetGame = useCallback((startingPlayer: Player = 'player') => {
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
            currentPlayer: startingPlayer,
            startingPlayer,
            winner: null,
        });
        setPreviewCaptures([]);
    }, []);

    const setStartingPlayer = useCallback((player: Player) => {
        setGameState((prev) => ({
            ...prev,
            currentPlayer: player,
            startingPlayer: player,
        }));
    }, []);

    // AI Turn Logic (difficulty-based)
    useEffect(() => {
        if (gameState.currentPlayer === 'opponent' && !gameState.winner) {
            const timer = setTimeout(() => {
                const emptySlots = gameState.board
                    .map((card, index) => ({ card, index }))
                    .filter((slot) => slot.card === null)
                    .map((slot) => slot.index);

                if (emptySlots.length === 0 || gameState.opponentHand.length === 0) {
                    return;
                }

                const cloneBoard = (board: Board): Board =>
                    board.map((slot) =>
                        slot
                            ? {
                                  ...slot,
                                  stats: { ...slot.stats },
                                  baseStats: slot.baseStats ? { ...slot.baseStats } : undefined,
                              }
                            : null,
                    );

                const evaluateGreedy = (board: Board, card: Card, index: number): number => {
                    let tempBoard = cloneBoard(board);

                    const cardClone: Card = {
                        ...card,
                        stats: { ...card.stats },
                        baseStats: card.baseStats ? { ...card.baseStats } : { ...card.stats },
                    };

                    tempBoard[index] = cardClone;

                    const abilityResult = applyOnRevealAbility(
                        {
                            ...gameState,
                            board: tempBoard,
                        },
                        index,
                    );

                    if (abilityResult.board) {
                        tempBoard = abilityResult.board;
                    }

                    const capturedIndices = calculateCapture(tempBoard, cardClone, index, gameState.currentMapId);
                    capturedIndices.forEach((capturedIndex) => {
                        const capturedCard = tempBoard[capturedIndex];
                        if (capturedCard) {
                            tempBoard[capturedIndex] = { ...capturedCard, owner: 'opponent' };
                        }
                    });

                    let playerCount = 0;
                    let opponentCount = 0;
                    tempBoard.forEach((slot) => {
                        if (!slot) return;
                        if (slot.owner === 'player') playerCount++;
                        if (slot.owner === 'opponent') opponentCount++;
                    });

                    return opponentCount - playerCount;
                };

                const evaluateWithLookahead = (board: Board, card: Card, index: number): number => {
                    // Immediate result of AI move
                    let tempBoard = cloneBoard(board);

                    const cardClone: Card = {
                        ...card,
                        stats: { ...card.stats },
                        baseStats: card.baseStats ? { ...card.baseStats } : { ...card.stats },
                    };

                    tempBoard[index] = cardClone;

                    const abilityResult = applyOnRevealAbility(
                        {
                            ...gameState,
                            board: tempBoard,
                        },
                        index,
                    );

                    if (abilityResult.board) {
                        tempBoard = abilityResult.board;
                    }

                    const capturedIndices = calculateCapture(tempBoard, cardClone, index, gameState.currentMapId);
                    capturedIndices.forEach((capturedIndex) => {
                        const capturedCard = tempBoard[capturedIndex];
                        if (capturedCard) {
                            tempBoard[capturedIndex] = { ...capturedCard, owner: 'opponent' };
                        }
                    });

                    // After AI move, simulate best player reply greedily
                    const replyEmptySlots = tempBoard
                        .map((slot, idx) => ({ slot, idx }))
                        .filter((x) => x.slot === null)
                        .map((x) => x.idx);

                    let bestPlayerSwing = 0;

                    if (replyEmptySlots.length > 0 && gameState.playerHand.length > 0) {
                        gameState.playerHand.forEach((playerCard) => {
                            replyEmptySlots.forEach((slotIndex) => {
                                let replyBoard = cloneBoard(tempBoard);

                                const playerClone: Card = {
                                    ...playerCard,
                                    stats: { ...playerCard.stats },
                                    baseStats: playerCard.baseStats ? { ...playerCard.baseStats } : { ...playerCard.stats },
                                    owner: 'player',
                                };

                                replyBoard[slotIndex] = playerClone;

                                const abilityResultPlayer = applyOnRevealAbility(
                                    {
                                        ...gameState,
                                        board: replyBoard,
                                    },
                                    slotIndex,
                                );

                                if (abilityResultPlayer.board) {
                                    replyBoard = abilityResultPlayer.board;
                                }

                                const capturedByPlayer = calculateCapture(
                                    replyBoard,
                                    playerClone,
                                    slotIndex,
                                    gameState.currentMapId,
                                );
                                capturedByPlayer.forEach((cIdx) => {
                                    const captured = replyBoard[cIdx];
                                    if (captured) {
                                        replyBoard[cIdx] = { ...captured, owner: 'player' };
                                    }
                                });

                                let pCount = 0;
                                let oCount = 0;
                                replyBoard.forEach((s) => {
                                    if (!s) return;
                                    if (s.owner === 'player') pCount++;
                                    if (s.owner === 'opponent') oCount++;
                                });

                                const swing = pCount - oCount;
                                if (swing > bestPlayerSwing) {
                                    bestPlayerSwing = swing;
                                }
                            });
                        });
                    }

                    // AI wants to maximize its own board advantage while minimizing
                    // the player's best possible swing on the next turn.
                    let pFinal = 0;
                    let oFinal = 0;
                    tempBoard.forEach((s) => {
                        if (!s) return;
                        if (s.owner === 'player') pFinal++;
                        if (s.owner === 'opponent') oFinal++;
                    });
                    const immediate = oFinal - pFinal;
                    return immediate - bestPlayerSwing;
                };

                if (difficulty === 'easy') {
                    const randomSlot = emptySlots[Math.floor(Math.random() * emptySlots.length)];
                    const cardToPlay = gameState.opponentHand[
                        Math.floor(Math.random() * gameState.opponentHand.length)
                    ];
                    handleCardDrop(cardToPlay, randomSlot);
                    return;
                }

                const scorer = difficulty === 'hard' ? evaluateWithLookahead : evaluateGreedy;

                let bestScore = -Infinity;
                const bestMoves: { card: Card; index: number }[] = [];

                gameState.opponentHand.forEach((card) => {
                    emptySlots.forEach((slotIndex) => {
                        const score = scorer(gameState.board, card, slotIndex);
                        if (score > bestScore) {
                            bestScore = score;
                            bestMoves.length = 0;
                            bestMoves.push({ card, index: slotIndex });
                        } else if (score === bestScore) {
                            bestMoves.push({ card, index: slotIndex });
                        }
                    });
                });

                if (bestMoves.length > 0) {
                    const choice = bestMoves[Math.floor(Math.random() * bestMoves.length)];
                    handleCardDrop(choice.card, choice.index);
                }
            }, 1000); // 1 second delay for realism

            return () => clearTimeout(timer);
        }
    }, [gameState, handleCardDrop, difficulty]);

    return {
        gameState,
        previewCaptures,
        handleCardDrop,
        handleHover,
        resetGame,
        setStartingPlayer,
    };
};
