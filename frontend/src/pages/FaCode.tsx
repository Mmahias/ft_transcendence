import '../styles/FaCode.css';
import React, { useState, useEffect } from 'react';
import AuthService from '../api/auth-api';
import { useNavigate } from 'react-router-dom';
import UserService from '../api/users-api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const FaCode: React.FC = () => {

    const navigate = useNavigate();
    const { login, isAuthAvailable } = useAuth();
    const [successMsg, setSuccessMsg] = useState<string>("");
    const [show2FAForm, setShow2FAForm] = useState<boolean>(false);
    const [twoFACode, setTwoFACode] = useState<string>('');
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                await UserService.getMe();
                toast.success('Connexion réussie !');
                navigate('/user/profile');
            } catch (error) {
                const is2FARequired = await AuthService.check2FAStatus();
                setShow2FAForm(is2FARequired);
            }
        };
        checkAuthStatus();
    }, [navigate]);

    const handleVerifyCode = async (event: React.FormEvent) => {
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
    };

    return (
        <div className='facode-page'>
            <div className='card-fa'>
            <h1>Enter your verification code:</h1>
                {show2FAForm && 
                    <form onSubmit={handleVerifyCode}>
                        <input
                            type="text"
                            placeholder="2FA code"
                            value={twoFACode}
                            onChange={e => setTwoFACode(e.target.value)}
                        />
                        <button type="submit">Verify</button>
                    </form>
                }
            </div>
        </div>
    );
}

export default FaCode;
