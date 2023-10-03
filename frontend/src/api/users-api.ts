import { axiosPrivate } from './axios-config';
import { User } from './interfaces-api';

const USERS_API = `/users`


/*****************/
/*     USERS     */
/*****************/

// ---- CREATE ----

// ----- READ -----

class UserService{

  static async getMe(): Promise<User> {
    const response = await axiosPrivate.get<User>(`${USERS_API}/me`);
    console.log("get me", response.data);
    return response.data;
  }
  
  static async getUserByNickname(username: string): Promise<User> {
    const response = await axiosPrivate.get<User>(`${USERS_API}/?nickname=${username}`);
    return response.data;
  } 
}

export default UserService;