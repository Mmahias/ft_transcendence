import { Ball, Paddle } from '../useGameLogic'; 

interface DrawArgs {
  ctx: CanvasRenderingContext2D;
  ball: Ball;
  leftPaddle: Paddle;
  rightPaddle: Paddle;
}

const draw = ({ ctx, ball, leftPaddle, rightPaddle }: DrawArgs) => {
  // Clear the canvas for new drawings
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw the ball
  ctx.fillStyle = 'rgb(0, 200, 0)';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();

  // Draw the left paddle
  ctx.fillStyle = 'rgb(200, 0, 0)';
  ctx.fillRect(leftPaddle.initialX, leftPaddle.initialY, leftPaddle.width, leftPaddle.height);
  
  // Draw the right paddle
  ctx.fillStyle = 'rgb(0, 0, 200)';
  ctx.fillRect(rightPaddle.initialX, rightPaddle.initialY, rightPaddle.width, rightPaddle.height);
};

export default draw;
