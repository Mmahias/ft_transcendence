import { Channel, User } from "../../api/interfaces-api";
import React, { useContext } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import '../../styles/Tab_Chat.css';
import { leaveChannel } from "../../api/chat-api";
import { getMe } from "../../api/users-api";
import toast from 'react-hot-toast';
import { ChatStatusContext } from "../../contexts";
// import { ChannelTitle } from "./ChannelTitle";
// import { ChannelType } from "./ChannelType";

const getDate = (channel : Channel) => {
	const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric'} as const;
	const date = (typeof channel.date === 'string') ? new Date(channel.date) : channel.date;
	const formattedDate = date.toLocaleDateString('en-US', options);
	return formattedDate;
}


export function TabChatHeader({ chan }: { chan: Channel}) {

	const { setActiveTab, setActiveChan } = useContext(ChatStatusContext);
	const convName: string = (chan.type === 'DM') ? chan.name.replace(' ', ' , ').trim() : chan.name;
	const queryClient = useQueryClient();

	const {data: user, error, isLoading, isSuccess } = useQuery({queryKey: ['user'], queryFn: getMe});

	const leaveChannelRequest = useMutation({
		mutationFn: (user: User) => leaveChannel(user.id, chan.id),
		onSuccess: () => { 
			queryClient.invalidateQueries(['channels']);
			toast.success(`You left the channel!`) 
		},
		onError: () => { toast.error(`Error : cannot leave channel (tried to leave chan or group you weren't a part of)`) }
	});
	
	if (error) {
		return <div>Error</div>
	}
	if (isLoading || !isSuccess || chan === undefined || !chan) {
		return <div>Is Loading...</div>
	}

	const handleClick = (event: React.FormEvent<HTMLButtonElement>) => {
		event.preventDefault();
		if (user) {
			leaveChannelRequest.mutate(user);
			setActiveTab(0);
			setActiveChan(null);
		}
	};

	return (
	<div className='convo__header'>
		<div className='convo__header_title'>
			{/* <ChannelTitle conv={conv} initialName={convName} /> */}
			<button id="convo__header_leave-btn" onClick={handleClick}>Leave Conversation</button>
		</div>
		<p>Channel created on {getDate(chan)}</p>
		<p>Owner is: {chan?.owner.nickname} </p>
		{/* <ChannelType channelId={chan.id} loggedUser={user}/> */}
		</div>
	);
}