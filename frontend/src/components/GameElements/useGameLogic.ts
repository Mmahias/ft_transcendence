import { useState, useEffect, useRef } from 'react';
import { randomBallSpeed } from './movements';
import { BALL_SPEED_X, BALL_SPEED_Y } from './constants';
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
}

const useGameLogic = ({ height, width }: UseGameLogicArgs) => {

  const socket = useSocket()
  const navigate = useNavigate();

  const [gameState, setGameState] = useState({
    leftPaddleY: height / 2,
    rightPaddleY: height / 2,
    ballX: width / 2,
    ballY: height / 2,
    ballSpeedX: randomBallSpeed( BALL_SPEED_X(), BALL_SPEED_X()),
    ballSpeedY: randomBallSpeed( BALL_SPEED_Y(), BALL_SPEED_Y()),
    p1Score: 0,
    p2Score: 0,
    p1Username: "",
    p2Username: "",
  });
  
  
  const [canvasDimensions, setCanvasDimensions] = useState({ height, width });
  const [leftUser, setLeftUser] = useState(false);
  const [downKeyPressed, setDownKeyPressed] = useState(false);
  const [upKeyPressed, setUpKeyPressed] = useState(false);
  const [isMatchStarted, setIsMatchStarted] = useState(false);

  useEffect(() => {

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setUpKeyPressed(true);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setDownKeyPressed(true);
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") {
        setUpKeyPressed(false);
      } else if (event.key === "ArrowDown") {
        setDownKeyPressed(false);
      }
    };

    // Add event listeners for keydown and keyup
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };

  }, [upKeyPressed, downKeyPressed] );

	const fps = 60;
	const sps = 10;
	const paddleSpeed = 400;
	const paddleLength = 100;
	const paddleWidth = 10;
	const ballRadius = 5;
	const maxBallSpeed = 1000;
	let lastTime = useRef(Date.now());
	let lastCall = useRef(Date.now());

  useEffect(() => {
    let animationFrameId: number;

    // Game update loop using requestAnimationFrame
    const gameLoop = () => {
      // Calculate delta time
      const now = Date.now();
      const delta = (now - lastTime.current) / 1000; // In seconds

      // Update paddle position
      switch (leftUser) {
        case true:
        {
          if (upKeyPressed && gameState.leftPaddleY > 0) {
            gameState.leftPaddleY -= (paddleSpeed * delta);
          }

          if (downKeyPressed && gameState.leftPaddleY < height - paddleLength) {
            gameState.leftPaddleY += (paddleSpeed * delta);
          }
          break;
        }
        case false:
        {
          if (upKeyPressed && gameState.rightPaddleY > 0) {
            gameState.rightPaddleY -= (paddleSpeed * delta);
          }

          if (downKeyPressed && gameState.rightPaddleY < height - paddleLength) {
            gameState.rightPaddleY += (paddleSpeed * delta);
          }
          break;
        }
        default:
          break;
      }

      // Check paddle bounds
      if (gameState.leftPaddleY < 0) {
        gameState.leftPaddleY = 0;
      } else if (gameState.leftPaddleY > height - paddleLength) {
        gameState.leftPaddleY = height - paddleLength;
      }
      if (gameState.rightPaddleY < 0) {
        gameState.rightPaddleY = 0;
      } else if (gameState.rightPaddleY > height - paddleLength) {
        gameState.rightPaddleY = height - paddleLength;
      }

      // Actuate ball state here

      // Check collisions first
      setTimeout(() => {
        console.log("ball y", gameState.ballY, height)
      }, 3000);
      if (gameState.ballY + (gameState.ballSpeedY * delta) - ballRadius < 0 || gameState.ballY + (gameState.ballSpeedY * delta) + ballRadius > height) {
      gameState.ballSpeedY *= -1.05;
      }
      setTimeout(() => {
        console.log("ball x", gameState.ballX, width)
      }, 3000);
      if (gameState.ballX + (gameState.ballSpeedX * delta) - ballRadius - paddleWidth < 0) {
        if (gameState.ballY > gameState.leftPaddleY && gameState.ballY < gameState.leftPaddleY + paddleLength) {
          // It bounces on the paddle
          gameState.ballSpeedX *= -1.8;
          gameState.ballSpeedY *= 1.2;
        } else {
          // Goal
          gameState.ballSpeedX = 0;
          gameState.ballSpeedY = 0;
        }
      }
      else if (gameState.ballX + (gameState.ballSpeedX * delta) + ballRadius + paddleWidth > width) {
        if (gameState.ballY > gameState.rightPaddleY && gameState.ballY < gameState.rightPaddleY + paddleLength) {
          // It bounces on the paddle
          gameState.ballSpeedX *= -1.8;
          gameState.ballSpeedY *= 1.2;
        } else {
          // Goal
          gameState.ballSpeedX = 0;
          gameState.ballSpeedY = 0;
        }
      }

      // Speed limits
      if (gameState.ballSpeedX > maxBallSpeed) {
        gameState.ballSpeedX = maxBallSpeed;
      } else if (gameState.ballSpeedX < -maxBallSpeed) {
        gameState.ballSpeedX = -maxBallSpeed;
      }
      if (gameState.ballSpeedY > maxBallSpeed) {
        gameState.ballSpeedY = maxBallSpeed;
      } else if (gameState.ballSpeedY < -maxBallSpeed) {
        gameState.ballSpeedY = -maxBallSpeed;
      }

      gameState.ballX += gameState.ballSpeedX * delta;
      gameState.ballY += gameState.ballSpeedY * delta;

      // Send the game input to the backend every sps tick
      if (now - lastCall.current >= 1 / sps)
      {
        switch (leftUser){
          case true:
            socket?.emit("game input", gameState.leftPaddleY);
            break;
          case false:
            socket?.emit("game input", gameState.rightPaddleY);
            break;
          default:
            break;
        }
        lastCall.current = now;
      }

      lastTime.current = now;

      // Schedule the next game loop
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    // Start the game loop
    if (isMatchStarted) {
      if (Date.now() - lastTime.current > fps) {
          gameLoop();
      } else {
          animationFrameId = requestAnimationFrame(gameLoop);
      }
    }

    // Clean up the game loop on component unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [socket, leftUser, upKeyPressed, downKeyPressed, gameState]);




  useEffect(() => {
    if (!canvasDimensions.height || !canvasDimensions.width)
      return;
  }, [canvasDimensions.height, canvasDimensions.width]);

  // socket emits
  useEffect(() => {
    socket?.emit('game input', { posY: gameState.rightPaddleY });
  }, [gameState.rightPaddleY]);

  // socket listeners
  useEffect(() => {

    if (!socket || leftUser === undefined) return;

    // listen for found matches
    socket?.on('match found', (data) => {
      socket?.emit('accept match');
      console.log(data);
    });

    //listen for gameState changes
    socket?.on("game state", (matchClass: any) => {
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
      console.log("ball: ", matchClass.ballX, matchClass.ballY);
    });

    // Log when the match starts and get payload
    socket?.on("match started", (payload: boolean) => {
      setLeftUser(payload);
      setIsMatchStarted(true);

      toast.success("FIGHT ON!", {
        id: "matchmaking",
        icon: "🎉",
        duration: 3000,
      });
    });

    // Handle match cancellation
    socket?.on("match canceled", () => {
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
    socket?.on("match win", (payload: string) => {
      toast.success("VICTORY !!", {
        id: "matchmaking",
        icon: "🌟",
        duration: 3000,
      });
      setTimeout(() => {
        // Redirect to profile page
        navigate("/user/profile/" + payload);
      }, 2500);
    });

    socket?.on("match lose", (payload: string) => {
      toast.success("DEFEAT !!", {
        id: "matchmaking",
        icon: "😢",
        duration: 3000,
      });

      setTimeout(() => {
        // Redirect to profile page
        toast.dismiss("matchmaking");
        navigate("/user/profile/" + payload);
      }, 2500);
    });

    socket?.on('connect_error', (error) => {
      console.error("Socket connection error:", error);
    });

  }, [leftUser, socket]);

  return { gameState };
};

export default useGameLogic;
