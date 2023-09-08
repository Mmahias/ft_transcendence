// Navbar.tsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import './styles.css';

function Navbar() {
  return (
    <nav className="navbar-container">
      <img className="logo" src={logo} alt="App Logo" />
      <div className="links-container">
          <RouterLink className="router-link" to="/">home</RouterLink>
          <RouterLink className="router-link" to="/game">game</RouterLink>
      </div>
    </nav>
  );
}

export default Navbar;
