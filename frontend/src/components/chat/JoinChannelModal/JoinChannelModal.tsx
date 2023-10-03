import React, { useState, useEffect } from 'react';
import Modal from '../../shared/Modal/Modal';
import ChatService from '../../../api/chat-api';
import { Channel } from '../../../api/interfaces-api';

// ChannelBox component
interface ChannelBoxProps {
  channel: Channel;
  onJoin: (channelId: number) => void;
}

const ChannelBox: React.FC<ChannelBoxProps> = ({ channel, onJoin }) => {
  return (
    <div className="channel-box">
      <div className="channel-header">
        <strong>{channel.name}</strong>
        {channel.mode === "private" && <span>(Private)</span>}
      </div>
      <div className="channel-details">
        <p>Owned by: {channel.owner.username}</p>
        <p>Last Updated: {new Date(channel.updatedAt).toLocaleDateString()}</p>
        <p>Members: {channel.joinedUsers.length}</p>
      </div>
      <div className="channel-actions">
        <button onClick={() => onJoin(channel.id)}>Join</button>
      </div>
    </div>
  );
}

// ChannelsContainer component
interface ChannelsContainerProps {
  channels: Channel[];
  onJoin: (channelId: number) => void;
}

const ChannelsContainer: React.FC<ChannelsContainerProps> = ({ channels, onJoin }) => {
  return (
    <div className="channels-container">
      {channels.map(channel => <ChannelBox key={channel.id} channel={channel} onJoin={onJoin} />)}
    </div>
  );
}

// JoinChannelModal component
interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const JoinChannelModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchChannels();
    }
  }, [isOpen]);

  const fetchChannels = async () => {
    try {
      const result = await ChatService.getAccessibleChannels();
      console.log('upd: ', result[0].updatedAt);
      setChannels(result);
    } catch (error) {
      console.error("Failed to fetch channels:", error);
      // TODO: Consider some user-friendly error notification.
    }
  }

  const handleJoin = (channelId: number) => {
    console.log(`Joining channel with ID: ${channelId}`);
    ChatService.updateMeInChannel(channelId, 'joinedUsers', 'connect');
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Channel">
      <ChannelsContainer channels={channels} onJoin={handleJoin} />
    </Modal>
  );
}

export default JoinChannelModal;
