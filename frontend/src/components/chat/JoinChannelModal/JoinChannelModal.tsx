import React, { useState, useEffect } from 'react';
import Modal from '../../shared/Modal/Modal';
import ChatService from '../../../api/chat-api';
import ChannelsContainer from '../ChannelsContainer/ChannelsContainer';
import { Channel } from '../ChannelBox/ChannelBox'; // Import the Channel type

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
      setChannels(result);
    } catch (error) {
      console.error("Failed to fetch channels:", error);
      // TODO: Consider some user-friendly error notification.
    }
  }

  const handleJoin = (channelId: number) => {
    // TODO: Implement the logic to join a channel
    console.log(`Joining channel with ID: ${channelId}`);
    // Again, consider how the join action is reported to the user.
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Channel">
      <ChannelsContainer channels={channels} onJoin={handleJoin} />
    </Modal>
  );
}

export default JoinChannelModal;
