import '../../styles/Tab_channels.css';
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import ChanCreationForm from './ChanCreationForm';
import AccessibleChannelsTab from './AccessibleChannelsTab';
import UserService from '../../api/users-api'; // Make sure to import UserService
import ChatService from '../../api/chat-api'; // Assuming this is the correct import for ChatService.createDMChan
import { User } from '../../api/types'; // Assuming this is the correct import for ChatService.createDMChan
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/Tab_more.css';

enum Tab {
  JOIN,
  CREATE,
}

export default function TabMore() {
  const [tab, setTab] = useState<Tab>(Tab.JOIN);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Array<any>>([]); // replace any with your user type if needed
  
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null);
  const [searchFocus, setSearchFocus] = useState<boolean>(false);
  const blurTimeoutRef = useRef<number | null>(null);

  const { data: myDetails } = useQuery(['me'], UserService.getMe, {
    refetchOnWindowFocus: false,
    onError: (error: any) => {
      if (error.response?.status === 401) {
        console.error('user not connected');
      }
    },
  });

  useEffect(() => {
    if (searchTerm) {
      UserService.searchUsers(searchTerm, 8).then((users: Partial<User>[]) => {
        setSearchResults(users); // update search results when searchTerm changes
        console.log(users);
      });
    } else {
      setSearchResults([]); // clear search results if searchTerm is empty
    }
  }, [searchTerm]);
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedUserIndex(prev => (prev === null || prev === searchResults.length - 1) ? 0 : prev + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedUserIndex(prev => (prev === null || prev === 0) ? searchResults.length - 1 : prev - 1);
        break;
      case 'Enter':
        if (selectedUserIndex !== null && searchResults[selectedUserIndex]?.username) {
          handleUserClick(searchResults[selectedUserIndex].username);
        }
        break;
    }
  };

  const handleUserClick = async (receiverUsername: string) => { // replace string with the correct user id type if needed
    try {
      await ChatService.getDMs(String(myDetails?.username), receiverUsername);
      setSearchTerm(''); // clear search after creating a DM
    } catch (err) {
      console.error('Error creating DM:', err);
    }
  };
  
  const toggleTab = () => {
    setTab(tab === Tab.CREATE ? Tab.JOIN : Tab.CREATE);
  };

  return (
    <div className='channels_page'>
      {/* Adding the search bar here */}
      <input
        type="text"
        placeholder="Search for users..."
        value={searchTerm}
        onChange={handleSearchChange}
        onKeyDown={handleSearchSubmit}
        onFocus={() => {
          if (blurTimeoutRef.current) {
            clearTimeout(blurTimeoutRef.current);
            blurTimeoutRef.current = null;
          }
          setSearchFocus(true);
        }}
        onBlur={() => {
          blurTimeoutRef.current = window.setTimeout(() => {
            setSearchFocus(false);
          }, 150);
        }}
      />
  
      {searchResults.length > 0 && searchFocus && (
        <div className="search-results-">
          {searchResults.map((user, idx) => (
            <div 
              key={idx} 
              className={`user-result ${idx === selectedUserIndex ? 'highlighted-user' : ''}`}
            >
              <button 
                onClick={() => handleUserClick(user.username)}
              >
                {user.username}
              </button>
            </div>
          ))}
        </div>
      )}
  
      <div id="tabmore_page">
        {tab === Tab.CREATE ? <ChanCreationForm /> : <AccessibleChannelsTab />}
        <button id="button-join-create" onClick={toggleTab}>
          {tab === Tab.CREATE ? "Join a channel" : "Create a channel"}
        </button>
      </div>
    </div>
  )
}
