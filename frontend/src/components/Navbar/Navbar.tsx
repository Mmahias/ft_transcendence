// Navbar.tsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import logo from '../../assets/school_42.jpeg';
import './styles.css';

function Navbar() {
  return (
    <nav className="navbar-container">
      <img className="logo" src={logo} alt="App Logo" />
      <div className="links-container">
          <RouterLink className="router-link" to="/">HOME</RouterLink>
          <RouterLink className="router-link" to="/game">GAME</RouterLink>
          <RouterLink className="router-link" to="/chat">CHAT</RouterLink>
      </div>
    </nav>

  );
}

export default Navbar;
