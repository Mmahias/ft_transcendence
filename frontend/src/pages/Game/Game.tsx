import React, { useRef, useState } from 'react';
import Canvas from './canvas/Canvas';
import draw from './draw/draw';
import { GameWrapper, Score, StyledButton } from './Game.styles';
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
  const [gameState, setGameState] = useState<GameState>(GameState.RUNNING);

  const onGameOver = () => setGameState(GameState.GAME_OVER);

  const { ball, leftPaddle, rightPaddle, onKeyDownHandler, onKeyUpHandler } =
    useGameLogic({
      canvasHeight: CANVAS_HEIGHT(),
      canvasWidth: CANVAS_WIDTH(),
      onGameOver,
      gameState,
    });

  const drawGame = (ctx: CanvasRenderingContext2D) => {
    draw({ ctx, ball, leftPaddle, rightPaddle });
  };

  return (
    <div tabIndex={0} onKeyDown={onKeyDownHandler} onKeyUp={onKeyUpHandler}>
    <GameWrapper tabIndex={0} onKeyDown={onKeyDownHandler}>
      <Score>{`${leftPaddle.score} - ${rightPaddle.score}`}</Score>
      <Canvas ref={canvasRef} draw={drawGame} ball={ball} leftPaddle={leftPaddle} rightPaddle={rightPaddle} />
      {gameState === GameState.GAME_OVER ? (
      <StyledButton
      onClick={() => {
        setGameState(GameState.RUNNING);
        // Add any other reset game logic if needed
      }}
    >
      Play Again
    </StyledButton>
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
