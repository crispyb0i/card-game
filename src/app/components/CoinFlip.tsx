'use client';

import { useState } from 'react';

interface CoinFlipProps {
    onResult: (result: 'heads' | 'tails') => void;
    show: boolean;
}

export default function CoinFlip({ onResult, show }: CoinFlipProps) {
    const [flipping, setFlipping] = useState(false);
    const [result, setResult] = useState<'heads' | 'tails' | null>(null);

    if (!show) return null;

    const flip = () => {
        setFlipping(true);
        const outcome: 'heads' | 'tails' = Math.random() > 0.5 ? 'heads' : 'tails';

        setTimeout(() => {
            setResult(outcome);
            setFlipping(false);
            setTimeout(() => {
                onResult(outcome);
            }, 1000);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 shadow-2xl">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {!flipping && !result && 'Click to Flip!'}
                        {flipping && 'Flipping...'}
                        {result && `Result: ${result === 'heads' ? 'Heads! 🎯' : 'Tails! ❌'}`}
                    </h2>
                </div>

                <div className="flex justify-center mb-6">
                    <div
                        className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl cursor-pointer transition-all duration-500 ${flipping ? 'animate-spin' : ''
                            } ${result === 'heads' ? 'bg-yellow-400' : result === 'tails' ? 'bg-gray-400' : 'bg-gradient-to-br from-yellow-400 to-gray-400'
                            }`}
                        onClick={!flipping && !result ? flip : undefined}
                        style={{
                            transform: flipping ? 'rotateY(1800deg)' : 'rotateY(0deg)',
                            transition: 'transform 1.5s ease-in-out',
                        }}
                    >
                        {!flipping && !result && '🪙'}
                        {result === 'heads' && '🎯'}
                        {result === 'tails' && '❌'}
                    </div>
                </div>

                {result && (
                    <p className="text-center text-gray-600">
                        {result === 'heads' ? 'Success!' : 'Failed!'}
                    </p>
                )}
            </div>
        </div>
    );
}
