// AuthService.ts
import axios from 'axios';
import UserService from './users-api';
import { axiosPrivate, axiosPublic } from './axios-config';
import { useAuth } from '../hooks/useAuth';

const AUTH_API = `/auth`;

class AuthService {

  static async signUp(newUsername: string, password: string, newNickname: string) {
    try {
    const response = await axiosPublic.post(`${AUTH_API}/signup`, {
      username: newUsername,
      password: password,
      nickname: newNickname
    });
    if (response.status !== 201) {
      return Promise.reject("Sign up failed")
    }
    return ;
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
      const me = await UserService.getMe();
      // console.log("me", me.id)
      await axiosPrivate.post(`${AUTH_API}/logout`, { userId: me.id });
    }  catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.data) {
        console.error('Error logging out efbe:', error.response.data);
      } else {
        console.error('Error logging out:', error);
      }
    }
  }

  // Génère le QR Code pour le 2FA
  static async generate2FAQRCode() {
    try {
      const response = await axiosPrivate.post(`${AUTH_API}/2fa/generate`);
      return response.data;
    } catch (error) {
      console.error('Error in generate2FAQRCode:', error);
      throw new Error('Failed to generate 2FA QRCode');
    }
  }

  // Vérifie si le 2FA est activé pour l'utilisateur
   static async check2FAStatus() {
    try {
      const response = await axiosPrivate.get(`${AUTH_API}/2fa/is-turn-on`);
      return response.data.isAuthenticationEnabled;
    } catch (error) {
      // console.error('Une erreur s\'est produite lors de la vérification de la double authentification à deux facteurs :', error);
      return false;
    }
  }

  static async check2FAStatusLogin() {
    try {
      const response = await axiosPublic.get(`${AUTH_API}/2fa/check2fa`);
      return response.data.isAuthenticationEnabled;
    } catch (error) {
      console.error('Une erreur s\'est produite lors de la vérification de la double authentification à deux facteurs :', error);
      return false;
    }
  }

  // Active le 2FA pour l'utilisateur
  static async enable2FA(code: string) {
    try {
      const response = await axiosPrivate.post(`${AUTH_API}/2fa/turn-on`, { twoFactorAuthenticationCode: code });
      return response.status;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.data && error.response.data.message) {
          throw new Error(error.response.data.message);
        }
      }
      throw new Error('Failed to enable 2FA');
    }
  }

  // Désactive le 2FA pour l'utilisateur
  static async disable2FA() {
    try {
      // Ajoutez ici la logique pour désactiver le 2FA
      return axiosPrivate.post(`${AUTH_API}/2fa/turn-off`);
    } catch (error) {
      throw new Error('Failed to disable 2FA');
    }
  }

  // Authentifie l'utilisateur avec le 2FA
  static async authenticate2FA(code: string) {
    try {
      const response = await axiosPrivate.post(`${AUTH_API}/2fa/authenticate`, { twoFactorAuthenticationCode: code });
      return response.data;
    } catch (error) {
      throw new Error('Failed verify 2FA QRCode');
    }
  }  

}

export default AuthService;

