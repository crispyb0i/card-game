"use client";

import React, { useState } from 'react';
import { useGameLogic } from '../../hooks/useGameLogic';
import { Board } from './Board';
import { Card } from './Card';
import { Card as CardType, Player, Board as BoardState, AIDifficulty } from '../../lib/types';
import { MainMenu } from './MainMenu';
import { Inventory } from './Inventory';
import { HowToPlay } from './HowToPlay';
import CoinFlip from './CoinFlip';

const computeFinalScores = (board: BoardState, startingPlayer: Player) => {
    let playerCount = 0;
    let opponentCount = 0;

    board.forEach((slot) => {
        if (!slot) return;
        if (slot.owner === 'player') playerCount++;
        if (slot.owner === 'opponent') opponentCount++;
    });

    const secondPlayer: Player = startingPlayer === 'player' ? 'opponent' : 'player';
    const playerBonus = secondPlayer === 'player' ? 1 : 0;
    const opponentBonus = secondPlayer === 'opponent' ? 1 : 0;

    return {
        playerBoard: playerCount,
        opponentBoard: opponentCount,
        playerScore: playerCount + playerBonus,
        opponentScore: opponentCount + opponentBonus,
        secondPlayer,
    };
};
type ViewState = 'menu' | 'game' | 'inventory' | 'howToPlay';

export const Game: React.FC = () => {
    const [difficulty, setDifficulty] = useState<AIDifficulty>('normal');
    const { gameState, previewCaptures, handleCardDrop, handleHover, resetGame, setStartingPlayer } = useGameLogic(difficulty);
    const [draggedCard, setDraggedCard] = useState<CardType | null>(null);
    const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
    const [view, setView] = useState<ViewState>('menu');
    const [previewCard, setPreviewCard] = useState<CardType | null>(null);
    const [showStarterPicker, setShowStarterPicker] = useState(false);

    const liveScores = computeFinalScores(gameState.board, gameState.startingPlayer);

    const onDragStart = (e: React.DragEvent, card: CardType) => {
        setDraggedCard(card);
    };

    const onDropCard = (index: number) => {
        if (draggedCard) {
            handleCardDrop(draggedCard, index);
            setDraggedCard(null);
            setHoveredSlot(null);
        }
    };

    const onHoverSlot = (index: number) => {
        setHoveredSlot(index);
        handleHover(draggedCard, index);
    };

    const onDragLeave = () => {
        setHoveredSlot(null);
    };

    const handleStartGame = () => {
        resetGame();
        setView('game');
        setShowStarterPicker(true);
    };

    const handleStartingPlayerChosen = (startingPlayer: Player) => {
        setStartingPlayer(startingPlayer);
        setShowStarterPicker(false);
    };

    if (view === 'menu') {
        return (
            <MainMenu
                onStartGame={handleStartGame}
                onOpenInventory={() => setView('inventory')}
                onOpenHowToPlay={() => setView('howToPlay')}
                difficulty={difficulty}
                onSelectDifficulty={setDifficulty}
            />
        );
    }

    if (view === 'howToPlay') {
        return <HowToPlay onBack={() => setView('menu')} />;
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
                {/* Player Hand (left side) */}
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
                </div>

                {/* Board Area */}
                <div className="flex flex-col items-center gap-4">
                    {/* Live score (includes second-player bonus) */}
                    <div className="text-lg md:text-xl text-slate-100 font-sans font-bold mb-2 tracking-wide">
                        Score:{' '}
                        <span className="text-amber-300 font-extrabold">You {liveScores.playerScore}</span>
                        <span className="mx-2 text-slate-500">vs</span>
                        <span className="text-red-300 font-extrabold">{liveScores.opponentScore} Opponent</span>
                    </div>

                    {/* Deck Counts */}
                    <div className="flex items-center justify-center gap-8 mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-16 bg-blue-900/40 border-2 border-blue-500 rounded-sm flex items-center justify-center shadow-inner">
                                <span className="text-blue-300 font-bold text-lg">{gameState.playerDeck.length}</span>
                            </div>
                            <span className="text-sm text-slate-400 font-sans uppercase tracking-wider font-semibold">Deck</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-16 bg-red-900/40 border-2 border-red-500 rounded-sm flex items-center justify-center shadow-inner">
                                <span className="text-red-300 font-bold text-lg">{gameState.opponentDeck.length}</span>
                            </div>
                            <span className="text-sm text-slate-400 font-sans uppercase tracking-wider font-semibold">Deck</span>
                        </div>
                    </div>

                    <div className="relative p-4 bg-slate-900/50 rounded-xl border border-slate-700 shadow-2xl backdrop-blur-sm">
                        <Board
                            board={gameState.board}
                            onDropCard={onDropCard}
                            onHoverSlot={onHoverSlot}
                            onDragLeave={onDragLeave}
                            previewCaptures={previewCaptures}
                            hoveredSlot={hoveredSlot}
                            onCardClick={(card) => setPreviewCard(card)}
                        />

                        {/* Winner Overlay */}
                        {gameState.winner && (
                            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 rounded-xl">
                                <h2 className="text-5xl font-black text-amber-100 mb-2 animate-bounce drop-shadow-lg">
                                    {gameState.winner === 'player' ? 'VICTORY' : gameState.winner === 'opponent' ? 'DEFEAT' : 'DRAW'}
                                </h2>
                                {(() => {
                                    const { playerScore, opponentScore } = computeFinalScores(
                                        gameState.board,
                                        gameState.startingPlayer,
                                    );
                                    return (
                                        <div className="mb-4 text-sm text-slate-200 font-sans text-center">
                                            <div>
                                                Final score: <span className="text-amber-300 font-semibold">You {playerScore}</span>{' '}
                                                <span className="text-slate-400">vs</span>{' '}
                                                <span className="text-red-300 font-semibold">{opponentScore} Opponent</span>
                                            </div>
                                        </div>
                                    );
                                })()}
                                <button
                                    onClick={() => {
                                        resetGame();
                                        setShowStarterPicker(true);
                                    }}
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

                {/* Opponent Hand (right side) */}
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
                </div>
            </div>

            {previewCard && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                    onClick={() => setPreviewCard(null)}
                >
                    <Card card={previewCard} className="scale-[3.5] shadow-2xl" />
                </div>
            )}

            <CoinFlip onResult={handleStartingPlayerChosen} show={showStarterPicker} />
        </div>
    );
};
