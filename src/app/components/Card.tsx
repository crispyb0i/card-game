"use client";

import React from 'react';
import { Card as CardType } from '../../lib/types';
import Image from 'next/image';

interface CardProps {
    card: CardType;
    isDraggable?: boolean;
    onDragStart?: (e: React.DragEvent, card: CardType) => void;
    className?: string;
    onClick?: (card: CardType) => void;
}

export const Card: React.FC<CardProps> = ({ card, isDraggable = false, onDragStart, className = '', onClick }) => {
    const handleDragStart = (e: React.DragEvent) => {
        if (isDraggable && onDragStart) {
            onDragStart(e, card);
            e.dataTransfer.setData('cardId', card.id);
            // Create a drag image if needed, or let browser handle it
        }
    };

    const isPlayer = card.owner === 'player';
    const [isFlipping, setIsFlipping] = React.useState(false);
    const prevOwnerRef = React.useRef(card.owner);

    React.useEffect(() => {
        if (prevOwnerRef.current !== card.owner) {
            setIsFlipping(true);
            const timer = setTimeout(() => setIsFlipping(false), 600); // Match duration
            prevOwnerRef.current = card.owner;
            return () => clearTimeout(timer);
        }
    }, [card.owner]);

    // Colors: Blue for Player, Red for Opponent
    const bgColor = isPlayer ? 'bg-blue-600' : 'bg-red-600';
    const borderColor = isPlayer ? 'border-blue-800' : 'border-red-800';
    const textColor = isPlayer ? 'text-blue-50' : 'text-red-50';

    // Rarity Glow (instead of border color, we use shadow/ring)
    const getRarityGlow = (rarity: string) => {
        switch (rarity) {
            case 'legendary': return 'ring-2 ring-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.8)]';
            case 'epic': return 'ring-2 ring-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.6)]';
            case 'rare': return 'ring-2 ring-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]';
            default: return 'border-slate-900'; // Common
        }
    };

    const rarityStyle = getRarityGlow(card.rarity);
    const statsEmphasis = isPlayer ? 'scale-110 shadow-[0_0_18px_rgba(251,191,36,0.7)]' : '';

    return (
        <div
            draggable={isDraggable}
            onDragStart={handleDragStart}
            onClick={onClick ? () => onClick(card) : undefined}
            className={`
        relative w-28 h-36 rounded-lg flex flex-col items-center p-1 select-none
        transition-all duration-500 transform-style-3d
        ${bgColor} ${className} ${rarityStyle}
        ${isDraggable ? 'cursor-grab active:cursor-grabbing hover:scale-110 hover:z-20' : 'cursor-pointer'}
        ${isFlipping ? 'animate-flip' : ''}
      `}
            style={{
                transform: `rotateY(${isPlayer ? '0deg' : '0deg'})`,
                backfaceVisibility: 'hidden',
            }}
        >
            {/* Inner Frame for Image (takes ~85% height) */}
            <div className="relative w-full flex-1 min-h-[80%] bg-slate-900 rounded-md overflow-hidden border border-black/20 mb-0.5">
                <Image
                    src={card.imageUrl}
                    alt={card.name}
                    fill
                    className="object-cover"
                    sizes="128px"
                />
            </div>

            {/* Stats Overlay - Top Right (User Request) */}
            <div className={`absolute top-1.5 right-1.5 flex flex-col items-center justify-center font-serif font-black ${textColor} text-[11px] leading-tight bg-black/70 rounded-md px-1.5 py-1 backdrop-blur-sm border border-white/30 shadow-lg z-10 ${statsEmphasis}`}>
                <div>{card.stats.top}</div>
                <div className="flex gap-1">
                    <span>{card.stats.left}</span>
                    <span>{card.stats.right}</span>
                </div>
                <div>{card.stats.bottom}</div>
            </div>

            {/* Name at bottom */}
            <div className={`w-full text-center text-[9px] uppercase tracking-widest font-bold ${textColor} truncate mt-auto pt-0.5 pb-0.5`}>
                {card.name}
            </div>
        </div>
    );
};
