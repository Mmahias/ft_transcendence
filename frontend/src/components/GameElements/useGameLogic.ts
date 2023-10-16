import React, { useState, useEffect, useRef } from 'react';
import {   willBallHitPaddle, adjustBallVelocityAfterPaddleHit,
  adjustBallVelocityAfterCanvasHit, adjustBallVelocityAfterOutOfBounds,
  willBallGetOutOfBounds, movePaddle, randomBallSpeed
  } from './movements';
import { GameState } from '../../pages/Game';
import useInterval from './utils/useInterval';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_SPEED, BALL_SPEED_X,
  BALL_SPEED_Y, TICKS_PER_SEC, MAX_SCORE
  } from './constants';
import { useSocket } from '../../hooks/useSocket';

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

export interface Paddle {
  initialX: number;
  initialY: number;
  width: number;
  height: number;
  speed: number;
  moveUpKey: string;
  moveDownKey: string;
  score: number;
  side: string;
}

interface UseGameLogicArgs {
  height: number;
  width: number;
  onGameOver: () => void;
  gameState: GameState;
}

const useGameLogic = ({ height, width, onGameOver, gameState }: UseGameLogicArgs) => {

  const socketRef = useRef(useSocket());

  const PADDLE_WIDTH = () => Math.min(width / 55);
  const PADDLE_HEIGHT = () => height / 4.3;
  const BALL_SIZE = () => Math.pow(20 * width * height, 2/11);
  const BORDER_PADDING = () => (30 * width) / (2 * height);
  // const BORDER_PADDING_SIDE = () => BORDER_PADDING() / 2;
  // const BORDER_THICKNESS = () => width / 100;

  const initialLeftPaddle = {
    initialX: BORDER_PADDING(),
    initialY: (CANVAS_HEIGHT() - PADDLE_HEIGHT()) / 2,
    width: PADDLE_WIDTH(),
    height: PADDLE_HEIGHT(),
    speed: PADDLE_SPEED(),
    moveUpKey: 's',
    moveDownKey: 'w',
    score: 0,
    side: 'left',
  };

  const initialRightPaddle = {
    initialX: CANVAS_WIDTH() - PADDLE_WIDTH() - BORDER_PADDING(),
    initialY: (CANVAS_HEIGHT() - PADDLE_HEIGHT()) / 2,
    width: PADDLE_WIDTH(),
    height: PADDLE_HEIGHT(),
    speed: PADDLE_SPEED(),
    moveUpKey: 'ArrowUp',
    moveDownKey: 'ArrowDown',
    score: 0,
    side: 'right',
  };

  const initialBall = {
    x: CANVAS_WIDTH() / 2,
    y: CANVAS_HEIGHT() / 2,
    vx: randomBallSpeed(0.6 * BALL_SPEED_X(), BALL_SPEED_X()),
    vy: randomBallSpeed(0.8 * BALL_SPEED_Y(), BALL_SPEED_Y()),
    size: BALL_SIZE(),
  };

  const lastScoredAt = useRef<number | null>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  
  
  const [ball, setBall] = useState<Ball>(initialBall);
  const [localPlayerPaddle, setLocalPlayerPaddle] = useState<Paddle>(initialRightPaddle);
  const [networkPlayerPaddle, setNetworkPlayerPaddle] = useState<Paddle>(initialLeftPaddle);
  const [canvasDimensions, setCanvasDimensions] = useState({ height: CANVAS_HEIGHT(), width: CANVAS_WIDTH() });
  
  const resetGame = () => {
    setBall(initialBall);
    setNetworkPlayerPaddle(initialLeftPaddle);
    setLocalPlayerPaddle(initialRightPaddle);
  };
  
  const onKeyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault(); // Prevents default browser behavior
    }
    socketRef.current?.emit('keyPress', { key: event.key, type: 'down' });
  };

  const onKeyUpHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
    socketRef.current?.emit('keyPress', { key: event.key, type: 'up' });
  };

  const handlePaddleMovement = () => {
    const updatePaddlePosition = (paddle: Paddle, direction: 'up' | 'down') => {
      const updatedPaddle = movePaddle(paddle, direction, height);
      return updatedPaddle;
    };

    if (keysPressed.current[localPlayerPaddle.moveDownKey]) {
      setLocalPlayerPaddle(prevPaddle => updatePaddlePosition(prevPaddle, 'down'));
    }

    if (keysPressed.current[localPlayerPaddle.moveUpKey]) {
      setLocalPlayerPaddle(prevPaddle => updatePaddlePosition(prevPaddle, 'up'));
    }
  };

