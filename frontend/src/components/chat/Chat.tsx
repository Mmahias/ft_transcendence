import React, { useState } from 'react';
import CreateChannelModal from './CreateChannelModal/CreateChannelModal';
import JoinChannelModal from './JoinChannelModal/JoinChannelModal';

const Chat: React.FC = () => {
    const [showCreateChannel, setShowCreateChannel] = useState(false);
    const [showJoinChannel, setShowJoinChannel] = useState(false);

    return (
        <div>
            <button onClick={() => setShowCreateChannel(true)}>Create Channel</button>
            <button onClick={() => setShowJoinChannel(true)}>Join Channel</button>

            <CreateChannelModal isOpen={showCreateChannel} onClose={() => setShowCreateChannel(false)} />
            <JoinChannelModal isOpen={showJoinChannel} onClose={() => setShowJoinChannel(false)} />
        </div>
    );
}

export default Chat;
