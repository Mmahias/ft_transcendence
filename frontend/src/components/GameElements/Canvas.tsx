import React, { forwardRef, useEffect, useState } from 'react';
import { GameState } from "./gameState"
import { DrawArgs } from "./utils/draw"
import { BACKEND_WIDTH, BACKEND_HEIGHT, RESIZE_FACTOR } from './constants';
import * as S from './Game.styles';

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
    width: Number(window.innerWidth / RESIZE_FACTOR),
    height: Number(window.innerHeight / RESIZE_FACTOR),
  });
  
  const getResponsiveSize = () => {
    const windowRatio = window.innerWidth / window.innerHeight;
    const gameRatio = BACKEND_WIDTH / BACKEND_HEIGHT;

    let newWidth, newHeight;

    if (windowRatio > gameRatio) {
      newHeight = window.innerHeight / RESIZE_FACTOR;
      newWidth = newHeight * gameRatio;
    } else {
      newWidth = window.innerWidth / RESIZE_FACTOR;
      newHeight = newWidth / gameRatio;
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