"use client";

import React, { useState } from 'react';
import { useGameLogic } from '../../hooks/useGameLogic';
import { Board } from './Board';
import { Card } from './Card';
import { Card as CardType } from '../../lib/types';
import { MainMenu } from './MainMenu';
import { Inventory } from './Inventory';


type ViewState = 'menu' | 'game' | 'inventory';

export const Game: React.FC = () => {
    const { gameState, previewCaptures, handleCardDrop, handleHover, resetGame } = useGameLogic();
    const [draggedCard, setDraggedCard] = useState<CardType | null>(null);
    const [view, setView] = useState<ViewState>('menu');
    const [previewCard, setPreviewCard] = useState<CardType | null>(null);

    const onDragStart = (e: React.DragEvent, card: CardType) => {
        setDraggedCard(card);
    };

    const onDropCard = (index: number) => {
        if (draggedCard) {
            handleCardDrop(draggedCard, index);
            setDraggedCard(null);
        }
    };

    const onHoverSlot = (index: number) => {
        handleHover(draggedCard, index);
    };

    const handleStartGame = () => {
        resetGame();
        setView('game');
    };

    if (view === 'menu') {
        return (
            <MainMenu
                onStartGame={handleStartGame}
                onOpenInventory={() => setView('inventory')}
            />
        );
    }



    if (view === 'inventory') {
        return <Inventory onBack={() => setView('menu')} onSaveDeck={(deck) => {
            // Update game logic with new deck (need to expose a setPlayerDeck method in useGameLogic or just reload)
            // For now, we rely on localStorage and next game start will pick it up, 
            // OR we can pass it to useGameLogic if we refactor it.
            // Let's just save to local storage (handled in Inventory) and maybe force a reset?
            // Actually, useGameLogic initializes from createDeck.
            // We should update useGameLogic to accept an initial deck.
            console.log("Deck saved:", deck);
        }} />;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-amber-50 font-serif selection:bg-amber-900/30 relative bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')]">
            {/* Back Button */}
            <button
                onClick={() => setView('menu')}
                className="absolute top-4 left-4 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-amber-100 rounded-sm transition-colors text-sm font-bold border border-slate-700"
            >
                ← MENU
            </button>

            <h1 className="text-4xl font-bold mb-8 tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 drop-shadow-md">
                MYTHIC TRIAD
            </h1>

            <div className="flex flex-col md:flex-row gap-12 items-center">
                {/* Opponent Hand */}
                <div className="flex flex-col gap-2">
                    <h2 className="text-red-400 font-bold text-center mb-2 uppercase tracking-widest text-xs font-sans">Opponent</h2>
                    <div className="flex flex-col gap-3">
                        {gameState.opponentHand.map((card) => (
                            <Card
                                key={card.id}
                                card={card}
                                onClick={(c) => setPreviewCard(c)}
                            />
                        ))}
                    </div>
                    {/* Opponent Deck Count */}
                    <div className="mt-4 flex items-center justify-center gap-2 opacity-70">
                        <div className="w-8 h-10 bg-slate-800 border border-slate-600 rounded-sm flex items-center justify-center shadow-inner">
                            <span className="text-slate-400 font-bold text-xs">{gameState.opponentDeck.length}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-sans uppercase tracking-wider">Deck</span>
                    </div>
                </div>

                {/* Board Area */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative p-4 bg-slate-900/50 rounded-xl border border-slate-700 shadow-2xl backdrop-blur-sm">
                        <Board
                            board={gameState.board}
                            onDropCard={onDropCard}
                            onHoverSlot={onHoverSlot}
                            previewCaptures={previewCaptures}
                            onCardClick={(card) => setPreviewCard(card)}
                        />

                        {/* Winner Overlay */}
                        {gameState.winner && (
                            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 rounded-xl">
                                <h2 className="text-5xl font-black text-amber-100 mb-4 animate-bounce drop-shadow-lg">
                                    {gameState.winner === 'player' ? 'VICTORY' : gameState.winner === 'opponent' ? 'DEFEAT' : 'DRAW'}
                                </h2>
                                <button
                                    onClick={resetGame}
                                    className="px-8 py-3 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-bold rounded-sm border-2 border-emerald-600 shadow-lg transition-all"
                                >
                                    PLAY AGAIN
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="text-slate-400 text-sm font-sans font-bold tracking-wider">
                        TURN: <span className={gameState.currentPlayer === 'player' ? 'text-amber-400' : 'text-red-400'}>
                            {gameState.currentPlayer === 'player' ? 'YOUR TURN' : 'OPPONENT TURN'}
                        </span>
                    </div>
                </div>

                {/* Player Hand */}
                <div className="flex flex-col gap-2">
                    <h2 className="text-amber-400 font-bold text-center mb-2 uppercase tracking-widest text-xs font-sans">Player</h2>
                    <div className="flex flex-col gap-3">
                        {gameState.playerHand.map((card) => (
                            <Card
                                key={card.id}
                                card={card}
                                isDraggable={gameState.currentPlayer === 'player'}
                                onDragStart={onDragStart}
                                onClick={(c) => setPreviewCard(c)}
                            />
                        ))}
                    </div>
                    {/* Player Deck Count */}
                    <div className="mt-4 flex items-center justify-center gap-2 opacity-70">
                        <div className="w-8 h-10 bg-slate-800 border border-slate-600 rounded-sm flex items-center justify-center shadow-inner">
                            <span className="text-amber-400 font-bold text-xs">{gameState.playerDeck.length}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-sans uppercase tracking-wider">Deck</span>
                    </div>
                </div>
            </div>

            {previewCard && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                    onClick={() => setPreviewCard(null)}
                >
                    <Card card={previewCard} className="scale-[2.5] shadow-2xl" />
                </div>
            )}
        </div>
    );
};
