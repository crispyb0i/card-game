"use client";

import React from 'react';

interface HowToPlayProps {
    onBack: () => void;
}

export const HowToPlay: React.FC<HowToPlayProps> = ({ onBack }) => {
    return (
        <div className="flex flex-col min-h-screen bg-slate-950 text-amber-50 font-serif selection:bg-amber-900/30 relative bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')]">
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90">
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-100 rounded-sm transition-colors text-sm font-bold border border-slate-700"
                >
                    ← BACK
                </button>
                <h1 className="text-2xl md:text-3xl font-black tracking-[0.35em] text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-500 drop-shadow-md uppercase">
                    How To Play
                </h1>
                <div className="w-20" />
            </header>

            <main className="flex-1 flex justify-center px-4 py-8 md:py-12">
                <div className="w-full max-w-3xl bg-slate-900/80 border border-slate-700 rounded-xl shadow-2xl p-6 md:p-8 backdrop-blur-sm">
                    <p className="text-sm text-slate-300 mb-6 font-sans">
                        Mythic Triad is a quick tactical card game inspired by classic 3×3 grid battlers. The goal is simple:
                        when the board is full, control more spaces than your opponent.
                    </p>

                    <ol className="list-decimal list-inside space-y-4 text-sm text-slate-200 font-sans leading-relaxed">
                        <li>
                            <span className="font-semibold">Board & turns.</span> The game is played on a 3×3 board. You and the opponent
                            take turns placing cards, one per turn, until all 9 spaces are filled.
                        </li>
                        <li>
                            <span className="font-semibold">Card numbers.</span> Each card has four numbers: top, right, bottom, and left.
                            When you place a card next to an enemy card, its touching number is compared to the enemy's touching
                            number.
                        </li>
                        <li>
                            <span className="font-semibold">Abilities resolve first.</span> Many cards have special abilities. When you
                            play a card, its ability resolves <span className="font-semibold">before</span> any battling happens.
                            Buffs, debuffs, movement, or other effects are applied first, and then the updated cards fight for
                            control of adjacent spaces.
                        </li>
                        <li>
                            <span className="font-semibold">Capturing cards.</span> After abilities resolve, your newly placed card can
                            capture adjacent enemy cards. For each neighbor, if your touching number is strictly higher than
                            theirs, you flip that card and it becomes yours.
                        </li>
                        <li>
                            <span className="font-semibold">Second-player bonus point.</span> A coin flip decides who goes first. At the
                            end of the match, the player who went second automatically gets <span className="font-semibold">+1 bonus point</span>.
                            This represents the extra card left in their hand and helps offset the natural advantage of making
                            the first move, so close games feel fair and can still swing either way.
                        </li>
                        <li>
                            <span className="font-semibold">Winning the game.</span> Once the board is full, the game counts how many
                            spaces each player controls, then adds the second-player bonus. The higher total wins; if both totals
                            are equal, the game ends in a draw.
                        </li>
                    </ol>

                    <p className="mt-6 text-xs text-slate-400 font-sans">
                        Tip: experiment with ability cards and positioning. Because abilities resolve before combat, a well-timed
                        play can swing multiple captures at once.
                    </p>
                </div>
            </main>
        </div>
    );
};
