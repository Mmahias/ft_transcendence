import { Ball, Paddle } from './useGameLogic';
import { GameState } from './Game';

export const willBallHitPaddle = (ball: Ball, paddle: Paddle): boolean => {
  if (
    ball.x + ball.vx + ball.size > paddle.initialX &&
    ball.x + ball.vx - ball.size < paddle.initialX + paddle.width &&
    ball.y + ball.vy + ball.size > paddle.initialY &&
    ball.y + ball.vy - ball.size < paddle.initialY + paddle.height
  ) {
    return true;
  }
  return false;
};

export const willBallHitCanvas = (ball: Ball, canvasHeight: number, canvasWidth: number): boolean => {
    return ball.y + ball.vy + ball.size > canvasHeight || ball.y + ball.vy - ball.size < 0;
};

export const willBallGetOutOfBounds = (ball: Ball, canvasHeight: number, canvasWidth: number): boolean => {
    return ball.x + ball.vx + ball.size > canvasWidth || ball.x + ball.vx - ball.size < 0;
};

export const movePaddle = (paddle: Paddle, direction: 'up' | 'down', canvasHeight: number): Paddle => {
  if (direction === 'up' && paddle.initialY - paddle.speed > 0) {
    return { ...paddle, initialY: paddle.initialY - paddle.speed };
  } else if (
    direction === 'down' &&
    paddle.initialY + paddle.height + paddle.speed < canvasHeight
  ) {
    return { ...paddle, initialY: paddle.initialY + paddle.speed };
  }
  return paddle;
};

export const randomBallSpeed = (bound: number): number => {
    const gap = 4;
    return Math.floor(Math.random() * gap + bound - gap);
};

export const calculateBounceAngle = (ball: Ball, paddle: Paddle): number => {
    const relativeY = ball.y - (paddle.initialY + paddle.height / 2);
    // Calculate the angle using the arcsine function
    const angle = Math.asin(relativeY / (paddle.height / 2));
    return angle;
};

export const handleResize = (gameState: GameState, setBall: React.Dispatch<React.SetStateAction<Ball>>) => {
    // Pause the game
    if (gameState !== GameState.GAME_OVER) {
        gameState = GameState.PAUSED;
    }
    
    // Force re-render to update all elements that depend on the window size
    setBall(prev => ({ ...prev }));
};