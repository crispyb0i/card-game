'use client';

import { useState } from 'react';
import { useSound } from '../../hooks/useSound';
import type { Player } from '../../lib/types';

interface CoinFlipProps {
    onResult: (startingPlayer: Player) => void;
    show: boolean;
}

export default function CoinFlip({ onResult, show }: CoinFlipProps) {
    const [flipping, setFlipping] = useState(false);
    const [activeSide, setActiveSide] = useState<Player>('player');
    const { play: playDecider, stop: stopDecider } = useSound('/sounds/decider.mp3', 0.8, { loop: true });

    if (!show) return null;

    const flip = () => {
        if (flipping) return;
        setFlipping(true);

        playDecider();

        const chosen: Player = Math.random() > 0.5 ? 'player' : 'opponent';
        let count = 0;
        const totalFlips = 14 + Math.floor(Math.random() * 6);

        const interval = window.setInterval(() => {
            setActiveSide((prev) => (prev === 'player' ? 'opponent' : 'player'));
            count++;

            if (count >= totalFlips) {
                window.clearInterval(interval);
                setActiveSide(chosen);
                setFlipping(false);
                stopDecider();
                window.setTimeout(() => {
                    onResult(chosen);
                }, 700);
            }
        }, 100);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-slate-900 rounded-xl p-8 shadow-2xl border border-slate-700 min-w-[320px]">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-amber-100 tracking-wide">
                        Decide Who Goes First
                    </h2>
                    <p className="text-xs text-slate-400 mt-2 uppercase tracking-[0.2em]">
                        Arrow shuffles between players then chooses
                    </p>
                </div>

                <div className="flex items-center justify-between mb-6 text-sm font-sans text-slate-200">
                    <span className={activeSide === 'player' ? 'text-amber-300 font-bold' : 'text-slate-500'}>
                        YOU
                    </span>
                    <div className="flex items-center justify-center w-24">
                        <span className="text-4xl transition-all duration-150">
                            {activeSide === 'player' ? '←' : '→'}
                        </span>
                    </div>
                    <span className={activeSide === 'opponent' ? 'text-red-300 font-bold' : 'text-slate-500'}>
                        OPPONENT
                    </span>
                </div>

                <div className="text-center">
                    <button
                        onClick={flip}
                        disabled={flipping}
                        className="px-6 py-2 rounded-sm bg-emerald-700 hover:bg-emerald-600 disabled:bg-emerald-900 text-emerald-50 font-bold tracking-wide text-sm border border-emerald-500 disabled:border-emerald-800 transition-colors"
                    >
                        {flipping ? 'SHUFFLING…' : 'START'}
                    </button>
                </div>
            </div>
        </div>
    );
}
