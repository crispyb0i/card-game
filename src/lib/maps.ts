import { Board, MapDefinition, MapId, BOARD_SIZE } from './types';

export type StatModifier = {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
};

export type AbilityModifierMap = Record<number, StatModifier>;

// Core map metadata used by the UI
export const MAPS: MapDefinition[] = [
    {
        id: 'none',
        name: 'None',
        description: 'No environmental effects - pure strategy.',
    },
    {
        id: 'ancient-ruins',
        name: 'Ancient Ruins',
        description: 'Center relic: cards on the four adjacent tiles gain +1 to all four sides.',
    },
    {
        id: 'arcane-library',
        name: 'Arcane Library',
        description: 'All common cards gain +1 to all four sides.',
    },
    {
        id: 'volcanic-rift',
        name: 'Volcanic Rift',
        description: 'Cards on the glowing lava tiles lose 1 from all four sides.',
    },
    {
        id: 'royal-arena',
        name: 'Royal Arena',
        description: 'The player controlling fewer cards gains +1 top and +1 bottom on all their cards.',
    },
];

export const DEFAULT_MAP_ID: MapId = 'none';

export const MAPS_BY_ID: Record<MapId, MapDefinition> = MAPS.reduce((acc, map) => {
    acc[map.id] = map;
    return acc;
}, {} as Record<MapId, MapDefinition>);

// ---- Mechanical effects ----

const applyModifierToIndex = (
    map: AbilityModifierMap,
    index: number,
    delta: StatModifier,
): void => {
    const existing = map[index] || {};
    map[index] = {
        top: (existing.top ?? 0) + (delta.top ?? 0),
        right: (existing.right ?? 0) + (delta.right ?? 0),
        bottom: (existing.bottom ?? 0) + (delta.bottom ?? 0),
        left: (existing.left ?? 0) + (delta.left ?? 0),
    };
};

const getRowCol = (index: number) => ({
    row: Math.floor(index / BOARD_SIZE),
    col: index % BOARD_SIZE,
});

const getAdjacentIndicesFromIndex = (index: number): number[] => {
    const { row, col } = getRowCol(index);
    const neighbors: number[] = [];

    if (row > 0) neighbors.push((row - 1) * BOARD_SIZE + col);
    if (row < BOARD_SIZE - 1) neighbors.push((row + 1) * BOARD_SIZE + col);
    if (col > 0) neighbors.push(row * BOARD_SIZE + (col - 1));
    if (col < BOARD_SIZE - 1) neighbors.push(row * BOARD_SIZE + (col + 1));

    return neighbors;
};

const ancientRuinsModifiers = (board: Board): AbilityModifierMap => {
    const modifierMap: AbilityModifierMap = {};

    // Center relic at the middle of a 3x3 board (index 4)
    const relicIndex = 4;
    const adjacent = getAdjacentIndicesFromIndex(relicIndex);

    adjacent.forEach((idx) => {
        const card = board[idx];
        if (!card) return;

        // Relic aura: flat +1 to all sides for any adjacent card
        applyModifierToIndex(modifierMap, idx, {
            top: 1,
            right: 1,
            bottom: 1,
            left: 1,
        });
    });

    return modifierMap;
};

const arcaneLibraryModifiers = (board: Board): AbilityModifierMap => {
    const modifierMap: AbilityModifierMap = {};

    board.forEach((card, index) => {
        if (!card) return;
        if (card.rarity !== 'common') return;

        // Humble commons are empowered here
        applyModifierToIndex(modifierMap, index, {
            top: 1,
            right: 1,
            bottom: 1,
            left: 1,
        });
    });

    return modifierMap;
};

const volcanicRiftModifiers = (board: Board): AbilityModifierMap => {
    const modifierMap: AbilityModifierMap = {};

    // Lava vents in the top and bottom center tiles
    const lavaTiles = [1, 7];

    lavaTiles.forEach((idx) => {
        const card = board[idx];
        if (!card) return;

        // Standing on a lava vent slightly weakens all sides
        applyModifierToIndex(modifierMap, idx, {
            top: -1,
            right: -1,
            bottom: -1,
            left: -1,
        });
    });

    return modifierMap;
};

