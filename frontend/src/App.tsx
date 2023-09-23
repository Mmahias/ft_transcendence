import React from 'react';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState } from 'react';

import theme from './theme';
import { MainContentWrapper, AppWrapper } from './App.styles';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Chat from './components/chat/chat';
import Game from './pages/Game/Game';
import Profile from './pages/User/profile';
import History from './pages/User/history';
import Friends from './pages/User/friends';
import Edit from './pages/User/edit';
import Error from './pages/Error/Error';
import { Socket } from 'socket.io-client';
import { IsLoggedInContext, SocketContext, ChatStatusContext } from './context/contexts';
import { Channel } from './api/interfaces';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
	const [activeChan, setActiveChan] = useState<Channel | null>(null);
	const [isExpanded, setIsExpanded] = useState<boolean>(false);
	const [isLoggedIn, setLoggedIn] = useState<boolean>(false);
	const [socket, setSocket] = useState<Socket | null>(null);

    return (
        <Router>
            <ThemeProvider theme={theme}>
                <AppWrapper>
                    <Navbar />
                    <ChatStatusContext.Provider value={ {activeTab, setActiveTab, activeConv, setActiveConv, isExpanded, setIsExpanded}}>
                    <SocketContext.Provider value={socket}>
                    <IsLoggedInContext.Provider value={isLoggedIn}>
                    <MainContentWrapper>
                        <Routes>
                            <Route path="/" element={<Home/>} />
                            <Route path="/game" element={<Game />} />
                            <Route path="/user/profile" element={<Profile />} />
                            <Route path="/user/history" element={<History />} />
                            <Route path="/user/friends" element={<Friends />} />
                            <Route path="/user/edit" element={<Edit />} />
                            <Route path="/chat" element={ <Chat/> } />
                            <Route path='*' element={<Error />}/>
                        </Routes>
                    </MainContentWrapper>
                    <Footer />
                </AppWrapper>
            </ThemeProvider>
        </Router>
    );
}

export default App;
