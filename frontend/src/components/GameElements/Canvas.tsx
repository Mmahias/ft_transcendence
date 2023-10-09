import React, { forwardRef, useEffect, useState } from 'react';
import { Ball, Paddle } from './useGameLogic';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import * as S from './Game.styles';

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

    const [canvasDimensions, setCanvasDimensions] = useState({
        width: CANVAS_WIDTH(),
        height: CANVAS_HEIGHT(),
    });

    useEffect(() => {
        const updateDimensions = () => {
            setCanvasDimensions({
                width: CANVAS_WIDTH(),
                height: CANVAS_HEIGHT(),
            });
        };

        updateDimensions();

        window.addEventListener('resize', updateDimensions);

        return () => {
            window.removeEventListener('resize', updateDimensions);
        };
    }, []);

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

    return (
        <S.Canvas 
            canvasWidth={canvasDimensions.width}
            canvasHeight={canvasDimensions.height}
            width={canvasDimensions.width} 
            height={canvasDimensions.height} 
            ref={canvasRef as any} 
            {...props} 
        />
    );
});

export default Canvas;
