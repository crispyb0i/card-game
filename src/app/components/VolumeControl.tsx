"use client";

import React, { useState, useEffect } from 'react';

export const VolumeControl: React.FC = () => {
    const [volume, setVolumeState] = useState(0.3);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('volume');
            if (saved) setVolumeState(parseFloat(saved));
        }
    }, []);

    const setVolume = (v: number) => {
        setVolumeState(v);
        localStorage.setItem('volume', v.toString());
    };

    const toggleMute = () => setVolume(volume === 0 ? 0.3 : 0);

    const icon = volume === 0 ? '🔇' : volume < 0.3 ? '🔈' : volume < 0.7 ? '🔉' : '🔊';

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={toggleMute}
                className="text-2xl hover:scale-110 transition-transform"
                title={volume === 0 ? 'Unmute' : 'Mute'}
            >
                {icon}
            </button>
            {isExpanded && (
                <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-700 backdrop-blur-sm">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-24 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <span className="text-xs text-slate-400 font-mono min-w-[3ch] text-right">
                        {Math.round(volume * 100)}
                    </span>
                </div>
            )}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-slate-400 hover:text-amber-300 transition-colors"
            >
                {isExpanded ? '◀' : '▶'}
            </button>
        </div>
    );
};
