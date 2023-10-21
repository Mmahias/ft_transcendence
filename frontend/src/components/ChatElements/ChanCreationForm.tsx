import React, { useState } from 'react';
import { useQueryClient, useMutation } from "@tanstack/react-query";
import '../../styles/Tab_channels.css';
import toast from 'react-hot-toast';
import ChatService from '../../api/chat-api';
import { useSocket } from '../../hooks';
import SocketService from '../../sockets/sockets';
import { ChanMode } from '../../shared/types';
import Chat from 'pages/Chat';

export default function ChanCreationForm() {
  // State
  const [channelMode, setChannelMode] = useState<ChanMode>(ChanMode.PUBLIC);
  const [channelPassword, setChannelPassword] = useState<string>('');
  const [channelName, setChannelName] = useState<string>('');
  const [channelId, setChannelId] = useState<number>();
  
  const socket = useSocket();
  const queryClient = useQueryClient();

  // Handlers
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length > 10) {
      toast.error('Channel name length must be under 10!');
    } else {
      setChannelName(event.target.value);
    }
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createChannelRequest.mutate();
};

  // Mutation for creating a channel
  const createChannelRequest = useMutation({
    mutationFn: () => ChatService.createChannel(channelName, channelMode, channelPassword),
    onSuccess: async () => {
      queryClient.invalidateQueries(['channels']);
      toast.success(`Your channel ${channelName} was successfully created!`);
      
      const channel = await ChatService.getChannelByName(channelName);
      console.log("Fetched channel:", channel);
      if (socket && channel.id) {
        SocketService.sendNotificationToServer(socket, 'joinRoom', String(channel.id));
      }
      console.log('channel.id', channel.id);
      setChannelId(channel.id);
    },
    onError: () => {
      toast.error('Error during creation of channel');
    }
  });

  return (
    <form id="create-chan-form" onSubmit={handleFormSubmit}>
      <input
        className="create-chan-input text_input"
        type="text"
        value={channelName}
        onChange={handleInputChange}
        placeholder="Channel name (10 chars max)"
      />
      
      {/* Channel Mode Selection */}
      <div>
        <p>Channel mode:</p>
        <div className='custom-select'>
          <select className="select-chan-mode" name="mode" id="select-chan-mode" onChange={(event) => setChannelMode(event.target.value as ChanMode)}>
            <option value={ChanMode.PUBLIC}>Public</option>
            <option value={ChanMode.PRIVATE}>Private</option>
            <option value={ChanMode.PROTECTED}>Protected</option>
          </select>
        </div>
      </div>

      {/* Channel Password Input (Only for Protected Mode) */}
      {channelMode === ChanMode.PROTECTED && (
        <input
          className="create-chan-input text_input"
          type="password"
          value={channelPassword}
          onChange={(event) => setChannelPassword(event.target.value)}
          placeholder="Channel password"
        />
      )}
      
      {/* Create Channel Button */}
      <button id='tabmore-btn' type="submit">Create channel</button>
    </form>
  );
}
