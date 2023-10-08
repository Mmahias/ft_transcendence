import '../../styles/Tab_channels.css';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ChatService from "../../api/chat-api";
import { Channel } from '../../api/types';
import toast from 'react-hot-toast';
import '../../styles/AccessibleChannelsTab.css'
import { ChanMode } from '../../shared/types';

interface PasswordModalProps {
  channel: Channel;
  onClose: () => void;
  onPasswordSubmit: (password: string) => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ channel, onClose, onPasswordSubmit }) => {
  const [password, setPassword] = useState<string>('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onPasswordSubmit(password);
  };

  return (
    <div className="password-modal-overlay">
      <div className="password-modal">
        <h2>Enter Password for {channel.name}</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password" 
          />
          <button type="submit">Submit</button>
        </form>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

interface ChannelListItemProps {
  channel: Channel;
}

const ChannelListItem: React.FC<ChannelListItemProps> = ({ channel }) => {

  const [askForPassword, setAskForPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');

  const queryClient = useQueryClient();

  let formattedDate = '';
  if (channel?.updatedAt) {
    const date = new Date(channel.updatedAt);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');  // months are 0-indexed in JavaScript
    const year = date.getFullYear();
    formattedDate = `${day}/${month}/${year}`;
  }

  const joinChannelRequest = useMutation({
    mutationFn: (channel: Channel) => ChatService.updateMeInChannel(channel.id, "joinedUsers", "connect"),
    onSuccess: () => { 
      queryClient.invalidateQueries(['channels']);
      toast.success(`You joined the channel!`) 
    },
    onError: () => { toast.error('Error : cannot join channel') }
  })

  const { mutate: verifyPassword} = useMutation({
    mutationFn: (pwd: string) => ChatService.verifyPasswords(channel.id, pwd),
    onSuccess: () => { 
      toast.success("Correct password!");
      joinChannelRequest.mutate(channel); },
    onError: () => { toast.error("Incorrect password!") }
  })

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (channel.mode === ChanMode.PROTECTED) {
        setAskForPassword(true);
    } else {
        joinChannelRequest.mutate(channel);
    }
  };

  const handleCloseModal = () => {
    setAskForPassword(false);
  };

  const handlePasswordSubmit = (password: string) => {
    verifyPassword(password);
    setAskForPassword(false);
  };

return (
    <div className="channel-list-item">
      <span className="channel-name truncate-text">{channel?.name}</span>
      <span className="channel-mode truncate-text">{channel?.mode}</span>
      <span className="channel-members truncate-text">{channel?.joinedUsers.length}</span>
      <span className="channel-last-update truncate-text">{formattedDate}</span>
      <span className="channel-msg-count truncate-text">{channel?.nbMessages}</span>
      <button className="channel-join-btn truncate-text" onClick={handleClick}>
        Join
      </button>
      {askForPassword && (
        <PasswordModal 
          channel={channel}
          onClose={handleCloseModal}
          onPasswordSubmit={handlePasswordSubmit}
        />
      )}
    </div>
  );
};

export default function AccessibleChannelsTab() {

  const { data: nonJoinedChannels, status: statusJoinedChannels } = useQuery({queryKey: ['channels'], queryFn: ChatService.getAccessibleChannels});
  
  if (statusJoinedChannels == 'error'){ return <div>Error</div> }
  if (statusJoinedChannels == 'loading'){ return <div>Loading...</div> }

  const toBeJoinedChannels: Channel[] = nonJoinedChannels;
  console.log(toBeJoinedChannels);

  return (
    <div className='channels_page'>
      <div id="tabmore_page">
        <div className="channel-list-header">
          <span className="channel-name truncate-text">Channel</span>
          <span className="channel-mode truncate-text">Mode</span>
          <span className="channel-members truncate-text">Members</span>
          <span className="channel-last-update truncate-text">Last message</span>
          <span className="channel-msg-count truncate-text">Messages sent</span>
          <span className="channel-blank truncate-text"></span> {/* Empty for the join button column */}
        </div>
        <div id="tabmore-chanwaiting">
          {
            toBeJoinedChannels.map(channel => (
              <ChannelListItem key={channel.id} channel={channel} />
            ))
          }
        </div>
      </div>
    </div>
  );
}