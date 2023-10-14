import React, { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChatStatusContext } from '../../contexts';
import { useSocket } from '../../hooks';
import ChatService from '../../api/chat-api';
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

  return (
    <div className="channel-link-item" onClick={() => onClick?.(channel)}>
      <span className="channel-link-name truncate-text">{channel?.name}</span>
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
  const { data: joinedChannels, error, isLoading, isSuccess } = useQuery(['channels'], ChatService.getMyChannels);

  const isBlockedByUser = (targetUser: User, user: User) => user.blockedList.some(blocked => blocked.id === targetUser.id);

  const isBlockedInDM = (channel: Channel) => {
    console.log("goobs", channel.joinedUsers);
    return false;
    if (channel.mode !== ChanMode.DM) return false;
    const [userA, userB] = channel.joinedUsers;
    return !!(userA && userB && (isBlockedByUser(userA, userB) || isBlockedByUser(userB, userA)));
  };

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
        <span className="channel-link-name truncate-text">Channel</span>
        <span className="channel-link-mode truncate-text">Mode</span>
        <span className="channel-link-members truncate-text">Members</span>
        <span className="channel-link-last-update truncate-text">Last message</span>
        <span className="channel-link-msg-count truncate-text">Messages sent</span>
      </div>
      <div id="channels_page_joinedscroll">
        {joinedChannels && joinedChannels.map(chan => (
          (chan.mode !== ChanMode.DM || !isBlockedInDM(chan)) &&
          <div key={chan.id} onClick={() => handleChannelClick(chan)}>
            <ChannelLinkItem channel={chan} />
          </div>
        ))}
        {!joinedChannels?.length && 
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
