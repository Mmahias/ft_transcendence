import React from 'react';
import '../styles/Home.css';
import { CLIENT_ID, BACKEND_FULL_URL, API_REDIR } from '../constants';
import { testBackendEndpoint } from '../api/test-api';
import { useAuth, useSocket } from '../hooks';
import { Socket } from 'socket.io-client';
import { AuthState, isAuthAvailable } from '../contexts/AuthContext';
import { Link as RouterLink } from "react-router-dom";
import UserService from '../api/users-api'

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

const Home: React.FC = () => {
  const { auth } = useAuth();
  const socket = useSocket();
  const isLoggedIn = isAuthAvailable(auth);

  
  const callTestEndpoint = async () => {
    try {
      const result = await testBackendEndpoint();
      console.log(result);
    } catch (error) {
      console.error("Error calling test endpoint:", error);
    }
  };
  
  const testToken = async (auth: AuthState) => {
    try {
      console.log('auth: ', auth);
    } catch (error) {
      console.error("Error calling test endpoint");
    }
  };
  
  const testConnected = async (auth: AuthState) => {
    try {
      console.log('isLoggedIn', !!auth?.accessToken);
    } catch (error) {
      console.error("Error calling test endpoint:", error);
    }
  };
  
  const testSocketConnection = (socket: Socket | null) => {
    console.log('socket: ', socket);
    if (!socket || socket?.connected === null) {
      console.log('Socket is null or not connected');
      return;
    }
    socket.emit('test-event', { message: 'Hello from client!' });
  };
  
  const testMe= () => {
    if (!!auth?.accessToken && socket) {
      UserService.getMe().then((res) => {
        console.log(res);
      }).catch(() => {
        console.log("Error while fetching user data");
      });
    }
    else {
      console.log("No user connected");
    }
  };

  return (
    <div className="home-container">
      <h1><span className="home-span" >FT_TRANSCENDENCE</span></h1>
      {isLoggedIn ? (
        <>
        <p className='welcome-home'>Welcome to our transcendence</p>
        </>
      ) : (
        <div className='button-home-container'>
        <RouterLink to='/login'><button className="button-52">SignUp/Login</button></RouterLink>
      </div>
      )}
      <div className='button-test'>
        <button onClick={callTestEndpoint}>Test Backend Endpoint</button>
        <button onClick={() => testMe()}>Test User Me</button>
        <button onClick={() => testToken(auth)}>Test Token</button>
        <button onClick={() => testConnected(auth)}>Am i connected ?</button>
        <button onClick={() => testSocketConnection(socket)}>Test Socket Connection</button>
      </div>
    </div>
  );
}

export default Home;
