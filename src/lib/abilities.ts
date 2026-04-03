import {
    AbilityDefinition,
    AbilityId,
    AbilityModifierMap,
    AbilityOnRevealResult,
    Board,
    Card,
    CardStats,
    GameState,
    MapId,
    StatModifier,
    BOARD_SIZE
} from './types';
import { collectMapModifiers } from './maps';
import { seededRandom } from './gameEngine';

// Helper to get adjacent indices (up, down, left, right)
const getAdjacentIndices = (index: number): number[] => {
    const row = Math.floor(index / BOARD_SIZE);
    const col = index % BOARD_SIZE;
    const adjacent: number[] = [];

    if (row > 0) adjacent.push((row - 1) * BOARD_SIZE + col); // Top
    if (row < BOARD_SIZE - 1) adjacent.push((row + 1) * BOARD_SIZE + col); // Bottom
    if (col > 0) adjacent.push(row * BOARD_SIZE + (col - 1)); // Left
    if (col < BOARD_SIZE - 1) adjacent.push(row * BOARD_SIZE + (col + 1)); // Right

    return adjacent;
};

// Helper to deep-clone a board without mutating the original
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

export const abilityCatalog: Record<AbilityId, AbilityDefinition> = {
    'guardian-aura': {
        id: 'guardian-aura',
        name: 'Guardian Aura',
        trigger: 'ongoing',
        text: 'Ongoing: Allied cards gain +1 left.',
        ongoing: ({ board, card }) =>
            board.reduce<{ targetIndex: number; modifier: StatModifier }[]>((acc, slot, targetIndex) => {
                if (slot && slot.owner === card.owner) {
                    acc.push({
                        targetIndex,
                        modifier: { left: 1 },
                    });
                }
                return acc;
            }, []),
    },
    'necrotic-chill': {
        id: 'necrotic-chill',
        name: 'Necrotic Chill',
        trigger: 'ongoing',
        text: 'Ongoing: All enemy cards lose 1 from all sides.',
        ongoing: ({ board, card }) => {
            return board.reduce<{ targetIndex: number; modifier: StatModifier }[]>((acc, target, targetIndex) => {
                if (target && target.owner !== card.owner) {
                    acc.push({
                        targetIndex,
                        modifier: { top: -1, right: -1, bottom: -1, left: -1 },
                    });
                }
                return acc;
            }, []);
        },
    },
    'bull-charge': {
        id: 'bull-charge',
        name: 'Bull Charge',
        trigger: 'onReveal',
        text: 'On Reveal: Charges vertically in both directions, battling through up to two enemy cards in this column using its top vs their bottom.',
        onReveal: ({ board, index, card }) => {
            const newBoard = cloneBoard(board);
            const row = Math.floor(index / BOARD_SIZE);
            const col = index % BOARD_SIZE;

            const directions = [-1, 1];

            directions.forEach(direction => {
                for (let offset = 1; offset <= 2; offset++) {
                    const targetRow = row + (offset * direction);
                    if (targetRow < 0 || targetRow >= BOARD_SIZE) break;

                    const targetIndex = targetRow * BOARD_SIZE + col;
                    const target = newBoard[targetIndex];

                    if (!target || target.owner === card.owner) break;

                    const attackerStat = card.stats.top;
                    const defenderStat = target.stats.bottom;

                    if (attackerStat > defenderStat) {
                        newBoard[targetIndex] = { ...target, owner: card.owner };
                    }
                }
            });

            return { board: newBoard };
        },
    },
    'rally': {
        id: 'rally',
        name: 'Rally',
        trigger: 'onReveal',
        text: 'On Reveal: +1 to all sides of adjacent allied cards.',
        onReveal: ({ board, index, card }) => {
            const newBoard = cloneBoard(board);
            const neighbors = getAdjacentIndices(index);
            neighbors.forEach(targetIndex => {
                const target = newBoard[targetIndex];
                if (target && target.owner === card.owner) {
                    newBoard[targetIndex] = {
                        ...target,
                        stats: {
                            top: target.stats.top + 1,
                            right: target.stats.right + 1,
                            bottom: target.stats.bottom + 1,
                            left: target.stats.left + 1,
                        },
                        baseStats: target.baseStats
                            ? {
                                  top: target.baseStats.top + 1,
                                  right: target.baseStats.right + 1,
                                  bottom: target.baseStats.bottom + 1,
                                  left: target.baseStats.left + 1,
                              }
                            : undefined,
                    };
                }
            });
            return { board: newBoard };
        },
    },
    'assassin': {
        id: 'assassin',
        name: 'Assassin',
        trigger: 'onReveal',
        text: 'On Reveal: Destroys the enemy card at the mirrored position across the board.',
        onReveal: ({ board, index, card }) => {
            const newBoard = cloneBoard(board);
            const targetIndex = (BOARD_SIZE * BOARD_SIZE - 1) - index;
            const target = newBoard[targetIndex];

            if (target && target.owner !== card.owner) {
                newBoard[targetIndex] = null;
            }

            return { board: newBoard };
        },
    },
    'crusader': {
        id: 'crusader',
        name: 'Crusader',
        trigger: 'ongoing',
        text: 'Ongoing: Gains +1 to all sides for each other allied card on the board.',
        ongoing: ({ board, card }) => {
            let allyCount = 0;
            board.forEach(slot => {
                if (slot && slot.owner === card.owner && slot.id !== card.id) {
                    allyCount++;
                }
            });

            if (allyCount > 0) {
                const sourceIndex = board.findIndex(c => c?.id === card.id);
                if (sourceIndex !== -1) {
                    return [{
                        targetIndex: sourceIndex,
                        modifier: { top: allyCount, right: allyCount, bottom: allyCount, left: allyCount }
                    }];
                }
            }
            return [];
        },
    },
    'sniper': {
        id: 'sniper',
        name: 'Sniper',
        trigger: 'onReveal',
        text: 'On Reveal: If placed in a corner, destroy the enemy card in the opposite corner.',
        onReveal: ({ board, index, card }) => {
            const newBoard = cloneBoard(board);
            const corners = [0, 2, 6, 8];
            if (corners.includes(index)) {
                const oppositeIndex = (BOARD_SIZE * BOARD_SIZE - 1) - index;
                const target = newBoard[oppositeIndex];
                if (target && target.owner !== card.owner) {
                    newBoard[oppositeIndex] = null;
                }
            }
            return { board: newBoard };
        },
    },
    'swap': {
        id: 'swap',
        name: 'Swap',
        trigger: 'onReveal',
        text: 'On Reveal: Swap positions with an adjacent enemy card.',
        onReveal: ({ board, index, card }) => {
            const newBoard = cloneBoard(board);
            const neighbors = getAdjacentIndices(index);
            const enemyNeighborIndex = neighbors.find(idx => newBoard[idx] && newBoard[idx]?.owner !== card.owner);

            if (enemyNeighborIndex !== undefined) {
                const enemyCard = newBoard[enemyNeighborIndex];
                const selfCard = newBoard[index];
                newBoard[index] = enemyCard;
                newBoard[enemyNeighborIndex] = selfCard;
            }
            return { board: newBoard };
        },
    },
    'phantom': {
        id: 'phantom',
        name: 'Phantom',
        trigger: 'onReveal',
        text: 'On Reveal: Creates a copy of itself in an empty adjacent slot.',
        onReveal: ({ board, index, card, gameState }) => {
            const newBoard = cloneBoard(board);
            const neighbors = getAdjacentIndices(index);
            const emptyNeighbor = neighbors.find(idx => newBoard[idx] === null);

            if (emptyNeighbor !== undefined) {
                const seed = gameState?.seed ?? Date.now();
                const { value: randomVal } = seededRandom(seed);
                const copy: Card = {
                    ...card,
                    id: `${card.id}-copy-${Math.floor(randomVal * 1e9)}`,
                    stats: { ...card.stats },
                    baseStats: card.baseStats ? { ...card.baseStats } : undefined
                };
                newBoard[emptyNeighbor] = copy;
            }
            return { board: newBoard };
        },
    },
    'echo': {
        id: 'echo',
        name: 'Echo',
        trigger: 'onReveal',
        text: 'On Reveal: Triggers the On Reveal ability of the last played card.',
        onReveal: ({ board, index, card, gameState }) => {
            if (!gameState || !gameState.lastMove) {
                return { board };
            }

            const lastCard = gameState.lastMove.card;

            // Don't echo if the last card was also an Echo (prevent infinite loops)
            if (lastCard.characterId === card.characterId && lastCard.characterId === 'echo-mage') {
                return { board };
            }

            if (!lastCard.ability || lastCard.ability.trigger !== 'onReveal') {
                return { board };
            }

            const definition = abilityCatalog[lastCard.ability.id];
            if (!definition || !definition.onReveal) {
                return { board };
            }

            const boardCard = board[index];
            if (!boardCard) {
                return { board };
            }

            let cardToUse = boardCard;

            // Special case for Phantom - it needs to create a copy of the last card, not Echo
            if (lastCard.ability.id === 'phantom') {
                const lastCardClone: Card = {
                    ...lastCard,
                    id: `${lastCard.id}-echo-${gameState.seed ?? Date.now()}`,
                    stats: { ...lastCard.stats },
                    baseStats: lastCard.baseStats ? { ...lastCard.baseStats } : undefined,
                    owner: boardCard.owner,
                };
                cardToUse = lastCardClone;
            }

            const result = definition.onReveal({
                board,
                index,
                card: cardToUse,
                gameState
            });

            return result;
        },
    },
    'borrow': {
        id: 'borrow',
        name: 'Borrow',
        trigger: 'onReveal',
        text: 'On Reveal: Copies the stats of the strongest adjacent card.',
        onReveal: ({ board, index, card }) => {
            const newBoard = cloneBoard(board);
            const neighbors = getAdjacentIndices(index);
            let strongestNeighbor: Card | null = null;
            let maxTotal = -1;

            neighbors.forEach(idx => {
                const neighbor = newBoard[idx];
                if (neighbor) {
                    const total = neighbor.stats.top + neighbor.stats.right + neighbor.stats.bottom + neighbor.stats.left;
                    if (total > maxTotal) {
                        maxTotal = total;
                        strongestNeighbor = neighbor;
                    }
                }
            });

            if (strongestNeighbor) {
                const target = strongestNeighbor as Card;
                const selfCard = newBoard[index];
                if (selfCard) {
                    newBoard[index] = {
                        ...selfCard,
                        stats: { ...target.stats },
                        baseStats: selfCard.baseStats ? { ...target.stats } : undefined,
                    };
                }
            }
            return { board: newBoard };
        },
    },
    'gambit': {
        id: 'gambit',
        name: 'Gambit',
        trigger: 'onReveal',
        text: 'On Reveal: 50% chance to gain +1 to all stats, 50% chance to lose -1 to all stats.',
        onReveal: ({ board, index, card, gameState }) => {
            const newBoard = cloneBoard(board);
            const seed = gameState?.seed ?? Date.now();
            const { value: randomVal } = seededRandom(seed);
            const isWin = randomVal >= 0.5;
            const modifier = isWin ? 1 : -1;

            const selfCard = newBoard[index];
            if (selfCard) {
                newBoard[index] = {
                    ...selfCard,
                    stats: {
                        top: selfCard.stats.top + modifier,
                        right: selfCard.stats.right + modifier,
                        bottom: selfCard.stats.bottom + modifier,
                        left: selfCard.stats.left + modifier,
                    },
                };
            }

            return { board: newBoard };
        },
    },
    'sacrifice': {
        id: 'sacrifice',
        name: 'Sacrifice',
        trigger: 'onReveal',
        text: 'On Reveal: Destroy an adjacent ally to gain its stats.',
        onReveal: ({ board, index, card }) => {
            const newBoard = cloneBoard(board);
            const neighbors = getAdjacentIndices(index);
            let bestAllyIndex: number | null = null;
            let bestAllyCard: Card | null = null;
            let maxTotal = 0;

            neighbors.forEach(idx => {
                const neighbor = newBoard[idx];
                if (neighbor && neighbor.owner === card.owner && neighbor.id !== card.id) {
                    const total = neighbor.stats.top + neighbor.stats.right + neighbor.stats.bottom + neighbor.stats.left;
                    if (total > maxTotal) {
                        maxTotal = total;
                        bestAllyIndex = idx;
                        bestAllyCard = neighbor;
                    }
                }
            });

            if (bestAllyIndex !== null && bestAllyCard !== null) {
                const ally: Card = bestAllyCard;
                const selfCard = newBoard[index];
                if (selfCard) {
                    newBoard[index] = {
                        ...selfCard,
                        stats: {
                            top: selfCard.stats.top + ally.stats.top,
                            right: selfCard.stats.right + ally.stats.right,
                            bottom: selfCard.stats.bottom + ally.stats.bottom,
                            left: selfCard.stats.left + ally.stats.left,
                        },
                    };
                }
                newBoard[bestAllyIndex] = null;
            }

            return { board: newBoard };
        },
    },
    'volatile': {
        id: 'volatile',
        name: 'Volatile',
        trigger: 'onReveal',
        text: 'On Reveal: Explodes, destroying itself and all adjacent cards.',
        onReveal: ({ board, index }) => {
            const newBoard = cloneBoard(board);
            const neighbors = getAdjacentIndices(index);
            neighbors.forEach(idx => {
                newBoard[idx] = null;
            });
            newBoard[index] = null;
            return { board: newBoard };
        },
    },
    'timeshift': {
        id: 'timeshift',
        name: 'Timeshift',
        trigger: 'onReveal',
        text: 'On Reveal: Returns the last played enemy card to their hand.',
        onReveal: ({ board, card, gameState }) => {
            if (!gameState || !gameState.lastMove) return { board };

            const lastMove = gameState.lastMove;

            if (lastMove.player === card.owner) return { board };

            if (board[lastMove.index]?.id === lastMove.card.id) {
                const newBoard = cloneBoard(board);
                newBoard[lastMove.index] = null;

                const targetHandKey = lastMove.player === 'player' ? 'playerHand' : 'opponentHand';
                const currentHand = gameState[targetHandKey];

                const returnedCard: Card = {
                    ...lastMove.card,
                    stats: { ...lastMove.card.baseStats! },
                    baseStats: lastMove.card.baseStats ? { ...lastMove.card.baseStats } : undefined,
                };

                return {
                    board: newBoard,
                    gameState: {
                        [targetHandKey]: [...currentHand, returnedCard]
                    }
                };
            }

            return { board };
        },
    },
    'arcane-insight': {
        id: 'arcane-insight',
        name: 'Arcane Insight',
        trigger: 'ongoing',
        text: 'Ongoing: Gains +1 to all stats for each adjacent card with an ability.',
        ongoing: ({ board, sourceIndex, card }) => {
            const neighbors = getAdjacentIndices(sourceIndex);
            let abilityCount = 0;

            neighbors.forEach(idx => {
                const neighbor = board[idx];
                if (neighbor && neighbor.ability) {
                    abilityCount++;
                }
            });

            if (abilityCount > 0) {
                const sourceCardIndex = board.findIndex(c => c?.id === card.id);
                if (sourceCardIndex !== -1) {
                    return [{
                        targetIndex: sourceCardIndex,
                        modifier: {
                            top: abilityCount,
                            right: abilityCount,
                            bottom: abilityCount,
                            left: abilityCount
                        }
                    }];
                }
            }
            return [];
        },
    },
    'silence': {
        id: 'silence',
        name: 'Silence',
        trigger: 'onReveal',
        text: 'On Reveal: Silences adjacent enemy cards, removing their abilities.',
        onReveal: ({ board, index, card }) => {
            const newBoard = cloneBoard(board);
            const neighbors = getAdjacentIndices(index);
            neighbors.forEach(idx => {
                const target = newBoard[idx];
                if (target && target.owner !== card.owner) {
                    // Create a new card object without the ability property
                    const { ability: _removed, ...rest } = target;
                    newBoard[idx] = rest as Card;
                }
            });
            return { board: newBoard };
        },
    },
    'ranger-snipe': {
        id: 'ranger-snipe',
        name: 'Long Shot',
        trigger: 'onReveal',
        text: 'On Reveal: Attacks cards that are 2 slots away in all directions.',
        onReveal: ({ board, index, card }) => {
            const newBoard = cloneBoard(board);
            const row = Math.floor(index / BOARD_SIZE);
            const col = index % BOARD_SIZE;

            const targets = [
                { r: -2, c: 0, attackStat: 'top', defendStat: 'bottom' },
                { r: 0, c: 2, attackStat: 'right', defendStat: 'left' },
                { r: 2, c: 0, attackStat: 'bottom', defendStat: 'top' },
                { r: 0, c: -2, attackStat: 'left', defendStat: 'right' },
            ] as const;

            targets.forEach(({ r, c, attackStat, defendStat }) => {
                const targetRow = row + r;
                const targetCol = col + c;

                if (targetRow >= 0 && targetRow < BOARD_SIZE && targetCol >= 0 && targetCol < BOARD_SIZE) {
                    const midRow = row + r / 2;
                    const midCol = col + c / 2;
                    if (
                        midRow >= 0 &&
                        midRow < BOARD_SIZE &&
                        midCol >= 0 &&
                        midCol < BOARD_SIZE &&
                        newBoard[midRow * BOARD_SIZE + midCol]
                    ) {
                        return;
                    }

                    const targetIndex = targetRow * BOARD_SIZE + targetCol;
                    const target = newBoard[targetIndex];

                    if (target && target.owner !== card.owner) {
                        if (card.stats[attackStat] > target.stats[defendStat]) {
                            newBoard[targetIndex] = { ...target, owner: card.owner };
                        }
                    }
                }
            });

            return { board: newBoard };
        },
    },
    'lich-debuff': {
        id: 'lich-debuff',
        name: 'Death Aura',
        trigger: 'ongoing',
        text: 'Ongoing: Adjacent enemy cards lose -2 to all stats.',
        ongoing: ({ board, sourceIndex, card }) => {
            const neighbors = getAdjacentIndices(sourceIndex);
            const modifiers: { targetIndex: number; modifier: StatModifier }[] = [];

            neighbors.forEach(idx => {
                const neighbor = board[idx];
                if (neighbor && neighbor.owner !== card.owner) {
                    modifiers.push({
                        targetIndex: idx,
                        modifier: { top: -2, right: -2, bottom: -2, left: -2 },
                    });
                }
            });

            return modifiers;
        },
    },
    'knight-rally': {
        id: 'knight-rally',
        name: 'Defensive Formation',
        trigger: 'ongoing',
        text: 'Ongoing: All allied cards gain +1 bottom.',
        ongoing: ({ board, card }) => {
            return board.reduce<{ targetIndex: number; modifier: StatModifier }[]>((acc, slot, targetIndex) => {
                if (slot && slot.owner === card.owner) {
                    acc.push({
                        targetIndex,
                        modifier: { bottom: 1 },
                    });
                }
                return acc;
            }, []);
        },
    },
    'cleric-blessing': {
        id: 'cleric-blessing',
        name: 'Divine Blessing',
        trigger: 'onReveal',
        text: 'On Reveal: The next card you play gains +1 bottom.',
        onReveal: ({ board }) => {
            // TODO: Implement buff for next card - requires GameState.nextCardBuff tracking
            return { board };
        },
    },
    'dragon-fire': {
        id: 'dragon-fire',
        name: 'Dragon Fire',
        trigger: 'ongoing',
        text: 'Ongoing: Adjacent allied cards gain +2 top.',
        ongoing: ({ board, sourceIndex, card }) => {
            const neighbors = getAdjacentIndices(sourceIndex);
            const modifiers: { targetIndex: number; modifier: StatModifier }[] = [];

            neighbors.forEach(idx => {
                const neighbor = board[idx];
                if (neighbor && neighbor.owner === card.owner) {
                    modifiers.push({
                        targetIndex: idx,
                        modifier: { top: 2 },
                    });
                }
            });

            return modifiers;
        },
    },
    'void-drain': {
        id: 'void-drain',
        name: 'Void Drain',
        trigger: 'onReveal',
        text: 'On Reveal: Steals +1 from all stats of all enemy cards on the board.',
        onReveal: ({ board, index }) => {
            const newBoard = cloneBoard(board);
            let totalDrained = 0;

            // Drain from all enemy cards
            const selfCard = newBoard[index];
            if (!selfCard) return { board: newBoard };

            newBoard.forEach((slot, slotIndex) => {
                if (slot && slot.owner !== selfCard.owner) {
                    const newStats = { ...slot.stats };
                    if (newStats.top > 0) { newStats.top -= 1; totalDrained++; }
                    if (newStats.right > 0) { newStats.right -= 1; totalDrained++; }
                    if (newStats.bottom > 0) { newStats.bottom -= 1; totalDrained++; }
                    if (newStats.left > 0) { newStats.left -= 1; totalDrained++; }
                    newBoard[slotIndex] = { ...slot, stats: newStats };
                }
            });

            // Add drained stats to self (distribute evenly)
            const perStat = Math.floor(totalDrained / 4);
            const remainder = totalDrained % 4;

            newBoard[index] = {
                ...selfCard,
                stats: {
                    top: selfCard.stats.top + perStat + (remainder > 0 ? 1 : 0),
                    right: selfCard.stats.right + perStat + (remainder > 1 ? 1 : 0),
                    bottom: selfCard.stats.bottom + perStat + (remainder > 2 ? 1 : 0),
                    left: selfCard.stats.left + perStat,
                },
            };

            return { board: newBoard };
        },
    },
};

