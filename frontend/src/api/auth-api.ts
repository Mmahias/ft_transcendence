// AuthService.ts
import axios, {AxiosError} from 'axios';
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
            console.log('signup: ', response.data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data && error.response.data.message) {
                    // Use the error message from the backend
                    throw new Error(error.response.data.message);
                }
            }
            throw new Error('A user with this nickname already exists');
        }
    }

    static async login(username: string, password: string) {
        try {
            const response = await axiosPublic.post(`${AUTH_API}/login`, {
                username: username,
                password: password
            });
            console.log('login: ', response.data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data && error.response.data.message) {
                    // Use the error message from the backend
                    throw new Error(error.response.data.message);
                }
            }
            throw new Error('Invalid credentials');
        }
    }

    static async logout() {
        try {
            await axiosPrivate.post(`${AUTH_API}/logout`);
        }  catch (error) {
            if (axios.isAxiosError(error) && error.response && error.response.data) {
                console.error('Error logging out:', error.response.data);
            } else {
                console.error('Error logging out:', error);
            }
        }
    }


    // 2FA
    // static async enable2FA() {
    //     try {
    //       const response = await axiosPrivate.post(`${AUTH_API}/2fa/turn-on`);
    //       return response.data;
    //     } catch (error) {
    //       if (axios.isAxiosError(error)) {
    //         if (error.response && error.response.data && error.response.data.message) {
    //           // Utilisez le message d'erreur du backend
    //           throw new Error(error.response.data.message);
    //         }
    //       }
    //       throw new Error('Failed to enable 2FA');
    //     }
    //   }

    static async enable2FA(code: string) {
      try {
          const response = await axiosPrivate.post(`${AUTH_API}/2fa/turn-on`, { twoFactorAuthenticationCode: code });
          return response.data;
      } catch (error) {
          if (axios.isAxiosError(error)) {
              if (error.response && error.response.data && error.response.data.message) {
                  throw new Error(error.response.data.message);
              }
          }
          throw new Error('Failed to enable 2FA');
      }
  }

      // 2FA QRCODE

      static async request2FAQrCode() {
        try {
          const response = await axiosPrivate.post(`${AUTH_API}/2fa/generate`);
          return response.data; // Cela devrait être l'URL otpauth ou les données du QR code
        } catch (error) {
          console.error('Error in request2FAQrCode:', error);
          throw new Error('Failed to request 2FA QRCode');
        }
      }
      
      
      static async verify2FACode(code: string) {
        try {
          const response = await axiosPrivate.post(`${AUTH_API}/2fa/authenticate`, { twoFactorAuthenticationCode: code });
          return response.data;
        } catch (error) {
          throw new Error('Failed verify 2FA QRCode');
        }
      }
}

export default AuthService;
