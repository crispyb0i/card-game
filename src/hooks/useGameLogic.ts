"use client";

import { useReducer, useCallback, useEffect, useRef } from 'react';
import {
    Board,
    Card,
    GameState,
    Player,
    AIDifficulty,
    BOARD_SIZE,
    GameAction,
    FullGameState,
    SideEffect,
} from '../lib/types';
import { calculateCapture, checkWinCondition, createDeck } from '../lib/gameEngine';
import { applyOnRevealAbility } from '../lib/abilities';
import { useSound } from './useSound';

// ---------------------------------------------------------------------------
// Helpers (pure, no side-effects)
// ---------------------------------------------------------------------------

const INITIAL_BOARD: Board = Array(BOARD_SIZE * BOARD_SIZE).fill(null);

/** Fisher-Yates Shuffle */
const shuffle = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

/** Deep-clone a board to avoid mutations leaking across states. */
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

/** Draw a card from the given player's deck into their hand. Pure helper. */
const drawCard = (state: GameState, player: 'player' | 'opponent'): Partial<GameState> => {
    if (player === 'player') {
        if (state.playerDeck.length === 0) return {};
        const newDeck = [...state.playerDeck];
        const card = newDeck.shift();
        if (!card) return {};
        return { playerDeck: newDeck, playerHand: [...state.playerHand, card] };
    } else {
        if (state.opponentDeck.length === 0) return {};
        const newDeck = [...state.opponentDeck];
        const card = newDeck.shift();
        if (!card) return {};
        return { opponentDeck: newDeck, opponentHand: [...state.opponentHand, card] };
    }
};

/** Build a fresh GameState for a new game. */
const buildInitialGameState = (
    startingPlayer: Player = 'player',
    playerDeckIds?: string[],
): GameState => {
    const fullPlayerDeck = createDeck('player', 10, playerDeckIds);
    const fullOpponentDeck = createDeck('opponent', 10);

    const shuffledPlayerDeck = shuffle(fullPlayerDeck);
    const shuffledOpponentDeck = shuffle(fullOpponentDeck);

    return {
        board: INITIAL_BOARD,
        playerHand: shuffledPlayerDeck.slice(0, 5),
        playerDeck: shuffledPlayerDeck.slice(5),
        opponentHand: shuffledOpponentDeck.slice(0, 5),
        opponentDeck: shuffledOpponentDeck.slice(5),
        currentPlayer: startingPlayer,
        startingPlayer,
        winner: null,
    };
};

/** Read saved player deck IDs from localStorage (browser-only).
 *  Falls back to owned cards if no deck is saved. */
const readPlayerDeckIds = (): string[] | undefined => {
    if (typeof window === 'undefined') return undefined;

    // Try saved deck first
    const saved = localStorage.getItem('playerDeck');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Failed to parse deck', e);
        }
    }

    // No saved deck — fall back to owned cards
    const ownedRaw = localStorage.getItem('ownedCards');
    if (ownedRaw) {
        try {
            return JSON.parse(ownedRaw);
        } catch (e) {
            console.error('Failed to parse ownedCards', e);
        }
    }

    return undefined;
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

