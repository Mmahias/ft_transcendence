import '../../styles/Tab_channels.css';
import React from 'react';
import { useQuery} from "@tanstack/react-query";
import ChatService from "../..//api/chat-api";
import ChanCreationForm from './ChanCreationForm';
import { Channel } from '../../api/types';
import '../../styles/Tab_more.css'
import ChannelMore from './ChannelMore';

export default function TabMore() {

  const { data: nonJoinedChannels, error, isLoading, isSuccess } = useQuery({queryKey: ['channels'], queryFn: ChatService.getAccessibleChannels});
  
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
          <h5>There is no public or protected channel you can join at the moment...</h5>
          <h6>It's time to take charge and create your own!</h6>
        </div>
      }
      </div>
    </div>
  </div>
  )
}