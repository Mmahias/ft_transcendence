import React, { createContext, useState, ReactNode, useEffect } from "react";
import UserService from "../api/users-api";
import AuthService from "../api/auth-api";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<(AuthState & { 
  logout: () => Promise<void>; 
  checkIsLoggedIn: () => Promise<void>;
}) | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);

  const checkIsLoggedIn = async () => {
    try {
      const response = await UserService.isLoggedIn();
      setAuthState({
        isAuthenticated: !!response,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.log("User not authenticated");
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error))
      });
    }
  };
  
  const logout = async () => {
    try {
      await AuthService.logout();
      setAuthState(prevState => ({
        ...prevState,
        isAuthenticated: false
      }));
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    checkIsLoggedIn();
    const intervalId = setInterval(checkIsLoggedIn, 30000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, logout, checkIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
