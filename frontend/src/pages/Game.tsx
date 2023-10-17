import React, { useRef, useState, useEffect } from 'react';
import Canvas from '../components/GameElements/Canvas';
import draw from '../components/GameElements/utils/draw';
import { GameWrapper, Score, StyledButton, WinningMessage } from '../components/GameElements/Game.styles';
import useGameLogic from '../components/GameElements/useGameLogic';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../components/GameElements/constants';
import { useSocket } from '../hooks/useSocket';

interface GameProps {}

const Game: React.FC<GameProps> = () => {
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameWrapperRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();
  
  const {
    gameState,
    onKeyDownHandler,
    onKeyUpHandler,
  } = useGameLogic({
    height: Number(CANVAS_HEIGHT()),
    width: Number(CANVAS_WIDTH()),
  });
  
  useEffect(() => {
    if (gameWrapperRef && gameWrapperRef.current) {
      gameWrapperRef.current.focus(); // Sets focus on the div when the component mounts
    }
  }, []);

  // Socket listeners

  const handleJoinQueue = (mode: string) => {
    if (!socket) {
      console.error("Socket is not defined.");
      return;
    }
    socket.emit('join queue', { mode });
    console.log(`Joining ${mode} queue`);
  };
  
  const determineWinner = () => {
    if (gameState.p1Score > gameState.p2Score)
      return "You won";
    else
      return "You lost"; // For equal scores
  };

  return (
    <div tabIndex={0} onKeyDown={onKeyDownHandler} onKeyUp={onKeyUpHandler}>
      <GameWrapper ref={gameWrapperRef} tabIndex={0} onKeyDown={onKeyDownHandler} style={{ position: 'relative' }}>
        
        <Score>{`${gameState.p1Score} - ${gameState.p2Score}`}</Score>
        <Canvas ref={canvasRef} draw={draw} gameState={gameState} />
        
        <StyledButton onClick={() => handleJoinQueue('classic')}>Join Classic Queue</StyledButton>
        <StyledButton onClick={() => handleJoinQueue('special')}>Join Special Queue</StyledButton>
        {/* <StyledButton onClick={handleTestQueue}>Test Queue</StyledButton> */}
      </GameWrapper>
    </div>
  );
};

export default Game;
