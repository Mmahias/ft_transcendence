import React, { useState, useEffect } from 'react';
import Modal from '../../src/components/shared/Modal/Modal';
import ChatService from '../../src/api/chat-api';
import { Channel } from '../../src/api/types';
import {
  ChannelBoxStyled,
  ChannelHeader,
  ChannelDetails,
  ChannelActions,
  JoinButton,
  ChannelsContainerStyled,
  DetailItem
} from './JoinChannelModal.styles';

// ChannelBox component
interface ChannelBoxProps {
  channel: Channel;
  onChannelJoined: (channelId: number) => void;
  onClose: () => void; 
}

const ChannelBox: React.FC<ChannelBoxProps> = ({ channel, onChannelJoined, onClose }) =>  {
  const handleJoinClick = (channelId: number) => {
    onChannelJoined(channelId);
    onClose();  // Close the modal
  };

  return (
    <ChannelBoxStyled>
      <ChannelHeader>
        <strong>{channel.name}</strong>
        {channel.mode === "private" && <span>(Private)</span>}
      </ChannelHeader>
      <ChannelDetails>
        <DetailItem>Owned by: {channel.owner.username}</DetailItem>
        <DetailItem>Last Updated: {new Date(channel.updatedAt).toLocaleDateString()}</DetailItem>
        <DetailItem>Members: {channel.joinedUsers.length}</DetailItem>
      </ChannelDetails>
      <ChannelActions>
        <JoinButton onClick={() => handleJoinClick(channel.id)}>Join</JoinButton>
      </ChannelActions>
    </ChannelBoxStyled>
  );
}

// ChannelsContainer component
interface ChannelsContainerProps {
  channels: Channel[];
  onChannelJoined: (channelId: number) => void;
  onClose: () => void;
}

const ChannelsContainer: React.FC<ChannelsContainerProps> = ({ channels, onChannelJoined, onClose }) => {
  return (
    <ChannelsContainerStyled>
      {channels.map(channel => <ChannelBox key={channel.id} channel={channel} onChannelJoined={onChannelJoined} onClose={onClose} />)}
    </ChannelsContainerStyled>
  );
}

// JoinChannelModal component
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onChannelJoined?: () => void; // Add this line
}

const JoinChannelModal: React.FC<Props> = ({ isOpen, onClose, onChannelJoined }) => {
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
    
    if (onChannelJoined) {
      onChannelJoined();
    }
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Channel">
      <ChannelsContainer channels={channels} onChannelJoined={handleJoin} onClose={onClose} />
    </Modal>
  );
}

export default JoinChannelModal;
