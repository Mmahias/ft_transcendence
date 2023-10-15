import { axiosPrivate } from './axios-config';
import UserService from './users-api';
import { Channel, Message, User } from './types';
import { ChanMode } from '../shared/types';

const CHAT_API = `/chat`


/*******************/
/*    CHANNELS     */
/*******************/

// ----- CREATE -----
class ChatService {
  static async createChannel(name: string, mode: ChanMode, password?: string)
    : Promise<Channel> {
    try {
      const user: User = await UserService.getMe();
      const userId: number = user.id;
      const response = await axiosPrivate.post(`${CHAT_API}/channel`,
        {
          name: name,
          ownerId: userId,
          password: password || null,
          mode: mode,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;

    } catch (error) {
      throw new Error('An error occured: channel not created (maybe a channel with the same name already exists)');
    }
  }

  // ----- READ -----

  static async getChannelById(id: number): Promise<Channel> {
    const response = await axiosPrivate.get<Channel>(`${CHAT_API}/channel/${id}`);
    return response.data;
  }

  static async getChannelByName(name: string): Promise<Channel> {
    const response = await axiosPrivate.get<Channel>(`${CHAT_API}/channel?name=${name}`);
    return response.data;
  }

  static async getMyChannels(): Promise<Channel[]> {
    const user: User = await UserService.getMe();
    const response = await axiosPrivate.get<Channel[]>(`${CHAT_API}/users/${user.id}/channels`);
    return response.data;
  }

  static async getAccessibleChannels(): Promise<Channel[]> {
    const user: User = await UserService.getMe();
    const response = await axiosPrivate.get<Channel[]>(`${CHAT_API}/channel/access/${user.id}`);
    return response.data;
  }


  static async verifyPasswords(channelId: number, userInput: string): Promise<boolean> {
    try {
      const response = await axiosPrivate.get<boolean>(`${CHAT_API}/channel/${channelId}/password-check`,
      {
        params: {
          userInput: userInput,
          },
      });
      return response.data;
    } catch (error) {
      throw new Error('Wrong password dumdum');
    }
  }

  // ----- UPDATE -----

  static async updateChannel(channelId: number,  property: keyof Channel, newValue: string) {
    try {
      const response = await axiosPrivate.patch(`${CHAT_API}/channel/${channelId}`,
      {
        [property]: newValue
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
      );
      return response.data;
    } catch (error) {
      throw new Error('Error: cannot join this channel');
    }
  }

  // cette fonction est utilisée pour update le status dun user dans un chan
  // on peut kick, ban, mute etc
  // cf backend/src/chat/chat.controller.ts puis la fct quil appelle pour lusage
  // usergroup can be in ['adminUsers', 'joinedUsers', 'bannedUsers', 'kickedUsers', 'mutedUsers']
  // action can be ['connect', 'disconnect'] to join or leave the group
  static async updateUserInChannel(id: number, channelId: number, usergroup: string, action: string) {
    try {
      const response = await axiosPrivate.post(`${CHAT_API}/channel/${channelId}/users`,
        {
          id,
          usergroup,
          action,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error('Error: cannot join this channel');
    }
  }

  static async updateMeInChannel(channelId: number, usergroup: string, action: string) {
    try {
      const user = await UserService.getMe();
      const response = await axiosPrivate.post(`${CHAT_API}/channel/${channelId}/users`,
        {
          id: user.id,
          usergroup,
          action,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error('Error: cannot join this channel');
    }
  }

  static async leaveChannel(userId: number, channelId: number) {
    try {
      const response = await axiosPrivate.delete(`${CHAT_API}/channel/${channelId}/users`,
        {
          data: { id: userId },
        });
      return response.data;
    } catch (error) {
      throw new Error("An error occured: you did not leave this channel.")
    }
  }

  /**
  ** @param from sender id
  ** @param to recipient (channel name)
  ** @param content message
  ** @param channelId channel id
  ** @returns message object
  **/
  static async newMessage(channelId: number, content: string): Promise<Message> {

    try {
      const channel: Channel = await ChatService.getChannelById(channelId);
      const user: User = await UserService.getMe();
      const response = await axiosPrivate.post(`${CHAT_API}/message`,
        {
          fromId: user.id,
          to: channel.name,
          content: content,
          channelId: channelId,
          fromUsername: user.username,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error("API error: message not created");
    }
  }

  static async getAllMessages(channelId: number): Promise<Message[]> {
    try {
      const response = await axiosPrivate.get(`${CHAT_API}/messages/${channelId}`);
      const messages: Message[] = response.data.map((message: Message) => ({
        ...message,
        date: new Date(message.date),
      }));

      return messages;
    } catch (error) {
      throw new Error("API error: could not get messages");
    }
  }

  static async deleteAllMessages(channelId: number) {
    try {
      return axiosPrivate.delete(`${CHAT_API}/messages/${channelId}`);
    } catch (error) {
      throw new Error("API error: messages not deleted");
    }
  }

  static async getDMs(senderUsername: string, receiverUsername: string): Promise<Channel> {
    try {
      // gets the users and check if they can communicate
      if (!senderUsername || !receiverUsername) {
        throw new Error('missing username');
      }
      if (senderUsername == receiverUsername) {
        throw new Error('cannot DM yourself');
      }
      let sender: User = await UserService.getUserByUsername(senderUsername);
      if (!sender) {
        throw new Error('sender does not exist');
      }
      let receiver: User = await UserService.getUserByUsername(receiverUsername);
      if (!receiver) {
        throw new Error('receiver does not exist');
      }
      if (receiver.blockedList && receiver.blockedList.some((user) => user.id === sender.id)) {
        throw new Error('you are blocked by this user');
      }
      if (sender.blockedList && sender.blockedList.some((user) => user.id === receiver.id)) {
        throw new Error('you blocked this user');
      }
      
      const name = [senderUsername, receiverUsername]
      .map(name => name.toLowerCase()) // Convert to lowercase to ensure case-insensitivity
      .sort()                          // Sort the names alphabetically
      .join('@');                      // Separate the names with an '@' symbol
      console.log("getDMs: ", senderUsername, receiverUsername)
      let conv: Channel = await ChatService.getChannelByName(name);
      if (!conv) {
        conv = await ChatService.createChannel(name, ChanMode.DM);
        ChatService.updateUserInChannel(receiver.id, conv.id, 'joinedUsers', 'connect');
      }
      return conv;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export default ChatService;