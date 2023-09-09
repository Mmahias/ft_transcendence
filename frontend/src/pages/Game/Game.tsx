import React, { useRef, useState } from 'react';
import Canvas from './canvas/Canvas';
import draw from './draw/draw';
import { GameWrapper, Score } from './Game.styles';
import useGameLogic from './useGameLogic';
import {
    CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, 
    PADDLE_SPEED, BALL_SIZE, BORDER_PADDING, BORDER_PADDING_SIDE, 
    BORDER_THICKNESS, BALL_SPEED_X, BALL_SPEED_Y, TICKS_PER_SEC
} from './Game.constants';

interface GameProps {}

export enum GameState {
  RUNNING,
  PAUSED,
  GAME_OVER,
}

const Game: React.FC<GameProps> = ({}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.RUNNING);

  const onGameOver = () => setGameState(GameState.GAME_OVER);

  const { ball, leftPaddle, rightPaddle, onKeyDownHandler } =
    useGameLogic({
      canvasHeight: CANVAS_HEIGHT,
      canvasWidth: CANVAS_WIDTH,
      onGameOver,
      gameState,
    });

  const drawGame = (ctx: CanvasRenderingContext2D) => {
    draw({ ctx, ball, leftPaddle, rightPaddle });
  };

  return (
    <GameWrapper tabIndex={0} onKeyDown={onKeyDownHandler}>
      <Canvas ref={canvasRef} draw={drawGame} ball={ball} leftPaddle={leftPaddle} rightPaddle={rightPaddle} />
      {gameState === GameState.GAME_OVER ? (
        <button
          onClick={() => {
            setGameState(GameState.RUNNING);
            // Add any other reset game logic if needed
          }}
        >
          Play Again
        </button>
      ) : (
        <button
          onClick={() => {
            setGameState(
              gameState === GameState.RUNNING
                ? GameState.PAUSED
                : GameState.RUNNING
            );
          }}
        >
          {gameState === GameState.RUNNING ? 'Pause' : 'Play'}
        </button>
      )}
      <Score>{`${leftPaddle.score} - ${rightPaddle.score}`}</Score>
    </GameWrapper>
  );
};

export default Game;
