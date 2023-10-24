import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import ChatService from "../../api/chat-api";
import UserService from "../../api/users-api";
import { Channel } from "../../api/types";
import { useAuth } from '../../hooks';
import { ChanMode } from '../../shared/types';


export function ChannelTitle({ conv, initialName } : { conv: Channel, initialName: string}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialName);
  const [newTitle, setNewTitle] = useState(initialName);
  const { auth } = useAuth();
    const { data: user, error, isLoading, isSuccess } = useQuery(['me'], UserService.getMe, {
      refetchOnWindowFocus: false,
      enabled: !!auth?.accessToken ? true : false,
      onError: (error: any) => {
        if (error.response?.status === 401) {
          console.error('user not connected');
        }
      },
    });
  const queryClient = useQueryClient();

  const updateChannel = useMutation({
    mutationFn: (newValue: string) => ChatService.updateChannel(conv.id, "name" ,newValue),
    onSuccess: () => { 
      queryClient.invalidateQueries(['channels']);
      toast.success(`You updated the name of the channel!`);
    },
    onError: () => {
      toast.error(`Error : cannot update the channel name.`);
      setTitle(initialName);  // Revert back to the initial title on error
    }
});

  if (error) {
    return <div>Error</div>
  }
  if (isLoading || !isSuccess) {
    return <div>Loading...</div>
  }

  const handleTitleClick = () => {
    if (conv.ownerId === user.id) {
      setIsEditing(true);
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    setNewTitle(title);
  };

  const handleInputKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (newTitle.length > 10) {
        toast.error(`Channel name too long (max 10 characters)`);
      }
      else if (newTitle !== initialName && newTitle.trim() !== '') {
        setIsEditing(false);
        updateChannel.mutate(newTitle);
        setTitle(newTitle);
      }
    }
  };

  return (
    <div>
      {isEditing ? (
        <input
          type="text"
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyPress}
        />
      ) : (
        <h1 id="convo__name" onClick={handleTitleClick}>
          {newTitle}
          {
            conv.ownerId === user.id && conv.mode !== ChanMode.DM &&
            <FontAwesomeIcon icon={faPencil} style={{ cursor: "pointer" }}/>
          } 
        </h1>
        
      )}
    </div>
  );
};
