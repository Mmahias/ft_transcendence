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
  const { auth } = useAuth();

  useEffect(() => {
    let newSocket: Socket | null = null;
  
    if (auth.accessToken) {  // If there's an access token, initialize the socket
      newSocket = io('YOUR_SERVER_URL_HERE', {
        auth: {
          token: auth.accessToken,
        },
      });
      setSocket(newSocket);
    }
  
    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, [auth]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

