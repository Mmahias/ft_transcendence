import React from 'react';
import './styles.css';
import { Link as RouterLink} from 'react-router-dom';


const Home: React.FC = () => {
    return (
      <div className="home-container">
        <p>
          <h1> <span> FT_TRANSCENDENCE </span> </h1>
          <div className="button-container">
            <RouterLink to='/SignUp'><button className="button-52">SignUp</button></RouterLink>
            <RouterLink to='/Login'><button className="button-52">Login</button></RouterLink>
          </div>
        </p>

      </div>
    );
}

export default Home;
