import React, { forwardRef, useEffect, useState } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import { GameState } from "./gameState"
import { DrawArgs } from "./utils/draw"
import * as S from './Game.styles';

export const BACKEND_WIDTH = 1000;
export const BACKEND_HEIGHT = BACKEND_WIDTH * 7 / 11;
export const PADDLE_LENGTH = BACKEND_HEIGHT / 5;
export const PADDLE_WIDTH = PADDLE_LENGTH / 20;
export const PADDLE_PAD = PADDLE_WIDTH * 2;

type CanvasProps = React.DetailedHTMLProps<
  React.CanvasHTMLAttributes<HTMLCanvasElement>,
  HTMLCanvasElement
> & {
  gameState: GameState;
  draw?: (args: DrawArgs) => void;
};

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ draw, gameState }, canvasRef) => {
    
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: Number(window.innerWidth / 1.5),
    height: Number(window.innerHeight / 1.5),
  });
  
  const getResponsiveSize = () => {
    // const newWidth = window.innerWidth / 1.5;
    // const newHeight = newWidth * 7 / 11;
    const windowRatio = window.innerWidth / window.innerHeight;
    const gameRatio = BACKEND_WIDTH / BACKEND_HEIGHT;
  
    let newWidth, newHeight;
  
    if (windowRatio > gameRatio) {
      newHeight = window.innerHeight / 1.5;
      newWidth = newHeight * gameRatio / 1.5;
    } else {
      newWidth = window.innerWidth / 1.5;
      newHeight = newWidth / (gameRatio * 1.5);
    }
    return { width: newWidth, height: newHeight };
  };

  useEffect(() => {
    const updateDimensions = () => {
      const newSize = getResponsiveSize();
      setCanvasDimensions(newSize);
    };
  
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);


  // draw on canvas
  useEffect(() => {
    const canvas = (canvasRef as React.RefObject<HTMLCanvasElement>).current;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    // Clear the canvas first before drawing the new frame.
    context.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);
    if (draw) {
      draw({ ctx: context, gameState, canvasDimensions });
    }
    // Removed the cleanup function because we already cleared the canvas above.
  }, [draw, canvasRef, gameState, canvasDimensions.width, canvasDimensions.height]);

  return (
    <S.Canvas 
      width={canvasDimensions.width} 
      height={canvasDimensions.height} 
      ref={canvasRef as any}
    />
  );
});

export default Canvas;