import { ballColor, leftPaddleColor, rightPaddleColor, canvasBackgroundColor } from '../Game.styles';
import { GameState } from '../gameState';
import { BACKEND_HEIGHT, PADDLE_LENGTH, PADDLE_WIDTH, PADDLE_PADDING } from '../constants';

export interface DrawArgs {
  ctx: CanvasRenderingContext2D;
  gameState: GameState;
  canvasDimensions: { width: number; height: number };
  mode: 'classic' | 'special';
  colorShiftFactor: number;
}

const draw = ({ ctx, gameState, canvasDimensions, mode, colorShiftFactor }: DrawArgs) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const scaleFactor = canvasDimensions.height / BACKEND_HEIGHT;

  const time = Date.now() * 0.001;
  const alpha = mode === 'special' ? (Math.sin(time) + 1) / 2 : 1;

  const computeColor = (color: { r: number, g: number, b: number }) => {
    const shiftColor = (component: number) => 10 + component * colorShiftFactor % 255; // Ensure we don't exceed 255

    return `rgba(${shiftColor(color.r)},${shiftColor(color.g)},${shiftColor(color.b)},${alpha})`;
}


  ctx.fillStyle = computeColor(canvasBackgroundColor);
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const ballSize = 10 * scaleFactor;
  ctx.fillStyle = computeColor(ballColor);
  ctx.beginPath();
  ctx.arc(gameState.ballX * scaleFactor, gameState.ballY * scaleFactor, ballSize / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();

  const paddlePad = PADDLE_PADDING * scaleFactor;
  const paddleLength = PADDLE_LENGTH * scaleFactor;
  const leftPaddleY = gameState.p1PosY * scaleFactor;
  const rightPaddleY = gameState.p2PosY * scaleFactor;
  const paddleWidth = PADDLE_WIDTH * scaleFactor;

  ctx.fillStyle = computeColor(leftPaddleColor);
  ctx.fillRect(paddlePad, leftPaddleY, paddleWidth, paddleLength);

  ctx.fillStyle = computeColor(rightPaddleColor);
  ctx.fillRect(ctx.canvas.width - paddleWidth - paddlePad, rightPaddleY, paddleWidth, paddleLength);
};

export default draw;
