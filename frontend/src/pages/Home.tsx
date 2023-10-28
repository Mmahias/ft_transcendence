import React from 'react';
import '../styles/Home.css';
import { useAuth } from '../hooks';
import { Link as RouterLink } from "react-router-dom";


const Home: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="home-container">
      <h1 className="home-title" data-shadow='FT_TRANSCENDENCE'>FT_TRANSCENDENCE</h1>
      {isAuthenticated ? (
        <>
        <div className="wlcm-container">
          <div className='wlcm-div'>
            <p className='wlcm-msg'>Welcome to our transcendence</p>
          </div>
        </div>
        </>
      ) : (
        <div className="home-btn-container">
        <RouterLink to='/login'><button className="home-btn">SignUp/Login</button></RouterLink>
        
      </div>
      )}
    </div>
  );
}

export default Home;
