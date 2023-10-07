import '../../styles/Tab_channels.css';
import React, { useState } from 'react';
import ChanCreationForm from './ChanCreationForm';
import AccessibleChannelsTab from './AccessibleChannelsTab';
import '../../styles/Tab_more.css'

enum Tab {
  JOIN,
  CREATE,
}

export default function TabMore() {

  const [tab, setTab] = useState<Tab>(Tab.CREATE);
  
  const toggleTab = () => {
    if (tab === Tab.CREATE) {
      setTab(Tab.JOIN);
    } else {
      setTab(Tab.CREATE);
    }
  };

  return (
  <div className='channels_page'>
    <div id="tabmore_page">
      {tab === Tab.CREATE
        ? ( <ChanCreationForm /> )
        : ( <AccessibleChannelsTab /> )
      }
      <button id = "button-join-create" onClick={toggleTab}>
        {tab === Tab.CREATE ? "Join a channel" : "Create a channel"}
      </button>
    </div>
  </div>
  )
}