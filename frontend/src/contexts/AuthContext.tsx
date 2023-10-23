import React, { createContext, useState, ReactNode, useCallback } from "react";

export interface AuthState {
  accessToken: string | null;
}

export interface AuthContextType {
  auth: AuthState;
  isAuthAvailable: (auth: AuthState) => boolean;
  login: (data: AuthState) => void;
  logout: () => void;
  refreshToken: () => string | null;
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
    localStorage.setItem("auth", JSON.stringify(data));
    setAuth(data);
    console.log('New token saved to localStorage:', data.accessToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth");
    setAuth({ accessToken: null });
  }, []);

  const refreshToken = useCallback((): string | null => {
    const storedToken = localStorage.getItem("auth");
    if (storedToken) {
        const parsedToken = JSON.parse(storedToken);
        console.log('Refresh:', parsedToken);
        setAuth(parsedToken);
        // console.log('New token from localStorage:', parsedToken.accessToken);
        return parsedToken.accessToken;
    }
    return null;
}, []);

  return (
    <AuthContext.Provider value={{ auth, isAuthAvailable: () => isAuthAvailable(auth), login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
