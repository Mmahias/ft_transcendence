import { useContext, useDebugValue } from "react";
import AuthContext, { AuthContextType } from "../contexts/AuthContext";

export const useAuth = (): AuthContextType => {
    const authContext = useContext(AuthContext);

    if (!authContext) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    const { auth } = authContext;
    useDebugValue(auth, auth => auth?.accessToken ? "Logged In" : "Logged Out");

    return authContext;
};
