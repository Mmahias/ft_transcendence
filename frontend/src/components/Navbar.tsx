import React, { useState } from 'react';
import AuthService from "../api/auth-api";
import UserService from "../api/users-api";
import { User } from '../api/types';
import { Link, Navigate } from 'react-router-dom';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from '../hooks';
import '../styles/Navbar.css';
import logo from '../assets/school_42.jpeg';

interface NavbarProps {
  theme: string;
}

const Navbar: React.FC<NavbarProps> = (props) => {
  const { auth, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!auth?.accessToken);
  const [searchResults, setSearchResults] = useState<Partial<User>[]>([]);

  const { data, status } = useQuery(
    ['searchUsers', searchTerm],
    () => UserService.searchUsers(searchTerm, 8),
    {
      enabled: !!searchTerm, // makes sure the query runs only when searchTerm is not empty
      refetchOnWindowFocus: false, // Optional: prevents refetching on window focus
      onSuccess: (fetchedData) => {
        setSearchResults(fetchedData);
      }
    }
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && searchTerm && searchResults[0].username) {
      return <Navigate to={`/user/profile/${searchResults[0].username}`} />;
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      logout();
      console.log("Ok OUT");
    } catch (error) {
      console.log("logout error", error);
    }
  };
  console.log("real fetch", searchTerm, data);
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
              />
              <div className="search-results-">
                {searchResults.map((user, idx) => (
                  <div key={idx} className="user-result">
                    <Link to={`/user/profile/${user.username}`}>
                      <img src={user.avatar} className="user-avatar" />
                      {user.username}
                    </Link>
                  </div>
                ))}
              </div>
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