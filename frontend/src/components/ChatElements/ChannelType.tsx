import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faPencil } from "@fortawesome/free-solid-svg-icons";
import ChatService from "../..//api/chat-api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Channel, User } from "../..//api/types";
import { toast } from "react-hot-toast";
import { ChanMode } from "../..//shared/types";
import "../../styles/Tab_Chat.css";

export function ChannelType({ channelId, loggedUser } : { channelId: number, loggedUser: User}) {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [toggleDisplay, setToggleDisplay] = useState<boolean>(false);
  const [chanMode, setChanMode] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: channel, error, isLoading, isSuccess }= useQuery({ 
    queryKey: ['channels', channelId], 
    queryFn: () => ChatService.getChannelById(channelId)
  });

  const updateChannel = useMutation({
    mutationFn: ([property, newValue]: [keyof Channel, string]) => ChatService.updateChannel(channelId, property ,newValue),
    onSuccess: () => { 
      queryClient.invalidateQueries(['channels']);
      toast.success(`You updated the channel!`) 
    },
    onError: () => { toast.error(`Error : cannot change type of channel`) }
  });

  useEffect(() => {
    if (channel && channel.ownerId === loggedUser.id) {
      setIsEnabled(true);
    }
  }, [channel, loggedUser.id])
  
  if (error) {
    return <div>Error</div>;
  }
  if (isLoading || !isSuccess) {
    return <div>Loading...</div>;
  }

  const handleInputBlur = () => {
    if (chanMode !== ChanMode.PROTECTED) {
      setIsEditing(false);
    }
  };

  const handleInputKeyPress = (event: React.FormEvent<HTMLButtonElement>) => {
    void event;
    setIsEditing(false);
    updateChannel.mutate(["mode", chanMode]);
    if (chanMode === ChanMode.PROTECTED) {
      updateChannel.mutate(["password", password]);
    }
  };

  return (<div className="chanmode">
    {
      isEnabled === true &&
      <>
      <FontAwesomeIcon 
        onClick={() => setToggleDisplay(!toggleDisplay)} 
        icon={faCircleInfo} 
        title="Click to see more"
        id="fa_see_more"
      />
      {
        toggleDisplay === true &&
        <>
        { isEditing? 
          (
            <>
            <select 
            value={chanMode} 
            onChange={(event) => setChanMode(event.target.value)}
            onBlur={handleInputBlur}
            id="chanmode_select"
            >
              <option value="PUBLIC">PUBLIC</option>
              <option value="PRIVATE">PRIVATE</option>
              <option value="PROTECTED">PROTECTED</option>
            </select>
            {
              chanMode === "PROTECTED" &&
              <input 
              type="password" 
              placeholder="password to enter"
              id="chanmode_addpwd"
              value={password} 
              onChange={(event) => setPassword(event.target.value)} 
              />
            }
            <button id="chanmode_confirmbtn" onClick={handleInputKeyPress}>Confirm change</button>
            </>
          ) : (
            <p id="chan_header_changetype" >Mode: {(chanMode) ? chanMode : channel.mode} <FontAwesomeIcon onClick={() => setIsEditing(true)} icon={faPencil} id="fa_see_more"/></p>
          )
        }
          
        </>
      }
      </>
    }
  </div>
  );
}