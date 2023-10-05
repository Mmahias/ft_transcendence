import React, { createContext, useState, ReactNode, useCallback } from "react";
import { AxiosResponse } from 'axios';
import { axiosPublic } from "../api/axios-config";

export interface AuthState {
  accessToken?: string;
}

export interface AuthContextType {
  auth: AuthState;
  isAuthAvailable: (auth: AuthState) => boolean;
  login: (data: AuthState) => void;
  logout: () => void;
  refreshToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const isAuthAvailable = (auth: AuthState) => {
  return !!auth.accessToken;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {

  const initialAuth = JSON.parse(localStorage.getItem("auth") || "{}");
  const [auth, setAuth] = useState<AuthState>(initialAuth);

  const login = useCallback((data: AuthState) => {
    console.log("login", data);
    localStorage.setItem("auth", JSON.stringify(data));
    setAuth(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth");
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
    <AuthContext.Provider value={{ auth, isAuthAvailable: () => isAuthAvailable(auth), login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
