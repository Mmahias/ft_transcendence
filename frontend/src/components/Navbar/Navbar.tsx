import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IsLoggedInContext, SocketContext } from '../context/contexts';
import { logOut, checkIfLogged } from "../../api/APIHandler";
import { createSocketConnexion } from '../../sockets/sockets';
import { Socket } from 'socket.io-client';

import '../styles/Navbar.css';
import logo from '../../assets/school_42.jpeg';
// import Avatar from './Avatar';
// import LoginBtn from './LoginBtn';
// import Sidebar from './Sidebar';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

interface NavbarProps {
  theme: string;
  toggleTheme: React.ChangeEventHandler;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setSocket: React.Dispatch<React.SetStateAction<Socket | null>>;
}

const Navbar: React.FC<NavbarProps> = (props) => {
  const [sidebar, setSidebar] = useState<boolean>(false);
  const isLoggedIn = useContext(IsLoggedInContext);
  const socket = useContext(SocketContext);

  useEffect(() => {
    const fetchData = async () => {
      const userStatus = await checkIfLogged();
      props.setLoggedIn(userStatus);
      if (isLoggedIn && !socket) {
        const newSocket = createSocketConnexion();
        props.setSocket(newSocket);
      }
    };

    fetchData();
  }, [props, isLoggedIn, socket]);

  const handleLogout = async () => {
    try {
      await logOut();
      props.setLoggedIn(false);
      if (socket) {
        socket.disconnect();
      }
    } catch (error) {
      console.log("logout error");
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

        {/* User Avatar/LoginBtn section */}
        { isLoggedIn ? (
          <div className="nav-avatar">
            {/* <Avatar setLoggedIn={props.setLoggedIn} /> */}
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

      <Sidebar sidebar={sidebar} isLoggedIn={isLoggedIn} />
    </>
  );
};

export default Navbar;
