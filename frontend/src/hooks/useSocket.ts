import { SocketContext } from '../contexts';
import { useContext, useDebugValue } from 'react';
import { Socket } from 'socket.io-client';

export const useSocket = (): Socket | null => {
  const socketContext = useContext(SocketContext);
  if (!socketContext) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  const { socket } = socketContext;

  useDebugValue(socket, s => s?.connected ? "Connected" : "Disconnected");
  
  return socket;
}