const gameReducer = (state: FullGameState, action: GameAction): FullGameState => {
    switch (action.type) {
        // ---------------------------------------------------------------
        // PLACE_CARD — the core game action
        // ---------------------------------------------------------------
        case 'PLACE_CARD': {
            const prev = state.game;
            if (prev.winner || prev.board[action.index] !== null) return state;

            const sideEffects: SideEffect[] = [{ type: 'SOUND', sound: 'cardPlace' }];

            // 1. Place the card
            let newBoard = cloneBoard(prev.board);
            const cardClone: Card = {
                ...action.card,
                stats: { ...action.card.stats },
                baseStats: action.card.baseStats ? { ...action.card.baseStats } : undefined,
            };
            newBoard[action.index] = cardClone;

            // 2. Trigger On Reveal abilities
            const abilityResult = applyOnRevealAbility(
                { ...prev, board: newBoard },
                action.index,
            );

            if (abilityResult.board) {
                newBoard = abilityResult.board.map((slot) => {
                    if (!slot) return null;
                    return {
                        ...slot,
                        stats: { ...slot.stats },
                        baseStats: slot.baseStats ? { ...slot.baseStats } : undefined,
                    };
                });
            }

            const placedCard = newBoard[action.index] ?? cardClone;

            // 3. Calculate captures
            const capturedIndices = calculateCapture(newBoard, placedCard, action.index, prev.currentMapId);
            capturedIndices.forEach((capturedIndex) => {
                const capturedCard = newBoard[capturedIndex];
                if (capturedCard) {
                    newBoard[capturedIndex] = { ...capturedCard, owner: placedCard.owner };
                }
            });

            if (capturedIndices.length > 0) {
                sideEffects.push({ type: 'SOUND', sound: 'cardCapture' });
            }

            // 4. Remove card from hand
            const newPlayerHand = prev.playerHand.filter((c) => c.id !== action.card.id);
            const newOpponentHand = prev.opponentHand.filter((c) => c.id !== action.card.id);

            // 5. Check for winner
            const winner = checkWinCondition(newBoard, prev.startingPlayer);

            if (winner) {
                if (winner === 'player') {
                    sideEffects.push({ type: 'SOUND', sound: 'win' });
                } else if (winner === 'opponent') {
                    sideEffects.push({ type: 'SOUND', sound: 'lose' });
                }
                sideEffects.push({ type: 'AWARD_CREDITS', winner });
            }

            // 6. Draw a card for the current player (end-of-turn draw)
            let deckUpdates: Partial<GameState> = {};
            if (!winner) {
                deckUpdates = drawCard(
                    {
                        ...prev,
                        playerHand: newPlayerHand,
                        opponentHand: newOpponentHand,
                    } as GameState,
                    prev.currentPlayer === 'player' ? 'player' : 'opponent',
                );
            }

            const newGame: GameState = {
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
                    card: placedCard,
                    index: action.index,
                },
                ...abilityResult.gameState,
            };

            return {
                game: newGame,
                previewCaptures: [],
                _sideEffects: sideEffects,
            };
        }

        // ---------------------------------------------------------------
        // RESET_GAME
        // ---------------------------------------------------------------
        case 'RESET_GAME': {
            const deckIds = action.playerDeckIds ?? readPlayerDeckIds();
            return {
                game: buildInitialGameState(action.startingPlayer ?? 'player', deckIds),
                previewCaptures: [],
                _sideEffects: [],
            };
        }

        // ---------------------------------------------------------------
        // SET_STARTING_PLAYER
        // ---------------------------------------------------------------
        case 'SET_STARTING_PLAYER': {
            return {
                ...state,
                game: {
                    ...state.game,
                    currentPlayer: action.player,
                    startingPlayer: action.player,
                },
                _sideEffects: [],
            };
        }

        // ---------------------------------------------------------------
        // Preview captures (UI-only state)
        // ---------------------------------------------------------------
        case 'SET_PREVIEW_CAPTURES': {
            return { ...state, previewCaptures: action.captures, _sideEffects: [] };
        }

        case 'CLEAR_PREVIEW_CAPTURES': {
            if (state.previewCaptures.length === 0) return state; // avoid re-render
            return { ...state, previewCaptures: [], _sideEffects: [] };
        }

        default:
            return state;
    }
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useGameLogic = (difficulty: AIDifficulty = 'normal') => {
    const [state, dispatch] = useReducer(gameReducer, undefined, (): FullGameState => {
        const deckIds = readPlayerDeckIds();
        return {
            game: buildInitialGameState('player', deckIds),
            previewCaptures: [],
            _sideEffects: [],
        };
    });

    // Sound effects
    const { play: playCardPlace } = useSound('/sounds/card-place.mp3', 0.8);
    const { play: playCardCapture } = useSound('/sounds/card-capture.mp3', 0.85);
    const { play: playWin } = useSound('/sounds/win-fanfare.mp3', 0.9);
    const { play: playLose } = useSound('/sounds/lose-sting.mp3', 0.9);

    // Process side-effects emitted by the reducer
    const prevSideEffectsRef = useRef<SideEffect[]>([]);
    useEffect(() => {
        const effects = state._sideEffects;
        // Skip if same reference (no new dispatch)
        if (effects === prevSideEffectsRef.current || effects.length === 0) return;
        prevSideEffectsRef.current = effects;

        for (const effect of effects) {
            switch (effect.type) {
                case 'SOUND':
                    switch (effect.sound) {
                        case 'cardPlace': playCardPlace(); break;
                        case 'cardCapture': playCardCapture(); break;
                        case 'win': playWin(); break;
                        case 'lose': playLose(); break;
                    }
                    break;

                case 'AWARD_CREDITS':
                    if (typeof window !== 'undefined') {
                        const currentCredits = parseInt(localStorage.getItem('credits') || '500');
                        let award = effect.winner === 'player' ? 30 : 5;

                        // First win of the day bonus
                        if (effect.winner === 'player') {
                            const today = new Date().toISOString().slice(0, 10);
                            const lastBonusDate = localStorage.getItem('lastDailyBonusDate');
                            if (lastBonusDate !== today) {
                                award += 100;
                                localStorage.setItem('lastDailyBonusDate', today);
                            }
                        }

                        localStorage.setItem('credits', (currentCredits + award).toString());
                    }
                    break;
            }
        }
    }, [state._sideEffects, playCardPlace, playCardCapture, playWin, playLose]);

    // -----------------------------------------------------------------------
    // Public API — preserves the same shape consumed by Game.tsx
    // -----------------------------------------------------------------------

    const handleCardDrop = useCallback((card: Card, index: number) => {
        dispatch({ type: 'PLACE_CARD', card, index });
    }, []);

    const handleHover = useCallback(
        (card: Card | null, index: number) => {
            if (!card || state.game.board[index] !== null) {
                dispatch({ type: 'CLEAR_PREVIEW_CAPTURES' });
                return;
            }

            // Simulate placement to preview captures
            const tempBoard = [...state.game.board];
            tempBoard[index] = card;
            const captures = calculateCapture(tempBoard, card, index, state.game.currentMapId);
            dispatch({ type: 'SET_PREVIEW_CAPTURES', captures });
        },
        [state.game.board, state.game.currentMapId],
    );

    const resetGame = useCallback((startingPlayer: Player = 'player') => {
        const deckIds = readPlayerDeckIds();
        dispatch({ type: 'RESET_GAME', startingPlayer, playerDeckIds: deckIds });
    }, []);

    const setStartingPlayer = useCallback((player: Player) => {
        dispatch({ type: 'SET_STARTING_PLAYER', player });
    }, []);

    // -----------------------------------------------------------------------
    // AI Turn Logic (unchanged behaviour, now dispatches actions)
    // -----------------------------------------------------------------------
    const gameState = state.game;

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

                const evaluateGreedy = (board: Board, card: Card, index: number): number => {
                    let tempBoard = cloneBoard(board);

                    const cardClone: Card = {
                        ...card,
                        stats: { ...card.stats },
                        baseStats: card.baseStats ? { ...card.baseStats } : { ...card.stats },
                    };

                    tempBoard[index] = cardClone;

                    const abilityResult = applyOnRevealAbility(
                        { ...gameState, board: tempBoard },
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
                    let tempBoard = cloneBoard(board);

                    const cardClone: Card = {
                        ...card,
                        stats: { ...card.stats },
                        baseStats: card.baseStats ? { ...card.baseStats } : { ...card.stats },
                    };

                    tempBoard[index] = cardClone;

                    const abilityResult = applyOnRevealAbility(
                        { ...gameState, board: tempBoard },
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

                    // Simulate best player reply greedily
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
                                    baseStats: playerCard.baseStats
                                        ? { ...playerCard.baseStats }
                                        : { ...playerCard.stats },
                                    owner: 'player',
                                };

                                replyBoard[slotIndex] = playerClone;

                                const abilityResultPlayer = applyOnRevealAbility(
                                    { ...gameState, board: replyBoard },
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
                    const cardToPlay =
                        gameState.opponentHand[Math.floor(Math.random() * gameState.opponentHand.length)];
                    dispatch({ type: 'PLACE_CARD', card: cardToPlay, index: randomSlot });
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
                    dispatch({ type: 'PLACE_CARD', card: choice.card, index: choice.index });
                }
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [gameState, difficulty]);

    // -----------------------------------------------------------------------
    // Return the same public API shape
    // -----------------------------------------------------------------------
    return {
        gameState: state.game,
        previewCaptures: state.previewCaptures,
        handleCardDrop,
        handleHover,
        resetGame,
        setStartingPlayer,
    };
};
