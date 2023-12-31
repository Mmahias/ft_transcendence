import React,  { useContext, useEffect }  from 'react';
import '../styles/Chat.css';
import '../styles/Tab_channels.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft, faAnglesRight} from "@fortawesome/free-solid-svg-icons";
import TabChannels from '../components/ChatElements/TabChannels';
import TabChat from '../components/ChatElements/TabChat';
import TabMore from '../components/ChatElements/TabMore';
import { useQuery } from "@tanstack/react-query";
import UserService from '../api/users-api';
import { ChatStatusContext } from '../contexts/ChatContext';

interface Tab {
  label: string;
  content: JSX.Element;
}

const Chat = () => {
  const {data: userMe, status: statusMe } = useQuery({queryKey: ['user'], queryFn: UserService.getMe});
  const { activeTab, setActiveTab, activeChan, setActiveChan, isExpanded, setIsExpanded } = useContext(ChatStatusContext);

  // useEffect(() => {
  //   if (!window.location.search.includes('load')) {
  //     // Rafraîchissez la page et ajoutez le paramètre "refreshed"
  //     window.location.href = window.location.href + '?load';
  //   }
  // }, []);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  if (statusMe === "error"){
    return <div>Error</div>
  }
  if (statusMe === "loading" ){
    return <div>Loading...</div>
  }

  const tabs: Tab[] = [
    { label: 'Channels', content: <div><TabChannels/></div> },
    { label: 'Chat', content:
      activeChan ? <TabChat conv={activeChan} loggedUser={userMe}/> : <div id='chat_no-chat'>Join convos to chat!</div>
    },
    { label: 'More', content: <div><TabMore /></div> },
  ];

  return (
    <div className='container-chatbox'>
      <aside className='aside-content'>
        <ul className='ul_items'>
        {
          tabs.map((tab, index) => (
              <li className={`tab ${index === activeTab ? 'active' : ''}`} key={index} onClick={() => handleTabClick(index)}>
                <div>
                  <h2>{tab.label}</h2>
                </div>
              </li>
          ))
        }
        </ul>
      </aside>
      <main className='main-box'>
       {tabs[activeTab].content}
      </main>
    </div>
    );
};

export default Chat;
