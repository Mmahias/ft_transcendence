import { axiosPrivate } from './axios-config';
import { User } from './types';

const USERS_API = `/users`


/*****************/
/*     USERS     */
/*****************/

// ---- CREATE ----

// ----- READ -----

class UserService{

  static async getMe(): Promise<User> {
    const response = await axiosPrivate.get<User>(`${USERS_API}/me`);
    return response.data;
  }
  
  static async getUserByUsername(username: string): Promise<User> {
    const response = await axiosPrivate.get<User>(`${USERS_API}/?username=${username}`);
    return response.data;
  }

  static async searchUsers(searchTerm: string, nbUsers: number): Promise< Partial<User>[] > {
    const response = await axiosPrivate.get<Partial<User>[]>(`${USERS_API}/searchUsers?searchTerm=${searchTerm}&nbUsers=${nbUsers}`);
    return response.data;
  }
}

export default UserService;