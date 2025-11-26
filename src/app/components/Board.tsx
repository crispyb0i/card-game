"use client";

import React from 'react';
import { Board as BoardType, Card as CardType, MapId } from '../../lib/types';
import { Card } from './Card';
import { collectAllModifiers } from '../../lib/abilities';
import { getMapTileConfig, getMapEffectForCard } from '../../lib/maps';

interface BoardProps {
    board: BoardType;
    onDropCard: (index: number) => void;
    onHoverSlot: (index: number) => void;
    onDragLeave?: () => void;
    previewCaptures: number[];
    hoveredSlot?: number | null;
    onCardClick?: (card: CardType) => void;
    mapId?: MapId;
}

export const Board: React.FC<BoardProps> = ({ board, onDropCard, onHoverSlot, onDragLeave, previewCaptures, hoveredSlot, onCardClick, mapId }) => {
    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault(); // Allow drop
        onHoverSlot(index);
    };

    const handleDragLeave = () => {
        if (onDragLeave) {
            onDragLeave();
        }
    };

    const handleDrop = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        onDropCard(index);
    };

    // Calculate all modifiers (abilities + map) for all cards
    const modifierMap = collectAllModifiers(board, mapId);

    return (
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-800 rounded-xl border-[6px] border-slate-700 shadow-[0_0_40px_rgba(15,23,42,0.9)]">
            {board.map((card, index) => {
                const isCapturedPreview = previewCaptures.includes(index);
                const isHovered = hoveredSlot === index && !card;

                // Apply modifiers to card stats if they exist
                let displayCard = card;
                if (card && modifierMap[index]) {
                    const modifier = modifierMap[index];
                    displayCard = {
                        ...card,
                        stats: {
                            top: card.stats.top + (modifier.top || 0),
                            right: card.stats.right + (modifier.right || 0),
                            bottom: card.stats.bottom + (modifier.bottom || 0),
                            left: card.stats.left + (modifier.left || 0),
                        }
                    };
                }

                const tileConfig = getMapTileConfig(mapId, index);
                const envEffect = card ? getMapEffectForCard(board, index, mapId) : undefined;

                return (
                    <div
                        key={index}
                        className={`
              relative w-28 h-36 rounded-sm border-2 flex items-center justify-center
              transition-all duration-200
              ${card ? 'border-transparent' : 'border-slate-600 bg-slate-700/30'}
              ${!card && 'hover:bg-slate-600/50'}
              ${tileConfig?.type === 'relic' && !card ? 'bg-amber-900/30 border-amber-500/70' : ''}
              ${tileConfig?.type === 'hazard' && !card ? 'bg-red-900/30 border-red-500/70' : ''}
              ${isCapturedPreview ? 'ring-4 ring-amber-400 ring-opacity-70 z-10' : ''}
              ${isHovered ? 'ring-4 ring-blue-400 ring-opacity-80 bg-blue-500/20 border-blue-400 scale-105 z-10' : ''}
            `}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                    >
                        {tileConfig && (
                            <>
                                {/* Centered visual treatment for special map tiles */}
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
                                    {tileConfig.type === 'hazard' && (
                                        <div className="w-10 h-10 rounded-full bg-red-600/75 shadow-[0_0_25px_rgba(220,38,38,0.9)]" />
                                    )}
                                    {tileConfig.type === 'relic' && (
                                        <div className="relative flex items-center justify-center">
                                            <div className="w-10 h-10 rounded-full bg-amber-500/20 blur-md" />
                                            <div className="w-6 h-6 bg-gradient-to-br from-amber-100 via-amber-300 to-amber-600 rotate-45 rounded-sm shadow-[0_0_20px_rgba(252,211,77,0.95)]" />
                                        </div>
                                    )}
                                </div>

                                {/* Small corner icon for quick readability */}
                                <div className="absolute inset-1 rounded-sm pointer-events-none flex items-start justify-end p-1 z-10">
                                    <span
                                        className={`text-xs opacity-80 ${tileConfig.type === 'relic' ? 'text-amber-200' : 'text-red-300'
                                            }`}
                                    >
                                        {tileConfig.type === 'relic' ? '✧' : '⚠'}
                                    </span>
                                </div>
                            </>
                        )}

                        {displayCard && (
                            <div className={`${isCapturedPreview ? 'animate-pulse' : ''} relative z-10`}>
                                <Card
                                    card={displayCard}
                                    onClick={onCardClick}
                                    board={board}
                                    boardIndex={index}
                                    envEffect={envEffect}
                                />
                                {isCapturedPreview && (
                                    <div className="absolute inset-0 bg-amber-500/20 rounded-sm z-20 pointer-events-none" />
                                )}
                            </div>
                        )}
                        {isHovered && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                <div className="w-24 h-32 border-2 border-dashed border-blue-400 rounded-sm bg-blue-500/10 animate-pulse" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
