import React from 'react';
import { CLIENT_ID, API_REDIR, BACK_URL } from '../../constants/constants';
import './Login.style.css'; // Assurez-vous que le chemin est correct

export const Log42: React.FC = () => {

  const log = {
    client_id: CLIENT_ID,
    redirect_uri: API_REDIR,
    response_type: "code",
    scope: "public",
  }

  const url_42 = BACK_URL + "?" + new URLSearchParams(log).toString();

  const handleButtonClick = () => {
    window.location.href = url_42;
  };
  
  return (
    <div className="button-containe" style={{marginTop: "20px"}}>
      <button className="button-52" onClick={handleButtonClick}>Login_42</button>
    </div>
  );
};

const Login: React.FC = () => {
  return (
    <div className="login-container">
      <h1 style={{ justifyContent: "center", marginTop: "0px" }}><span>Login</span></h1>
      <form className="login-form">
        <label htmlFor="username">Username</label>
        <input type="text" id="username" name="username" />
        <label htmlFor="password">Password</label>
        <input type="password" id="password" name="password" />
        <div className="button-container" style={{marginTop: "10px"}}>
          <button type="submit" className="button-52">LogIn</button>
        </div>
      </form>
      <Log42 />
    </div>
  );
}

export default Login;

