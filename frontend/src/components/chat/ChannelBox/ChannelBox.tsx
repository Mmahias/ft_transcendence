import React from 'react';

// Strongly type our props
export interface Channel {
  id: number;
  date: string;
  lastUpdate: string;
  // ... other channel properties ...
}

interface ChannelBoxProps {
  channel: Channel;
  onJoin: (channelId: number) => void;
}

const ChannelBox: React.FC<ChannelBoxProps> = ({ channel, onJoin }) => {
  return (
    <div className="channel-box">
      {/* Consider displaying more relevant channel details for better UX */}
      <span>{channel.id}</span>
      <button onClick={() => onJoin(channel.id)}>Join</button>
    </div>
  );
}

export default ChannelBox;
