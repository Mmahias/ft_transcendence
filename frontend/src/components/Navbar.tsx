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
import toast from 'react-hot-toast';

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
  const socketRef = useRef<typeof socket | null>(socket);

  // useEffect(() => {
  //   if (auth.accessToken) {
  //     socketRef.current = socket;
  //   } else {
  //     socketRef.current = null;
  //   }
  // }, [auth.accessToken]);

  const { data: myDetails } = useQuery(['me'], UserService.getMe, {
    refetchOnWindowFocus: false,
    enabled: isLoggedIn ? true : false,
    onSuccess: () => {
      // console.log('Fetched user profile');
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
        const filteredData = fetchedData.filter(user => user.id !== myDetails?.id);
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
      await AuthService.logout();
      socketRef.current?.emit('forceDisconnectAll');
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

  socket?.on('match invitation', (inviter: string) => {
    toast(
      <div>
        <p>{inviter} has invited you to a match!</p>
        <button
          className="button3"
          style={{ marginRight: '30%' }}
          onClick={() => {
            socket?.emit('accept match invitation', inviter);
            toast.dismiss('match invitation');
          }}>
          Accept
        </button>
        <button
          className="button3"
          onClick={() => {
            socket?.emit('decline match invitation', inviter);
            toast.dismiss('match invitation');
          }}>
          Decline
        </button>
      </div>,
      {
        id: 'match invitation',
        duration: 10000,
        icon: '🎾',
      }
    );
  });

  socket?.on('match invitation', (inviter: string) => {
    toast(
      <div>
        <p>{inviter} has invited you to a match!</p>
        <button
          className="button3"
          style={{ marginRight: '30%' }}
          onClick={() => {
            socket?.emit('accept match invitation', inviter);
            toast.dismiss('match invitation');
          }}>
          Accept
        </button>
        <button
          className="button3"
          onClick={() => {
            socket?.emit('decline match invitation', inviter);
            toast.dismiss('match invitation');
          }}>
          Decline
        </button>
      </div>,
      {
        id: 'match invitation',
        duration: 10000,
        icon: '🎾',
      }
    );
  });

  socket?.on('match invite ready', (inviter: string) => {
    navigate("/game");
    socket?.emit('accept match');
  });

  socket?.on('match invitation declined', (username: string) => {
    toast.error(`${username} declined your invitation.`, {id: 'invite'});
  });

  return (
    <>
      <nav className="navbar-container">
        {/* <div className="dropbtn">
          <p> {myDetails?.username}</p>
        </div> */}
        <a href="/">
          <img className="logo" src={logo} alt="App Logo" />
        </a>

      <div className="links-container">
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
                <Link to="/game" className="router-link">GAME</Link>
                <Link to="/chat" className="router-link">CHAT</Link>
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
