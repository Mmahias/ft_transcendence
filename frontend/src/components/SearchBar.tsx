import { User } from "../api/types";
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import '../styles/SearchBar.css';
import UserService from "../api/users-api";
import toast from 'react-hot-toast';

const SearchBar: React.FC<{ onUserClick: (selectedUserID: string) => Promise<void> }> = ({ onUserClick }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Array<any>>([]); // replace any with your user type if needed
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null);
  const [searchFocus, setSearchFocus] = useState<boolean>(false);
  const blurTimeoutRef = useRef<number | null>(null);

  const { data: myDetails, error, isLoading, isSuccess } = useQuery(['me'], UserService.getMe, {
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

  const handleUserClick = async (receiverUserId: string) => { 
    try {
      await onUserClick(receiverUserId);
      setSearchTerm(''); // clear search after adding the user to the conversation
    } catch (err: any) {
      console.log("err", err);
      toast.error(`Error adding user to conversation: ${err.message}`);
    }
  };

  return (
    <div className="links-container">
    {
      <div className="searchBar">
        <input
          type="text"
          placeholder="Search user..."
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
                <button onClick={() => handleUserClick(user.id)}>
                  <img src={user.avatar} className="user-avatar" />
                  {user.username}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    }
    </div>
  );
};

export default SearchBar;