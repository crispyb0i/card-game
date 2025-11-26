"use client";

import React from 'react';

interface HowToPlayProps {
    onBack: () => void;
}

export const HowToPlay: React.FC<HowToPlayProps> = ({ onBack }) => {
    return (
        <div className="flex flex-col bg-slate-950 text-amber-50 font-serif selection:bg-amber-900/30 relative bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] min-h-screen">
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm sticky top-0 z-10">
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

            <main className="flex-1 flex justify-center px-4 py-8 md:py-10 pb-12">
                <div className="w-full max-w-4xl">
                    {/* Hero Section */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600 mb-3">
                            Mythic Triad
                        </h2>
                        <p className="text-lg text-slate-300 font-sans max-w-2xl mx-auto">
                            A quick tactical card game inspired by classic 3×3 grid battlers. Control more spaces than your opponent when the board is full.
                        </p>
                    </div>

                    {/* Main Content Card */}
                    <div className="bg-slate-900/80 border border-slate-700 rounded-xl shadow-2xl p-6 md:p-8 backdrop-blur-sm">
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg border-l-4 border-amber-500">
                                <div className="text-2xl font-bold text-amber-400 min-w-[2rem]">1</div>
                                <div>
                                    <h3 className="font-semibold text-amber-200 mb-1">Board & Turns</h3>
                                    <p className="text-sm text-slate-300 font-sans leading-relaxed">
                                        The game is played on a 3×3 board. You and the opponent take turns placing cards, one per turn, until all 9 spaces are filled.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg border-l-4 border-blue-500">
                                <div className="text-2xl font-bold text-blue-400 min-w-[2rem]">2</div>
                                <div>
                                    <h3 className="font-semibold text-blue-200 mb-1">Card Numbers</h3>
                                    <p className="text-sm text-slate-300 font-sans leading-relaxed">
                                        Each card has four numbers: <span className="text-amber-300 font-semibold">top</span>, <span className="text-amber-300 font-semibold">right</span>, <span className="text-amber-300 font-semibold">bottom</span>, and <span className="text-amber-300 font-semibold">left</span>.
                                        When you place a card next to an enemy card, its touching number is compared to the enemy&apos;s touching number.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg border-l-4 border-purple-500">
                                <div className="text-2xl font-bold text-purple-400 min-w-[2rem]">3</div>
                                <div>
                                    <h3 className="font-semibold text-purple-200 mb-1">Abilities Resolve First</h3>
                                    <p className="text-sm text-slate-300 font-sans leading-relaxed">
                                        Many cards have special abilities. When you play a card, its ability resolves <span className="font-semibold text-amber-300">before</span> any battling happens.
                                        Buffs, debuffs, movement, or other effects are applied first, and then the updated cards fight for control of adjacent spaces.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg border-l-4 border-red-500">
                                <div className="text-2xl font-bold text-red-400 min-w-[2rem]">4</div>
                                <div>
                                    <h3 className="font-semibold text-red-200 mb-1">Capturing Cards</h3>
                                    <p className="text-sm text-slate-300 font-sans leading-relaxed">
                                        After abilities resolve, your newly placed card can capture adjacent enemy cards. For each neighbor, if your touching number is <span className="font-semibold text-amber-300">strictly higher</span> than theirs, you flip that card and it becomes yours.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg border-l-4 border-emerald-500">
                                <div className="text-2xl font-bold text-emerald-400 min-w-[2rem]">5</div>
                                <div>
                                    <h3 className="font-semibold text-emerald-200 mb-1">Second-Player Bonus Point</h3>
                                    <p className="text-sm text-slate-300 font-sans leading-relaxed">
                                        A coin flip decides who goes first. At the end of the match, the player who went second automatically gets <span className="font-semibold text-amber-300">+1 bonus point</span>.
                                        This represents the extra card left in their hand and helps offset the natural advantage of making the first move.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg border-l-4 border-cyan-500">
                                <div className="text-2xl font-bold text-cyan-400 min-w-[2rem]">6</div>
                                <div>
                                    <h3 className="font-semibold text-cyan-200 mb-1">Winning the Game</h3>
                                    <p className="text-sm text-slate-300 font-sans leading-relaxed">
                                        Once the board is full, the game counts how many spaces each player controls, then adds the second-player bonus. The higher total wins; if both totals are equal, the game ends in a draw.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tip Section */}
                        <div className="mt-8 p-4 bg-amber-900/20 border border-amber-700/50 rounded-lg">
                            <p className="text-sm text-amber-200 font-sans leading-relaxed">
                                <span className="font-bold text-amber-300">💡 Pro Tip:</span> Experiment with ability cards and positioning. Because abilities resolve before combat, a well-timed play can swing multiple captures at once.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
