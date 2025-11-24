"use client";

import React from 'react';
import { Board as BoardType, Card as CardType, BOARD_SIZE } from '../../lib/types';
import { Card } from './Card';

interface BoardProps {
    board: BoardType;
    onDropCard: (index: number) => void;
    onHoverSlot: (index: number) => void;
    previewCaptures: number[];
    onCardClick?: (card: CardType) => void;
}

export const Board: React.FC<BoardProps> = ({ board, onDropCard, onHoverSlot, previewCaptures, onCardClick }) => {
    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault(); // Allow drop
        onHoverSlot(index);
    };

    const handleDragLeave = (index: number) => {
        // Optional: clear hover state if needed, but usually handled by next hover or drop
        // onHoverSlot(-1); // Assuming -1 clears it
    };

    const handleDrop = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        onDropCard(index);
    };

    return (
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-800 rounded-xl border-[6px] border-slate-700 shadow-[0_0_40px_rgba(15,23,42,0.9)]">
            {board.map((card, index) => {
                const isCapturedPreview = previewCaptures.includes(index);

                return (
                    <div
                        key={index}
                        className={`
              w-32 h-40 rounded-sm border-2 flex items-center justify-center
              transition-colors duration-200
              ${card ? 'border-transparent' : 'border-slate-600 bg-slate-700/30'}
              ${!card && 'hover:bg-slate-600/50'}
              ${isCapturedPreview ? 'ring-4 ring-amber-400 ring-opacity-70 z-10' : ''}
            `}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                    >
                        {card && (
                            <div className={isCapturedPreview ? 'animate-pulse' : ''}>
                                <Card card={card} onClick={onCardClick} />
                                {isCapturedPreview && (
                                    <div className="absolute inset-0 bg-amber-500/20 rounded-sm z-10 pointer-events-none" />
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
