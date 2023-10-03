import React, { useState } from 'react';
import ChatNavbar from './ChatNavbar/ChatNavbar';

const Chat: React.FC = () => {
    const [showCreateChannel, setShowCreateChannel] = useState(false);
    const [showJoinChannel, setShowJoinChannel] = useState(false);

    return (
        <div>
            <ChatNavbar />
        </div>
    );
}

export default Chat;
