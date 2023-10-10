import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import ChatService from "../../api/chat-api";
import UserService from "../../api/users-api";
import { Channel } from "../../api/types";
import { useAuth } from '../../hooks';

export function ChannelTitle({ conv, initialName } : { conv: Channel, initialName: string}) {
  const [isEditing, setIsEditing] = useState(false);
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
      toast.success(`You updated the name of the channel!`) 
    },
    onError: () => { toast.error(`Error : cannot leave channel (tried to leave chan or group you weren't a part of)`) }
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
    if (newTitle === '') {
      setNewTitle(initialName);
    }
  };

  const handleInputKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && newTitle !== initialName && newTitle !== '') {
      setIsEditing(false);
      updateChannel.mutate(newTitle);
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
            conv.ownerId === user.id && 
            <FontAwesomeIcon icon={faPencil} />
          } 
        </h1>
        
      )}
    </div>
  );
};