const royalArenaModifiers = (board: Board): AbilityModifierMap => {
    const modifierMap: AbilityModifierMap = {};

    let playerCount = 0;
    let opponentCount = 0;

    board.forEach((card) => {
        if (!card) return;
        if (card.owner === 'player') playerCount++;
        if (card.owner === 'opponent') opponentCount++;
    });

    if (playerCount === opponentCount || (playerCount === 0 && opponentCount === 0)) {
        return modifierMap;
    }

    const underdog: 'player' | 'opponent' = playerCount < opponentCount ? 'player' : 'opponent';

    board.forEach((card, index) => {
        if (!card) return;
        if (card.owner !== underdog) return;

        // Underdog momentum: +1 top/bottom for all cards on the losing side
        applyModifierToIndex(modifierMap, index, {
            top: 1,
            bottom: 1,
        });
    });

    return modifierMap;
};

const MAP_EFFECTS: Record<MapId, (board: Board) => AbilityModifierMap> = {
    'none': () => ({}),
    'ancient-ruins': ancientRuinsModifiers,
    'arcane-library': arcaneLibraryModifiers,
    'volcanic-rift': volcanicRiftModifiers,
    'royal-arena': royalArenaModifiers,
};

export const collectMapModifiers = (board: Board, mapId?: MapId): AbilityModifierMap => {
    if (!mapId || mapId === 'none') return {};
    const fn = MAP_EFFECTS[mapId];
    if (!fn) return {};
    return fn(board);
};

// ---- Per-card environment effects (used for icons/tooltips) ----

export type MapEffectKind = 'buff' | 'debuff' | 'special';

export interface MapEffectInstance {
    icon: string;
    label: string;
    description: string;
    kind: MapEffectKind;
}

export const getMapEffectForCard = (
    board: Board,
    index: number,
    mapId?: MapId,
): MapEffectInstance | undefined => {
    const id = mapId ?? DEFAULT_MAP_ID;
    const card = board[index];
    if (!card) return undefined;

    const mapModifiers = collectMapModifiers(board, id);
    const modifier = mapModifiers[index];
    if (!modifier) return undefined;

    switch (id) {
        case 'ancient-ruins':
            return {
                icon: '✧',
                label: 'Relic Aura',
                description: 'Environment: This card is next to the ancient relic and gains +1 to all four sides.',
                kind: 'buff',
            };
        case 'arcane-library':
            return {
                icon: '📜',
                label: 'Arcane Shelves',
                description: 'Environment: Common cards gain +1 to all four sides in the Arcane Library.',
                kind: 'buff',
            };
        case 'volcanic-rift':
            return {
                icon: '🔥',
                label: 'Lava Vent',
                description: 'Environment: Standing on a lava tile gives this card -1 to all four sides.',
                kind: 'debuff',
            };
        case 'royal-arena':
            return {
                icon: '📣',
                label: 'Crowd Favor',
                description: 'Environment: While your side controls fewer cards, this card gains +1 top and +1 bottom.',
                kind: 'buff',
            };
        default:
            return undefined;
    }
};

// ---- Visual helpers for special tiles ----

export type MapTileType = 'relic' | 'hazard';

export interface MapTileConfig {
    type: MapTileType;
    label: string;
}

const MAP_SPECIAL_TILES: Record<MapId, Record<number, MapTileConfig>> = {
    'none': {},
    'ancient-ruins': {
        4: { type: 'relic', label: 'Ancient Relic' },
    },
    'arcane-library': {},
    'volcanic-rift': {
        1: { type: 'hazard', label: 'Lava Vent' },
        7: { type: 'hazard', label: 'Lava Vent' },
    },
    'royal-arena': {},
};

export const getMapTileConfig = (mapId: MapId | undefined, index: number): MapTileConfig | undefined => {
    if (!mapId) return undefined;
    return MAP_SPECIAL_TILES[mapId]?.[index];
};
