"use client";

import React from 'react';
import { MapId, MapDefinition, AIDifficulty } from '../../lib/types';

interface MainMenuProps {
    onStartGame: () => void;
    onOpenInventory: () => void;
    onOpenShop: () => void;
    onOpenHowToPlay: () => void;
    maps?: MapDefinition[];
    selectedMapId?: MapId;
    onSelectMap?: (mapId: MapId) => void;
    difficulty?: AIDifficulty;
    onSelectDifficulty?: (difficulty: AIDifficulty) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onOpenInventory, onOpenShop, onOpenHowToPlay, maps, selectedMapId, onSelectMap, difficulty = 'normal', onSelectDifficulty }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-amber-100 font-serif">
            <h1 className="text-6xl font-black mb-12 tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                MYTHIC TRIAD
            </h1>

            <div className="flex flex-col gap-6 w-64">
                {/* Difficulty selection */}
                {onSelectDifficulty && (
                    <div className="mt-2">
                        <div className="text-xs uppercase tracking-widest text-slate-400 text-center mb-2">
                            AI Difficulty
                        </div>
                        <div className="flex justify-between gap-2 text-xs font-sans">
                            {(['easy', 'normal', 'hard'] as AIDifficulty[]).map((level) => {
                                const isSelected = difficulty === level;
                                const label = level === 'easy' ? 'Easy' : level === 'normal' ? 'Normal' : 'Hard';
                                return (
                                    <button
                                        key={level}
                                        onClick={() => onSelectDifficulty(level)}
                                        className={
                                            'flex-1 px-2 py-1 rounded-full border transition-colors ' +
                                            (isSelected
                                                ? 'bg-amber-600 border-amber-400 text-white'
                                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700')
                                        }
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
                <button
                    onClick={onStartGame}
                    className="w-full py-4 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-bold text-xl rounded-sm border-2 border-emerald-600 shadow-[0_4px_0_#064e3b] active:shadow-none active:translate-y-1 transition-all"
                >
                    PLAY GAME
                </button>

                {maps && maps.length > 0 && selectedMapId && onSelectMap && (
                    <>
                        <div className="mt-4 text-xs uppercase tracking-widest text-slate-400 text-center">
                            Choose Battlefield
                        </div>

                        <div className="space-y-3">
                            {maps.map((map) => {
                                const isSelected = map.id === selectedMapId;
                                return (
                                    <button
                                        key={map.id}
                                        onClick={() => onSelectMap(map.id)}
                                        className={`w-full px-3 py-2 text-left rounded-sm border text-sm transition-colors ${isSelected
                                            ? 'bg-amber-900/40 border-amber-500 text-amber-100'
                                            : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold tracking-wide">{map.name}</span>
                                            {isSelected && <span className="text-amber-300 text-xs">SELECTED</span>}
                                        </div>
                                        <p className="text-xs text-slate-400 leading-snug">{map.description}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}

                <button
                    onClick={onOpenInventory}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-sm border border-slate-600 hover:border-slate-400"
                >
                    INVENTORY
                </button>
                <button
                    onClick={onOpenShop}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-sm border border-slate-600 hover:border-slate-400"
                >
                    SHOP
                </button>
                <button
                    onClick={onOpenHowToPlay}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-sm border border-slate-600 hover:border-slate-400"
                >
                    HOW TO PLAY
                </button>
            </div>

            <div className="mt-16 text-slate-500 text-sm italic">
                v0.2.0 Fantasy Update
            </div>
        </div>
    );
};