const moveBall = () => {
    if (networkPlayerPaddle.score >= MAX_SCORE() || localPlayerPaddle.score >= MAX_SCORE()) {
      onGameOver();
    }
    setBall(prevBall => {
      let newBall = { ...prevBall };

      if (willBallHitPaddle(prevBall, networkPlayerPaddle) || willBallHitPaddle(prevBall, localPlayerPaddle)) {
        const hitPaddle = willBallHitPaddle(prevBall, networkPlayerPaddle) ? networkPlayerPaddle : localPlayerPaddle;
        newBall = adjustBallVelocityAfterPaddleHit(newBall, hitPaddle);
      }

      // Check if the ball hits the canvas boundaries and adjust velocity accordingly
      newBall = adjustBallVelocityAfterCanvasHit(newBall, height);

      // If the ball goes out of bounds
      if (willBallGetOutOfBounds(prevBall, height, width)) {
        const now = Date.now();
        let newLeftScore = networkPlayerPaddle.score;
        let newRightScore = localPlayerPaddle.score;
    
        if (!lastScoredAt.current || now - lastScoredAt.current > 200) {
          if (prevBall.x < width / 2) {
            setLocalPlayerPaddle(prevPaddle => {
              newRightScore = prevPaddle.score + 1;
              return { ...prevPaddle, score: newRightScore };
            });
          } else {
            setNetworkPlayerPaddle(prevPaddle => {
              newLeftScore = prevPaddle.score + 1;
              return { ...prevPaddle, score: newLeftScore };
            });
          }
          lastScoredAt.current = now;

          // Now, you can use the local variables for accurate logging
          console.log(newLeftScore, "-", newRightScore, "==>", MAX_SCORE()); 
        }
        newBall = adjustBallVelocityAfterOutOfBounds(newBall, width);
        newBall = {
          ...initialBall,
          vx: randomBallSpeed(0.6 * BALL_SPEED_X(), BALL_SPEED_X()),
          vy: randomBallSpeed(0.8 * BALL_SPEED_Y(), BALL_SPEED_Y()),
        }
      }
      newBall.x += newBall.vx;
      newBall.y += newBall.vy;
      return newBall;
    });
  };

  useEffect(() => {
    if (!canvasDimensions.height || !canvasDimensions.width)
      return;
    resetGame();
  }, [canvasDimensions.height, canvasDimensions.width]);
  
  useEffect(() => {
    const updateDimensions = () => {
      setCanvasDimensions({
        height: CANVAS_HEIGHT(),
        width: CANVAS_WIDTH(),
      });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  useEffect(() => {
    socketRef.current?.emit('gameInput', { posY: localPlayerPaddle.initialY });
  }, [localPlayerPaddle.initialY]);

  useEffect(() => {
    socketRef.current?.on('gameupdate', (data) => {
      setNetworkPlayerPaddle(prev => ({ ...prev, initialY: data.p1posY }));
      setBall(prevBall => ({
        ...prevBall, // spread the previous ball properties first
        x: data.ballX, // then assign x
        y: data.ballY  // and y
      }));
    });
    return () => {
        socketRef.current?.off('gameInput');
    };
  }, []);

  useInterval(() => {
    handlePaddleMovement();
    moveBall();
  }, gameState === GameState.RUNNING ? 1000 / TICKS_PER_SEC() : null);



  return {
      ball,
      networkPlayerPaddle,
      localPlayerPaddle,
      onKeyDownHandler,
      onKeyUpHandler,
      resetGame,
  };
};

export default useGameLogic;