export const applyOnRevealAbility = (
    gameState: GameState,
    index: number
): AbilityOnRevealResult => {
    const board = [...gameState.board];
    const card = board[index];

    if (!card || !card.ability || card.ability.trigger !== 'onReveal') {
        return { board };
    }

    const definition = abilityCatalog[card.ability.id];
    if (definition && definition.onReveal) {
        return definition.onReveal({
            board,
            index,
            card,
            gameState
        });
    }

    return { board };
};

export const collectOngoingModifiers = (board: Board): AbilityModifierMap => {
    const modifierMap: AbilityModifierMap = {};

    board.forEach((sourceCard, sourceIndex) => {
        if (!sourceCard || !sourceCard.ability || sourceCard.ability.trigger !== 'ongoing') return;

        const definition = abilityCatalog[sourceCard.ability.id];
        if (definition && definition.ongoing) {
            const contributions = definition.ongoing({ board, sourceIndex, card: sourceCard });
            contributions.forEach(({ targetIndex, modifier }) => {
                if (!modifierMap[targetIndex]) {
                    modifierMap[targetIndex] = {};
                }
                const current = modifierMap[targetIndex];
                if (modifier.top) current.top = (current.top || 0) + modifier.top;
                if (modifier.right) current.right = (current.right || 0) + modifier.right;
                if (modifier.bottom) current.bottom = (current.bottom || 0) + modifier.bottom;
                if (modifier.left) current.left = (current.left || 0) + modifier.left;
            });
        }
    });

    return modifierMap;
};

