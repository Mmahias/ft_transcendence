import React from 'react';
import '../styles/Home.css';
import {BACKEND_FULL_URL} from '../constants';
import { testBackendEndpoint } from '../api/test-api';
import { useAuth, useSocket } from '../hooks';
import { Socket } from 'socket.io-client';
import AuthContext from '../contexts/AuthContext';
import { Link as RouterLink } from "react-router-dom";
import UserService from '../api/users-api'


// export const Log42: React.FC = () => {
//   const log = {
//     client_id: CLIENT_ID,
//     redirect_uri: API_REDIR,
//     response_type: "code",
//     scope: "public",
//   }

//   const url_42 = `${BACKEND_FULL_URL}?${new URLSearchParams(log).toString()}`;

//   const handleButtonClick = () => {
//     window.location.href = url_42;
//   };

//   return (
//     <div className="button-container">
//       <button className="button-52" onClick={handleButtonClick}>42_Login</button>
//     </div>
//   );
// };

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const socket = useSocket();

  
  const callTestEndpoint = async () => {
    try {
      const result = await testBackendEndpoint();
      console.log(result);
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
    if (isAuthenticated && socket) {
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

  const testMatchHistory = () => {
      UserService.getMe().then((res) => {
        console.log(res, typeof res.id);
        UserService.getMatchHistory(res.id).then((res) => {
          console.log(res);
        }
        ).catch(() => {
          console.log("Error while fetching user data");
        });
    }).catch(() => {
      console.log("Error while fetching user data");
    });
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
      <div className='button-test'>
        <button style={{color: 'white',marginLeft:'10px'}} onClick={callTestEndpoint}>Test BackendEndpoint |</button>
        <button style={{color: 'white',marginLeft:'10px'}} onClick={() => testMe()}>Test UserMe |</button>
        <button style={{color: 'white',marginLeft:'10px'}} onClick={() => testSocketConnection(socket)}>Test SocketConnection |</button>
        <button style={{color: 'white',marginLeft:'10px'}} onClick={() => testMatchHistory()}>Test MatchHistory |</button>
      </div>
    </div>
  );
}

export default Home;
