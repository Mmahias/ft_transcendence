// AuthService.ts
import { axiosPrivate, axiosPublic } from './axios-config';

const AUTH_API = `/auth`;

class AuthService {
    static async signUp(newUsername: string, password: string, newNickname: string) {
        try {
            const response = await axiosPublic.post(`${AUTH_API}/signup`, {
                username: newUsername,
                password: password,
                nickname: newNickname
            });
            return response.data;
        } catch (error) {
            throw new Error('A user with this nickname already exists');
        }
    }

    static async login(username: string, password: string) {
        try {
            const response = await axiosPublic.post(`${AUTH_API}/login`, {
                username: username,
                password: password
            });
            return response.data;
        } catch (error) {
            throw new Error('Invalid credentials');
        }
    }

    static async logout() {
        try {
            await axiosPrivate.post(`${AUTH_API}/logout`);
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }
}

export default AuthService;
