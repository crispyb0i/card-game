"use client";

import React from 'react';
import { Card as CardType } from '../../lib/types';
import Image from 'next/image';
import { getModifierBreakdown } from '../../lib/abilities';
import type { MapEffectInstance } from '../../lib/maps';

interface CardProps {
    card: CardType;
    isDraggable?: boolean;
    onDragStart?: (e: React.DragEvent, card: CardType) => void;
    className?: string;
    onClick?: (card: CardType) => void;
    board?: (CardType | null)[];  // For showing modifier breakdown
    boardIndex?: number;  // Index of this card on the board
    envEffect?: MapEffectInstance; // If present, this card is being modified by the environment
}

export const Card: React.FC<CardProps> = ({ card, isDraggable = false, onDragStart, className = '', onClick, board, boardIndex, envEffect }) => {
    const handleDragStart = (e: React.DragEvent) => {
        if (isDraggable && onDragStart) {
            onDragStart(e, card);
            e.dataTransfer.setData('cardId', card.id);

            // Use the whole card as the drag preview instead of just the image
            const node = e.currentTarget as HTMLElement;
            if (e.dataTransfer && node) {
                const rect = node.getBoundingClientRect();
                e.dataTransfer.setDragImage(node, rect.width / 2, rect.height / 2);
            }
        }
    };

    const isPlayer = card.owner === 'player';
    const [isFlipping, setIsFlipping] = React.useState(false);
    const [showAbilityTooltip, setShowAbilityTooltip] = React.useState(false);
    const [showStatsTooltip, setShowStatsTooltip] = React.useState(false);
    const [showEnvTooltip, setShowEnvTooltip] = React.useState(false);
    const prevOwnerRef = React.useRef(card.owner);

    React.useEffect(() => {
        if (prevOwnerRef.current !== card.owner) {
            setIsFlipping(true);
            const timer = setTimeout(() => setIsFlipping(false), 600);
            prevOwnerRef.current = card.owner;
            return () => clearTimeout(timer);
        }
    }, [card.owner]);

    // Get modifier breakdown if board is provided
    const modifierBreakdown = board && boardIndex !== undefined
        ? getModifierBreakdown(board, boardIndex)
        : [];

    // Colors: Blue for Player, Red for Opponent
    const bgColor = isPlayer ? 'bg-blue-600' : 'bg-red-600';
    const textColor = isPlayer ? 'text-blue-50' : 'text-red-50';

    // Rarity Glow
    const getRarityGlow = (rarity: string) => {
        switch (rarity) {
            case 'legendary':
                return 'ring-4 ring-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.8)]';
            case 'epic':
                return 'ring-4 ring-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.6)]';
            case 'rare':
                return 'ring-4 ring-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]';
            case 'common':
                // Soft gray border for common cards (same thickness as others)
                return 'ring-4 ring-slate-300/80 shadow-[0_0_6px_rgba(148,163,184,0.5)]';
            default:
                return 'border border-slate-900';
        }
    };

    const rarityStyle = getRarityGlow(card.rarity);
    const abilityMeta = card.ability
        ? {
            icon: card.ability.trigger === 'onReveal' ? '💥' : '♾️',
            label: card.ability.trigger === 'onReveal' ? 'On Reveal' : 'Ongoing',
        }
        : null;
    const abilityGlow = card.ability
        ? card.ability.trigger === 'ongoing'
            ? 'shadow-[0_0_25px_rgba(34,197,94,0.45)]'
            : 'shadow-[0_0_20px_rgba(251,191,36,0.35)]'
        : '';

    const baseStats = card.baseStats ?? card.stats;
    const statTrendClass = (value: number, base: number) => {
        if (value > base) return 'text-emerald-300';
        if (value < base) return 'text-rose-300';
        return textColor;
    };

    const formatModifier = (value: number | undefined) => {
        if (!value) return '';
        return value > 0 ? `+${value}` : `${value}`;
    };

    return (
        <div
            className={`relative inline-block ${showEnvTooltip || showAbilityTooltip || showStatsTooltip ? 'z-[9999]' : ''
                }`}
        >
            <div
                draggable={isDraggable}
                onDragStart={handleDragStart}
                onClick={onClick ? () => onClick(card) : undefined}
                className={`
        relative w-28 h-36 rounded-lg flex flex-col items-center p-1 select-none
        transition-all duration-500 transform-style-3d
        ${bgColor} ${className} ${rarityStyle} ${abilityGlow}
        ${isDraggable ? 'cursor-grab active:cursor-grabbing hover:scale-110 hover:z-20' : 'cursor-pointer'}
        ${isFlipping ? 'animate-flip' : ''}
      `}
                style={{
                    transform: `rotateY(${isPlayer ? '0deg' : '0deg'})`,
                    backfaceVisibility: 'hidden',
                }}
            >
                {/* Stats Overlay */}
                <div
                    className={`absolute -top-3 -left-3 flex flex-col items-center justify-center font-serif font-black text-[11px] leading-tight bg-black/80 rounded-md px-1.5 py-1 backdrop-blur-sm border border-white/30 shadow-lg z-10 cursor-help`}
                    onMouseEnter={() => setShowStatsTooltip(true)}
                    onMouseLeave={() => setShowStatsTooltip(false)}
                >
                    <div className={statTrendClass(card.stats.top, baseStats.top)}>{card.stats.top}</div>
                    <div className="flex gap-1">
                        <span className={statTrendClass(card.stats.left, baseStats.left)}>{card.stats.left}</span>
                        <span className={statTrendClass(card.stats.right, baseStats.right)}>{card.stats.right}</span>
                    </div>
                    <div className={statTrendClass(card.stats.bottom, baseStats.bottom)}>{card.stats.bottom}</div>
                </div>

                {envEffect && (
                    <div
                        className={`absolute -top-2 -right-11 w-7 h-7 rounded-full bg-black/80 border flex items-center justify-center text-sm shadow-lg z-10 cursor-help ${envEffect.kind === 'debuff'
                            ? 'border-red-400 text-red-300'
                            : 'border-emerald-400 text-emerald-300'
                            }`}
                        onMouseEnter={() => setShowEnvTooltip(true)}
                        onMouseLeave={() => setShowEnvTooltip(false)}
                        aria-label={envEffect.label}
                    >
                        {envEffect.icon}
                    </div>
                )}

                {card.ability && abilityMeta && (
                    <div
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-black/80 border border-white/30 text-amber-200 flex items-center justify-center text-lg shadow-lg z-10 cursor-help"
                        onMouseEnter={() => setShowAbilityTooltip(true)}
                        onMouseLeave={() => setShowAbilityTooltip(false)}
                        aria-label={`${card.ability.name} (${abilityMeta.label})`}
                    >
                        {abilityMeta.icon}
                    </div>
                )}

                {/* Inner Frame for Image */}
                <div className="relative w-full flex-1 min-h-[80%] bg-slate-900 rounded-md overflow-hidden border border-black/20 mb-0.5">
                    <Image
                        src={card.imageUrl}
                        alt={card.name}
                        fill
                        className="object-cover"
                        sizes="128px"
                        draggable={false}
                    />
                </div>

                {/* Name */}
                <div className="w-full mt-auto flex flex-col items-center gap-0.5">
                    <div className={`text-center text-[9px] uppercase tracking-widest font-bold ${textColor} truncate`}>
                        {card.name}
                    </div>
                </div>
            </div>

            {/* Stats Modifier Breakdown Tooltip */}
            {showStatsTooltip && modifierBreakdown.length > 0 && (
                <div className="absolute left-full top-0 ml-2 w-64 bg-slate-900/95 border border-slate-600 rounded-lg p-4 shadow-2xl backdrop-blur z-[9999] pointer-events-none">
                    <div className="text-xs uppercase tracking-wider text-cyan-300 mb-3 font-bold">Stat Modifiers</div>
                    <div className="space-y-2">
                        {modifierBreakdown.map((breakdown, idx) => (
                            <div key={idx} className="text-xs text-slate-200 border-l-2 border-slate-600 pl-2">
                                <div className="font-semibold text-amber-200">{breakdown.sourceName}</div>
                                <div className="text-slate-400 italic text-[10px]">{breakdown.abilityName}</div>
                                <div className="flex gap-2 mt-1 font-mono text-[11px]">
                                    {breakdown.modifier.top && <span className="text-emerald-300">{formatModifier(breakdown.modifier.top)} top</span>}
                                    {breakdown.modifier.right && <span className="text-emerald-300">{formatModifier(breakdown.modifier.right)} right</span>}
                                    {breakdown.modifier.bottom && <span className="text-rose-300">{formatModifier(breakdown.modifier.bottom)} bottom</span>}
                                    {breakdown.modifier.left && <span className="text-rose-300">{formatModifier(breakdown.modifier.left)} left</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Ability Tooltip */}
            {showAbilityTooltip && card.ability && (
                <div className="absolute left-full top-0 ml-2 w-64 bg-slate-900/95 border border-slate-600 rounded-lg p-4 shadow-2xl backdrop-blur z-[9999] pointer-events-none">
                    <div className="text-xs uppercase tracking-wider text-amber-300 mb-2 flex items-center gap-2">
                        <span>{card.ability.trigger === 'onReveal' ? '💥' : '♾️'}</span>
                        <span>{card.ability.trigger === 'onReveal' ? 'On Reveal' : 'Ongoing'}</span>
                    </div>
                    <div className="text-lg font-semibold text-amber-100 mb-2">{card.ability.name}</div>
                    <p className="text-sm text-slate-100 font-sans leading-relaxed">{card.ability.text}</p>
                </div>
            )}

            {/* Environment Tooltip */}
            {showEnvTooltip && envEffect && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900/95 border border-slate-600 rounded-lg p-4 shadow-2xl backdrop-blur z-[9999] pointer-events-none">
                    <div className="text-xs uppercase tracking-wider text-cyan-300 mb-2 flex items-center gap-2">
                        <span>{envEffect.icon}</span>
                        <span>Environment</span>
                    </div>
                    <div className="text-sm font-semibold text-amber-100 mb-1">{envEffect.label}</div>
                    <p className="text-xs text-slate-100 font-sans leading-relaxed">{envEffect.description}</p>
                </div>
            )}
        </div>
    );
};
