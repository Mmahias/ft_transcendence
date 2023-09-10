import React, { useState, useEffect, useRef } from 'react';
import {   willBallHitPaddle, adjustBallVelocityAfterPaddleHit,
    adjustBallVelocityAfterCanvasHit, adjustBallVelocityAfterOutOfBounds, willBallHitCanvas,
    willBallGetOutOfBounds, movePaddle, randomBallSpeed, calculateBounceAngle
    } from './movements';
import { GameState } from './Game';
import useInterval from './utils/useInterval';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_SPEED, BALL_SPEED_X,
    BALL_SPEED_Y, TICKS_PER_SEC, MAX_SCORE, VELOCITY_FACTOR
    } from './Game.constants';

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
    canvasHeight: number;
    canvasWidth: number;
    onGameOver: () => void;
    gameState: GameState;
}

const useGameLogic = ({ canvasHeight, canvasWidth, onGameOver, gameState }: UseGameLogicArgs) => {

    const PADDLE_WIDTH = () => canvasWidth / 40;
    const PADDLE_HEIGHT = () => canvasHeight / 5;
    const BALL_SIZE = () => Math.pow(20 * canvasWidth * canvasHeight, 2/11);
    const BORDER_PADDING = () => (30 * canvasWidth) / (2 * canvasHeight);
    const BORDER_PADDING_SIDE = () => BORDER_PADDING() / 2;
    const BORDER_THICKNESS = () => canvasWidth / 100;


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
        vx: randomBallSpeed(BALL_SPEED_X()),
        vy: randomBallSpeed(BALL_SPEED_Y()),
        size: BALL_SIZE(),
    };

    const [ball, setBall] = useState<Ball>(initialBall);
    const [leftPaddle, setLeftPaddle] = useState<Paddle>(initialLeftPaddle);
    const [rightPaddle, setRightPaddle] = useState<Paddle>(initialRightPaddle);
    const [canvasDimensions, setCanvasDimensions] = useState({
        height: CANVAS_HEIGHT(),
        width: CANVAS_WIDTH(),
    });
    const lastScoredAt = useRef<number | null>(null);

    useEffect(() => {
        if (!canvasDimensions.height || !canvasDimensions.width) return;

        // Reset paddles and ball to their initial positions
        setBall(initialBall);
        setLeftPaddle(initialLeftPaddle);
        setRightPaddle(initialRightPaddle);
    }, [canvasDimensions.height, canvasDimensions.width]);
    
    useEffect(() => {
        // Function to update dimensions
        const updateDimensions = () => {
            setCanvasDimensions({
                height: CANVAS_HEIGHT(),
                width: CANVAS_WIDTH(),
            });
        };
        
        // Initial call to set dimensions
        updateDimensions();
    
        // Listen for window resize events
        window.addEventListener('resize', updateDimensions);
    
        // Cleanup listener on component unmount
        return () => {
            window.removeEventListener('resize', updateDimensions);
        };
    }, []);

    const onKeyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
        handlePaddleMovement(event, leftPaddle, setLeftPaddle);
        handlePaddleMovement(event, rightPaddle, setRightPaddle);
    };

    const handlePaddleMovement = (event: React.KeyboardEvent<HTMLDivElement>, paddle: Paddle, setPaddle: React.Dispatch<React.SetStateAction<Paddle>>) => {
        if (event.key === paddle.moveUpKey) {
            setPaddle(prevPaddle => movePaddle(prevPaddle, 'up', canvasHeight));
        } else if (event.key === paddle.moveDownKey) {
            setPaddle(prevPaddle => movePaddle(prevPaddle, 'down', canvasHeight));
        }
    };

    const moveBall = () => {
        setBall(prevBall => {
          let newBall = { ...prevBall };
          console.log(newBall);
    
          if (willBallHitPaddle(prevBall, leftPaddle) || willBallHitPaddle(prevBall, rightPaddle)) {
            const hitPaddle = willBallHitPaddle(prevBall, leftPaddle) ? leftPaddle : rightPaddle;
            newBall = adjustBallVelocityAfterPaddleHit(newBall, hitPaddle);
          }
    
          // Check if the ball hits the canvas boundaries and adjust velocity accordingly
          newBall = adjustBallVelocityAfterCanvasHit(newBall, canvasHeight);
    
          // If the ball goes out of bounds
          if (willBallGetOutOfBounds(prevBall, canvasHeight, canvasWidth)) {
            const now = Date.now();
            if (!lastScoredAt.current || now - lastScoredAt.current > 1000) {
                if (prevBall.x < canvasWidth / 2) {
                    setRightPaddle(prevPaddle => ({ ...prevPaddle, score: prevPaddle.score + 1 }));
                    console.log("Right player scored!", rightPaddle.score, ' ', leftPaddle.score)
                } else {
                    setLeftPaddle(prevPaddle => ({ ...prevPaddle, score: prevPaddle.score + 1 }));
                    console.log("Left player scored!", rightPaddle.score, ' ', leftPaddle.score)
                }
                lastScoredAt.current = now;
            }
                
                if (leftPaddle.score >= MAX_SCORE() || rightPaddle.score >= MAX_SCORE()) {
                    onGameOver();
                } else {
                    newBall = adjustBallVelocityAfterOutOfBounds(newBall, canvasWidth);
                    newBall = {
                        ...initialBall,
                vx: randomBallSpeed(BALL_SPEED_X()),
                vy: randomBallSpeed(BALL_SPEED_Y())
              };
            }
          }
          newBall.x += newBall.vx;
          newBall.y += newBall.vy;
          return newBall;
        });
      };

    useInterval(moveBall, gameState === GameState.RUNNING ? 1000 / TICKS_PER_SEC() : null);

    return {
        ball,
        leftPaddle,
        rightPaddle,
        onKeyDownHandler,
    };
};

export default useGameLogic;
