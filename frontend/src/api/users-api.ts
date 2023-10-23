import { axiosPrivate } from './axios-config';
import { User, UserUpdateDto, Match, UserAchievement } from './types';

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
    const response = await axiosPrivate.get<Blob>(`${USERS_API}/avatar`, {
      params: { userId },
      responseType: 'blob'
    });
    const imageUrl = URL.createObjectURL(response.data);

    return imageUrl;
  }
  

  static async getMatchHistory(userId: number): Promise< Match[] > {
    const response = await axiosPrivate.get<Match[]>(`${USERS_API}/getMatchHistory?userId=${userId}`);
    return response.data;
  }
  static async getAchievements(userId: number): Promise< UserAchievement[] > {
    const response = await axiosPrivate.get<UserAchievement[]>(`${USERS_API}/getAchievements?userId=${userId}`);
    return response.data;
  }

  static async getUserAvatarByUsername(username: string): Promise<string> {
    const response = await axiosPrivate.get<Blob>(`${USERS_API}/avatar/${username}`, {
      responseType: 'blob'
    });
    const imageUrl = URL.createObjectURL(response.data);
    return imageUrl;
  }
  

}

export default UserService;