import React from 'react';
import './styles.css';
import { Link as RouterLink } from 'react-router-dom';

const Home: React.FC = () => {
    return (
      <div className="home-container">
          <p>
            <h1> <span> FT_TRANSCENDENCE </span> </h1>
          </p>
        <div className="button-container">
        <RouterLink to="/"><button className="button-52" role="button">42_Login</button></RouterLink>
        <RouterLink to="/"><button className="button-52" role="button">Sign_In</button></RouterLink>
        <RouterLink to="/"><button className="button-52" role="button">Sign_Up</button></RouterLink>
        </div>
      </div>
    );
}

export default Home;
