import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useNavigate } from 'react-router-dom';
import { BACKEND_WIDTH, BACKEND_HEIGHT, PADDLE_LENGTH,
  PADDLE_SPEED, PADDLE_WIDTH, BORDER_WIDTH, PADDLE_PADDING } from './constants';
import toast from 'react-hot-toast';

const useGameLogic = () => {

  const socket = useSocket()
  const navigate = useNavigate();

  const initialGameState = {
    p1PosY: BACKEND_HEIGHT / 2 - PADDLE_LENGTH / 2,
    p2PosY: BACKEND_HEIGHT / 2 - PADDLE_LENGTH / 2,
    ballX: BACKEND_WIDTH / 2,
    ballY: BACKEND_HEIGHT / 2,
    ballSpeedX: 0,
    ballSpeedY: 0,
    p1Score: 0,
    p2Score: 0,
    p1Username: "",
    p2Username: "",
  };

  const [gameState, setGameState] = useState(initialGameState);
  const [leftUser, setLeftUser] = useState(false);
  const [downKeyPressed, setDownKeyPressed] = useState(false);
  const [upKeyPressed, setUpKeyPressed] = useState(false);
  const [isMatchStarted, setIsMatchStarted] = useState(false);

  // keys listeners
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

  }, [] );

  const fps = 60;
  const sps = 3;
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
          if (upKeyPressed && gameState.p1PosY > BORDER_WIDTH) {
            gameState.p1PosY -= (PADDLE_SPEED * delta);
          }

          if (downKeyPressed && gameState.p1PosY < BACKEND_HEIGHT - PADDLE_LENGTH - BORDER_WIDTH) {
            gameState.p1PosY += (PADDLE_SPEED * delta);
          }
          break;
        }
        case false:
        {
          if (upKeyPressed && gameState.p2PosY > BORDER_WIDTH) {
            gameState.p2PosY -= (PADDLE_SPEED * delta);
          }

          if (downKeyPressed && gameState.p2PosY < BACKEND_HEIGHT - PADDLE_LENGTH - BORDER_WIDTH) {
            gameState.p2PosY += (PADDLE_SPEED * delta);
          }
          break;
        }
        default:
          break;
      }

      // Check paddle bounds
      if (gameState.p1PosY < BORDER_WIDTH) {
        gameState.p1PosY = BORDER_WIDTH;
      } else if (gameState.p1PosY > BACKEND_HEIGHT - PADDLE_LENGTH - BORDER_WIDTH) {
        gameState.p1PosY = BACKEND_HEIGHT - PADDLE_LENGTH - BORDER_WIDTH;
      }
      if (gameState.p2PosY < BORDER_WIDTH) {
        gameState.p2PosY = BORDER_WIDTH;
      } else if (gameState.p2PosY > BACKEND_HEIGHT - PADDLE_LENGTH - BORDER_WIDTH) {
        gameState.p2PosY = BACKEND_HEIGHT - PADDLE_LENGTH - BORDER_WIDTH;
      }

      // Actuate ball state here

      // Check top/bottom collisions first
      if (
        gameState.ballY + (gameState.ballSpeedY * delta) - ballRadius < 0 || 
        gameState.ballY + (gameState.ballSpeedY * delta) + ballRadius > BACKEND_HEIGHT
      ) {
        gameState.ballSpeedY *= -1.05;
      }
      
      // Left border/paddle collision
      if (gameState.ballX + (gameState.ballSpeedX * delta) - ballRadius - PADDLE_WIDTH - PADDLE_PADDING < 0) {
        if (
          gameState.ballY > gameState.p1PosY && 
          gameState.ballY < gameState.p1PosY + PADDLE_LENGTH
        ) {
          gameState.ballSpeedX *= -1.4;
          gameState.ballSpeedY *= 1.2;
        } else {
          gameState.ballSpeedX = 0;
          gameState.ballSpeedY = 0;
        }
      }
      
      // Right border/paddle collision
      else if (gameState.ballX + (gameState.ballSpeedX * delta) + ballRadius + PADDLE_WIDTH + PADDLE_PADDING > BACKEND_WIDTH) {
        if (
          gameState.ballY > gameState.p2PosY && 
          gameState.ballY < gameState.p2PosY + PADDLE_LENGTH
        ) {
          gameState.ballSpeedX *= -1.4;
          gameState.ballSpeedY *= 1.2;
        } else {
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
            socket?.emit("game input", gameState.p1PosY);
            break;
          case false:
            socket?.emit("game input", gameState.p2PosY);
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
      lastTime.current = Date.now();
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
  }, [socket, leftUser, upKeyPressed, downKeyPressed]);

  // socket listeners
  useEffect(() => {
    if (!socket || leftUser === undefined) return;

    const handleMatchFound = (data: any) => {
        socket?.emit('accept match');
    };

    const handleGameState = (matchClass: any) => {
      // Update the game state and convert the data to the correct format
      setGameState({
        p1PosY: matchClass.p1PosY,
        p2PosY: matchClass.p2PosY,
        ballX: matchClass.ballX,
        ballY: matchClass.ballY,
        ballSpeedX: matchClass.ballSpeedX,
        ballSpeedY: matchClass.ballSpeedY,
        p1Score: matchClass.player1.score,
        p2Score: matchClass.player2.score,
        p1Username: matchClass.player1.username,
        p2Username: matchClass.player2.username,
      });
    };

    const handleMatchStarted = (payload: boolean) => {
      setLeftUser(payload);
      setIsMatchStarted(true);

      toast.success("FIGHT ON!", {
        id: "matchmaking",
        icon: "🎉",
        duration: 3000,
      });
    };

    const handleMatchCanceled = () => {
      setIsMatchStarted(false);
      toast.error("Player disconnected.", {
        id: "matchmaking",
        icon: "❌",
        duration: 2000,
      });

      setGameState(initialGameState);

      setTimeout(() => {
        // Redirect to the home page
        toast.dismiss("matchmaking");
        navigate("/");
      }, 2500);
    };

    const handleMatchWin = (payload: string) => {
      setIsMatchStarted(false);
      toast.success("VICTORY !!", {
        id: "matchmaking",
        icon: "🌟",
        duration: 3000,
      });

      setGameState(initialGameState);

      setTimeout(() => {
        // Redirect to profile page
        navigate("/user/profile/" + payload);
      }, 2500);
    };

    const handleMatchLose = (payload: string) => {
      setIsMatchStarted(false);
      toast.success("DEFEAT !!", {
        id: "matchmaking",
        icon: "😢",
        duration: 3000,
      });

      setGameState(initialGameState);

      setTimeout(() => {
        // Redirect to profile page
        toast.dismiss("matchmaking");
        navigate("/user/profile/" + payload);
      }, 2500);
    };

    const handleConnectError = (error: any) => {
        console.error("Socket connection error:", error);
    };

    // Register the listeners
    socket.on('match found', handleMatchFound);
    socket.on("game state", handleGameState);
    socket.on("match started", handleMatchStarted);
    socket.on("match canceled", handleMatchCanceled);
    socket.on("match win", handleMatchWin);
    socket.on("match lose", handleMatchLose);
    socket.on('connect_error', handleConnectError);

    // Return a cleanup function
    return () => {
        socket.off('match found', handleMatchFound);
        socket.off("game state", handleGameState);
        socket.off("match started", handleMatchStarted);
        socket.off("match canceled", handleMatchCanceled);
        socket.off("match win", handleMatchWin);
        socket.off("match lose", handleMatchLose);
        socket.off('connect_error', handleConnectError);
    };
  }, [leftUser, socket]);

  return { gameState };
};

export default useGameLogic;
