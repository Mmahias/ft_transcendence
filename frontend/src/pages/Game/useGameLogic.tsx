import React, { useState, useEffect, useRef } from 'react';
import {   willBallHitPaddle, adjustBallVelocityAfterPaddleHit,
    adjustBallVelocityAfterCanvasHit, adjustBallVelocityAfterOutOfBounds,
    willBallGetOutOfBounds, movePaddle, randomBallSpeed
    } from './movements';
import { GameState } from './Game';
import useInterval from './utils/useInterval';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_SPEED, BALL_SPEED_X,
    BALL_SPEED_Y, TICKS_PER_SEC, MAX_SCORE
    } from './Game.constants';
import { io, Socket } from 'socket.io-client';
import { BACKEND_FULL_URL } from '../../constants/envConstants';
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

    const PADDLE_WIDTH = () => Math.min(canvasWidth / 55);
    const PADDLE_HEIGHT = () => canvasHeight / 4.3;
    const BALL_SIZE = () => Math.pow(20 * canvasWidth * canvasHeight, 2/11);
    const BORDER_PADDING = () => (30 * canvasWidth) / (2 * canvasHeight);
    // const BORDER_PADDING_SIDE = () => BORDER_PADDING() / 2;
    // const BORDER_THICKNESS = () => canvasWidth / 100;

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

    const [ball, setBall] = useState<Ball>(initialBall);
    const [leftPaddle, setLeftPaddle] = useState<Paddle>(initialLeftPaddle);
    const [rightPaddle, setRightPaddle] = useState<Paddle>(initialRightPaddle);
    const [canvasDimensions, setCanvasDimensions] = useState({
        height: CANVAS_HEIGHT(),
        width: CANVAS_WIDTH(),
    });
    const lastScoredAt = useRef<number | null>(null);
    const keysPressed = useRef<{ [key: string]: boolean }>({});

    const socket = useRef<Socket | null>(null);

    useEffect(() => {
        socket.current = io(BACKEND_FULL_URL);

        socket.current.on('connect', () => {
            console.log('Connected to WebSocket server');
        });
    
        socket.current.on('opponentMove', (data: Paddle) => {
            // Here, check the side of the paddle and update the game state based on the received data
            if (data.side === 'left') {
                setLeftPaddle(data);
            } else if (data.side === 'right') {
                setRightPaddle(data);
            }
        });

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, []);

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

    const resetGame = () => {
        setBall(initialBall);
        setLeftPaddle(initialLeftPaddle);
        setRightPaddle(initialRightPaddle);
    };

    const onKeyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault(); // Prevents default browser behavior
          }
        keysPressed.current[event.key] = true;
    };
        
    const onKeyUpHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
        keysPressed.current[event.key] = false;
    };

    const handlePaddleMovement = () => {
        const updatePaddlePosition = (paddle: Paddle, direction: 'up' | 'down') => {
            const updatedPaddle = movePaddle(paddle, direction, canvasHeight);
            if (socket.current) {
                socket.current.emit('playerMove', updatedPaddle);
            }
            return updatedPaddle;
        };
    
        if (keysPressed.current[leftPaddle.moveDownKey]) {
            setLeftPaddle(prevPaddle => updatePaddlePosition(prevPaddle, 'down'));
        }
    
        if (keysPressed.current[leftPaddle.moveUpKey]) {
            setLeftPaddle(prevPaddle => updatePaddlePosition(prevPaddle, 'up'));
        }
    
        if (keysPressed.current[rightPaddle.moveDownKey]) {
            setRightPaddle(prevPaddle => updatePaddlePosition(prevPaddle, 'down'));
        }
    
        if (keysPressed.current[rightPaddle.moveUpKey]) {
            setRightPaddle(prevPaddle => updatePaddlePosition(prevPaddle, 'up'));
        }
    };
    
    

    const moveBall = () => {
        if (leftPaddle.score >= MAX_SCORE() || rightPaddle.score >= MAX_SCORE()) {
            onGameOver();
        }
        setBall(prevBall => {
          let newBall = { ...prevBall };
    
          if (willBallHitPaddle(prevBall, leftPaddle) || willBallHitPaddle(prevBall, rightPaddle)) {
            const hitPaddle = willBallHitPaddle(prevBall, leftPaddle) ? leftPaddle : rightPaddle;
            newBall = adjustBallVelocityAfterPaddleHit(newBall, hitPaddle);
          }
    
          // Check if the ball hits the canvas boundaries and adjust velocity accordingly
          newBall = adjustBallVelocityAfterCanvasHit(newBall, canvasHeight);
    
          // If the ball goes out of bounds
          if (willBallGetOutOfBounds(prevBall, canvasHeight, canvasWidth)) {
            const now = Date.now();
            let newLeftScore = leftPaddle.score;
            let newRightScore = rightPaddle.score;
        
            if (!lastScoredAt.current || now - lastScoredAt.current > 200) {
                if (prevBall.x < canvasWidth / 2) {
                    setRightPaddle(prevPaddle => {
                        newRightScore = prevPaddle.score + 1;
                        return { ...prevPaddle, score: newRightScore };
                    });
                } else {
                    setLeftPaddle(prevPaddle => {
                        newLeftScore = prevPaddle.score + 1;
                        return { ...prevPaddle, score: newLeftScore };
                    });
                }
                lastScoredAt.current = now;
        
                // Now, you can use the local variables for accurate logging
                console.log(newLeftScore, "-", newRightScore, "==>", MAX_SCORE()); 
            }
            newBall = adjustBallVelocityAfterOutOfBounds(newBall, canvasWidth);
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

      useInterval(() => {
        handlePaddleMovement();
        moveBall();
    }, gameState === GameState.RUNNING ? 1000 / TICKS_PER_SEC() : null);

    return {
        ball,
        leftPaddle,
        rightPaddle,
        onKeyDownHandler,
        onKeyUpHandler,
        resetGame,
    };
};

export default useGameLogic;
