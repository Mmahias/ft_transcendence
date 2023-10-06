import './Navbar.css';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import AuthService from "../../api/auth-api";
import logo from '../../assets/school_42.jpeg';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from '../../hooks';

interface NavbarProps {
  theme: string;
}

const Navbar: React.FC<NavbarProps> = (props) => {
  const { auth, logout } = useAuth();
  const isLoggedIn = !!auth?.accessToken;

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      logout();
      console.log("Ok OUT");
    } catch (error) {
      console.log("logout error", error);
    }
  };

  return (
    <>
      <nav className="navbar-container">
        <img className="logo" src={logo} alt="App Logo" />
        <Link to="/" className="router-link">HOME</Link>
        <Link to="/game" className="router-link">GAME</Link>
        <Link to="/chat" className="router-link">CHAT</Link>

        { isLoggedIn ? (
          <div className="nav-avatar">
            <button onClick={handleLogout}>
              <FontAwesomeIcon className='nav-logout-icon' icon={faRightFromBracket} />
            </button>
          </div>
        ) : (
          <div className="nav-avatar">
            <Link to="/login" className="router-link">LOGIN</Link>
          </div>
        )}

        { isLoggedIn && (
          <div className="dropdown">
            <div className="dropbtn">
              <FontAwesomeIcon icon={faRightFromBracket} />
            </div>
            <div className="dropdown-content">
              <Link to="/user/profile" className="router-link">PROFILE</Link>
              <Link to="/" onClick={handleLogout} className="router-link">LOGOUT</Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
