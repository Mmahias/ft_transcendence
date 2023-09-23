import React from 'react';
import './Login.style.css'; // Assurez-vous que le chemin est correct

const Login: React.FC = () => {
  return (
    <div className="login-container">
      <h1><span>Login</span></h1>
      <form className="login-form">
        <label htmlFor="username">Username</label>
        <input type="text" id="username" name="username" />
        <label htmlFor="password">Password</label>
        <input type="password" id="password" name="password" />
        <div className="button-container">
          <button type="submit" className="button-52">Login</button>
          <button type="button" className="button-52">Login42</button>
        </div>
      </form>
    </div>
  );
}

export default Login;

