import React from 'react';
import './styles.css';
import { useQuery } from 'react-query';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

const Home: React.FC = () => {
    return (
      <div className="home-container">
          <p>
            <h1> <span> FT_TRANSCENDENCE </span> </h1>
          </p>
        <div className="button-container">
        <RouterLink to="/"><button className="button-52">42_Login</button></RouterLink>
        </div>
      </div>
    );
}

export default Home;
