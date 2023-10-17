import React, { forwardRef, useEffect, useState } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import { GameState } from "./gameState"
import { DrawArgs } from "./utils/draw"
import * as S from './Game.styles';

type CanvasProps = React.DetailedHTMLProps<
  React.CanvasHTMLAttributes<HTMLCanvasElement>,
  HTMLCanvasElement
> & {
  gameState: GameState;
  draw?: (args: DrawArgs) => void;
};

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ draw, gameState, ...props }, canvasRef) => {

  const [canvasDimensions, setCanvasDimensions] = useState({
    width: Number(CANVAS_WIDTH()),
    height: Number(CANVAS_HEIGHT()),
  });

  // resize canvas when window is resized
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
      draw({ ctx: context, gameState });
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