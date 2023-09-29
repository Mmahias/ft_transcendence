import { api, BASE_URL } from './axios-config';
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
