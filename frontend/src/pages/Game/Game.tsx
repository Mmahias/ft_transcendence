import React, { useRef, useState, useEffect } from 'react';
import Canvas from './canvas/Canvas';
import draw from './draw/draw';
import { GameWrapper, Score, StyledButton, WinningMessage } from './Game.styles';
import useGameLogic from './useGameLogic';
import {
    CANVAS_WIDTH, CANVAS_HEIGHT
} from './Game.constants';
import socket from './socket';

interface GameProps {}

export enum GameState {
    RUNNING,
    PAUSED,
    GAME_OVER,
    WAITING_FOR_PLAYERS,
}

const Game: React.FC<GameProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameWrapperRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.WAITING_FOR_PLAYERS);

  const onGameOver = () => setGameState(GameState.GAME_OVER);

  const {
    ball,
    leftPaddle,
    rightPaddle,
    onKeyDownHandler,
    onKeyUpHandler,
    resetGame,
} = useGameLogic({
    canvasHeight: CANVAS_HEIGHT(),
    canvasWidth: CANVAS_WIDTH(),
    onGameOver,
    gameState,
});

  const drawGame = (ctx: CanvasRenderingContext2D) => {
    draw({ ctx, ball, leftPaddle, rightPaddle });
  };

  const [lobby, setLobby] = useState<any | null>(null);

  const createLobbyHandler = () => {
    console.log("Create lobby clicked!");
    const player = { /* your player data here */ }; 
    socket.emit('createLobby', player);
  };

  const joinLobbyHandler = (lobbyID: string) => {
    console.log("Joining lobby with ID:", lobbyID);
    const player = { /* your player data here */ };
    socket.emit('joinLobby', lobbyID, player);
  };

  const [lobbyID, setLobbyID] = useState<string>('');

  useEffect(() => {
    if (gameWrapperRef && gameWrapperRef.current) {
      gameWrapperRef.current.focus(); // Sets focus on the div when the component mounts
    }
  }, []);

  useEffect(() => {
    // Listen for lobby updates
    socket.on('lobbyUpdate', (updatedLobby) => {
      setLobby(updatedLobby);
      if(updatedLobby.players.length === 2) {
        setGameState(GameState.RUNNING);
      } else {
        setGameState(GameState.WAITING_FOR_PLAYERS);
      }
    });

    // Cleanup when component unmounts
    return () => {
      socket.off('lobbyUpdate');
    };
  }, []);

  const determineWinner = () => {
    if (leftPaddle.score > rightPaddle.score) return "Player 1";
    if (leftPaddle.score < rightPaddle.score) return "Player 2";
    return "It's a tie"; // For equal scores
  };

  return (
    <div tabIndex={0} onKeyDown={onKeyDownHandler} onKeyUp={onKeyUpHandler}>
      <GameWrapper ref={gameWrapperRef} tabIndex={0} onKeyDown={onKeyDownHandler} style={{ position: 'relative' }}>
        
        {/* Display the lobby creation and joining UI if waiting for players */}
        {gameState === GameState.WAITING_FOR_PLAYERS && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <button onClick={createLobbyHandler}>Create Lobby</button>
            <div style={{ marginTop: '20px' }}>
              <input placeholder="Enter Lobby ID" value={lobbyID} onChange={(e) => joinLobbyHandler(e.target.value)} />
              <button onClick={() => joinLobbyHandler(lobbyID)}>Join</button>
            </div>
          </div>
        )}
  
        {/* Display the game's main content */}
        <Score>{`${leftPaddle.score} - ${rightPaddle.score}`}</Score>
        <Canvas ref={canvasRef} draw={drawGame} ball={ball} leftPaddle={leftPaddle} rightPaddle={rightPaddle} />
        
        {gameState === GameState.GAME_OVER ? (
          <>
            <WinningMessage>{determineWinner()} Won!</WinningMessage>
            <StyledButton
              onClick={() => {
                resetGame();
                setGameState(GameState.RUNNING);
              }}
            >
              Rematch
            </StyledButton>
          </>
        ) : (
          <StyledButton
            onClick={() => {
              setGameState(
                gameState === GameState.RUNNING
                  ? GameState.PAUSED
                  : GameState.RUNNING
              );
            }}
          >
            {gameState === GameState.RUNNING ? 'Pause' : 'Play'}
          </StyledButton>
        )}
      </GameWrapper>
    </div>
  );
};

export default Game;