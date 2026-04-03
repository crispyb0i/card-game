# Mythic Triad -- Economy Design

Working reference for the in-game credit economy. All values are tuning targets; adjust based on playtest data.

---

## Starting Credits

Every new player begins with **500 credits** -- enough for one Epic pack or several Common packs to start experimenting immediately.

## Credit Earn Rates

| Source | Credits | Notes |
|---|---|---|
| Win | 30 | Base reward per victory |
| Loss | 5 | Consolation; keeps losing streaks from feeling punishing |
| First-win-of-day bonus | 100 | One-time daily; resets at midnight UTC |

## Shop Packs

Each pack contains **1 card**. Buying a pack is the primary credit sink.

| Pack | Cost | Cards | Guaranteed Minimum Rarity |
|---|---|---|---|
| Common Pack | 100 | 1 | Common |
| Rare Pack | 250 | 1 | Rare |
| Epic Pack | 500 | 1 | Epic |
| Legendary Pack | 1000 | 1 | Legendary |

**Shop refresh cost:** 50 credits (re-rolls the featured pack selection).

> The current Shop.tsx implementation sells a single "Mythic Pack" (100 credits, 3 cards) with weighted rarity rolls. The design above replaces this with per-rarity packs to give players more agency over progression. Migration work is tracked separately.

## Rarity Drop Weights

When a pack does NOT guarantee a minimum rarity (e.g., the Common Pack), these weights determine the pull:

| Rarity | Weight | Probability |
|---|---|---|
| Common | 60 | 60% |
| Rare | 25 | 25% |
| Epic | 12 | 12% |
| Legendary | 3 | 3% |

> Current Shop.tsx weights are 60/30/9/1. The updated weights shift some Rare probability into Epic and Legendary to improve the feel of opening cheaper packs.

## Card Pool Summary

Current roster (from `cards.ts`):

| Rarity | Count | Stat Sum Range | Notes |
|---|---|---|---|
| Common | 7 | 9-11 | No abilities |
| Rare | 10 | 8-16 | Most have abilities |
| Epic | 8 | 8-20 | Strong abilities |
| Legendary | 5 | 14-20 | Powerful abilities, high stat spikes |

## Variant System

| Variant | Availability |
|---|---|
| Base | Free -- default appearance for all cards |
| Pixel | Future premium currency |
| Foil | Future premium currency |
| Glitch | Future premium currency |

Premium currency is out of scope for v1. Variants are cosmetic only and never affect gameplay.

## Session Pacing Analysis

Assumptions:
- Average game length: ~5 minutes
- Win rate vs AI: ~60% (normal difficulty)
- Games per hour: ~10

**Credits per hour (no daily bonus):**
- Wins: 6 games x 30 = 180
- Losses: 4 games x 5 = 20
- **Total: ~200 credits/hour**

**Credits per hour (with first-win bonus, amortized across a 1-hour session):**
- 200 + 100 = **~300 credits/hour**

**Time to earn each pack type:**

| Pack | Cost | Time (approx) |
|---|---|---|
| Common | 100 | 30 min |
| Rare | 250 | 50 min |
| Epic | 500 | 1.7 hours |
| Legendary | 1000 | 3.3 hours |

A player earns roughly one Legendary pack every 3.3 hours of play. This feels appropriate for a roguelike -- rare enough to be exciting, frequent enough to sustain engagement.

## Daily Bonus Structure

| Bonus | Value | Rationale |
|---|---|---|
| First win of the day | 100 credits | Encourages daily return without requiring long sessions. At 100 credits this is equivalent to ~3 wins, making a single daily login meaningful. |

Future considerations:
- Win streak bonuses (e.g., +10 per consecutive win, capped at +50)
- Weekly challenge rewards
- Seasonal reward track

---

*Last updated: 2026-04-03*
