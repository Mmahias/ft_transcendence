import React from "react";
import { useQuery} from "@tanstack/react-query";
import { getAccessibleChannels } from '../../api/chat-api';
import ChanCreationForm from './chanCreationForm';
import { Channel } from '../../api/interfaces-api';
import ChannelMore from './channelMore';

export default function TabMore() {

	const { data: nonJoinedChannels, error, isLoading, isSuccess } = useQuery({queryKey: ['channels'], queryFn: getAccessibleChannels});
	
	if (error){
		return <div>Error</div>
	}
	if (isLoading || !isSuccess){
		return <div>Loading...</div>
	}

	const publicAndPrivateChans: Channel[] = nonJoinedChannels;

	return (
	<div className='channels_page'>
		<div id="tabmore_page">
			<h2 className="tabmore_page_title">Want more? Create your own channel or join others!</h2>
			<ChanCreationForm />
			<h2 className="tabmore_page_title">Channels that are waiting for you</h2>
			<div id="tabmore-chanwaiting">
			{
				publicAndPrivateChans && Array.isArray(publicAndPrivateChans) && (
					publicAndPrivateChans.map((chan) => {
						return (
							<ChannelMore key={chan.id.toString()} channel={chan} />	
						);
					})
				)
			}
			{ (!publicAndPrivateChans || (publicAndPrivateChans && publicAndPrivateChans.length === 0)) && 
				<div className='tabmore_page-noconv'>
					<h3>There is no public or protected channel you can join at the moment...</h3>
					<h6>It's time to take charge and create your own!</h6>
				</div>
			}
			</div>
		</div>
	</div>
  )
}