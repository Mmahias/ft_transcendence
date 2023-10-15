import React, { useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChatStatusContext } from '../../contexts';
import { useSocket } from '../../hooks';
import ChatService from '../../api/chat-api';
import UsersService from '../../api/users-api';
import { Channel, User } from '../../api/types';
import { ChanMode } from '../../shared/types';
import SocketService from "../../sockets/sockets";
import '../../styles/Tab_channels.css';

interface ChannelListItemProps {
  channel: Channel;
  onClick?: (channel: Channel) => void;
}

const ChannelLinkItem: React.FC<ChannelListItemProps> = ({ channel, onClick }) => {
  const formattedDate = channel?.updatedAt
    ? new Intl.DateTimeFormat('en-GB').format(new Date(channel.updatedAt))
    : '';

  const [convName, setConvName] = useState<string>(channel.name);

  const { data: myDetails, error, isLoading, isSuccess } = useQuery(['me'], UsersService.getMe, {
    refetchOnWindowFocus: false,
    onError: (error: any) => {
      if (error.response?.status === 401) {
        console.error('user not connected');
      }
    },
  });

  useEffect(() => {
    if (channel.mode === ChanMode.DM && myDetails) {
      console.log('convName', convName);
      const parts = convName.split('@');
      setConvName(myDetails.username === parts[0] ? parts[1] : parts[0]);
    }
  }, [myDetails, channel]);

  return (
    <div className="channel-link-item" onClick={() => onClick?.(channel)}>
    <span className="channel-link-name truncate-text">{convName}</span>
    <span className="channel-link-mode truncate-text">{channel?.mode}</span>
    <span className="channel-link-members truncate-text">{channel?.joinedUsers.length}</span>
    <span className="channel-link-last-update truncate-text">{formattedDate}</span>
    <span className="channel-link-msg-count truncate-text">{channel?.nbMessages}</span>
  </div>
);
};

const TabChannels: React.FC = () => {
  
  const { setActiveTab, setActiveChan } = useContext(ChatStatusContext);
  const socket = useSocket();

  const [displayedChannels, setDisplayedChannels] = useState<Channel[]>([]);
  const { data: joinedChannels, error, isLoading, isSuccess } = useQuery(['channels'], ChatService.getMyChannels);
  
  const isBlockedByUser = async (targetUsername: string, username: string): Promise<boolean> => {
    const user = await UsersService.getUserByUsername(username);
    return user.blockedList.some(blocked => blocked.username === targetUsername);
  };

  useEffect(() => {
    const checkBlockedChannels = async () => {
      if (!joinedChannels) return;

      const promises = joinedChannels.map(async (chan) => {
        if (chan.mode !== ChanMode.DM) return chan;

        const [userA, userB] = chan.name.split('@');
        const isBlocked = await isBlockedByUser(userA, userB) || await isBlockedByUser(userB, userA);
        return isBlocked ? null : chan;
      });

      const filteredChannels = (await Promise.all(promises)).filter(Boolean) as Channel[];
      setDisplayedChannels(filteredChannels);
    };

    checkBlockedChannels();
  }, [joinedChannels]);

  const handleChannelClick = (channel: Channel) => {
    if (socket && channel.name) {
      SocketService.sendNotificationToServer(socket, 'joinRoom', String(channel.id));
    }
    setActiveChan(channel);
    setActiveTab(1);
  };

  if (error) return <div>Error</div>;
  if (isLoading || !isSuccess) return <div>Loading...</div>;

  return (
    <div className="channels_page">
      <h3 id="channels_page_title">Your channels:</h3>
      <div className="channel-link-header">
        {/* ... header rendering ... */}
      </div>
      <div id="channels_page_joinedscroll">
        {displayedChannels.map(chan => (
          <div key={chan.id} onClick={() => handleChannelClick(chan)}>
            <ChannelLinkItem channel={chan} />
          </div>
        ))}
        {!displayedChannels.length && 
          <div className="channels_page-noconv">
            <h6>You have not joined any channels yet!</h6>
            <h6>Don't be shy, start talking to someone or join a group conversation!</h6>
          </div>
        }
      </div>
    </div>
  );
}

export default TabChannels;
