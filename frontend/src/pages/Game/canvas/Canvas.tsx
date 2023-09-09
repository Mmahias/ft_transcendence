import React, { forwardRef, useEffect } from 'react';
import { Ball, Paddle } from '../useGameLogic';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../Game.constants';
import * as S from './Canvas.styles';


type CanvasProps = React.DetailedHTMLProps<
  React.CanvasHTMLAttributes<HTMLCanvasElement>,
  HTMLCanvasElement
> & {
  ball: Ball;
  leftPaddle: Paddle;
  rightPaddle: Paddle;
  draw?: (context: CanvasRenderingContext2D) => void;
};

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ draw, ball, leftPaddle, rightPaddle, ...props }, canvasRef) => {
    useEffect(() => {
      if (!canvasRef) {
        return;
      }
      const canvas = (canvasRef as React.RefObject<HTMLCanvasElement>).current;
      if (!canvas) {
        return;
      }

      const context = canvas.getContext('2d');
      if (!context) {
        return;
      }

      if (draw) {
        draw(context);
      }

      return () => context.clearRect(0, 0, window.innerWidth, 400);
    }, [draw, canvasRef, ball, leftPaddle, rightPaddle]);

    if (!canvasRef) {
      return null;
    }

    return (
        <S.Canvas width={ CANVAS_WIDTH() } height={ CANVAS_HEIGHT() } ref={canvasRef as any} {...props} />
    );
  }
);

export default Canvas;
