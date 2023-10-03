import React, { useState, useEffect } from 'react';
import {
  Sidebar,
  ButtonContainer,
  ChannelButton,
  ChannelList,
  ActiveChannel,
  GlobalStyles
} from './ChatNavbar.styles';
import CreateChannelModal from '../CreateChannelModal/CreateChannelModal';
import JoinChannelModal from '../JoinChannelModal/JoinChannelModal';
import ChatService from '../../../api/chat-api';

interface ChannelProps {
  name: string;
  onClick: () => void;
}

const Channel: React.FC<ChannelProps> = ({ name, onClick }) => (
  <li>
    <ChannelButton onClick={onClick}>{name}</ChannelButton>
  </li>
);

const ChatNavbar: React.FC = () => {
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showJoinChannel, setShowJoinChannel] = useState(false);
  const [channels, setChannels] = useState<string[]>([]);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);

  const fetchMyChannels = async () => {
    const data = await ChatService.getMyChannels();
    console.log(data);
    const channelNames = data.map((channel: any) => channel.name);
    setChannels(channelNames);
  };

  useEffect(() => {
    fetchMyChannels();
  }, []);

  return (
    <Sidebar>
      <ButtonContainer>
        <button onClick={() => setShowCreateChannel(true)}>Create Channel</button>
        <button onClick={() => setShowJoinChannel(true)}>Join Channel</button>
      </ButtonContainer>
      <ChannelList>
        <GlobalStyles>My Channels</GlobalStyles>
        {channels.map(channel => (
          <Channel
            key={channel}
            name={channel}
            onClick={() => setActiveChannel(channel)}
          />
        ))}
      </ChannelList>
      <CreateChannelModal 
        isOpen={showCreateChannel} 
        onClose={() => setShowCreateChannel(false)} 
        onChannelCreated={fetchMyChannels}  // Refresh channels after creation
      />
      <JoinChannelModal 
        isOpen={showJoinChannel} 
        onClose={() => setShowJoinChannel(false)} 
        onChannelJoined={fetchMyChannels}   // Refresh channels after joining
      />
    </Sidebar>
  );
}


export default ChatNavbar;
