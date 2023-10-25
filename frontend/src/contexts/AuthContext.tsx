import React, { createContext, useState, ReactNode, useCallback } from "react";
import { axiosPrivate } from "../api/axios-config";
import AuthService from "../api/auth-api";
export interface AuthState {
  accessToken: string | null;
}

export enum AuthStatus {
  DISCONNECTED = "DISCONNECTED",
  PARTIALLY_AUTHENTICATED = "PARTIALLY_AUTHENTICATED",
  FULLY_AUTHENTICATED = "FULLY_AUTHENTICATED",
}

export interface AuthContextType {
  auth: AuthState;
  authStatus: AuthStatus;
  setAuthStatus: (authStatus: AuthStatus) => void;
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
  const [authStatus, setAuthStatus] = useState<AuthStatus>(AuthStatus.DISCONNECTED);

  const login = useCallback((data: AuthState) => {
    localStorage.setItem("auth", JSON.stringify(data));
    setAuth(data);
    
    // Set token for axios immediately after login
    axiosPrivate.defaults.headers['Authorization'] = `Bearer ${data.accessToken}`;

    const check2FAStatusAndSetAuth = async () => {
      const isTwoFAActive1 = await AuthService.check2FAStatus();
      const isTwoFAActive2 = await AuthService.check2FAStatus();
      setAuthStatus(isTwoFAActive2 ? AuthStatus.PARTIALLY_AUTHENTICATED : AuthStatus.FULLY_AUTHENTICATED);
      console.log("2FA status:", isTwoFAActive2);
    };

    check2FAStatusAndSetAuth();
}, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth");
    setAuth({ accessToken: null });
    setAuthStatus(AuthStatus.DISCONNECTED);
  }, []);

  const refreshToken = useCallback((): string | null => {
    const storedToken = localStorage.getItem("auth");
    if (storedToken) {
        const parsedToken = JSON.parse(storedToken);
        // console.log("Parsed token object:", parsedToken);
        // console.log("Access token from parsed token:", parsedToken.accessToken);
        setAuth(parsedToken);
        return parsedToken.accessToken;
    }
    return null;
}, []);

return (
  <AuthContext.Provider value={{ auth, authStatus, setAuthStatus, isAuthAvailable: () => isAuthAvailable(auth), login, logout, refreshToken }}>
    {children}
  </AuthContext.Provider>
);
}

export default AuthContext;
