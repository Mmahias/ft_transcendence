import React, { useState, useEffect, useRef } from 'react';
import AuthService from "../api/auth-api";
import UserService from "../api/users-api";
import { User } from '../api/types';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useAuth, useSocket } from '../hooks';
import '../styles/Navbar.css';
import logo from '../assets/school_42.jpeg';

interface NavbarProps {
  theme: string;
}

const Navbar: React.FC<NavbarProps> = () => {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const socket = useSocket();
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!auth?.accessToken);
  const [searchResults, setSearchResults] = useState<Partial<User>[]>([]);
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null);
  const [searchFocus, setSearchFocus] = useState<boolean>(false);
  const blurTimeoutRef = useRef<number | null>(null); // Added ref for timeout
  const socketRef = useRef(socket);

  const myProfileQuery = useQuery(['me'], UserService.getMe, {
    refetchOnWindowFocus: false,
    enabled: isLoggedIn ? true : false,
    onSuccess: () => {
      console.log('Fetched user profile');
    },
    onError: (error: any) => {
      if (error.response?.status === 401) {
        console.error('User not connected');
      }
    },
  });
  
  const { data, status } = useQuery(
    ['searchUsers', searchTerm],
    () => UserService.searchUsers(searchTerm, 8),
    {
      enabled: !!searchTerm && isLoggedIn,
      refetchOnWindowFocus: false,
      onSuccess: (fetchedData) => {
        const filteredData = fetchedData.filter(user => user.id !== myProfileQuery.data?.id);
        setSearchResults(filteredData);
      }
    }
    );
    
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
      setSelectedUserIndex(null);
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
            handleOnClick(searchResults[selectedUserIndex].username);
          }
          break;
        }
      };
      
      // handle click on search bar result
      const handleOnClick = (username: string | null | undefined) => {
        if (!username) return; 
        if (window.location.pathname !== `/user/profile/${username}`) {
          setSearchResults([]);
          setSearchTerm('');
          navigate(`/user/profile/${username}`);
        }
      };

  // logout function
  const handleLogout = async () => {
    try {
      console.log("logout");
      socketRef.current?.emit('forceDisconnectAll');
      await AuthService.logout();
      logout();
      navigate("/");
    } catch (error) {
      console.log("logout error", error);
    }
  };

  // listening to socket change to limit React re renders
  useEffect(() => {
    socketRef.current = socket; // always keep the ref updated
  }, [socket]);

  // listening to login/logout
  useEffect(() => {
    setIsLoggedIn(!!auth?.accessToken);
  }, [auth]);
  
  // listening to logout from other tabs
  useEffect(() => {
    const handleForceLogout = () => {
      console.log('force logout');
      handleLogout();
    }
    socketRef.current?.on('forceLogout', handleForceLogout);

    return () => {
        socketRef.current?.off('forceLogout', handleForceLogout); // Cleanup on unmount
    }
  }, [socketRef, handleLogout]);

  return (
    <>
      <nav className="navbar-container">
      <img className="logo" src={logo} alt="App Logo" />

      <div className="links-container">
        <Link to="/" className="router-link">HOME</Link>
        <Link to="/game" className="router-link">GAME</Link>
        <Link to="/chat" className="router-link">CHAT</Link>
        {isLoggedIn && (
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
                    <Link 
                      to={`/user/profile/${user.username}`} 
                      onClick={() => {
                        if (blurTimeoutRef.current) {
                          clearTimeout(blurTimeoutRef.current); // Clear timeout when link is clicked
                          blurTimeoutRef.current = null;
                        }
                        handleOnClick(user.username);
                      }}
                    >
                      <img src={user.avatar} className="user-avatar" />
                      {user.username}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </div>

        <div className="dropdown">
          <div className="dropbtn">
            <FontAwesomeIcon icon={faBars} />
          </div>
          <div className="dropdown-content">
            {isLoggedIn ? (
              <>
                <Link to="/user/profile" className="router-link">PROFILE</Link>
                <Link to="/" onClick={handleLogout} className="router-link">LOGOUT</Link>
              </>
            ) : (
              <Link to="/login" className="router-link">LOGIN</Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
