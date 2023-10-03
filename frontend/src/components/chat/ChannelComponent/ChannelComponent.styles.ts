import styled from 'styled-components';

export const ChannelContainer = styled.div`
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 20px;
    margin: 10px 0;
`;

export const ChannelHeader = styled.h2`
    font-size: 1.5em;
    margin-bottom: 20px;
`;

export const MessagesContainer = styled.div`
    max-height: 300px;
    overflow-y: scroll;
`;

export const MessageItem = styled.div`
    margin-bottom: 10px;
    font-size: 1.2em;
`;
