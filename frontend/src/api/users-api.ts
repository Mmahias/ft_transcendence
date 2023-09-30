import { axiosPrivate } from './axios-config';
import { User } from './interfaces-api';

const USERS_API = `/users`


/*****************/
/*     USERS     */
/*****************/

// ---- CREATE ----

// ----- READ -----

export async function getMe(): Promise<User> {
  const response = await axiosPrivate.get<User>(`${USERS_API}/me`);
  return response.data;
}

export async function getUserByNickname(username: string): Promise<User> {
  const response = await axiosPrivate.get<User>(`${USERS_API}/?nickname=${username}`);
  return response.data;
}
