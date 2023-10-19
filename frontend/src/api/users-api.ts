import { axiosPrivate } from './axios-config';
import { User, UserUpdateDto } from './types';

const USERS_API = `/users`


/*****************/
/*     USERS     */
/*****************/


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

  static async getUserById(userId: number): Promise<User> {
    const response = await axiosPrivate.get<User>(`${USERS_API}/?userId=${userId}`);
    return response.data;
  }

  static async updateNickname(userId: number, userUpdate: UserUpdateDto): Promise<User> {
    const response = await axiosPrivate.put<User>(`${USERS_API}/update`, userUpdate, {
      params: { userId },
    });
    return response.data;
  }
  

  static async uploadAvatar(userId: number, avatarFile: File): Promise<void> {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    await axiosPrivate.post(`${USERS_API}/avatar`, formData, {
      params: { userId },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  static async getUserAvatar(userId: number): Promise<string> {
    const response = await axiosPrivate.get<string>(`${USERS_API}/avatar`, {
      params: { userId },
    });
    return response.data;
  }
}

export default UserService;