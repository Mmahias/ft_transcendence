import '../styles/Login.css';
import "../App.styles";
import React, { useState, useEffect }  from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from "../api/auth-api";
import UserService from '../api/users-api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';


const Login = () => {

  const navigate = useNavigate();
  const { login, isAuthAvailable } = useAuth();
  
  const [nickname, setNickname] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  
  const [rightPanelActive, setRightPanelActive] = useState(false);

  const switchToSignIn = () => {
    setRightPanelActive(false);
  }
  
  const switchToSignUp = () => {
    setRightPanelActive(true);
  }

  // useEffect(() => {
  //   const url = window.location.href;

  //   const tokenMatch = url.match(/token=([a-zA-Z0-9_.-]+)/);

  //   if (tokenMatch && tokenMatch[1]) {
  //       const token = tokenMatch[1];
  //       login({ accessToken: token });
  //       navigate('/facode');
  //   }
  // }, [login, navigate]);
  
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
        login(response);
        setSuccessMsg("Successfully signed up! ");
        setErrorMsg('');
        toast.success("Successfully signed up!", {
          id: "signup",
          icon: "🎮⌛",
          duration: 2000,
        });
        setTimeout(() => {
          navigate('/user/profile');
        }, 500);
      }
    } catch (error) {
      setSuccessMsg('');
      toast.error("Error while signing up!", {
        id: "signup",
        icon: "🎮⌛",
        duration: 2000,
      });
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg("A user with this nickname already exists");
      }
    }
  }

  const handleLogin = async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();

    const usernameValidationError = validateLoginUsername(username);
    const passwordValidationError = validateLoginPassword(password);

    setUsernameError(usernameValidationError);
    setPasswordError(passwordValidationError);

    if (usernameValidationError || passwordValidationError) {
        return;
    }

    try {
      const response = await AuthService.login(username.toLowerCase(), password);
      if (response) {
        login(response);
        navigate('/facode');
      } else {
        throw new Error("No valid token received");
      }
    } catch (error) {
      setSuccessMsg('');
      toast.error("Error while logging in !", {
        id: "login",
        icon: "🎮⌛",
        duration: 2000,
      });
      setErrorMsg("Wrong nickname or password");
    }
};

const handleOauth42Login = () => {
  AuthService.oauth42Login();
};

  return (
    <div className="login-page">
      <div className={`container ${rightPanelActive ? 'right-panel-active' : ''}`} id="container">
        <div className="form-container sign-up-container">
          <form action="#">
            <h1>Create Account</h1>
            <input type="text" placeholder="Username" id="username" onChange={(event) => {
              setUsername(event.target.value);
              setUsernameError(validateUsername(event.target.value));
            }} />
            {usernameError && <small className="error-message">{usernameError}</small>}
            <input type="password" placeholder="Password" id="password" onChange={(event) => {
              setPassword(event.target.value);
              setPasswordError(validatePassword(event.target.value));
            }} />
            {passwordError && <small className="error-message">{passwordError}</small>}
            <input type="text" placeholder="Nickname" id="nickname" onChange={(event) => {
              setNickname(event.target.value);
              setNicknameError(validateNickname(event.target.value));
            }} />
            {nicknameError && <small className="error-message">{nicknameError}</small>}
            {successMsg &&
              <div className='success-message'>
                <h6>{successMsg}</h6>
              </div>
            }
            <button onClick={handleSignUp} disabled={!!(usernameError || passwordError || nicknameError)}>Sign Up</button>
          </form>
        </div>
        <div className="form-container sign-in-container">
          <form action="#">
            <h1>Log In</h1>
            <input type="text" placeholder="Username" id="username" onChange={(event) => {
              setUsername(event.target.value);
              setUsernameError(validateUsername(event.target.value));
            }} />
            {usernameError && <small className="error-message">{usernameError}</small>}
            <input type="password" placeholder="Password" id="password" onChange={(event) => {
              setPassword(event.target.value);
              setPasswordError(validatePassword(event.target.value));
            }} />
            {passwordError && <small className="error-message">{passwordError}</small>}
            {successMsg &&
              <div className='success-message'>
                <h6>{successMsg}</h6>
              </div>
            }
            <button onClick={handleLogin} disabled={!!(usernameError || passwordError)}>Log In</button>
            <button style={{margin:'1%'}} onClick={handleOauth42Login}>Log 42</button>
          </form>
        </div>
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button className="ghost" id="signIn" onClick={switchToSignIn}>Log In</button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start journey with us</p>
              <button className="ghost" id="signUp" onClick={switchToSignUp}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;