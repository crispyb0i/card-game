import { CardStats, Rarity } from './types';

export interface Character {
    id: string;
    name: string;
    stats: CardStats;
    imageUrl: string;
    description: string;
    rarity: Rarity;
}

export const CHARACTERS: Character[] = [
    // COMMON (Sum ~10-12)
    {
        id: 'squire',
        name: 'Village Squire',
        stats: { top: 2, right: 3, bottom: 2, left: 3 },
        imageUrl: 'https://picsum.photos/seed/squire/200', // Placeholder
        description: 'Eager to prove himself.',
        rarity: 'common',
    },
    {
        id: 'rat',
        name: 'Giant Rat',
        stats: { top: 1, right: 4, bottom: 1, left: 4 },
        imageUrl: 'https://picsum.photos/seed/rat/200', // Placeholder
        description: 'A nuisance in the sewers.',
        rarity: 'common',
    },
    {
        id: 'slime',
        name: 'Green Slime',
        stats: { top: 3, right: 3, bottom: 3, left: 3 },
        imageUrl: 'https://picsum.photos/seed/slime/200', // Placeholder
        description: 'Sticky and gross.',
        rarity: 'common',
    },
    {
        id: 'goblin',
        name: 'Goblin Scavenger',
        stats: { top: 2, right: 5, bottom: 2, left: 1 },
        imageUrl: '/assets/goblin.png', // Will generate
        description: 'Weak alone, but dangerous in numbers.',
        rarity: 'common',
    },
    {
        id: 'knight',
        name: 'Royal Knight',
        stats: { top: 6, right: 4, bottom: 6, left: 4 }, // Sum 20? Too strong for common. Nerfing.
        // New Stats: 4/3/4/3 = 14. Still strong. Let's do 4/2/4/2 = 12.
        // Wait, original was 6/4/6/4. That's 20. That should be Rare/Epic.
        // Let's rebalance existing ones.
        imageUrl: '/assets/knight.png',
        description: 'A balanced warrior loyal to the crown.',
        rarity: 'rare', // Bumped to Rare
    },

    // RARE (Sum ~14-16)
    {
        id: 'ranger',
        name: 'Elven Ranger',
        stats: { top: 7, right: 2, bottom: 3, left: 6 }, // Sum 18. Strong.
        imageUrl: '/assets/ranger.png',
        description: 'Strikes from the shadows with deadly precision.',
        rarity: 'rare',
    },
    {
        id: 'wolf',
        name: 'Dire Wolf',
        stats: { top: 5, right: 5, bottom: 2, left: 2 }, // Sum 14
        imageUrl: 'https://picsum.photos/seed/wolf/200',
        description: 'Hunts in packs.',
        rarity: 'rare',
    },
    {
        id: 'cleric',
        name: 'Holy Cleric',
        stats: { top: 2, right: 6, bottom: 6, left: 2 }, // Sum 16
        imageUrl: '/assets/cleric.png', // Will generate
        description: 'Protects allies with divine magic.',
        rarity: 'rare',
    },

    // EPIC (Sum ~18-20)
    {
        id: 'wizard',
        name: 'High Wizard',
        stats: { top: 3, right: 8, bottom: 2, left: 7 }, // Sum 20
        imageUrl: '/assets/wizard.png',
        description: 'Master of arcane arts, weak in melee.',
        rarity: 'epic',
    },
    {
        id: 'golem',
        name: 'Iron Golem',
        stats: { top: 8, right: 1, bottom: 8, left: 1 }, // Sum 18
        imageUrl: 'https://picsum.photos/seed/golem/200',
        description: 'An unstoppable construct.',
        rarity: 'epic',
    },
    {
        id: 'assassin',
        name: 'Shadow Assassin',
        stats: { top: 9, right: 1, bottom: 1, left: 8 }, // Sum 19
        imageUrl: 'https://picsum.photos/seed/assassin/200',
        description: 'Strikes first, asks questions later.',
        rarity: 'epic',
    },

    // LEGENDARY (Sum ~22+ or Unique Spikes)
    {
        id: 'dragon',
        name: 'Red Dragon',
        stats: { top: 9, right: 8, bottom: 9, left: 8 }, // Sum 34! Very OP.
        // Let's nerf slightly or keep as boss card.
        // Triple Triad Bahamut is like 6/9/A/5.
        // Let's make it 9/6/9/6 = 30.
        imageUrl: '/assets/dragon.png',
        description: 'A legendary beast of immense power.',
        rarity: 'legendary',
    },
    {
        id: 'lich',
        name: 'Lich King',
        stats: { top: 8, right: 8, bottom: 8, left: 8 }, // Sum 32
        imageUrl: 'https://picsum.photos/seed/lich/200',
        description: 'The master of the undead.',
        rarity: 'legendary',
    },
];
