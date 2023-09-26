import React from 'react';
import './styles.css';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CLIENT_ID, BACK_URL, API_REDIR } from '../../constants/constants'; 
import { testBackendEndpoint } from '../../api/test-api';

export const Log42: React.FC = () => {
  const log = {
    client_id: CLIENT_ID,
    redirect_uri: API_REDIR,
    response_type: "code",
    scope: "public",
  }

  const url_42 = `${BACK_URL}?${new URLSearchParams(log).toString()}`;

  const handleButtonClick = () => {
    window.location.href = url_42;
  };

  return (
    <div className="button-container">
      <button className="button-52" onClick={handleButtonClick}>42_Login</button>
    </div>
  );
};

const callTestEndpoint = async () => {
  try {
    const result = await testBackendEndpoint();
    console.log(result);
  } catch (error) {
    console.error("Error calling test endpoint:", error);
  }
};

const Home: React.FC = () => {
<<<<<<< HEAD
  return (
    <div className="home-container">
        <h1>FT_TRANSCENDENCE</h1>
        <button onClick={callTestEndpoint}>Test Backend Endpoint</button>
        <Log42 />
    </div>
  );
=======
    return (
      <div className="home-container">
        <p>
          <h1> <span> FT_TRANSCENDENCE </span> </h1>
          <div className="button-container">
            <RouterLink to='/SignUp'><button className="button-52">SignUp</button></RouterLink>
            <RouterLink to='/Login'><button className="button-52">Login</button></RouterLink>
          </div>
        </p>

      </div>
    );
>>>>>>> b5cbb09eba67d2b70242c9d02e21c07755051dea
}

export default Home;
