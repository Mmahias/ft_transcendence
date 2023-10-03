import React, { useState } from 'react';
import ChatNavbar from './ChatNavbar/ChatNavbar';
import ChannelComponent from './ChannelComponent/ChannelComponent';
import { Channel } from '../../api/types';

const Chat: React.FC = () => {
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

    return (
        <div>
            <ChatNavbar onChannelSelect={setSelectedChannel} />
            {selectedChannel && <ChannelComponent channel={selectedChannel} />}
        </div>
    );
}

export default Chat;
