import '../styles/Login.css';
import "../App.styles";
import React, { useState }  from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from "../api/auth-api";
import { useAuth } from '../hooks/useAuth';

const Login = () => {

  const navigate = useNavigate();
  const { auth, login } = useAuth();
  
  const [nickname, setNickname] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  const validateUsername = (value: string): string | null => {
    if (!value) return "Username is required";
    if (value.length < 4 || value.length > 20) return "Username must be between 4 and 20 characters";
    return null;
  };
  
  const validatePassword = (value: string): string | null => {
    if (!value) return "Password is required";
    if (value.length < 2) return "Password must be at least 2 characters";
    if (!/[a-z]/.test(value)) return "Password should contain at least one lowercase letter.";
    if (!/[A-Z]/.test(value)) return "Password should contain at least one uppercase letter.";
    if (!/[0-9]/.test(value)) return "Password should contain at least one number.";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value)) return "Password should contain at least one special character.";
    return null;
  };
  
  const validateNickname = (value: string): string | null => {
    if (!value) return "Nickname is required";
    return null;
  };
  
  const validateLoginUsername = (value: string): string | null => {
    if (!value) return "Username is required";
    return null;
  };

  const validateLoginPassword = (value: string): string | null => {
    if (!value) return "Password is required";
    return null;
  };

  const handleSignUp = async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    try {
      const response = await AuthService.signUp(username.toLowerCase(), password, nickname.toLowerCase());
      if (response) {
        console.log("OK S: ", response);
        login(response);
        setSuccessMsg("Successfully signed up! ");
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
        return;
    }

    event.preventDefault();
    try {
      const response = await AuthService.login(username.toLowerCase(), password);
      if (response) {
        console.log("Logged in");
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
      <h1 style={{ justifyContent: "center", marginTop: "100px" }}><span className="profile-p">LogIn / SignUp</span></h1>
      <div className="login-container">
        <input type="checkbox" id="chk" />
        <div className="signup">
          <form>
            <label htmlFor="chk">LogIn</label>
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
            {successMsg &&
              <div className='success-message'>
                <h6>{successMsg}</h6>
              </div>
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
        <div className="login">
          <form>
            <label htmlFor="chk">SignUp</label>
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
              <div className='success-message'>
                <h6>{successMsg}</h6>
              </div>
            }
            <button
              className='button-log'
              onClick={handleSignUp}
              disabled={!!(usernameError || passwordError || nicknameError)}>
              Sign up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;