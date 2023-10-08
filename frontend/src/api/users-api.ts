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
    console.log("API 1 ", response.data);
    return response.data;
  }
  
  static async getUserByUsername(username: string): Promise<User> {
    const response = await axiosPrivate.get<User>(`${USERS_API}/?username=${username}`);
    console.log("API 2 ",username, response.data);
    return response.data;
  }

  static async searchUsers(searchTerm: string, nbUsers: number): Promise< Partial<User>[] > {
    const response = await axiosPrivate.get<Partial<User>[]>(`${USERS_API}/searchUsers?searchTerm=${searchTerm}&nbUsers=${nbUsers}`);
    console.log(response.data);
    return response.data;
  }
}

export default UserService;