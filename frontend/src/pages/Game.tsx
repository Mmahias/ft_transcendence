import React, { useRef, useState, useEffect } from 'react';
import Canvas from '../components/GameElements/Canvas';
import draw from '../components/GameElements/utils/draw';
import { GameWrapper, Score, StyledButton, WinningMessage } from '../components/GameElements/Game.styles';
import useGameLogic from '../components/GameElements/useGameLogic';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../components/GameElements/constants';
import { Socket } from 'socket.io-client';
import { useSocket } from '../hooks/useSocket';

interface GameProps {}

export enum GameStatus {
  RUNNING,
  PAUSED,
  GAME_OVER,
  WAITING,
}

const Game: React.FC<GameProps> = () => {
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameWrapperRef = useRef<HTMLDivElement>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.WAITING);
  const socket = useSocket();
  
  const {
    gameState,
    onKeyDownHandler,
    onKeyUpHandler,
    resetGame,
  } = useGameLogic({
    height: Number(CANVAS_HEIGHT()),
    width: Number(CANVAS_WIDTH()),
    onGameOver: () => setGameStatus(GameStatus.GAME_OVER),
    gameStatus,
  });
  
  const drawGame = (ctx: CanvasRenderingContext2D) => {
    draw({ ctx, gameState });
  };
  
  useEffect(() => {
    if (gameWrapperRef && gameWrapperRef.current) {
      gameWrapperRef.current.focus(); // Sets focus on the div when the component mounts
    }
  }, []);


  // Socket listeners
  useEffect(() => {
    const handleMatchFound = () => {
      setGameStatus(GameStatus.RUNNING);
      console.log("Match found")
    };
    socket?.on('foundMatch', handleMatchFound);
    socket?.on('connect_error', (error) => {
      console.error("Socket connection error:", error);
    });
  
    return () => {
      socket?.off('foundMatch', handleMatchFound);
      socket?.off('connect_error');
    };
  }, []);

  const handleJoinQueue = (mode: string) => {
    if (!socket) {
      console.error("Socket is not defined.");
      return;
    }
    socket.emit('joinQueue', { mode });
    console.log(`Joining ${mode} queue`);
  };

    // New function for testing the queue
    const handleTestQueue = () => {
      if (!socket) {
        console.error("Socket is not defined.");
        return;
      }
      socket.emit('test-event', { mode: 'special' });
    };
  
    // New function to toggle the game state between paused and running
    const handleToggleGameStatus = () => {
      setGameStatus(
        gameStatus === GameStatus.RUNNING ? GameStatus.PAUSED : GameStatus.RUNNING
      );
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
        
        <Score>{`${gameState.p1Score} - ${gameState.p1Score}`}</Score>
        <Canvas ref={canvasRef} draw={drawGame} gameState={gameState} />
        
        <StyledButton onClick={() => handleJoinQueue('classic')}>Join Classic Queue</StyledButton>
        <StyledButton onClick={() => handleJoinQueue('special')}>Join Special Queue</StyledButton>
        <StyledButton onClick={handleTestQueue}>Test Queue</StyledButton>
        {gameStatus === GameStatus.GAME_OVER ? (
          <>
            <WinningMessage>{determineWinner()} Won!</WinningMessage>
          </>
        ) : (
          <StyledButton onClick={handleToggleGameStatus}>
            {gameStatus === GameStatus.RUNNING ? 'Pause' : 'Play'}
          </StyledButton>
        )}
      </GameWrapper>
    </div>
  );
};

export default Game;
