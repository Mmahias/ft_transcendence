import {
  LoginWrapper,
  Background,
  LoginForm,
  LoginLabel,
  LoginInput,
  AlertSuccess,
  AlertError,
  SocialWrapper,
  SocialButton
} from './Login.styles';
import "./../../App.styles";
import React, { useState }  from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signUp, login } from "../../api/auth-api";
// import { createSocketConnexion } from '../sockets/sockets';
import { Socket } from 'socket.io-client';


export default function Login({ onSetLoggedIn, setSocket }: { 
  onSetLoggedIn: React.Dispatch<React.SetStateAction<boolean>>,
  setSocket: React.Dispatch<React.SetStateAction<Socket | null>> }) {
  
  const [nickname, setNickname] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const navigate = useNavigate();


  const handleSignUp = async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    try {
      await signUp(username, password, nickname);
      onSetLoggedIn(true);
      console.log("OK S");
      setSuccessMsg("Successfully signed up! ")
      setErrorMsg('');
      // const newSocket = createSocketConnexion();
      // setSocket(newSocket);
      setTimeout(() => {
        navigate('/settings');
      }, 2000);
    } catch (error) {
      console.log("KO S");
      setSuccessMsg('');
      setErrorMsg("A user with this nickname already exists");
    }
  }

  const handleLogin = async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    try {
      await login(username, password);
      onSetLoggedIn(true);
      console.log("OK L");
      setSuccessMsg("Successfully logged in! ")
      setErrorMsg('');
      // const newSocket = createSocketConnexion();
      // setSocket(newSocket);
      setTimeout(() => {
        navigate('/settings');
      }, 2000);
    } catch (error) {
      console.log("KO L", error);
      setSuccessMsg('');
      setErrorMsg("Wrong nickname or password");
    }
    
  }

  return (
    <>
      <Background />
      <LoginWrapper>
        <LoginForm>
          <LoginLabel htmlFor="username">Username</LoginLabel>
          <LoginInput
            onChange={(event) => { setUsername(event.target.value) }}
            type="text"
            placeholder="username"
            id="username"
          />
          <LoginLabel htmlFor="password">Password</LoginLabel>
          <LoginInput
            onChange={(event) => { setPassword(event.target.value) }}
            type="password"
            placeholder="Password"
            id="password"
          />
          <LoginInput
            onChange={(event) => { setNickname(event.target.value) }}
            type="text"
            placeholder="nickname"
            id="nickname"
          />
          {successMsg && 
            <AlertSuccess>
              <h6>{successMsg}</h6>
            </AlertSuccess>
          }
          {errorMsg &&
            <AlertError>
              <h6>{errorMsg}</h6>
            </AlertError>
          }
          <SocialWrapper>
            <SocialButton className="go">
              <a href={import.meta.env.VITE_URL_42}>Log with 42</a>
            </SocialButton>
            <SocialButton className="fb">
              <button onClick={handleSignUp}>Sign up</button>
            </SocialButton>
            <SocialButton className="fb">
              <button onClick={handleLogin}>Login</button>
            </SocialButton>
          </SocialWrapper>
        </LoginForm>
      </LoginWrapper>
    </>
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