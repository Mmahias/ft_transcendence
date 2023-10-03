import {
  AlertSuccess,
  AlertError,
} from './Login.styles';
import './Login.style.css';
import "./../../App.styles";
import React, { useState, useEffect }  from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from "../../api/auth-api";
// import { createSocketConnexion } from '../sockets/sockets';
import { Socket } from 'socket.io-client';
import useAuth from '../../hooks/useAuth';
import { validateUsername, validatePassword, validateNickname, validateLoginUsername, validateLoginPassword } from './validation';


export default function Login({ onSetLoggedIn, setSocket }: { 
  onSetLoggedIn: React.Dispatch<React.SetStateAction<boolean>>,
  setSocket: React.Dispatch<React.SetStateAction<Socket | null>> }) {
  
  const [nickname, setNickname] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const navigate = useNavigate();
  const { auth, login } = useAuth();
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);


  const handleSignUp = async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    try {
      const response = await AuthService.signUp(username, password, nickname);
      if (response) {
        console.log("OK S");
        login(response);
        onSetLoggedIn(true);
        setSuccessMsg("Successfully signed up! ");
        setErrorMsg('');
        setTimeout(() => {
          navigate('/settings');
        }, 2000);
      //}
    } catch (error) {
      setSuccessMsg('');
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg("A user with this nickname already exists");
      }
    }
  }

  
  const handleLogin = async (event: React.MouseEvent<HTMLElement>) => {

    const usernameValidationError = validateLoginUsername(username);
    const passwordValidationError = validateLoginPassword(password);

    setUsernameError(usernameValidationError);
    setPasswordError(passwordValidationError);

    if (usernameValidationError || passwordValidationError) {
        return; // Ne continuez pas si des erreurs de validation sont présentes
    }

    event.preventDefault();
    try {
      const response = await AuthService.login(username.toLowerCase(), password);
      if (response) {
        login(response);
        setSuccessMsg("Successfully logged in!");
        setErrorMsg('');
        setTimeout(() => {
          navigate('/user/profile');
        }, 2000);
      }
    } catch (error) {
      setSuccessMsg('');
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg("Wrong nickname or password");
      }
    }
  }


  return (
    <div className='sign-log-container'>
      <h1 style={{ justifyContent: "center", marginTop: "100px" }}><span className="profile-p">SignUp / LogIn</span></h1>
      <div className="login-container">
        <input type="checkbox" id="chk" />
        <div className="signup">
          <form>
            <label htmlFor="chk">Sign up</label>
            <input
              onChange={(event) => {
                setUsername(event.target.value);
                setUsernameError(validateUsername(event.target.value));
              }}
              type="text"
              placeholder="Username"
              id="username"
            />
            {usernameError && <small className="error-message">{usernameError}</small>}
            <input
              onChange={(event) => {
                setPassword(event.target.value);
                setPasswordError(validatePassword(event.target.value));
              }}
              type="password"
              placeholder="Password"
              id="password"
            />
            {passwordError && <small className="error-message">{passwordError}</small>}
            <input
              onChange={(event) => {
                setNickname(event.target.value);
                setNicknameError(validateNickname(event.target.value));
              }}
              type="text"
              placeholder="nickname"
              id="nickname"
            />
            {nicknameError && <small className="error-message">{nicknameError}</small>}
            {successMsg &&
              <AlertSuccess>
                <h6>{successMsg}</h6>
              </AlertSuccess>
            }
            <button
              className='button-log'
              onClick={handleSignUp}
              disabled={!!(usernameError || passwordError || nicknameError)}>
              Sign up
            </button>
          </form>
        </div>
        <div className="login">
          <form>
            <label htmlFor="chk">Login</label>
            <input
              onChange={(event) => {
                setUsername(event.target.value);
                setUsernameError(validateLoginUsername(event.target.value));
              }}
              type="text"
              placeholder="Username"
              id="username"
            />
            {usernameError && <small className="error-message">{usernameError}</small>}

            <input
              onChange={(event) => {
                setPassword(event.target.value);
                setPasswordError(validateLoginPassword(event.target.value));
              }}
              type="password"
              placeholder="Password"
              id="password"
            />
            {passwordError && <small className="error-message">{passwordError}</small>}
            {successMsg &&
              <AlertSuccess>
                <h6>{successMsg}</h6>
              </AlertSuccess>
            }
            <button
              className='button-log'
              onClick={handleLogin}
              disabled={!!(usernameError || passwordError)}>
              Login
            </button>
          </form>
          <button className='button-log'><a href={import.meta.env.VITE_URL_42}>Log with 42</a></button>
        </div>
      </div>
    </div>
  );
}


function LoggedStatus() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentSocket, setSocket] = useState<Socket | null>(null);

  return (
    <Login onSetLoggedIn={setIsLoggedIn} setSocket={setSocket} />
  );
}

export { LoggedStatus };