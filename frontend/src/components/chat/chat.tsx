import React,  { useContext }  from 'react';
// import '../styles/Chat.css';
// import '../styles/Tab_channels.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft, faAnglesRight} from "@fortawesome/free-solid-svg-icons";
// import TabChannels from './ChatElements/TabChannels';
import TabChat from './tabChat';
import TabMore from './tabMore';
import { useQuery } from "@tanstack/react-query";
import { getMe } from '../../api/users-api';
import { ChatStatusContext } from '../../contexts';

interface Tab {
  label: string;
  content: JSX.Element;
}

const Chat = () => {
	const {data: userMe, status: statusMe } = useQuery({queryKey: ['user'], queryFn: getMe});

	const { activeTab, setActiveTab, activeChan, isExpanded, setIsExpanded } = useContext(ChatStatusContext);

	const toggleExpand = () => {
		setIsExpanded(!isExpanded);
	};
		
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
				// { label: 'Convs', content: <div><TabChannels/></div> },
	activeChan ? { label: 'Chat', content: <div><TabChat chan={activeChan} loggedUser={userMe}/></div> } : { label: 'Chat', content: <div id='chat_no-chat'>Join convos to see the chat!</div> },
				{ label: 'More', content: <div><TabMore /></div> },
	];

	return (
		<div className={`chat ${isExpanded ? 'expanded' : 'collapsed'}`}>
			<div className="toggle-button" onClick={toggleExpand}>
			{isExpanded ? <FontAwesomeIcon icon={faAnglesLeft}/> : <FontAwesomeIcon icon={faAnglesRight}/>} 
			</div>

			<div className="content">
			{ 
				tabs.map((tab, index) => (
					<div
					key={index}
					className={`tab ${index === activeTab ? 'active' : ''}`}
					onClick={() => handleTabClick(index)}>
					<button className='chat_button'>{tab.label}</button>
					</div>
				))
			}
			</div>
			<div className="tab-content">{tabs[activeTab].content}</div>
		</div>
		);
};

export default Chat;
