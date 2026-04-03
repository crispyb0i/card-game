/**
 * Analytics event stubs for Mythic Triad.
 *
 * Each function logs to the console in development. Swap the `track` helper
 * with PostHog, Vercel Analytics, or any other provider when ready.
 */

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

interface GameStartEvent {
  difficulty: string;
  map: string;
}

interface GameEndEvent {
  result: 'win' | 'loss' | 'draw';
  duration_seconds: number;
  cards_captured: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ShopVisitEvent {}

interface CardPurchasedEvent {
  rarity: string;
  credits_spent: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface DeckSavedEvent {}

// ---------------------------------------------------------------------------
// Internal helper -- replace this with a real provider later
// ---------------------------------------------------------------------------

function track(event: string, properties: Record<string, unknown> = {}): void {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`[analytics] ${event}`, properties);
  }

  // TODO: wire up PostHog / Vercel Analytics here
  // e.g. posthog.capture(event, properties);
}

// ---------------------------------------------------------------------------
// Public API -- one typed function per core event
// ---------------------------------------------------------------------------

export function trackGameStart(props: GameStartEvent): void {
  track('game_start', props as unknown as Record<string, unknown>);
}

export function trackGameEnd(props: GameEndEvent): void {
  track('game_end', props as unknown as Record<string, unknown>);
}

export function trackShopVisit(_props?: ShopVisitEvent): void {
  track('shop_visit');
}

export function trackCardPurchased(props: CardPurchasedEvent): void {
  track('card_purchased', props as unknown as Record<string, unknown>);
}

export function trackDeckSaved(_props?: DeckSavedEvent): void {
  track('deck_saved');
}
