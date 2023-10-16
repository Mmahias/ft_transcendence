import { leftPaddleColor, rightPaddleColor, ballColor } from '../Game.styles';

interface GameState {
  leftPaddleY: number;
  rightPaddleY: number;
  ballX: number;
  ballY: number;
  ballSpeedX: number;
  ballSpeedY: number;
  p1Score: number;
  p2Score: number;
  p1Username: string;
  p2Username: string;
}

interface DrawArgs {
  ctx: CanvasRenderingContext2D;
  gameState: GameState;
}

const draw = ({ ctx, gameState }: DrawArgs) => {
  // Clear the canvas for new drawings
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw the ball
  ctx.fillStyle = ballColor;
  ctx.beginPath();
  ctx.arc(gameState.ballX, gameState.ballY, /* Assuming ball.size is standardized, e.g. 10 */ 10 / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();

  // Draw the left paddle
  ctx.fillStyle = leftPaddleColor;
  // Assuming a standard width for paddles, e.g. 15, and using the Y position from gameState
  ctx.fillRect(0 /* assuming left paddle always starts from x=0 */, gameState.leftPaddleY, 15, /* Assuming a standard height for paddles, e.g. 50 */ 50);
  
  // Draw the right paddle
  ctx.fillStyle = rightPaddleColor;
  // Assuming a standard width for paddles, e.g. 15, and the canvas width minus the paddle width for the x position
  ctx.fillRect(ctx.canvas.width - 15, gameState.rightPaddleY, 15, /* Assuming a standard height for paddles, e.g. 50 */ 50);
};

export default draw;
