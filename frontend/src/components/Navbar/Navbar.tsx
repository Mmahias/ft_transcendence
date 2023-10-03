import './Navbar.css';
import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IsLoggedInContext, SocketContext } from '../../contexts';
import AuthService from "../../api/auth-api";
import { createSocketConnexion } from '../../sockets/sockets';
import { Socket } from 'socket.io-client';
import useAuth from '../../hooks/useAuth';
import logo from '../../assets/school_42.jpeg';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

interface NavbarProps {
  theme: string;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setSocket: React.Dispatch<React.SetStateAction<Socket | null>>;
}

const Navbar: React.FC<NavbarProps> = (props) => {
  const [sidebar, setSidebar] = useState<boolean>(false);
  const isLoggedIn = useContext(IsLoggedInContext);
  const socket = useContext(SocketContext);

  const { auth, logout } = useAuth();

  useEffect(() => {
      const fetchData = async () => {
        const userStatus = !!auth?.accessToken; // Will be true if there's a user, false otherwise
        props.setLoggedIn(userStatus);
        if (userStatus && !socket) {
          const newSocket = createSocketConnexion();
          props.setSocket(newSocket);
        }
      };
    fetchData();
  }, [props, isLoggedIn, socket]);

  const handleLogout = async () => {
    try {
      await AuthService.logout();

      logout();

      props.setLoggedIn(false);
      console.log("Ok OUT");
      if (socket) {
        socket.disconnect();
      }
    } catch (error) {
      console.log("logout error", error);
    }
  };

  const showSidebar = () => setSidebar(!sidebar);

  return (
    <>
      <nav className="navbar-container">
        <img className="logo" src={logo} alt="App Logo" />
        <Link to="/" className="router-link">HOME</Link>
        <Link to="/game" className="router-link">GAME</Link>
        <Link to="/chat" className="router-link">CHAT</Link>
        <Link to="/login" className="router-link">LOGIN</Link>

        { isLoggedIn ? (
          <div className="nav-avatar">
            <button onClick={handleLogout}>
              <FontAwesomeIcon className='nav-logout-icon' icon={faRightFromBracket} />
            </button>
          </div>
        ) : (
          <div className="nav-avatar">
            {/* <LoginBtn /> */}
          </div>
        ) }

        {/* Dropdown section */}
        <div className="dropdown">
          <div className="dropbtn">
            <FontAwesomeIcon icon={faRightFromBracket} />
          </div>
          <div className="dropdown-content">
            <Link to="/user/profile" className="router-link">PROFILE</Link>
            <Link to="/" onClick={handleLogout} className="router-link">LOGOUT</Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
