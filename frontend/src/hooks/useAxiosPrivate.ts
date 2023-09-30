import { useEffect } from "react";
import { AxiosInstance } from 'axios';
import useAuth from "./useAuth";
import { axiosPrivate } from "../api/axios-config";

const useAxiosPrivate = (): AxiosInstance => {
    const { auth, refreshToken } = useAuth();

    useEffect(() => {

      const requestIntercept = axiosPrivate.interceptors.request.use(
        config => {
            config.headers['Authorization'] = `Bearer ${auth?.accessToken}`;
            console.log("inter", config.headers.Authorization);
            return config;
        }, (error) => Promise.reject(error)
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
        response => response,
        async (error) => {
            const prevRequest = error?.config;
            if (error?.response?.status === 403 && !prevRequest?.sent) {
                prevRequest.sent = true;
                const newAccessToken = await refreshToken();
                prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return axiosPrivate(prevRequest);
            }
            return Promise.reject(error);
        }
    );

    return () => {
        axiosPrivate.interceptors.request.eject(requestIntercept);
        axiosPrivate.interceptors.response.eject(responseIntercept);
    }
    }, [auth, refreshToken]);

    return axiosPrivate;
};

export default useAxiosPrivate;
