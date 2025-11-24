export type Player = 'player' | 'opponent';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type Variant = 'base' | 'pixel' | 'foil' | 'glitch';

export interface CardStats {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface Card {
    id: string;
    name: string;
    stats: CardStats;
    imageUrl: string;
    owner: Player;
    rarity: Rarity;
    variant: Variant;
}

export type BoardSlot = Card | null;

export type Board = BoardSlot[];

export interface GameState {
    board: Board;
    playerHand: Card[];
    opponentHand: Card[];
    currentPlayer: Player;
    winner: Player | 'draw' | null;
}

export const BOARD_SIZE = 3;
