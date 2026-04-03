# Mythic Triad — Council Plan

> Generated: 2026-04-03 | Mode: Full (7 agents, 4 phases) | Status: Active

---

## Executive Summary

**Mythic Triad** is a browser-based roguelike card battler combining Triple Triad's 3×3 grid mechanics with 31 unique card abilities, 4 maps, and a deck-building progression system. Built with Next.js 16, React 19, and Firebase (scaffolded but unused), the game has a functional core loop but critical gaps: the credit reward system is commented out, all cards are given for free (negating progression), there are no animations or mobile support, and the game has never been deployed. The immediate priority is to complete the earn/spend progression loop, fix technical foundations (state mutations, stub abilities), deploy with basic analytics, and ship a polished desktop experience before seeding niche communities. Multiplayer should be deferred until single-player retention is validated with real player data.

---

## Top 10 Immediate Actions

- [x] `P0` **Produce economy design doc (credit earn rates, shop prices, daily bonus)** — Owner: PM + Business Analyst — Effort: 4 hours ✅
- [x] `P0` **Eliminate direct state mutations in abilities.ts and gameEngine.ts** — Owner: Backend Engineer + Frontend Engineer — Effort: 2–3 days ✅
- [x] `P0` **Fix/complete or remove 7 stub abilities (pull, anchor, amplify, suppression-field, last-stand, aura, invisible)** — Owner: Research Analyst + Backend Engineer — Effort: 1–2 days ✅
- [x] `P0` **Uncomment and tune credit reward system (30/win, 5/loss, 100 first-win-daily)** — Owner: Frontend Engineer + Business Analyst — Effort: 4 hours ✅
- [x] `P0` **Gate card collection behind shop — stop giving all cards for free** — Owner: Frontend Engineer — Effort: 4 hours ✅
- [x] `P0` **Extract useGameLogic into reducer/state machine with shared GameState + Action types** — Owner: Frontend Engineer — Effort: 3–4 days ✅
- [x] `P0` **Replace Math.random() with seeded PRNG** — Owner: Backend Engineer — Effort: 4 hours ✅
- [x] `P0` **Deploy to Vercel with OG metadata and basic analytics (5 core events)** — Owner: PM + Marketing + Business — Effort: 1 day ✅ (OG + analytics ready; deploy pending)
- [x] `P0` **Add card capture flip animation and ability trigger visual feedback** — Owner: UI/UX Designer — Effort: 3 days ✅
- [ ] `P0` **Validate with 3–5 real players via r/TripleTriad alpha post** — Owner: Research + Marketing — Effort: 2 days (post-deploy)

---

## 30-Day Sprint Plan

### Week 1: Foundation & Deploy
- [x] Day 1: PM writes economy design doc; Backend produces shared `types.ts` (GameState + Action signatures)
- [ ] Day 1–2: PM + Backend + Frontend alignment session on state shape and Firestore compatibility
- [x] Day 1–3: Backend makes game engine functions pure (no side effects); adds seeded PRNG
- [x] Day 1–3: Research completes or removes 7 stub abilities
- [x] Day 2–3: Frontend begins mutation elimination in card/ability code
- [x] Day 3–4: Frontend uncomments credit rewards with tuned rates; gates inventory behind shop purchases
- [x] Day 4: PM deploys to Vercel; Business wires 5 analytics events; Marketing adds OG metadata
- [ ] Day 5: Marketing creates gameplay GIFs and seeds first community post (r/TripleTriad)

### Week 2: State Machine & Animations
- [ ] Frontend extracts useGameLogic into reducer/state machine with transition events
- [x] UI/UX adds capture flip animation (CSS-only, 0.4s rotateY)
- [x] UI/UX adds ability trigger visual feedback (icon flash + stat pulse)
- [ ] Research validates positioning with alpha player feedback
- [ ] Business sets up KPI dashboard (DAU, session length, shop conversion)
- [ ] Frontend adds error boundaries at route and game-board levels

### Week 3: Polish & Persistence
- [ ] Backend designs Firestore data model aligned with reducer state shape
- [ ] Backend implements Firebase anonymous auth
- [ ] Research designs roguelike run structure (5 escalating matches, shop between, boss at end)
- [ ] UI/UX designs inventory filtering/sorting and deck-builder improvements
- [ ] Marketing stands up Discord server (once 20+ players from community posts)

### Week 4: Responsive & Run Structure
- [ ] Frontend + UI/UX begin responsive layout pass (clamp-based card sizing, CSS Grid board)
- [ ] Backend implements Firestore persistence layer (abstract localStorage vs Firestore)
- [ ] Research delivers card balance framework with initial data
- [ ] PM reviews first 2 weeks of analytics data and adjusts priorities

