import React, { useRef, useEffect } from 'react';
import './styles.css';

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = CANVAS_WIDTH / 40;
const PADDLE_HEIGHT = CANVAS_HEIGHT / 5;
const PADDLE_SPEED = 18;
const BALL_SIZE = (30 * CANVAS_WIDTH) / (4 * CANVAS_HEIGHT);;
const BORDER_PADDING = (30 * CANVAS_WIDTH) / (2 * CANVAS_HEIGHT);
const BORDER_PADDING_SIDE = BORDER_PADDING / 2;
const BORDER_THICKNESS = CANVAS_WIDTH / 100;
const BALL_SPEED_X = 4;
const BALL_SPEED_Y = 4;

const Game: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const leftPaddle = {
        x: BORDER_PADDING,
        y: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        dy: PADDLE_SPEED
    };

    const rightPaddle = {
        x: CANVAS_WIDTH - PADDLE_WIDTH - BORDER_PADDING,
        y: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        dy: PADDLE_SPEED
    };

    const ball = {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        size: BALL_SIZE,
        vx: BALL_SPEED_X,
        vy: BALL_SPEED_Y
    };

    const updateBallPosition = () => {
        ball.x += ball.vx;
        ball.y += ball.vy;
    
        // Bounce off side borders
        if (ball.y - ball.size < BORDER_THICKNESS || ball.y + ball.size > CANVAS_HEIGHT - BORDER_THICKNESS) {
            ball.vy = -ball.vy;
        }
    
        // Bounce off paddles
        if (
            (ball.x - ball.size < leftPaddle.x + leftPaddle.width &&
             ball.y + ball.size > leftPaddle.y &&
             ball.y - ball.size < leftPaddle.y + leftPaddle.height) ||
    
            (ball.x + ball.size > rightPaddle.x &&
             ball.y + ball.size > rightPaddle.y &&
             ball.y - ball.size < rightPaddle.y + rightPaddle.height)
        ) {
            ball.vx = -ball.vx;
        }
    
        if (ball.x < 0 || ball.x > CANVAS_WIDTH) {
            resetBall();
        }
    };

    const resetBall = () => {
        ball.x = CANVAS_WIDTH / 2;
        ball.y = CANVAS_HEIGHT / 2;
        ball.vx = BALL_SPEED_X;
        ball.vy = BALL_SPEED_Y;
    };

    const draw = () => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d')!;

            // Clear the canvas
            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            
            // Set the background color of the canvas
            ctx.fillStyle = 'lightgrey';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Draw the paddles and ball
            ctx.fillStyle = 'black';
            ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
            ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
            ctx.fill();

            // Draw the border
            ctx.strokeStyle = 'black';
            ctx.lineWidth = BORDER_THICKNESS;
            ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        switch(e.key) {
            case 'ArrowUp':
                if (rightPaddle.y - rightPaddle.dy > BORDER_PADDING_SIDE) rightPaddle.y -= rightPaddle.dy;
                break;
            case 'ArrowDown':
                if (rightPaddle.y + rightPaddle.height + rightPaddle.dy < CANVAS_HEIGHT - BORDER_PADDING_SIDE) rightPaddle.y += rightPaddle.dy;
                break;
            case 'w':
                if (leftPaddle.y - leftPaddle.dy > BORDER_PADDING_SIDE) leftPaddle.y -= leftPaddle.dy;
                break;
            case 's':
                if (leftPaddle.y + leftPaddle.height + leftPaddle.dy < CANVAS_HEIGHT - BORDER_PADDING_SIDE) leftPaddle.y += leftPaddle.dy;
                break;
        }
        console.log("BORDER_PADDING_SIDE:", BORDER_PADDING_SIDE);
        console.log("right paddle x:", rightPaddle.x);
        console.log("right paddle y:", rightPaddle.y);
        draw();
    };

    useEffect(() => {
        draw();
    }, []);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className="game-container">
            <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
        </div>
    );
}

export default Game;
