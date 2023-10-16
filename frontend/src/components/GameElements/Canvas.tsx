import React, { forwardRef, useEffect, useState } from 'react';
import { Ball, Paddle } from './useGameLogic';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import { GameState } from "./gameState"
import * as S from './Game.styles';

type CanvasProps = React.DetailedHTMLProps<
  React.CanvasHTMLAttributes<HTMLCanvasElement>,
  HTMLCanvasElement
> & {
  gameState: GameState;
  draw?: (context: CanvasRenderingContext2D) => void;
};

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ draw, gameState, ...props }, canvasRef) => {

    const [canvasDimensions, setCanvasDimensions] = useState({
        width: Number(CANVAS_WIDTH()),
        height: Number(CANVAS_HEIGHT()),
    });

    useEffect(() => {
        const updateDimensions = () => {
            setCanvasDimensions({
                width: Number(CANVAS_WIDTH()),
                height: Number(CANVAS_HEIGHT()),
            });
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        return () => {
            window.removeEventListener('resize', updateDimensions);
        };
    }, []);

    useEffect(() => {
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
    }, [draw, canvasRef, gameState]);

    return (
        <S.Canvas 
            width={canvasDimensions.width} 
            height={canvasDimensions.height} 
            ref={canvasRef as any} 
        />
    );
});

export default Canvas;