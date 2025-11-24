import { Board, Card, Player, BOARD_SIZE } from './types';

export const getIndex = (row: number, col: number) => row * BOARD_SIZE + col;
export const getRowCol = (index: number) => ({ row: Math.floor(index / BOARD_SIZE), col: index % BOARD_SIZE });

export const calculateCapture = (board: Board, card: Card, index: number): number[] => {
    const capturedIndices: number[] = [];
    const { row, col } = getRowCol(index);
    const { stats, owner } = card;

    // Directions: Top, Right, Bottom, Left
    const directions = [
        { r: -1, c: 0, myStat: stats.top, oppStatKey: 'bottom' as const },
        { r: 0, c: 1, myStat: stats.right, oppStatKey: 'left' as const },
        { r: 1, c: 0, myStat: stats.bottom, oppStatKey: 'top' as const },
        { r: 0, c: -1, myStat: stats.left, oppStatKey: 'right' as const },
    ];

    directions.forEach(({ r, c, myStat, oppStatKey }) => {
        const adjRow = row + r;
        const adjCol = col + c;

        if (adjRow >= 0 && adjRow < BOARD_SIZE && adjCol >= 0 && adjCol < BOARD_SIZE) {
            const adjIndex = getIndex(adjRow, adjCol);
            const adjCard = board[adjIndex];

            if (adjCard && adjCard.owner !== owner) {
                const oppStat = adjCard.stats[oppStatKey];
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
            stats: { ...char.stats }, // Copy stats to avoid mutation issues if we add modifiers later
            owner,
            rarity: char.rarity,
            variant: 'base',
        };
    });
};
