import { api, BASE_URL } from './config-api';
import { User } from './interfaces-api';

const USERS_API = `/users`


/*****************/
/*     USERS     */
/*****************/

// ---- CREATE ----

// ----- READ -----

export async function getMe(): Promise<User> {
  const response = await api.get<User>(`${USERS_API}/me`);
  return response.data;
}

export async function getUserByNickname(username: string): Promise<User> {
  const response = await api.get<User>(`${USERS_API}/?nickname=${username}`);
  return response.data;
}

export async function checkIfLoggedIn(): Promise<boolean> {
  const response = await api.get<boolean>(`${USERS_API}/logincheck`);
  return response.data;
}

export async function logout(): Promise<void> {
  try {
    await api.post(`${USERS_API}/logout`);
    // maybe need to clear some cache on client side here ?
  } catch (error) {
    console.error('Error logging out:', error);
  }
}