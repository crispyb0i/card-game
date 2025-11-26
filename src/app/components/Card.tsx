"use client";

import React from 'react';
import { createPortal } from 'react-dom';
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
            setIsDragging(true);
            onDragStart(e, card);
            e.dataTransfer.setData('cardId', card.id);

            // Create a custom drag image to avoid border clipping
            const node = e.currentTarget as HTMLElement;
            if (e.dataTransfer && node) {
                // Clone the node to use as drag image
                const clone = node.cloneNode(true) as HTMLElement;
                clone.style.position = 'absolute';
                clone.style.top = '-9999px';
                clone.style.left = '-9999px';
                clone.style.opacity = '0.95';
                clone.style.transform = 'rotate(3deg)';
                clone.style.pointerEvents = 'none';
                // Ensure borders are included
                clone.style.boxSizing = 'border-box';
                document.body.appendChild(clone);
                
                // Force a reflow to ensure the clone is rendered
                clone.offsetHeight;
                
                const rect = node.getBoundingClientRect();
                // Use the center of the card, accounting for borders
                e.dataTransfer.setDragImage(clone, rect.width / 2, rect.height / 2);
                
                // Clean up after drag starts
                requestAnimationFrame(() => {
                    if (document.body.contains(clone)) {
                        document.body.removeChild(clone);
                    }
                });
            }
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const isPlayer = card.owner === 'player';
    const [isFlipping, setIsFlipping] = React.useState(false);
    const [isDragging, setIsDragging] = React.useState(false);
    const [showAbilityTooltip, setShowAbilityTooltip] = React.useState(false);
    const [showStatsTooltip, setShowStatsTooltip] = React.useState(false);
    const [showEnvTooltip, setShowEnvTooltip] = React.useState(false);
    const [tooltipPosition, setTooltipPosition] = React.useState<{ top: number; left: number } | null>(null);
    const cardRef = React.useRef<HTMLDivElement>(null);
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
                return 'legendary-card ring-4 ring-yellow-400';
            case 'epic':
                return 'epic-card ring-4 ring-purple-400';
            case 'rare':
                return 'ring-4 ring-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6),0_0_24px_rgba(34,211,238,0.3)]';
            case 'common':
                // Soft gray border for common cards (same thickness as others)
                return 'ring-4 ring-slate-300/80 shadow-[0_0_8px_rgba(148,163,184,0.4)]';
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

    // Update tooltip position when showing tooltips
    React.useEffect(() => {
        if ((showAbilityTooltip || showStatsTooltip || showEnvTooltip) && cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            setTooltipPosition({
                top: rect.top + window.scrollY,
                left: rect.right + window.scrollX + 8, // 8px margin (ml-2)
            });
        } else {
            setTooltipPosition(null);
        }
    }, [showAbilityTooltip, showStatsTooltip, showEnvTooltip]);

    const renderTooltip = (content: React.ReactNode, isBottom = false) => {
        if (!tooltipPosition || typeof window === 'undefined') return null;
        
        const style: React.CSSProperties = {
            position: 'fixed',
            top: isBottom ? 'auto' : `${tooltipPosition.top}px`,
            bottom: isBottom ? `${window.innerHeight - tooltipPosition.top}px` : 'auto',
            left: `${tooltipPosition.left}px`,
            zIndex: 999999,
        };

        return createPortal(
            <div 
                className="w-64 bg-slate-900/95 border border-slate-600 rounded-lg p-4 shadow-2xl backdrop-blur pointer-events-none"
                style={style}
            >
                {content}
            </div>,
            document.body
        );
    };

    return (
        <div
            ref={cardRef}
            className={`relative inline-block ${showEnvTooltip || showAbilityTooltip || showStatsTooltip ? 'z-[99999]' : ''
                }`}
        >
            <div
                draggable={isDraggable}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onClick={onClick ? () => onClick(card) : undefined}
                className={`
        relative w-28 h-36 rounded-lg flex flex-col items-center p-1 select-none
        transition-all duration-500 transform-style-3d
        ${bgColor} ${className} ${rarityStyle} ${abilityGlow}
        ${isDraggable ? 'cursor-grab active:cursor-grabbing hover:scale-110 hover:z-20' : 'cursor-pointer'}
        ${isFlipping ? 'animate-flip' : ''}
        ${isDragging ? 'opacity-30' : ''}
      `}
                style={{
                    transform: `rotateY(${isPlayer ? '0deg' : '0deg'})`,
                    backfaceVisibility: 'hidden',
                }}
            >
                {/* Stats Overlay */}
                <div
                    className={`absolute -top-3 -left-3 flex flex-col items-center justify-center font-serif font-black text-[11px] leading-tight bg-black/80 rounded-md px-1.5 py-1 backdrop-blur-sm border border-white/30 shadow-lg z-20 cursor-help`}
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
                        className={`absolute -top-2 -right-11 w-7 h-7 rounded-full bg-black/80 border flex items-center justify-center text-sm shadow-lg z-20 cursor-help ${envEffect.kind === 'debuff'
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
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-black/80 border border-white/30 text-amber-200 flex items-center justify-center text-lg shadow-lg z-20 cursor-help"
                        onMouseEnter={() => setShowAbilityTooltip(true)}
                        onMouseLeave={() => setShowAbilityTooltip(false)}
                        aria-label={`${card.ability.name} (${abilityMeta.label})`}
                    >
                        {abilityMeta.icon}
                    </div>
                )}

                {/* Inner Frame for Image */}
                <div className="relative w-full flex-1 min-h-[80%] bg-slate-900 rounded-md overflow-hidden border border-black/20 mb-0.5 z-0">
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
                <div className="relative w-full mt-auto flex flex-col items-center gap-0.5 z-10">
                    <div className={`text-center text-[9px] uppercase tracking-widest font-bold ${textColor} truncate`}>
                        {card.name}
                    </div>
                </div>
            </div>

            {/* Stats Modifier Breakdown Tooltip */}
            {showStatsTooltip && modifierBreakdown.length > 0 && renderTooltip(
                <>
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
                </>
            )}

            {/* Ability Tooltip */}
            {showAbilityTooltip && card.ability && renderTooltip(
                <>
                    <div className="text-xs uppercase tracking-wider text-amber-300 mb-2 flex items-center gap-2">
                        <span>{card.ability.trigger === 'onReveal' ? '💥' : '♾️'}</span>
                        <span>{card.ability.trigger === 'onReveal' ? 'On Reveal' : 'Ongoing'}</span>
                    </div>
                    <div className="text-lg font-semibold text-amber-100 mb-2">{card.ability.name}</div>
                    <p className="text-sm text-slate-100 font-sans leading-relaxed">{card.ability.text}</p>
                </>
            )}

            {/* Environment Tooltip */}
            {showEnvTooltip && envEffect && (() => {
                if (!tooltipPosition || typeof window === 'undefined') return null;
                const rect = cardRef.current?.getBoundingClientRect();
                if (!rect) return null;
                
                const style: React.CSSProperties = {
                    position: 'fixed',
                    bottom: `${window.innerHeight - rect.top}px`,
                    left: `${rect.left + rect.width / 2}px`,
                    transform: 'translateX(-50%)',
                    marginBottom: '8px',
                    zIndex: 999999,
                };

                return createPortal(
                    <div 
                        className="w-64 bg-slate-900/95 border border-slate-600 rounded-lg p-4 shadow-2xl backdrop-blur pointer-events-none"
                        style={style}
                    >
                        <div className="text-xs uppercase tracking-wider text-cyan-300 mb-2 flex items-center gap-2">
                            <span>{envEffect.icon}</span>
                            <span>Environment</span>
                        </div>
                        <div className="text-sm font-semibold text-amber-100 mb-1">{envEffect.label}</div>
                        <p className="text-xs text-slate-100 font-sans leading-relaxed">{envEffect.description}</p>
                    </div>,
                    document.body
                );
            })()}
        </div>
    );
};
