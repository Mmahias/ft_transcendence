import { useContext, useDebugValue } from "react";
import AuthContext from "../contexts/AuthContext";

export const useAuth = () => {
    const authState = useContext(AuthContext);

    if (!authState) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    useDebugValue(authState.isAuthenticated, auth => auth ? "Logged In" : "Logged Out");

    return authState;
};
