import React, { useRef, useState, useEffect } from 'react';
import Canvas from './canvas/Canvas';
import draw from './draw/draw';
import { GameWrapper, Score, StyledButton, WinningMessage } from './Game.styles';
import useGameLogic from './useGameLogic';
import {
    CANVAS_WIDTH, CANVAS_HEIGHT
} from './Game.constants';

interface GameProps {}

export enum GameState {
  RUNNING,
  PAUSED,
  GAME_OVER,
}

const Game: React.FC<GameProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameWrapperRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.RUNNING);

  const onGameOver = () => setGameState(GameState.GAME_OVER);

  const {
    ball,
    leftPaddle,
    rightPaddle,
    onKeyDownHandler,
    onKeyUpHandler,
    resetGame,
} = useGameLogic({
    canvasHeight: CANVAS_HEIGHT(),
    canvasWidth: CANVAS_WIDTH(),
    onGameOver,
    gameState,
});

  const drawGame = (ctx: CanvasRenderingContext2D) => {
    draw({ ctx, ball, leftPaddle, rightPaddle });
  };

  useEffect(() => {
    if (gameWrapperRef && gameWrapperRef.current) {
      gameWrapperRef.current.focus(); // Sets focus on the div when the component mounts
    }
  }, []);

  const determineWinner = () => {
    if (leftPaddle.score > rightPaddle.score) return "Player 1";
    if (leftPaddle.score < rightPaddle.score) return "Player 2";
    return "It's a tie"; // For equal scores
  };

  return (
    <div tabIndex={0} onKeyDown={onKeyDownHandler} onKeyUp={onKeyUpHandler}>
      <GameWrapper ref={gameWrapperRef} tabIndex={0} onKeyDown={onKeyDownHandler} style={{ position: 'relative' }}>
        <Score>{`${leftPaddle.score} - ${rightPaddle.score}`}</Score>
        <Canvas ref={canvasRef} draw={drawGame} ball={ball} leftPaddle={leftPaddle} rightPaddle={rightPaddle} />
        
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
