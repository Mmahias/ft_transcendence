import React, { createContext, useState, ReactNode, useCallback } from "react";
import { AxiosResponse } from 'axios';
import { axiosPublic } from "../api/axios-config";

export interface AuthState {
  accessToken?: string;
}

export interface AuthContextType {
  auth: AuthState;
  login: (data: AuthState) => void;
  logout: () => void;
  refreshToken: () => Promise<string>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({});

  const login = useCallback((data: AuthState) => {
    console.log("login", data);
    setAuth(data);
  }, []);

  const logout = useCallback(() => {
    setAuth({});
  }, []);

  const refreshToken = useCallback(async (): Promise<string> => {
    const response: AxiosResponse<{ accessToken: string }> = await axiosPublic.get('/refresh', {
        withCredentials: true
    });
    setAuth(prev => ({
        ...prev,
        accessToken: response.data.accessToken
    }));
    return response.data.accessToken;
}, []);
  
  return (
    <AuthContext.Provider value={{ auth, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
