import React from 'react';
import theme from './theme';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Chat from './pages/Chat';
// import Game from './pages/Game';
import MyProfile from './pages/MyProfile';
import OtherProfile from './pages/OtherProfile';
import History from './pages/User/history';
import Friends from './pages/User/friends';
import Request from './pages/User/Request';
import Edit from './pages/User/edit';
import Login from './pages/Login';
import Error from './pages/Error';
import { Toaster } from 'react-hot-toast';
import { useAxiosPrivate } from './hooks';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import { MainContentWrapper, AppWrapper } from './App.styles';
import { AuthProvider, SocketProvider, ChatStatusContext } from './contexts';
import { Channel } from './api/types';

const MainContent: React.FC = () => {
  useAxiosPrivate();

  return (
    <MainContentWrapper>
      <Routes>
        <Route path="/" element={<Home/>} />
        {/* <Route path="/game" element={<Game />} /> */}
        <Route path="/user/profile" element={<MyProfile />} />
        <Route path="/user/history" element={<History />} />
        <Route path="/user/friends" element={<Friends />} />
        <Route path="/user/request" element={<Request />} />
        <Route path="/user/edit" element={<Edit />} />
        <Route path="/user/profile/:reqUsername" element={<OtherProfile />} />
        <Route path="/chat" element={ <Chat/> } />
        <Route path="/login" element={<Login />} />
        <Route path='*' element={<Error />}/>
      </Routes>
    </MainContentWrapper>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [activeChan, setActiveChan] = useState<Channel | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
    return (
      <Router>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <SocketProvider>
              <ChatStatusContext.Provider value={ {activeTab, setActiveTab, activeChan, setActiveChan, isExpanded, setIsExpanded}}>
                <Toaster />
                  <AppWrapper>
                    <Navbar theme={'dark'} />
                    <MainContent />
                    <Footer />
                  </AppWrapper>
              </ChatStatusContext.Provider>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    );
}

export default App;