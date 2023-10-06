import React from 'react';
import './styles.css';
import { CLIENT_ID, BACKEND_FULL_URL, API_REDIR } from '../../constants';
import { testBackendEndpoint } from '../../api/test-api';
import { useAuth, useSocket } from '../../hooks';
import { Socket } from 'socket.io-client';
import { AuthState } from '../../contexts/AuthContext';
import { Link as RouterLink } from "react-router-dom";
import UserService from '../../api/users-api'
import { SocketContextType } from 'contexts';

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

const connected = async (auth: AuthState) => {
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
  // Emitting a test event, you can remove this if not required
  socket.emit('test-event', { message: 'Hello from client!' });
};


const Home: React.FC = () => {
  const { auth } = useAuth();
  const socket = useSocket();
  const isLoggedIn = !!auth?.accessToken;

  return (
    <div className="home-container">
      <h1><span>FT_TRANSCENDENCE</span></h1>
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
        <button onClick={UserService.getMe}>Test User Me</button>
        <button onClick={() => getToken(auth)}>Test Token</button>
        <button onClick={() => connected(auth)}>Am i connected ?</button>
        <button onClick={() => testSocketConnection(socket)}>Test Socket Connection</button>
      </div>
    </div>
  );
}

export default Home;
