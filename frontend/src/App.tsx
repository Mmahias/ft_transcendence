import { ThemeProvider } from 'styled-components';
import theme from './theme';
import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Game from './pages/Game';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const App: React.FC = () => {
    return (
        <Router>
            <ThemeProvider theme={theme}>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home/>} />
                    <Route path="/game" element={<Game />} />
                </Routes>
                <Footer />
            </ThemeProvider>
        </Router>
    );
}

export default App;