// Helper to merge two modifier maps
const mergeModifiers = (base: Partial<CardStats> | undefined, add: Partial<CardStats> | undefined): Partial<CardStats> => {
    const result = { ...(base || {}) };
    if (add) {
        result.top = (result.top || 0) + (add.top || 0);
        result.right = (result.right || 0) + (add.right || 0);
        result.bottom = (result.bottom || 0) + (add.bottom || 0);
        result.left = (result.left || 0) + (add.left || 0);
    }
    return result;
};

// Collect all stat modifiers affecting the board: ongoing abilities + map effects
export const collectAllModifiers = (board: Board, mapId?: MapId): AbilityModifierMap => {
    const abilityModifiers = collectOngoingModifiers(board);
    const mapModifiers = collectMapModifiers(board, mapId);

    const combined: AbilityModifierMap = { ...abilityModifiers };

    Object.entries(mapModifiers).forEach(([key, modifier]) => {
        const index = Number(key);
        combined[index] = mergeModifiers(combined[index], modifier);
    });

    return combined;
};

// Calculate what modifiers would apply if a card were placed at a specific slot
// This simulates placing the card temporarily to calculate ongoing modifiers
export const calculatePreviewModifiers = (board: Board, card: Card, targetIndex: number, mapId?: MapId): Partial<CardStats> => {
    // Create a temporary board with the card placed at targetIndex
    const tempBoard = [...board];
    tempBoard[targetIndex] = card;

    // Calculate modifiers for this temporary board
    const modifiers = collectAllModifiers(tempBoard, mapId);

    // Return the modifiers that would apply to the card at targetIndex
    return modifiers[targetIndex] || {};
};

