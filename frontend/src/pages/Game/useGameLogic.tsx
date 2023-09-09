import React, { useState, useEffect } from 'react';
import { willBallHitPaddle, willBallHitCanvas, willBallGetOutOfBounds,
    movePaddle, randomBallSpeed, calculateBounceAngle } from './movements';
import { GameState } from './Game';
import useInterval from './utils/useInterval';
import {
    CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, 
    PADDLE_SPEED, BALL_SIZE, BORDER_PADDING, BORDER_PADDING_SIDE, 
    BORDER_THICKNESS, BALL_SPEED_X, BALL_SPEED_Y, TICKS_PER_SEC, MAX_SCORE,
    VELOCITY_FACTOR
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
}

interface UseGameLogicArgs {
    canvasHeight: number;
    canvasWidth: number;
    onGameOver: () => void;
    gameState: GameState;
}

const initialLeftPaddle = {
    initialX: BORDER_PADDING,
    initialY: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: PADDLE_SPEED,
    moveUpKey: 's',
    moveDownKey: 'w',
    score: 0,
};

const initialRightPaddle = {
    initialX: CANVAS_WIDTH - PADDLE_WIDTH - BORDER_PADDING,
    initialY: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: PADDLE_SPEED,
    moveUpKey: 'ArrowUp',
    moveDownKey: 'ArrowDown',
    score: 0,
};

const initialBall = {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    vx: randomBallSpeed(BALL_SPEED_X),
    vy: randomBallSpeed(BALL_SPEED_Y),
    size: BALL_SIZE,
};

const useGameLogic = ({ canvasHeight, canvasWidth, onGameOver, gameState }: UseGameLogicArgs) => {
    const [ball, setBall] = useState<Ball>(initialBall);
    const [leftPaddle, setLeftPaddle] = useState<Paddle>(initialLeftPaddle);
    const [rightPaddle, setRightPaddle] = useState<Paddle>(initialRightPaddle);

    useEffect(() => {
        if (!canvasHeight || !canvasWidth) return;

        // Reset paddles and ball to their initial positions
        setBall(initialBall);
        setLeftPaddle(initialLeftPaddle);
        setRightPaddle(initialRightPaddle);
    }, [canvasHeight, canvasWidth]);

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
            let newVx = prevBall.vx;
            let newVy = prevBall.vy;

            if (willBallHitPaddle(prevBall, leftPaddle) || willBallHitPaddle(prevBall, rightPaddle)) {
                const hitPaddle = willBallHitPaddle(prevBall, leftPaddle) ? leftPaddle : rightPaddle;
                const bounceAngle = calculateBounceAngle(prevBall, hitPaddle);
                console.log('angle', bounceAngle);
                console.log('paddle', hitPaddle === rightPaddle ? 'right' : 'left');
                newVx *= -1.03;
                newVy *= (hitPaddle === rightPaddle ? -1 : 1) * Math.sin(bounceAngle);
            }

            // Use the function to check if the ball hits the canvas boundaries
            if (willBallHitCanvas(prevBall, canvasHeight, canvasWidth)) {
                newVy = -newVy;
            }

            // If the ball goes out of bounds
            if (willBallGetOutOfBounds(prevBall, canvasHeight, canvasWidth)) {
                if (prevBall.x < canvasWidth / 2) {
                    setRightPaddle(prevPaddle => ({ ...prevPaddle, score: prevPaddle.score + 1 }));
                } else {
                    setLeftPaddle(prevPaddle => ({ ...prevPaddle, score: prevPaddle.score + 1 }));
                }
                if (leftPaddle.score >= MAX_SCORE || rightPaddle.score >= MAX_SCORE) {
                    onGameOver();
                }
                else {
                    setBall({
                        ...initialBall,
                        vx: randomBallSpeed(BALL_SPEED_X),
                        vy: randomBallSpeed(BALL_SPEED_Y)
                    });
                }
            }

            return {
                ...prevBall,
                x: prevBall.x + newVx,
                y: prevBall.y + newVy,
                vx: newVx,
                vy: newVy
            };
        });
    };

    useInterval(moveBall, gameState === GameState.RUNNING ? 1000 / TICKS_PER_SEC : null);

    return {
        ball,
        leftPaddle,
        rightPaddle,
        onKeyDownHandler,
    };
};

export default useGameLogic;
