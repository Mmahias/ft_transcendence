import { api, BASE_URL } from './config-api';
import { getMe, getUserByNickname } from './users-api';
import { Channel, Message, User } from './interfaces-api';

const AUTH_API = `/auth`


/*******************/
/*    CHANNELS     */
/*******************/

// ----- CREATE -----

export async function signUp(newNickname: string, password: string) {
  try {
    const response = await api.post(`${AUTH_API}/signup`,
      {
        nickname: newNickname,
        password: password
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;

  } catch (error) {
    throw new Error('A user with this nickname already exists');
  }
}

// ----- READ -----

export async function login(nickname: string, password: string) {
  try {
    const response = await api.post(`${AUTH_API}/login`,
      {
        nickname: nickname,
        password: password
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;

  } catch (error) {
    throw new Error('Invalid credentials');
  }
}

export async function checkIfLoggedIn(): Promise<boolean> {
  const response = await api.get<boolean>(`${AUTH_API}/isloggedin`);
  return response.data;
}

// ----- DELETE -----

export async function logout(): Promise<void> {
  try {
    await api.post(`${AUTH_API}/logout`);
    // maybe need to clear some cache on client side here ?
  } catch (error) {
    console.error('Error logging out:', error);
  }
}