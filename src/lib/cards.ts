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
        stats: { top: 1, right: 3, bottom: 1, left: 4 },
        imageUrl: '/assets/rat.png',
        description: 'A nuisance in the sewers.',
        rarity: 'common',
    },
    {
        id: 'slime',
        name: 'Green Slime',
        stats: { top: 3, right: 1, bottom: 3, left: 3 },
        imageUrl: '/assets/slime.png',
        description: 'Sticky and gross.',
        rarity: 'common',
    },
    {
        id: 'goblin',
        name: 'Goblin Scavenger',
        stats: { top: 2, right: 4, bottom: 2, left: 1 },
        imageUrl: '/assets/goblin.png', // Will generate
        description: 'Weak alone, but dangerous in numbers.',
        rarity: 'common',
    },
    {
        id: 'shield-bearer',
        name: 'Shield Bearer',
        stats: { top: 1, right: 3, bottom: 4, left: 3 },
        imageUrl: '/assets/shield-bearer.png',
        description: 'A simple frontliner with a sturdy guard.',
        rarity: 'common',
    },
    {
        id: 'sky-scout',
        name: 'Sky Scout',
        stats: { top: 3, right: 3, bottom: 2, left: 3 },
        imageUrl: '/assets/sky-scout.png',
        description: 'Keeps an eye on every corner of the board.',
        rarity: 'common',
    },
    {
        id: 'river-wisp',
        name: 'River Wisp',
        stats: { top: 2, right: 4, bottom: 3, left: 2 },
        imageUrl: '/assets/river-wisp.png',
        description: 'A slippery spirit that flows around stronger foes.',
        rarity: 'common',
    },
    {
        id: 'knight',
        name: 'Royal Knight',
        stats: { top: 3, right: 2, bottom: 6, left: 4 },
        imageUrl: '/assets/knight.png',
        description: 'A stalwart defender who bolsters the defense of allies.',
        rarity: 'rare',
        ability: {
            id: 'knight-rally',
            name: 'Defensive Formation',
            trigger: 'ongoing',
            text: 'Ongoing: All allied cards gain +1 bottom.'
        }
    },

    // RARE (Sum ~14-16)
    {
        id: 'ranger',
        name: 'Elven Ranger',
        stats: { top: 4, right: 2, bottom: 3, left: 6 },
        imageUrl: '/assets/ranger.png',
        description: 'Strikes from the shadows with deadly precision.',
        rarity: 'rare',
        ability: {
            id: 'ranger-snipe',
            name: 'Long Shot',
            trigger: 'onReveal',
            text: 'On Reveal: Attacks cards that are 2 slots away in all directions.'
        }
    },
    {
        id: 'wolf',
        name: 'Dire Wolf',
        stats: { top: 3, right: 5, bottom: 2, left: 2 }, // Sum 14
        imageUrl: '/assets/wolf.png',
        description: 'Hunts in packs.',
        rarity: 'rare',
    },
    {
        id: 'cleric',
        name: 'Holy Cleric',
        stats: { top: 2, right: 3, bottom: 4, left: 2 },
        imageUrl: '/assets/cleric.png',
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
        stats: { top: 3, right: 5, bottom: 3, left: 5 },
        imageUrl: '/assets/cyan_knight.png',
        description: 'A ghostly protector of the realm.',
        rarity: 'rare',
        ability: {
            id: 'guardian-aura',
            name: 'Guardian Aura',
            trigger: 'ongoing',
            text: 'Ongoing: Allied cards gain +1 left.'
        }
    },
    {
        id: 'silencer',
        name: 'Silencer',
        stats: { top: 4, right: 3, bottom: 4, left: 4 },
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
    {
        id: 'battle-priest',
        name: 'Battle Priest',
        stats: { top: 3, right: 3, bottom: 4, left: 4 },
        imageUrl: '/assets/battle-priest.png',
        description: 'Bolsters nearby allies before the clash.',
        rarity: 'rare',
        ability: {
            id: 'rally',
            name: 'Rally',
            trigger: 'onReveal',
            text: 'On Reveal: +1 to all sides of adjacent allied cards.'
        }
    },
    {
        id: 'mirror-thief',
        name: 'Mirror Thief',
        stats: { top: 3, right: 3, bottom: 3, left: 4 },
        imageUrl: '/assets/mirror-thief.png',
        description: 'Steals the strength of nearby foes.',
        rarity: 'rare',
        ability: {
            id: 'borrow',
            name: 'Stolen Shape',
            trigger: 'onReveal',
            text: 'On Reveal: Copies the stats of the strongest adjacent card.'
        }
    },
    {
        id: 'boom-bomber',
        name: 'Booming Bomber',
        stats: { top: 4, right: 2, bottom: 4, left: 3 },
        imageUrl: '/assets/booming-bomber.png',
        description: 'Sometimes the best defense is a big explosion.',
        rarity: 'rare',
        ability: {
            id: 'volatile',
            name: 'Volatile',
            trigger: 'onReveal',
            text: 'On Reveal: Explodes, destroying itself and all adjacent cards.'
        }
    },

    // EPIC (Sum ~18-20)
    {
        id: 'wizard',
        name: 'High Wizard',
        stats: { top: 3, right: 5, bottom: 2, left: 6 }, // Sum 20
        imageUrl: '/assets/wizard.png',
        description: 'Master of arcane arts, weak in melee.',
        rarity: 'epic',
    },
    {
        id: 'golem',
        name: 'Iron Golem',
        stats: { top: 6, right: 2, bottom: 6, left: 2 }, // Sum 18
        imageUrl: '/assets/golem.png',
        description: 'An unstoppable construct.',
        rarity: 'epic',
    },
    {
        id: 'assassin',
        name: 'Shadow Assassin',
        stats: { top: 7, right: 2, bottom: 2, left: 4 },
        imageUrl: '/assets/assassin.png',
        description: 'Strikes first, asks questions later.',
        rarity: 'epic',
    },
    {
        id: 'rogue',
        name: 'Crimson Rogue',
        stats: { top: 5, right: 2, bottom: 2, left: 5 },
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
    {
        id: 'echo-mage',
        name: 'Echo Mage',
        stats: { top: 3, right: 4, bottom: 3, left: 4 },
        imageUrl: '/assets/echo-mage.png',
        description: 'Repeats the last spell cast on the battlefield.',
        rarity: 'epic',
        ability: {
            id: 'echo',
            name: 'Echo',
            trigger: 'onReveal',
            text: 'On Reveal: Triggers the On Reveal ability of the last played card.'
        }
    },
    {
        id: 'phantom-general',
        name: 'Phantom General',
        stats: { top: 5, right: 4, bottom: 5, left: 4 },
        imageUrl: '/assets/phantom-general.png',
        description: 'Leads an army of afterimages.',
        rarity: 'epic',
        ability: {
            id: 'phantom',
            name: 'Phantom Legion',
            trigger: 'onReveal',
            text: 'On Reveal: Creates a copy of itself in an empty adjacent slot.'
        }
    },
    {
        id: 'arcane-scholar',
        name: 'Arcane Scholar',
        stats: { top: 1, right: 3, bottom: 1, left: 3 },
        imageUrl: '/assets/arcane-scholar.png',
        description: 'Learns from nearby magical effects.',
        rarity: 'epic',
        ability: {
            id: 'arcane-insight',
            name: 'Arcane Insight',
            trigger: 'ongoing',
            text: 'Ongoing: Gains +1 to all stats for each adjacent card with an ability.'
        }
    },

    // LEGENDARY (Sum ~22+ or Unique Spikes)
    {
        id: 'dragon',
        name: 'Red Dragon',
        stats: { top: 8, right: 4, bottom: 5, left: 2 },
        imageUrl: '/assets/dragon.png',
        description: 'A legendary beast of immense power.',
        rarity: 'legendary',
        ability: {
            id: 'dragon-fire',
            name: 'Dragon Fire',
            trigger: 'ongoing',
            text: 'Ongoing: Adjacent allied cards gain +2 top.'
        }
    },
    {
        id: 'lich',
        name: 'Lich King',
        stats: { top: 4, right: 3, bottom: 8, left: 7 },
        imageUrl: '/assets/lich.png',
        description: 'The master of the undead.',
        rarity: 'legendary',
        ability: {
            id: 'lich-debuff',
            name: 'Death Aura',
            trigger: 'ongoing',
            text: 'Ongoing: Adjacent enemy cards lose -2 to all stats.'
        }
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
        stats: { top: 7, right: 5, bottom: 3, left: 3 },
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
    {
        id: 'void-tyrant',
        name: 'Void Tyrant',
        stats: { top: 3, right: 4, bottom: 3, left: 4 },
        imageUrl: '/assets/void-tyrant.png',
        description: 'Saps the strength of all who stand against it.',
        rarity: 'legendary',
        ability: {
            id: 'void-drain',
            name: 'Void Drain',
            trigger: 'onReveal',
            text: 'On Reveal: Steals +1 from all stats of all enemy cards on the board.'
        }
    },
];