// Calculate fully resolved stats after On Reveal ability and ongoing modifiers
// This simulates the complete resolution: place card -> trigger On Reveal -> apply ongoing modifiers
export const calculateResolvedStats = (
    board: Board,
    card: Card,
    targetIndex: number,
    mapId?: MapId,
    gameState?: Partial<GameState>
): CardStats => {
    // Deep clone the card to avoid mutating the original
    const cardClone: Card = {
        ...card,
        stats: { ...card.stats },
        baseStats: card.baseStats ? { ...card.baseStats } : undefined
    };

    // Step 1: Create deep copy of board to avoid mutating original cards
    const tempBoard: Board = board.map((slot) => {
        if (!slot) return null;
        return {
            ...slot,
            stats: { ...slot.stats },
            baseStats: slot.baseStats ? { ...slot.baseStats } : undefined
        };
    });
    tempBoard[targetIndex] = cardClone;

    // Step 2: Apply On Reveal ability if it exists
    if (cardClone.ability && cardClone.ability.trigger === 'onReveal') {
        const definition = abilityCatalog[cardClone.ability.id];
        if (definition && definition.onReveal) {
            // Special handling for random abilities (Gambit)
            if (cardClone.ability.id === 'gambit') {
                // For preview, show average (no change) since it's random
            } else {
                // Apply the On Reveal ability
                const result = definition.onReveal({
                    board: tempBoard,
                    index: targetIndex,
                    card: cardClone,
                    gameState: gameState as GameState
                });

                // Update tempBoard if it was modified
                if (result.board) {
                    // Copy back the modified card stats
                    const modifiedCard = result.board[targetIndex];
                    if (modifiedCard) {
                        cardClone.stats = { ...modifiedCard.stats };
                    }
                }
            }
        }
    }

    // Step 3: Calculate ongoing modifiers on top of the resolved stats
    const modifiers = collectAllModifiers(tempBoard, mapId);
    const ongoingMods = modifiers[targetIndex] || {};

    // Step 4: Return final resolved stats
    return {
        top: cardClone.stats.top + (ongoingMods.top || 0),
        right: cardClone.stats.right + (ongoingMods.right || 0),
        bottom: cardClone.stats.bottom + (ongoingMods.bottom || 0),
        left: cardClone.stats.left + (ongoingMods.left || 0),
    };
};

// New function to get detailed modifier breakdown with sources
export const getModifierBreakdown = (board: Board, targetIndex: number): Array<{
    sourceName: string;
    abilityName: string;
    modifier: StatModifier;
}> => {
    const breakdowns: Array<{ sourceName: string; abilityName: string; modifier: StatModifier }> = [];
    const targetCard = board[targetIndex];
    if (!targetCard) return [];

    // 1. Check Ongoing Abilities from other cards
    board.forEach((sourceCard, sourceIndex) => {
        if (!sourceCard || !sourceCard.ability || sourceCard.ability.trigger !== 'ongoing') return;

        const definition = abilityCatalog[sourceCard.ability.id];
        if (definition && definition.ongoing) {
            const contributions = definition.ongoing({ board, sourceIndex, card: sourceCard });
            contributions.forEach((contribution) => {
                if (contribution.targetIndex === targetIndex) {
                    breakdowns.push({
                        sourceName: sourceCard.name,
                        abilityName: definition.name,
                        modifier: contribution.modifier
                    });
                }
            });
        }
    });

    return breakdowns;
};
