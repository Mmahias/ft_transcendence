import React from 'react';
import './styles.css';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CLIENT_ID, BACKEND_FULL_URL, API_REDIR } from '../../constants';
import { testBackendEndpoint } from '../../api/test-api';
import { getMe } from '../../api/users-api';
import useAuth from '../../hooks/useAuth';
import {AuthState} from '../../contexts/AuthProvider';

export const Log42: React.FC = () => {
  const log = {
    client_id: CLIENT_ID,
    redirect_uri: API_REDIR,
    response_type: "code",
    scope: "public",
  }

  const url_42 = `${BACKEND_FULL_URL}?${new URLSearchParams(log).toString()}`;

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


const getToken = async (auth: AuthState) => {
  try {
    console.log('auth: ', auth);
  } catch (error) {
    console.error("Error calling test endpoint:", error);
  }
};

const Home: React.FC = () => {
  const { auth } = useAuth();
  return (
    <div className="home-container">
      <h1>FT_TRANSCENDENCE</h1>
      <button onClick={callTestEndpoint}>Test Backend Endpoint</button>
      <button onClick={getMe}>Test User Me</button>
      <button onClick={() => getToken(auth)}>Test Token</button>
      <Log42 />
    </div>
  );
}

export default Home;
