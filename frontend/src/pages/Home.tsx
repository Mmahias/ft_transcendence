import React from 'react';
import '../styles/Home.css';
import { useAuth, useSocket } from '../hooks';
import { Socket } from 'socket.io-client';
import { Link as RouterLink } from "react-router-dom";


const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const socket = useSocket();
  
  const testSocketConnection = (socket: Socket | null) => {
    console.log('socket: ', socket);
    if (!socket || socket?.connected === null) {
      console.log('Socket is null or not connected');
      return;
    }
    socket.emit('test-event', { message: 'Hello from client!' });
  };

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
      <div className='button-test'>
        <button style={{color: 'white',marginLeft:'10px'}} onClick={() => testSocketConnection(socket)}>Test SocketConnection |</button>
      </div>
    </div>
  );
}

export default Home;
