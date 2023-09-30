import { axiosPrivate } from './axios-config';
import { getMe, getUserByNickname } from './users-api';
import { Channel, Message, User } from './interfaces-api';

const CHAT_API = `/chat`


/*******************/
/*    CHANNELS     */
/*******************/

// ----- CREATE -----

export async function createChannel(name: string, mode: string, password?: string)
  : Promise<Channel> {
  try {
    const user: User = await getMe();
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

export async function getChannelById(id: number): Promise<Channel> {
  const response = await axiosPrivate.get<Channel>(`${CHAT_API}/channel/${id}`);
  return response.data;
}

export async function getChannelByName(name: string): Promise<Channel> {
  const response = await axiosPrivate.get<Channel>(`${CHAT_API}/channel/find/${name}`);
  return response.data;
}

export async function getAccessibleChannels(): Promise<Channel[]> {
  const user: User = await getMe();
  const response = await axiosPrivate.get<Channel[]>(`${CHAT_API}/channel/access/${user.id}`);
  return response.data;
}

export async function verifyPasswords(channelId: number, userInput: string): Promise<boolean> {
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

export async function updateUserInChannel(name: string, channelId: number, usergroup: string, action: string) {
  try {
    const response = await axiosPrivate.post(`${CHAT_API}/channel/${channelId}/users`,
      {
        name,
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

export async function updateMeInChannel(channelId: number, usergroup: string, action: string) {
  try {
    const user = await getMe();
    const response = await axiosPrivate.post(`${CHAT_API}/channel/${channelId}/users`,
      {
        userId: user.id,
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

export async function leaveChannel(userId: number, channelId: number) {
  try {
    const response = await axiosPrivate.delete(`${CHAT_API}/channel/${channelId}/users`,
      {
        data: { userId },
      });
    return response.data;
  } catch (error) {
    throw new Error("An error occured: you did not leave this channel.")
  }
}

/**
 * @param from sender id
 * @param to recipient (channel name)
 * @param content message
 * @param channelId channel id
 * @returns message object
 */
export async function newMessage(channel: Channel, content: string): Promise<Message> {

  try {
    const { name, id } = channel;
    const user: User = await getMe();
    const response = await axiosPrivate.post(`${CHAT_API}/message`,
      {
        fromId: user.id,
        to: name,
        content: content,
        channelId: id
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

export async function getAllMessages(channelId: number): Promise<Message[]> {
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

export async function deleteAllMessages(channelId: number) {
  try {
    return axiosPrivate.delete(`${CHAT_API}/messages/${channelId}`);
  } catch (error) {
    throw new Error("API error: messages not deleted");
  }
}


export async function getDMs(senderUsername: string, receiverUsername: string): Promise<Channel> {
  try {
    // gets the users and check if they can communicate
    let sender: User = await getUserByNickname(senderUsername);
    if (!sender) {
      throw new Error('Error: sender does not exist');
    }
    let receiver: User = await getUserByNickname(receiverUsername);
    if (!receiver) {
      throw new Error('Error: receiver does not exist');
    }
    if (receiver.blockedList && receiver.blockedList.some((user) => user.id === sender.id)) {
      throw new Error('You are blocked by this user');
    }
    if (sender.blockedList && sender.blockedList.some((user) => user.id === receiver.id)) {
      throw new Error('You blocked this user');
    }

    const roomName = [senderUsername, receiverUsername]
      .map(name => name.toLowerCase()) // Convert to lowercase to ensure case-insensitivity
      .sort()                          // Sort the names alphabetically
      .join('@');                      // Separate the names with an '@' symbol
    let conv: Channel = await getChannelByName(roomName);
    if (!conv) {
      conv = await createChannel(roomName, 'DM');
    }
    await updateUserInChannel(sender.id, conv.id, 'joinedUsers', 'connect');
    return conv;
  } catch (error) {
    throw new Error('Error: cannot establish the DMs');
  }
}