import React from 'react';
import { Channel } from '../../../api/types';
import { ChannelContainer, ChannelHeader,
  MessagesContainer, MessageItem } from './ChannelComponent.styles';

const ChannelComponent: React.FC<{ channel: Channel }> = ({ channel }) => {
    return (
        <ChannelContainer>
            <ChannelHeader>{channel.name}</ChannelHeader>
            <MessagesContainer>
                {channel.messages.map(message => (
                    <MessageItem key={message.id}>
                        <strong>{message.from.username}</strong>: {message.content}
                    </MessageItem>
                ))}
            </MessagesContainer>
        </ChannelContainer>
    );
}

export default ChannelComponent;