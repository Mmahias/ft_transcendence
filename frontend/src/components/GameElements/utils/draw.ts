import { useEffect, useState } from 'react';
import { ballColor, leftPaddleColor, rightPaddleColor } from '../Game.styles';
import { GameState } from '../gameState';
import { BACKEND_HEIGHT, PADDLE_LENGTH, PADDLE_WIDTH, PADDLE_PADDING } from '../constants';

export interface DrawArgs {
  ctx: CanvasRenderingContext2D;
  gameState: GameState;
  canvasDimensions: { width: number; height: number };
  mode: 'classic' | 'special';
}

const draw = ({ ctx, gameState, canvasDimensions, mode }: DrawArgs) => {
  // Clear the canvas for new drawings
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const scaleFactor = canvasDimensions.height / BACKEND_HEIGHT;

  // Transparency oscillation for special mode
  let alpha = 1;
  if (mode === 'special') {
    const time = Date.now() * 0.001; // Current time in seconds
    alpha = (Math.sin(time) + 1) / 2; // Map sine values to [0,1] for transparency
  }

  // Draw the ball
  const ballSize = 10 * scaleFactor;
  ctx.fillStyle = `rgba(${ballColor.r},${ballColor.g},${ballColor.b},${alpha})`; // Assuming ballColor is an object with r, g, b
  ctx.beginPath();
  ctx.arc(gameState.ballX * scaleFactor, gameState.ballY * scaleFactor, ballSize / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();

  // Draw the left paddle
  const paddlePad = PADDLE_PADDING * scaleFactor;
  const paddleLength = PADDLE_LENGTH * scaleFactor;
  const leftPaddleY = gameState.p1PosY * scaleFactor;
  const rightPaddleY = gameState.p2PosY * scaleFactor;
  const paddleWidth = PADDLE_WIDTH * scaleFactor;

  ctx.fillStyle = `rgba(${leftPaddleColor.r},${leftPaddleColor.g},${leftPaddleColor.b},${alpha})`; // Assuming leftPaddleColor is an object with r, g, b
  ctx.fillRect(paddlePad, leftPaddleY, paddleWidth, paddleLength);

  // Draw the right paddle
  ctx.fillStyle = `rgba(${rightPaddleColor.r},${rightPaddleColor.g},${rightPaddleColor.b},${alpha})`; // Assuming rightPaddleColor is an object with r, g, b
  ctx.fillRect(ctx.canvas.width - paddleWidth - paddlePad, rightPaddleY, paddleWidth, paddleLength);
};

export default draw;
