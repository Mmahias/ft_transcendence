import './Navbar.css';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import AuthService from "../../api/auth-api";
import logo from '../../assets/school_42.jpeg';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faBars } from "@fortawesome/free-solid-svg-icons";
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

        <div className="links-container">
          <Link to="/" className="router-link">HOME</Link>
          <Link to="/game" className="router-link">GAME</Link>
          <Link to="/chat" className="router-link">CHAT</Link>
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
