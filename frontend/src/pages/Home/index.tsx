import React from 'react';
import './styles.css';
import { useQuery } from 'react-query';
import { Link as RouterLink, redirect } from 'react-router-dom';
import axios from 'axios';
import { CLIENT_ID, BACK_URL, API_REDIR } from '../../constants/constants'; 


export const Log42: React.FC = () => {

  const log = {
    client_id: CLIENT_ID,
    redirect_uri: API_REDIR,
    response_type: "code",
    scope: "public",
  }

  const url_42 = BACK_URL + "?" + new URLSearchParams(log).toString();

  const handleButtonClick = () => {
    window.location.href = url_42;
  };
  
  return (
    <div className="button-container">
      <button className="button-52" onClick={handleButtonClick}>Login</button>
    </div>
  );
};

const Home: React.FC = () => {
    return (
      <div className="home-container">
          <p>
            <h1> <span> FT_TRANSCENDENCE </span> </h1>
            <Log42 />
          </p>
        
      </div>
    );
}

export default Home;
