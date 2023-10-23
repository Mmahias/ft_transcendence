import '../styles/Login.css';
import "../App.styles";
import React, { useState }  from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from "../api/auth-api";
import UserService from '../api/users-api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import jwtDecode from 'jwt-decode';


// import { API_REDIR, API_URL, CLIENT_ID, BACKEND_FULL_URL } from '../constants';

// export const Login42: React.FC = () => {
//   const log = {
//     client_id: CLIENT_ID,
//     redirect_uri: API_REDIR,
//     response_type: "code",
//     scope: "public",
//   };

//   const url_42 = API_URL + "?" + new URLSearchParams(log).toString();

//   return (
//     <a className="btn-primary" style={{marginTop: '1%'}} href={url_42}>42_Login</a>
//   );
// };

interface DecodedToken {
  sub: number;
  isTwoFactorAuthenticated: boolean;
  iat: number; // Timestamp pour "Issued At"
  exp: number; // Timestamp pour "Expiration Time"
}


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
  const [show2FAForm, setShow2FAForm] = useState(false);
  const [twoFACode, setTwoFACode] = useState<string>('');
  
  const [rightPanelActive, setRightPanelActive] = useState(false);

  const switchToSignIn = () => {
    setRightPanelActive(false);
  }
  
  const switchToSignUp = () => {
    setRightPanelActive(true);
  }
  
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
      if (response && response.accessToken) {
        login(response);
        const decodedToken = jwtDecode(response.accessToken) as DecodedToken;
        
        if (decodedToken.isTwoFactorAuthenticated === false) {
          setShow2FAForm(true);
        } else {
          setSuccessMsg("Successfully logged in!");
          setErrorMsg('');
          toast.success("Successfully logged in!", {
            id: "login",
            icon: "🎮⌛",
            duration: 2000,
          });
          setTimeout(() => {
            navigate('/user/profile');
          }, 500);
        }
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
}

  const handleVerifyCode = async (event: React.MouseEvent<HTMLButtonElement>) => {
  // Empêcher le comportement par défaut (comme la soumission du formulaire)
  event.preventDefault();

    try {
        const response = await AuthService.authenticate2FA(twoFACode);
  
        const newAccessToken = response.accessToken;
  
        if (isAuthAvailable({ accessToken: newAccessToken })) {
            login({ accessToken: newAccessToken });
            setShow2FAForm(false);
            
            setSuccessMsg("Successfully authenticated with 2FA!");
            toast.success("Successfully authenticated with 2FA!", {
                id: "2fa",
                icon: "🎮⌛",
                duration: 2000,
            });
            setTimeout(() => {
                navigate('/user/profile');
            }, 500);
        } else {
            console.error("New access token does not meet criteria.");
            toast.error("Error: Incorrect 2FA code", {
                duration: 2000,
            });
        }
    } catch (error) {
        console.error('Error verifying 2FA code:', error);
        toast.error("Error: Incorrect 2FA code", {
            duration: 2000,
        });
    }
}


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
            {/* <Login42 /> */}
            {show2FAForm &&
              <div>
                <input type="text" placeholder="Enter 2FA Code" value={twoFACode} onChange={e => setTwoFACode(e.target.value)} />
                <button onClick={handleVerifyCode}>Verify</button>
              </div>}
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