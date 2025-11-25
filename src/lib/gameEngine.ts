import { Board, Card, Player, BOARD_SIZE } from './types';

export const getIndex = (row: number, col: number) => row * BOARD_SIZE + col;
export const getRowCol = (index: number) => ({ row: Math.floor(index / BOARD_SIZE), col: index % BOARD_SIZE });

import { collectAllModifiers } from './abilities';
import { MapId } from './types';

export const calculateCapture = (board: Board, card: Card, index: number, mapId?: MapId): number[] => {
    const capturedIndices: number[] = [];
    const { row, col } = getRowCol(index);

    // Calculate effective stats for the board
    const modifiers = collectAllModifiers(board, mapId);

    // Helper to get effective stat
    const getEffectiveStat = (cardIdx: number, statKey: keyof typeof card.stats): number => {
        const c = board[cardIdx];
        if (!c) return 0;
        const mod = modifiers[cardIdx] || {};
        return (c.stats[statKey] || 0) + (mod[statKey] || 0);
    };

    // For the placed card (which might not be in the board array yet if we are simulating, 
    // but usually the caller places it first. 
    // If 'card' is passed explicitly, we should use its stats + modifiers for 'index'.
    // However, collectAllModifiers looks at the board. 
    // If the card is NOT in the board at 'index', collectAllModifiers won't see it for 'ongoing' effects originating from it,
    // but it will calculate modifiers FOR it if it receives them.
    // Let's assume the card IS at board[index] for the sake of modifier calculation, 
    // or we might miss self-buffs or aura reception.

    // Actually, the caller usually places the card in the board before calling this.
    // But let's be safe. If board[index] is null, we can't calculate modifiers for it properly using collectAllModifiers 
    // because that function iterates the board.
    // But we can manually apply modifiers to the attacker.

    // Let's assume board[index] IS the card.

    const myStats = {
        top: getEffectiveStat(index, 'top'),
        right: getEffectiveStat(index, 'right'),
        bottom: getEffectiveStat(index, 'bottom'),
        left: getEffectiveStat(index, 'left'),
    };

    // Directions: Top, Right, Bottom, Left
    const directions = [
        { r: -1, c: 0, myStat: myStats.top, oppStatKey: 'bottom' as const },
        { r: 0, c: 1, myStat: myStats.right, oppStatKey: 'left' as const },
        { r: 1, c: 0, myStat: myStats.bottom, oppStatKey: 'top' as const },
        { r: 0, c: -1, myStat: myStats.left, oppStatKey: 'right' as const },
    ];

    directions.forEach(({ r, c, myStat, oppStatKey }) => {
        const adjRow = row + r;
        const adjCol = col + c;

        if (adjRow >= 0 && adjRow < BOARD_SIZE && adjCol >= 0 && adjCol < BOARD_SIZE) {
            const adjIndex = getIndex(adjRow, adjCol);
            const adjCard = board[adjIndex];

            if (adjCard && adjCard.owner !== card.owner) {
                const oppStat = getEffectiveStat(adjIndex, oppStatKey);
                if (myStat > oppStat) {
                    capturedIndices.push(adjIndex);
                }
            }
        }
    });

    return capturedIndices;
};

export const checkWinCondition = (board: Board): Player | 'draw' | null => {
    const isFull = board.every((slot) => slot !== null);
    if (!isFull) return null;

    let playerCount = 0;
    let opponentCount = 0;

    board.forEach((card) => {
        if (card?.owner === 'player') playerCount++;
        if (card?.owner === 'opponent') opponentCount++;
    });

    if (playerCount > opponentCount) return 'player';
    if (opponentCount > playerCount) return 'opponent';
    return 'draw';
};

export const generateRandomStats = (): { top: number; right: number; bottom: number; left: number } => {
    return {
        top: Math.floor(Math.random() * 9) + 1,
        right: Math.floor(Math.random() * 9) + 1,
        bottom: Math.floor(Math.random() * 9) + 1,
        left: Math.floor(Math.random() * 9) + 1,
    };
};

import { CHARACTERS } from './cards';

export const createDeck = (owner: Player, count: number = 5, characterIds?: string[]): Card[] => {
    return Array.from({ length: count }).map((_, i) => {
        let char;

        if (characterIds && characterIds[i]) {
            // Find character by ID
            char = CHARACTERS.find(c => c.id === characterIds[i]);
        }

        // Fallback to random if not found or not provided
        if (!char) {
            char = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
        }

        return {
            id: `${owner}-${i}-${Date.now()}`,
            name: char.name,
            imageUrl: char.imageUrl,
            stats: { ...char.stats }, // Working stats (may be modified by maps/abilities)
            baseStats: { ...char.stats }, // Immutable baseline for UI comparisons
            owner,
            rarity: char.rarity,
            variant: 'base',
            characterId: char.id,
            ability: char.ability,
        };
    });
};
