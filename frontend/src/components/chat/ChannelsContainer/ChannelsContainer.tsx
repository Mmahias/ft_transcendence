import React from 'react';
import ChannelBox, { Channel } from '../ChannelBox/ChannelBox';

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

export default ChannelsContainer;
