import { ThemeProvider } from 'styled-components';
import { AppLogo, AppHeader, AppLink, MainContentWrapper, AppWrapper } from './App.styles';
import theme from './theme';
import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Game from './pages/Game/Game';
import Profile from './pages/User/profile';
import History from './pages/User/history';
import Friends from './pages/User/friends';
import Edit from './pages/User/edit';
import Error from 'pages/Error/Error';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


const App: React.FC = () => {
    return (
        <Router>
            <ThemeProvider theme={theme}>
                <AppWrapper>
                    <Navbar />
                    <MainContentWrapper>
                        <Routes>
                            <Route path="/" element={<Home/>} />
                            <Route path="/game" element={<Game />} />
                            <Route path="/user/profile" element={<Profile />} />
                            <Route path="/user/history" element={<History />} />
                            <Route path="/user/friends" element={<Friends />} />
                            <Route path="/user/edit" element={<Edit />} />
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