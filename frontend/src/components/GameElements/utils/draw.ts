import { ballColor, leftPaddleColor, rightPaddleColor } from '../Game.styles';
import { GameState } from '../gameState';
import { BACKEND_HEIGHT, PADDLE_LENGTH, PADDLE_WIDTH, PADDLE_PADDING } from '../constants';

export interface DrawArgs {
  ctx: CanvasRenderingContext2D;
  gameState: GameState;
  canvasDimensions: { width: number; height: number };
}

const draw = ({ ctx, gameState, canvasDimensions }: DrawArgs) => {
  // Clear the canvas for new drawings
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const scaleFactor = canvasDimensions.height / BACKEND_HEIGHT;

  // Draw the ball
  const ballSize = 10 * scaleFactor; // Assuming the ball size is 10 in backend coordinates
  ctx.fillStyle = ballColor;
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

  ctx.fillStyle = leftPaddleColor;
  ctx.fillRect(paddlePad, leftPaddleY, paddleWidth, paddleLength);
  // Draw the right paddle
  ctx.fillStyle = rightPaddleColor;
  ctx.fillRect(ctx.canvas.width - paddleWidth - paddlePad, rightPaddleY, paddleWidth, paddleLength);
};

export default draw;
