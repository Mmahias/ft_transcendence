import React, { createContext, useState, ReactNode, useEffect } from "react";
import UserService from "../api/users-api";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: any;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  error: null
}

const AuthContext = createContext<AuthState | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);

  const checkIsLoggedIn = async () => {
    try {
      const response = await UserService.isLoggedIn();
      setAuthState({
        isAuthenticated: !!response,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.log("User not authenticated");
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: error
      });
    }
  };

  useEffect(() => {
    checkIsLoggedIn();

    const intervalId = setInterval(() => {
      checkIsLoggedIn();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
