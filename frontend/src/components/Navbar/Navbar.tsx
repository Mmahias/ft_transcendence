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
        <div className="dropbtn">MENU</div>
        <div className="dropdown-content">
            <RouterLink className="router-link" to="/profile">PROFILE</RouterLink>
            <RouterLink className="router-link" to="/settings">SETTINGS</RouterLink>
            <RouterLink className="router-link" to="/logout">LOGOUT</RouterLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;



