// Navbar.tsx
import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import logo from '../../assets/school_42.jpeg';
import './styles.css';

// Votre import ...

function Navbar() {
  return (
    <nav className="navbar-container">
      <img className="logo" src={logo} alt="App Logo" />
      <div className="links-container">
          <RouterLink className="router-link" to="/">HOME</RouterLink>
          <RouterLink className="router-link" to="/game">GAME</RouterLink>
          <RouterLink className="router-link" to="/chat">CHAT</RouterLink>
      </div>

      {/* Menu déroulant */}
      <div className="dropdown">
        <div className="dropbtn">
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
          </svg>
        </div>
        <div className="dropdown-content">
            <RouterLink className="router-link" to="/user/profile">PROFILE</RouterLink>
            <RouterLink className="router-link" to="/">LOGOUT</RouterLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;



