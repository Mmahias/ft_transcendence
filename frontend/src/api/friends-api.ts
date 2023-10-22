import { axiosPrivate } from './axios-config';
import { FriendRequest, User } from './types';

const FRIENDS_API = '/friends';

/*****************/
/*     FRIENDS    */
/*****************/

class FriendsService {
    static async sendFriendRequest(username: string): Promise<void> {
      const response = await axiosPrivate.post(`${FRIENDS_API}/request`, { username });
      return response.data;
    }
  
    static async acceptFriendRequest(friendUsername: string): Promise<void> {
      const response = await axiosPrivate.post(`${FRIENDS_API}/request/accepted/${friendUsername}`);
      return response.data;
    }
  
    static async refuseFriendRequest(friendUsername: string): Promise<void> {
      const response = await axiosPrivate.post(`${FRIENDS_API}/request/refused/${friendUsername}`);
      return response.data;
    }
  
    static async deleteFriend(friendUsername: string): Promise<void> {
      const response = await axiosPrivate.delete(`${FRIENDS_API}/delete/${friendUsername}`);
      return response.data;
    }
  }
  
  export default FriendsService;