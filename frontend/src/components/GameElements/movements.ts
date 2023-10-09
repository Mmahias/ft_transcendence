import { Ball, Paddle } from './useGameLogic';
import { GameState } from '../../pages/Game';
import { BALL_ACC_X, MAX_BALL_SPEED } from './constants';

export const willBallHitPaddle = (ball: Ball, paddle: Paddle): boolean => {
    const futureBallX = ball.x + ball.vx;
    const futureBallY = ball.y + ball.vy;

    const ballLeftEdge = futureBallX - ball.size;
    const ballRightEdge = futureBallX + ball.size;
    const ballTopEdge = futureBallY - ball.size;
    const ballBottomEdge = futureBallY + ball.size;

    const paddleLeftEdge = paddle.initialX;
    const paddleRightEdge = paddle.initialX + paddle.width;
    const paddleTopEdge = paddle.initialY;
    const paddleBottomEdge = paddle.initialY + paddle.height;

    const overlapsX = (ballLeftEdge < paddleRightEdge) && (ballRightEdge > paddleLeftEdge);
    const overlapsY = (ballTopEdge < paddleBottomEdge) && (ballBottomEdge > paddleTopEdge);

    return overlapsX && overlapsY;
};

export const adjustBallVelocityAfterPaddleHit = (ball: Ball, paddle: Paddle): Ball => {
    const ballCenterY = ball.y + ball.size / 2;
    const paddleCenterY = paddle.initialY + paddle.height / 2;
    const halfHeight = paddle.height / 2;
    const stepSize = halfHeight / 10;
    const degrees = 0.7;

    let factor = 0;

    if (ballCenterY < paddleCenterY) {
        factor = (paddleCenterY - ballCenterY) / stepSize;
        ball.vy = -Math.round(factor * degrees);
    } else if (ballCenterY > paddleCenterY) {
        factor = (ballCenterY - paddleCenterY) / stepSize;
        ball.vy = Math.round(factor * degrees);
    } else {
        ball.vy = -ball.vy;
    }
    
    ball.vx *= (0.96 + factor / 10) * BALL_ACC_X();
    ball.vx = Math.abs(ball.vx) <= MAX_BALL_SPEED() ? Math.abs(ball.vx): MAX_BALL_SPEED();
    ball.vx = paddle.side === 'left' ? Math.abs(ball.vx) : -Math.abs(ball.vx);

    return ball;
};

export const adjustBallVelocityAfterCanvasHit = (ball: Ball, canvasHeight: number): Ball => {
    if (ball.y + ball.size > canvasHeight || ball.y - ball.size < 0) {
        ball.vy = -ball.vy;
    }
    return ball;
};

export const adjustBallVelocityAfterOutOfBounds = (ball: Ball, canvasWidth: number): Ball => {
    if (ball.x + ball.size > canvasWidth || ball.x - ball.size < 0) {
        ball.vx = -ball.vx;
    }
    return ball;
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

export const randomBallSpeed = (min: number, max: number): number => {
    const direction = Math.random() < 0.5 ? -1 : 1;
    return direction * (min + Math.random() * (max - min));
};

export const calculateBounceAngle = (ball: Ball, paddle: Paddle): number => {
    const relativeY = ball.y - (paddle.initialY + paddle.height / 2);
    // Calculate the angle using the arcsine function
    const angle = Math.asin(relativeY / (paddle.height / 2));
    return angle;
};

export const handleResize = (gameState: GameState,
    setBall: React.Dispatch<React.SetStateAction<Ball>>,
    setGameState: React.Dispatch<React.SetStateAction<GameState>>
    ) => {
    if (gameState !== GameState.GAME_OVER) {
        setGameState(GameState.PAUSED);
    }
    setBall(prev => ({ ...prev }));
};