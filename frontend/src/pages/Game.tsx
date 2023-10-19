import React, { useRef, useState, useEffect } from 'react';
import Canvas from '../components/GameElements/Canvas';
import draw from '../components/GameElements/utils/draw';
import { GameWrapper, Score, StyledButton, WinningMessage } from '../components/GameElements/Game.styles';
import useGameLogic from '../components/GameElements/useGameLogic';
import { useSocket } from '../hooks/useSocket';
import toast from 'react-hot-toast';

interface GameProps {}

const Game: React.FC<GameProps> = () => {
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameWrapperRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();
  
  const {
    gameState,
  } = useGameLogic();
  
  useEffect(() => {
    if (gameWrapperRef && gameWrapperRef.current) {
      gameWrapperRef.current.focus(); // Sets focus on the div when the component mounts
    }
  }, []);

  // Socket listeners

  const handleJoinQueue = (mode: string) => {
    if (!socket) {
      toast.error("Failed to join queue...", {
        id: "matchmaking",
        icon: "❌",
        duration: 3000,
      });
      return;
    }
    socket.emit('join queue', { mode });
    toast.success("Waiting for an opponent...", {
      id: "matchmaking",
      icon: "🎮⌛",
      duration: 3000,
    });
  };

  return (
    <div tabIndex={0}>
      <GameWrapper ref={gameWrapperRef} tabIndex={0} style={{ position: 'relative' }}>
        <Score>{`${gameState.p1Score} - ${gameState.p2Score}`}</Score>
        <Canvas ref={canvasRef} draw={draw} gameState={gameState} />
        
        <StyledButton onClick={() => handleJoinQueue('classic')}>Join Classic Queue</StyledButton>
        <StyledButton onClick={() => handleJoinQueue('special')}>Join Special Queue</StyledButton>
      </GameWrapper>
    </div>
  );
};

export default Game;
