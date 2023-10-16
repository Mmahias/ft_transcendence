import React, { useState, useEffect, useRef } from 'react';
import {   willBallHitPaddle, adjustBallVelocityAfterPaddleHit,
  adjustBallVelocityAfterCanvasHit, adjustBallVelocityAfterOutOfBounds,
  willBallGetOutOfBounds, movePaddle, randomBallSpeed
  } from './movements';
import { GameStatus } from '../../pages/Game';
import useInterval from './utils/useInterval';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_SPEED, BALL_SPEED_X,
  BALL_SPEED_Y, TICKS_PER_SEC, MAX_SCORE
  } from './constants';
import { useSocket } from '../../hooks/useSocket';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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
  gameStatus: GameStatus;
}

const useGameLogic = ({ height, width, onGameOver, gameStatus }: UseGameLogicArgs) => {

  const socketRef = useRef(useSocket());
  const navigate = useNavigate();
  const PADDLE_WIDTH = () => Math.min(width / 55);
  const PADDLE_HEIGHT = () => height / 4.3;
  const BALL_SIZE = () => Math.pow(20 * width * height, 2/11);
  const BORDER_PADDING = () => (30 * width) / (2 * height);

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
  
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  
  const [ball, setBall] = useState<Ball>(initialBall);
  const [canvasDimensions, setCanvasDimensions] = useState({ height: CANVAS_HEIGHT(), width: CANVAS_WIDTH() });
  const [localPlayerPaddle, setLocalPlayerPaddle] = useState<Paddle>(initialRightPaddle);
  const [networkPlayerPaddle, setNetworkPlayerPaddle] = useState<Paddle>(initialLeftPaddle);
  const [leftUser, setLeftUser] = useState(true);
  const [downKeyPressed, setDownKeyPressed] = useState(false);
  const [upKeyPressed, setUpKeyPressed] = useState(false);

  const [gameState, setGameState] = useState({
    leftPaddleY: height / 2,
    rightPaddleY: height / 2,
    ballX: width / 2,
    ballY: height / 2,
    ballSpeedX: 0,
    ballSpeedY: 0,
    p1Score: 0,
    p2Score: 0,
    p1Username: "",
    p2Username: "",
  });

  const resetGame = () => {
    setBall(initialBall);
    setNetworkPlayerPaddle(initialLeftPaddle);
    setLocalPlayerPaddle(initialRightPaddle);
  };
  
  const onKeyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault(); // Prevents default browser behavior
      console.log(event.key);
    }
    socketRef.current?.emit('keyPress', { key: event.key, type: 'down' });
  };

  const onKeyUpHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
    socketRef.current?.emit('keyPress', { key: event.key, type: 'up' });
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
    socketRef.current?.on("game state", (matchClass: any) => {
      // Update the game state and convert the data to the correct format
      setGameState({
        leftPaddleY: matchClass.p1posY,
        rightPaddleY: matchClass.p2posY,
        ballX: matchClass.ballX,
        ballY: matchClass.ballY,
        ballSpeedX: matchClass.ballSpeedX,
        ballSpeedY: matchClass.ballSpeedY,
        p1Score: matchClass.player1.score,
        p2Score: matchClass.player2.score,
        p1Username: matchClass.player1.username,
        p2Username: matchClass.player2.username,
      });
    });

    // Log when the match starts and get payload
    socketRef.current?.on("match started", (payload: boolean) => {

      setLeftUser(payload);

      toast.success("FIGHT ON!", {
        id: "matchmaking",
        icon: "🎉",
        duration: 3000,
      });
    });

    // Handle match cancellation
    socketRef.current?.on("match canceled", () => {
      // setRunning(false);

      toast.error("Player disconnected.", {
        id: "matchmaking",
        icon: "❌",
        duration: 2000,
      });

      setTimeout(() => {
        // Redirect to the home page
        toast.dismiss("matchmaking");
        navigate("/");
      }, 2500);
    });

    // Handle match end
    socketRef.current?.on("match win", (payload: string) => {

      setTimeout(() => {
        // Redirect to profile page
        navigate("/user/" + payload);
      }, 2500);
    });

    socketRef.current?.on("match lose", (payload: string) => {
      toast.error("You lose.", {
        id: "matchmaking",
        icon: "❌",
        duration: 3000,
      });

      setTimeout(() => {
        // Redirect to profile page
        toast.dismiss("matchmaking");
        navigate("/user/" + payload);
      }, 2500);
    });
  }, [socketRef, navigate, leftUser]);

  useEffect(() => {
    // Emit local player's paddle position
    socketRef.current?.emit('gameInput', { posY: localPlayerPaddle.initialY });

    // Listen for game state updates from the server
    socketRef.current?.on('gameInput', (data) => {
        setNetworkPlayerPaddle(prev => ({ ...prev, initialY: data.p1posY }));
        setBall(prevBall => ({
            ...prevBall, 
            x: data.ballX,
            y: data.ballY
        }));
    });

    // Listen for key states from the server
    socketRef.current?.on('keyState', (data) => {
        keysPressed.current = data.keysPressed;
    });

    return () => {
        socketRef.current?.off('gameInput');
        socketRef.current?.off('keyState');
    };
}, []);

  return {
    gameState,
    onKeyDownHandler,
    onKeyUpHandler,
    resetGame,
  };
};

export default useGameLogic;
