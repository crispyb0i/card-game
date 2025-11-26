export type Player = 'player' | 'opponent';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export type Variant = 'base' | 'pixel' | 'foil' | 'glitch';

export type MapId = 'none' | 'ancient-ruins' | 'arcane-library' | 'volcanic-rift' | 'royal-arena';

export type AIDifficulty = 'easy' | 'normal' | 'hard';

export interface MapDefinition {
    id: MapId;
    name: string;
    description: string;
}

// Shared map effect descriptor used by UI tooltips (mirrors the shape in maps.ts)
export interface MapEffectInstance {
    icon: string;
    label: string;
    description: string;
    kind: 'buff' | 'debuff' | 'special';
}

export interface CardStats {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export type AbilityId =
    | 'guardian-aura' | 'necrotic-chill' | 'bull-charge'
    | 'rally' | 'assassin' | 'crusader' | 'sniper'
    | 'swap' | 'pull' | 'anchor' | 'phantom'
    | 'echo' | 'amplify' | 'borrow' | 'suppression-field'
    | 'gambit' | 'sacrifice' | 'last-stand' | 'volatile'
    | 'timeshift' | 'invisible' | 'study' | 'aura'
    | 'silence' | 'ranger-snipe' | 'lich-debuff' | 'knight-rally'
    | 'cleric-blessing' | 'dragon-fire' | 'void-drain';

export type AbilityTrigger = 'onReveal' | 'ongoing';

export interface CardAbility {
    id: AbilityId;
    name: string;
    trigger: AbilityTrigger;
    // Human-readable rules text shown in the tooltip.
    text: string;
}

export interface Card {
    id: string;
    name: string;
    // Current stats (may already include map/ability modifiers in some contexts)
    stats: CardStats;
    // Optional immutable base stats so the UI can compare before/after modifiers.
    baseStats?: CardStats;
    imageUrl: string;
    owner: Player;
    rarity: Rarity;
    variant: Variant;
    // Optional: base character ID for deck building / persistence
    characterId?: string;
    ability?: CardAbility;
}

export type BoardSlot = Card | null;

export type Board = BoardSlot[];

export interface GameState {
    board: Board;
    playerHand: Card[];
    playerDeck: Card[]; // Added playerDeck
    opponentHand: Card[];
    opponentDeck: Card[];
    currentPlayer: Player;
    startingPlayer: Player;
    winner: Player | 'draw' | null;
    activeEffects?: string[]; // e.g. 'delay-reveal'
    currentMapId?: MapId;
    lastMove?: {
        player: Player;
        card: Card;
        index: number;
    };
}

export const BOARD_SIZE = 3;

// Helper type for ability implementations
export interface AbilityContext {
    board: Board;
    index: number;
    card: Card;
    gameState?: GameState;
}

export interface AbilityResult {
    board?: Board;
    gameState?: Partial<GameState>;
}

export interface AbilityDefinition {
    id: AbilityId;
    name: string;
    trigger: AbilityTrigger;
    text: string;
    onReveal?: (context: { board: Board; index: number; card: Card; gameState?: GameState }) => AbilityResult;
    ongoing?: (context: { board: Board; sourceIndex: number; card: Card }) => { targetIndex: number; modifier: Partial<CardStats> }[];
}

export interface AbilityOnRevealResult {
    board?: Board;
    gameState?: Partial<GameState>;
}

export interface AbilityModifierMap {
    [index: number]: Partial<CardStats>;
}

export interface StatModifier {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}

export interface AbilitySummary {
    id: AbilityId;
    name: string;
    description: string;
}
