import React, { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useDebugValue } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks';

export interface SocketContextType {
  socket: Socket | null;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { auth, logout } = useAuth();

  useEffect(() => {
    if (auth.accessToken) {
      let newSocket : Socket = io('/', {  // or just '/' if your server setup serves socket.io at the root
        path: '/socket.io', // Ensure this path matches with your backend socket.io path setup
        auth: {
          token: auth.accessToken,
        },
      });
      newSocket.on("connect", () => {
        setSocket(newSocket);
        console.log('New socket created. Socket ID:', newSocket?.id || 'Not yet connected');
      });
      socket?.connect();
      
      return () => {
        if (newSocket) {
          newSocket.close();
        }
      }
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('connect_error', (error) => {
        console.error("Connection error");
        // FIX IT: Show a notification to the user, or handle the error in another way
      });
      socket.on('reconnect', () => {
        console.log("Successfuly reconnected");
        // FIX IT: Update any UI state to reflect the reconnected status
      });
    }
    return () => {
      if (socket) {
        socket.off('connect_error');
        socket.off('reconnect');
      }
    };
  }, [socket]);

  useEffect(() => {
      return () => {
          if (socket) {
              socket.close();
          }
      };
  }, [logout]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

