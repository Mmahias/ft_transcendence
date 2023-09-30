import React from 'react';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import theme from './theme';
import { MainContentWrapper, AppWrapper } from './App.styles';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Chat from './components/chat/Chat';
import Game from './pages/Game/Game';
import  {LoggedStatus} from './pages/Login/Login';
import Profile from './pages/User/profile';
import History from './pages/User/history';
import Friends from './pages/User/friends';
import Request from './pages/User/Request';
import Edit from './pages/User/edit';
import Error from './pages/Error/Error';
import { Socket } from 'socket.io-client';
import { IsLoggedInContext, SocketContext, ChatStatusContext } from './contexts';
import { Channel } from './api/interfaces-api';
import Footer from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';
import useAxiosPrivate from './hooks/useAxiosPrivate';

const MainContent: React.FC = () => {
  useAxiosPrivate();

  return (
    <MainContentWrapper>
      <Routes>
        <Route path="/" element={<Home/>} />
        {/* <Route path="/login" element={<Login />}/> */}
        <Route path="/game" element={<Game />} />
        <Route path="/user/profile" element={<Profile />} />
        <Route path="/user/history" element={<History />} />
        <Route path="/user/friends" element={<Friends />} />
        <Route path="/user/request" element={<Request />} />
        <Route path="/user/edit" element={<Edit />} />
        <Route path="/chat" element={ <Chat/> } />
        <Route path="/login" element={<LoggedStatus />} />
        <Route path='*' element={<Error />}/>
      </Routes>
    </MainContentWrapper>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [activeChan, setActiveChan] = useState<Channel | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLoggedIn, setLoggedIn] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);
    return (
      <Router>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <ChatStatusContext.Provider value={ {activeTab, setActiveTab, activeChan, setActiveChan, isExpanded, setIsExpanded}}>
              <SocketContext.Provider value={socket}>
                <IsLoggedInContext.Provider value={isLoggedIn}>
                  <AppWrapper>
                    <Navbar theme={'dark'} setLoggedIn={setLoggedIn} setSocket={setSocket} />
                    <MainContent />
                    <Footer />
                  </AppWrapper>
                </IsLoggedInContext.Provider>
              </SocketContext.Provider>
            </ChatStatusContext.Provider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    );
}

export default App;