import React from "react";
import './profile.style.css';
import { useEffect, useState } from "react";
import userImage from '../../assets/user2.png'
import { Link as RouterLink } from "react-router-dom";
import UserService from "../../api/users-api";
import AuthService from "../../api/auth-api";
import { useAuth } from "../../hooks";
import { User } from "../../api/types";
import { useQuery } from "@tanstack/react-query";

const Profile: React.FC = () => {
  const { auth } = useAuth();
  const {data: userProfile, status: statusProfile } = useQuery({queryKey: ['user'], queryFn: UserService.getMe});
  
  const [userName, setUserName] = useState<string>('');
  const [userStatus, setUserStatus] = useState<string>('');
  const [userWins, setUserWins] = useState<number>(0);
  const [userLosses, setUserLosses] = useState<number>(0);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [userSubDate, setUserSubDate] = useState<string>('');
  const [user2FAEnabled, set2FA] = useState<boolean>(false); // Initialisation
  const [userQrCodeData, setQrCodeData] = useState<string>('');
  const [userEnteredCode, setUserEnteredCode] = useState<string>('');
  
  const is2FAEnabledFromUser = userProfile?.authenticationEnabled || false;

  useEffect(() => {
    if (userProfile?.username) {
      setUserName(userProfile.username);
    } if (userProfile?.status) {
      setUserStatus(userProfile.status);
    } if (userProfile?.wins) {
      setUserWins(userProfile.wins);
    } if (userProfile?.losses) {
      setUserLosses(userProfile.losses);
    } if (userProfile?.level) {
      setUserLevel(userProfile.level);
    } if (userProfile?.authenticationEnabled) {
      set2FA(userProfile.authenticationEnabled);
    if (userProfile.createdAt) {
        const date = new Date(userProfile.createdAt);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');  // months are 0-indexed in JavaScript
        const year = date.getFullYear();
        
        const formattedDate = `${day}/${month}/${year}`;
        setUserSubDate(formattedDate);
      }
      console.log(userProfile);
    }
  }, [userProfile]);

  const handle2FAToggle = async () => {
    if (!user2FAEnabled) {
      try {
        const qrData = await AuthService.request2FAQrCode();
        setQrCodeData(qrData);
      } catch (error) {
        alert('Failed to request 2FA. Please try again.');
      }
    }
    // Vous pouvez ajouter la logique de désactivation ici plus tard
  };

  const handleVerifyCode = async () => {
    try {
        const verificationResponse = await AuthService.verify2FACode(userEnteredCode);
        if (verificationResponse && verificationResponse.accessToken) {
            await AuthService.enable2FA(userEnteredCode);  // Pass the code here
            alert('2FA verified and enabled successfully!');
            set2FA(true);
            setQrCodeData('');  // Hide the QR code
        } else {
            console.log("Verification failed.");
        }
    } catch (error) {
        alert('Failed to verify or enable 2FA. Please try again.');
    }
};


  return (
    <div className="wrapper">
      <div className="profile-card js-profile-card" style={{ marginTop: '25px' }}>
        <div className="profile-card__img">
          <img
            src={userImage}
            alt="profile card"
          />
        </div>
        <div className="profile-card__cnt js-profile-cnt">
          <div className="profile-card__name">{userName}</div>
          <div className="profile-card-loc">
            {/* <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right-circle" viewBox="0 0 16 16" style={{ color: 'red' }}>
              <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z" />
            </svg> */}
            <p style={{
              color: userStatus === "ONLINE" 
                ? '#006400'  // dark green
                : userStatus === "INGAME"
                ? '#FFD700'  // gold (as a substitute for dark yellow)
                : userStatus === "OFFLINE"
                ? '#8B0000'  // dark red
                : 'black'  // default color
            }}>
              {userStatus}
            </p>
          </div>
          <div className="profile-card-stats">
            <div className="profile-card-stats__item">
              <div className="profile-card-stats__title">Level</div>
              <div className="profile-card-stats__value">{userLevel}</div>
            </div>
            <div className="profile-card-stats__item">
              <div className="profile-card-stats__title">Wins</div>
              <div className="profile-card-stats__value">{userWins}</div>
            </div>
            <div className="profile-card-stats__item">
              <div className="profile-card-stats__title">Losses</div>
              <div className="profile-card-stats__value">{userLosses}</div>
            </div>
            <div className="profile-card-stats__item">
              <div className="profile-card-stats__title">Joined</div>
              <div className="profile-card-inf__txt">{userSubDate}</div>
            </div>
          </div>
          <div className="profile-card-inf">
            <div className="button-container">
              <RouterLink to='/user/edit'><button className="button-32">Edit profile pic</button></RouterLink>
              <RouterLink to='/user/history'><button className="button-32">History</button></RouterLink>
              <RouterLink to='/game'><button className="button-32">Play Game</button></RouterLink>
              <RouterLink to='/user/friends'><button className="button-32">Friends</button></RouterLink>
              <RouterLink to='/user/request'><button className="button-32">Request</button></RouterLink>
            </div>
          </div>
          <div className="toggle-container">
            <label className="lab-fa">2FA Authentication:</label>
            <input
              type="checkbox"
              checked={user2FAEnabled}
              onChange={handle2FAToggle}
              disabled={!!userQrCodeData} // Désactive la case à cocher si le QR Code est affiché
            />
            </div>
            <div className="qrcode-container">
            {userQrCodeData && (
              <div>
                <p>Veuillez scanner ce QR Code avec votre application d'authentification et entrer le code généré ci-dessous.</p>
                <img className="img-qrcode" src={userQrCodeData} />
                <input
                  type="text"
                  value={userEnteredCode}
                  onChange={(e) => setUserEnteredCode(e.target.value)}
                  placeholder="Enter the code from your app"
                />
                <button onClick={handleVerifyCode}>Verify Code</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;