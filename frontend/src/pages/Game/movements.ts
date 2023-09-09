import { Ball, Paddle } from './useGameLogic';

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
