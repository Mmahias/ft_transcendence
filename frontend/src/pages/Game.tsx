import React, { useRef, useState, useEffect } from 'react';
import Canvas from '../components/GameElements/Canvas';
import draw from '../components/GameElements/utils/draw';
import { GameWrapper, Score, StyledButton, ButtonContainer } from '../components/GameElements/Game.styles';
import useGameLogic from '../components/GameElements/useGameLogic';
import { useSocket } from '../hooks/useSocket';
import toast from 'react-hot-toast';

interface GameProps {}

const Game: React.FC<GameProps> = () => {
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameWrapperRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();
  
  const {
    gameState,
  } = useGameLogic();

  const [selectedMode, setSelectedMode] = useState<'classic' | 'special'>('classic');
  const [inQueue, setInQueue] = useState(false);
  
  useEffect(() => {
    if (gameWrapperRef && gameWrapperRef.current) {
      gameWrapperRef.current.focus();
    }
  }, []);

  // Socket listeners

  const handleJoinQueue = (mode: 'classic' | 'special') => {
    if (!socket) {
      toast.error("Failed to join queue...", {
        id: "matchmaking",
        icon: "❌",
        duration: 3000,
      });
      return;
    }
    setSelectedMode(mode);
    socket.emit('join queue', { mode });
    setInQueue(true);
    toast.success("Waiting for an opponent...", {
      id: "matchmaking",
      icon: "🎮⌛",
      duration: 3000,
    });
  };

  const handleLeaveQueue = () => {
    if (!socket) {
      toast.error("Failed to leave queue...", {
        id: "matchmaking",
        icon: "❌",
        duration: 3000,
      });
      return;
    }
    socket.emit('leave queue');
    toast.success("Left the queue.", {
      id: "matchmaking",
      icon: "🚪🚶",
      duration: 3000,
    });

    setInQueue(false);
  };

  return (
    <div tabIndex={0}>
      <GameWrapper ref={gameWrapperRef} tabIndex={0} style={{ position: 'relative' }}>
        <Score>{`${gameState.p1Score} - ${gameState.p2Score}`}</Score>
        <Canvas ref={canvasRef} draw={draw} gameState={gameState} mode={selectedMode} />
        {inQueue ? (
          <StyledButton onClick={handleLeaveQueue}>Leave Queue</StyledButton>
        ) : (
          <ButtonContainer>
            <StyledButton onClick={() => handleJoinQueue('classic')}>Join Classic Queue</StyledButton>
            <StyledButton onClick={() => handleJoinQueue('special')}>Join Special Queue</StyledButton>
          </ButtonContainer>
        )}
      </GameWrapper>
    </div>
  );
};

export default Game;