---

## 60-Day Milestones

**Milestone 1: Playable Roguelike Loop (Day 30)**
- Complete roguelike run structure: 5 matches → escalating difficulty → boss → rewards
- Credit economy functional and balanced (validated by analytics)
- Firestore persistence live — player progress survives browser clears
- Anonymous auth with Google sign-in upgrade path
- Desktop experience polished: animations, sound, error recovery

**Milestone 2: Mobile-Ready & Community Growing (Day 60)**
- Responsive layout working on phones and tablets (tap-to-select, tap-to-place)
- Interactive tutorial replacing text wall (5-step guided onboarding)
- Share button generating match result cards with OG images
- Discord community at 50+ members
- Premium currency model designed (cosmetic variants: pixel/foil/glitch)
- D7 retention measured and ≥15%

---

## 90-Day Vision

Mythic Triad is a **polished, deployed, mobile-friendly roguelike card battler** with:
- A complete single-player roguelike run loop with escalating difficulty and meaningful deck-building choices
- Persistent player accounts via Firebase (anonymous → Google sign-in)
- A cosmetic monetization model (variant upgrades) ready for activation
- An active community of 100+ players across Discord and Reddit
- Analytics-driven balance decisions with clear KPI dashboards
- Architecture ready for async multiplayer ("challenge a friend" via shared Firestore game documents)
- "Done" = consistent 20%+ D7 retention, 3+ matches per session average, and validated willingness-to-pay signal from cosmetic variant interest

---

## Critical Risks & Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| 1 | **State mutations cause silent bugs under React Compiler** — Ability handlers mutate objects in place; React 19's compiler assumes immutability | High | High | P0 Week 1: eliminate all mutations before adding features. Backend extracts pure engine; Frontend wraps in immutable reducer. |
| 2 | **Solo developer bottleneck** — All 7 agents' work maps to one person. Week 1 has ~8 days of P0 work. | High | High | Ruthless sequencing: economy doc → mutations → stub abilities → deploy. Defer mobile/animations to Week 2. Accept "good enough" over perfect. |
| 3 | **Launching too early damages first impression** — Reddit communities judge quickly; a buggy launch can't be relaunched | Medium | High | Gate deploy on: stub abilities fixed, credit loop working, basic animations present. Label as "alpha — feedback welcome." Target smallest community first (r/TripleTriad ~2.5K members). |
| 4 | **No retention without progression persistence** — localStorage wipes on browser clear; players lose everything and churn | Medium | High | Firestore persistence in Weeks 3–4. Stopgap: add deck export/import JSON. Communicate "cloud save coming soon" to early players. |
| 5 | **Firebase costs spike with multiplayer** — Real-time listeners generate 50–100 reads per match; at scale this compounds | Low (near-term) | Medium | Start with async multiplayer (fewer reads). Set Firestore budget alerts. Design data model to minimize listener granularity. Evaluate alternatives at 5K DAU. |

---

## Success Metrics

| KPI | Target (30 day) | Target (90 day) |
|-----|-----------------|-----------------|
| **DAU** | 20+ | 100+ |
| **D1 Retention** | 30% | 40% |
| **D7 Retention** | 15% | 20% |
| **Avg matches per session** | 2.0 | 3.0 |
| **Shop conversion rate** (% of sessions with a purchase) | 20% | 35% |
| **Run completion rate** (% of started runs finished) | — | 40% |
| **Credit economy health** (earn/spend ratio per session) | 0.6–0.8 | 0.5–0.7 |
| **Community size** (Discord + Reddit followers) | 30 | 150 |

---

## Open Questions

1. **Is this primarily a single-player roguelike with optional multiplayer, or a multiplayer game with single-player training?** This shapes every architectural and product decision. The council recommends single-player first.

2. **What is the revenue target: hobby sustainability ($0–50/month), indie income ($1K–5K/month), or growth-oriented?** This determines whether to optimize for donations, cosmetic microtransactions, or premium pricing.

3. **Is mobile a hard launch requirement or a fast-follow?** The council recommends desktop-first deploy (Week 1), mobile in Weeks 3–4. But if mobile is essential for the target audience, responsive work must move to Week 1.

4. **What is the minimum polish bar before the first public post?** Options: (a) deploy as-is with "alpha" label, (b) wait for animations + credit loop, (c) wait for full responsive + tutorial. The council recommends option (b).

5. **Should the game name "Mythic Triad" be validated for trademark conflicts before investing in branding?** Generic enough for SEO challenges; a quick trademark search is recommended before building marketing assets around it.
