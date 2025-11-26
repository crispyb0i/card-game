"use client";

import React, { useState } from 'react';
import { useStore } from '../../store/useStore';

interface VolumeControlProps {
    className?: string;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({ className = '' }) => {
    // Access Store
    const volume = useStore((state) => state.volume);
    const setVolume = useStore((state) => state.setVolume);

    const [isExpanded, setIsExpanded] = useState(false);

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
    };

    const toggleMute = () => {
        const newVolume = volume === 0 ? 0.3 : 0;
        setVolume(newVolume);
    };

    const getVolumeIcon = () => {
        if (volume === 0) return '🔇';
        if (volume < 0.3) return '🔈';
        if (volume < 0.7) return '🔉';
        return '🔊';
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <button
                onClick={toggleMute}
                className="text-2xl hover:scale-110 transition-transform"
                title={volume === 0 ? 'Unmute' : 'Mute'}
            >
                {getVolumeIcon()}
            </button>

            {isExpanded && (
                <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-700 backdrop-blur-sm animate-fade-in-left">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-24 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        title={`Volume: ${Math.round(volume * 100)}%`}
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
