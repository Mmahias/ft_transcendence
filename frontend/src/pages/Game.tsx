import React, { useRef, useState, useEffect } from 'react';
import Canvas from '../components/GameElements/Canvas';
import draw from '../components/GameElements/utils/draw';
import { GameWrapper, Score, StyledButton, WinningMessage } from '../components/GameElements/Game.styles';
import useGameLogic from '../components/GameElements/useGameLogic';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../components/GameElements/constants';
import { Socket } from 'socket.io-client';
import { useSocket } from '../hooks/useSocket';

interface GameProps {}

export enum GameState {
  RUNNING,
  PAUSED,
  GAME_OVER,
  WAITING,
}

const Game: React.FC<GameProps> = () => {
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameWrapperRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.WAITING);
  const socketRef = useRef(useSocket());
  
  const {
    ball,
    networkPlayerPaddle,
    localPlayerPaddle,
    onKeyDownHandler,
    onKeyUpHandler,
    resetGame,
  } = useGameLogic({
    height: Number(CANVAS_HEIGHT()),
    width: Number(CANVAS_WIDTH()),
    onGameOver: () => setGameState(GameState.GAME_OVER),
    gameState,
  });
  
  const drawGame = (ctx: CanvasRenderingContext2D) => {
    draw({ ctx, ball, leftPaddle: networkPlayerPaddle, rightPaddle: localPlayerPaddle });
  };
  
  useEffect(() => {
    if (gameWrapperRef && gameWrapperRef.current) {
      gameWrapperRef.current.focus(); // Sets focus on the div when the component mounts
    }
  }, []);


  // Socket listeners
  useEffect(() => {
    const handleMatchFound = () => {
      setGameState(GameState.RUNNING);
    };
    socketRef.current?.on('foundMatch', handleMatchFound);
    socketRef.current?.on('connect_error', (error) => {
      console.error("Socket connection error:", error);
    });
  
    return () => {
      socketRef.current?.off('foundMatch', handleMatchFound);
      socketRef.current?.off('connect_error');
    };
  }, []);



  const determineWinner = () => {
    if (networkPlayerPaddle.score > localPlayerPaddle.score) return "Player 1";
    if (networkPlayerPaddle.score < localPlayerPaddle.score) return "Player 2";
    return "It's a tie"; // For equal scores
  };

  return (
    <div tabIndex={0} onKeyDown={onKeyDownHandler} onKeyUp={onKeyUpHandler}>
      <GameWrapper ref={gameWrapperRef} tabIndex={0} onKeyDown={onKeyDownHandler} style={{ position: 'relative' }}>
        
        <Score>{`${networkPlayerPaddle.score} - ${localPlayerPaddle.score}`}</Score>
        <Canvas ref={canvasRef} draw={drawGame} ball={ball} leftPaddle={networkPlayerPaddle} rightPaddle={localPlayerPaddle} />
        
        {/* Join Classic Mode Queue */}
        <StyledButton onClick={() => {
            socketRef.current?.emit('joinQueue', { mode: 'classic' });
            console.log("Joining queue");
        }}>
            Join Classic Queue
        </StyledButton>

        {/* Join Special Mode Queue */}
        <StyledButton onClick={() => {
            socketRef.current?.emit('joinQueue', { mode: 'special' });
        }}>
            Join Special Queue
        </StyledButton>

        <StyledButton onClick={() => {
            socketRef.current?.emit('test-event', { mode: 'special' });
        }}>
            test Queue
        </StyledButton>

        {gameState === GameState.GAME_OVER ? (
          <>
            <WinningMessage>{determineWinner()} Won!</WinningMessage>
            <StyledButton
              onClick={() => {
                resetGame();
                setGameState(GameState.RUNNING);
              }}
            >
              Rematch
            </StyledButton>
          </>
        ) : (
          <StyledButton
            onClick={() => {
              setGameState(
                gameState === GameState.RUNNING
                  ? GameState.PAUSED
                  : GameState.RUNNING
              );
            }}
          >
            {gameState === GameState.RUNNING ? 'Pause' : 'Play'}
          </StyledButton>
        )}
      </GameWrapper>
    </div>
  );
};

export default Game;
