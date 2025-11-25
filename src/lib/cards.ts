import { CardStats, Rarity, CardAbility } from './types';

export interface Character {
    id: string;
    name: string;
    stats: CardStats;
    imageUrl: string;
    description: string;
    rarity: Rarity;
    ability?: CardAbility;
}

export const CHARACTERS: Character[] = [
    // COMMON (Sum ~10-12)
    {
        id: 'squire',
        name: 'Village Squire',
        stats: { top: 2, right: 3, bottom: 2, left: 3 },
        imageUrl: '/assets/squire.png',
        description: 'Eager to prove himself.',
        rarity: 'common',
    },
    {
        id: 'rat',
        name: 'Giant Rat',
        stats: { top: 1, right: 4, bottom: 1, left: 4 },
        imageUrl: '/assets/rat.png',
        description: 'A nuisance in the sewers.',
        rarity: 'common',
    },
    {
        id: 'slime',
        name: 'Green Slime',
        stats: { top: 3, right: 3, bottom: 3, left: 3 },
        imageUrl: '/assets/slime.png',
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
        imageUrl: '/assets/wolf.png',
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
    {
        id: 'cultist',
        name: 'Cultist',
        stats: { top: 2, right: 2, bottom: 2, left: 2 },
        imageUrl: '/assets/cultist.png',
        description: 'Willing to sacrifice for power.',
        rarity: 'rare',
        ability: {
            id: 'sacrifice',
            name: 'Sacrifice',
            trigger: 'onReveal',
            text: 'On Reveal: Destroy an adjacent ally to gain its stats.'
        }
    },
    {
        id: 'guardian',
        name: 'Spectral Guardian',
        stats: { top: 3, right: 6, bottom: 3, left: 6 },
        imageUrl: '/assets/cyan_knight.png',
        description: 'A ghostly protector of the realm.',
        rarity: 'rare',
        ability: {
            id: 'guardian-aura',
            name: 'Guardian Aura',
            trigger: 'ongoing',
            text: 'Ongoing: Allied cards gain +1 top and +1 right.'
        }
    },
    {
        id: 'silencer',
        name: 'Silencer',
        stats: { top: 4, right: 5, bottom: 4, left: 5 },
        imageUrl: '/assets/silencer.png',
        description: 'Nullifies magic in the vicinity.',
        rarity: 'rare',
        ability: {
            id: 'silence',
            name: 'Silence',
            trigger: 'onReveal',
            text: 'On Reveal: Silences adjacent enemy cards, removing their abilities.'
        }
    },
    {
        id: 'trickster',
        name: 'Trickster',
        stats: { top: 3, right: 4, bottom: 3, left: 4 },
        imageUrl: '/assets/swapper.png',
        description: 'Loves to cause confusion.',
        rarity: 'rare',
        ability: {
            id: 'swap',
            name: 'Swap',
            trigger: 'onReveal',
            text: 'On Reveal: Swap positions with an adjacent enemy card.'
        }
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
        imageUrl: '/assets/golem.png',
        description: 'An unstoppable construct.',
        rarity: 'epic',
    },
    {
        id: 'assassin',
        name: 'Shadow Assassin',
        stats: { top: 9, right: 1, bottom: 1, left: 8 }, // Sum 19
        imageUrl: '/assets/assassin.png',
        description: 'Strikes first, asks questions later.',
        rarity: 'epic',
    },
    {
        id: 'rogue',
        name: 'Crimson Rogue',
        stats: { top: 8, right: 2, bottom: 2, left: 8 },
        imageUrl: '/assets/red_rogue.png',
        description: 'Deadly and elusive.',
        rarity: 'epic',
        ability: {
            id: 'assassin',
            name: 'Assassinate',
            trigger: 'onReveal',
            text: 'On Reveal: Destroy the card opposite to this one (if enemy).'
        }
    },
    {
        id: 'gambler',
        name: 'Fortune Gambler',
        stats: { top: 4, right: 4, bottom: 4, left: 4 },
        imageUrl: '/assets/gambler.png',
        description: 'Always bets on a winning hand.',
        rarity: 'epic',
        ability: {
            id: 'gambit',
            name: 'Gambit',
            trigger: 'onReveal',
            text: 'On Reveal: 50% chance to gain +1 to all stats, 50% chance to lose -1 to all stats.'
        }
    },

    // LEGENDARY (Sum ~22+ or Unique Spikes)
    {
        id: 'dragon',
        name: 'Red Dragon',
        stats: { top: 9, right: 4, bottom: 9, left: 2 },
        imageUrl: '/assets/dragon.png',
        description: 'A legendary beast of immense power.',
        rarity: 'legendary',
    },
    {
        id: 'lich',
        name: 'Lich King',
        stats: { top: 8, right: 9, bottom: 4, left: 4 },
        imageUrl: '/assets/lich.png',
        description: 'The master of the undead.',
        rarity: 'legendary',
    },
    {
        id: 'chronomancer',
        name: 'Chronomancer',
        stats: { top: 3, right: 5, bottom: 3, left: 5 },
        imageUrl: '/assets/chronomancer.png',
        description: 'Manipulates time to undo mistakes.',
        rarity: 'legendary',
        ability: {
            id: 'timeshift',
            name: 'Timeshift',
            trigger: 'onReveal',
            text: 'On Reveal: Returns the last played enemy card to their hand.'
        }
    },
    {
        id: 'bull',
        name: 'Bull Boss',
        stats: { top: 9, right: 6, bottom: 3, left: 3 },
        imageUrl: '/assets/bull-boss.png',
        description: 'Charges forward, crushing everything in its path.',
        rarity: 'legendary',
        ability: {
            id: 'bull-charge',
            name: 'Bull Charge',
            trigger: 'onReveal',
            text: 'On Reveal: Charges straight up, battling through up to two enemy cards in this column using its top vs their bottom.'
        }
    },
];
