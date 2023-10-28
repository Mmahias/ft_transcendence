import '../styles/FaCode.css';
import React, { useState, useEffect } from 'react';
import AuthService from '../api/auth-api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const FaCode: React.FC = () => {

  const navigate = useNavigate();
  const [twoFACode, setTwoFACode] = useState<string>('');
  const { checkIsLoggedIn } = useAuth();

  const handleVerifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await AuthService.authenticate2FA(twoFACode);
      toast.success("Successfully authenticated with 2FA!", {
        id: "2fa",
        icon: "🎮⌛",
        duration: 2000,
      });
      checkIsLoggedIn();
      setTimeout(() => {
        navigate('/user/profile');
      }, 500);
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
      toast.error("Error: Incorrect 2FA code", {
        duration: 2000,
      });
    }
  };

  return (
    <div className='facode-page'>
      <div className='card-fa'>
      <h1>Enter your verification code:</h1>
          <form onSubmit={handleVerifyCode}>
            <input
              type="text"
              placeholder="2FA code"
              value={twoFACode}
              onChange={e => setTwoFACode(e.target.value)}
            />
            <button type="submit">Verify</button>
          </form>
      </div>
    </div>
  );
}

export default FaCode;
