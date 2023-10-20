import React from "react";
import '../styles/Profile.css';
import { useEffect, useState } from "react";
import userImage from '../assets/user2.png'
import { Link as RouterLink, useNavigate } from "react-router-dom";
import UserService from "../api/users-api";
import AuthService from "../api/auth-api";
import { Match } from "../api/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks";
import { Checkbox, CheckboxGroup } from '@chakra-ui/react'
import '../styles/Request.style.css'
import { User } from '../api/types';


const MyProfile: React.FC = () => {

  const { auth } = useAuth();
  const navigate = useNavigate();

  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<number>(0);
  const [userNick, setUserNick] = useState<string>('');
  const [userWins, setUserWins] = useState<number>(0);
  const [userLosses, setUserLosses] = useState<number>(0);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [userSubDate, setUserSubDate] = useState<string>('');
  const [user2FAEnabled, setUser2FAEnabled] = useState<boolean>(false); // Initialisation
  const [userQrCodeData, setUserQrCodeData] = useState<string>('');
  const [userEnteredCode, setUserEnteredCode] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!auth?.accessToken);
  const [showEditProfile, setShowEditProfile] = useState<boolean>(false);
  // const [showEditNickname, setShowEditNickname] = useState(false);
  // const [showEditAvatar, setShowEditAvatar] = useState(false);
  const [userAvatar, setUserAvatar] = useState('');
  const [userFriends, setUserFriends] = useState<User[]>([]);
  const [userRequestFriends, setUserRequestFriends] = useState<User[]>([]);
  const [matchHistory, setMatchHistory] = useState<Match[]>([]);


  const queryClient = useQueryClient();

  const { data: userProfile } = useQuery({
    queryKey: ['me'],
    queryFn: UserService.getMe,
    enabled: isLoggedIn ? true : false,
    onSuccess: (user) => {
      console.log("user", user)
    },
    onError: (error: any) => {
      if (error.response?.status === 401) {
        console.error('user not connected');
      }
    }
  });

  if (!isLoggedIn) {
    navigate("/error");
    return null;
  }

  // listening to login/logout
  useEffect(() => {
    setIsLoggedIn(!!auth?.accessToken);
  }, [auth]);

  useEffect(() => {
    console.log("UP", userProfile?.status)
    if (userProfile) {
      if (userProfile.username) {
        setUserName(userProfile.username);
      } if (userProfile.nickname) {
        setUserNick(userProfile.nickname);
      } if (userProfile.id) {
        setUserId(userProfile.id);
      } if (userProfile.wins) {
        setUserWins(userProfile.wins);
      } if (userProfile.losses) {
        setUserLosses(userProfile.losses);
      } if (userProfile.level) {
        setUserLevel(userProfile.level);
      } if (userProfile.authenticationEnabled) {
        setUser2FAEnabled(userProfile.authenticationEnabled);
      } if (userProfile.createdAt) {
        const date = new Date(userProfile.createdAt);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');  // months are 0-indexed in JavaScript
        const year = date.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;
        setUserSubDate(formattedDate);
      } if (userProfile.friends) {
        setUserFriends(userProfile.friends);
      } if (userProfile.friendsRequestReceived) {
        setUserRequestFriends(userProfile.friendsRequestReceived);
      }
      if (userProfile.id) {
        if (userProfile.id) {
          UserService.getMatchHistory(userProfile.id)
            .then(matchHistory => {
              setMatchHistory(matchHistory);
            })
            .catch(error => {
              console.error("Failed to fetch match history", error);
            });
        }
      }
    }
  }, [userProfile, isLoggedIn]);

  // MY AVATAR
  useEffect(() => {
    async function fetchUserAvatar() {
      if (userProfile) {
        const avatar = await UserService.getUserAvatar(userId);
        setUserAvatar(avatar);
      }
    }
    fetchUserAvatar(); // Appelez la fonction
  }, [userProfile]);

  // 2FA

  const enable2FAMutation = useMutation(async () => {
    return await AuthService.request2FAQrCode();
  }, {
    onSuccess: (qrData) => {
      setUserQrCodeData(qrData);
      queryClient.invalidateQueries(['user']);
    },
    onError: () => {
      alert('Failed to request 2FA. Please try again.');
    }
  });

  const disable2FAMutation = useMutation(async () => {
    // FIX IT
    // Add the logic for deactivating 2FA here.
    // return await AuthService.disable2FA();
  }, {
    onSuccess: () => {
      // Handle successful deactivation, for example:
      setUserQrCodeData('');
      queryClient.invalidateQueries(['user']);
    },
    onError: () => {
      alert('Failed to deactivate 2FA. Please try again.');
    }
  });

  const handle2FAToggle = () => {
    if (user2FAEnabled) {
      disable2FAMutation.mutate();
    } else {
      enable2FAMutation.mutate();
    }
  };

  const verify2FACodeMutation = useMutation(async (code: string) => {
    const response = await AuthService.enable2FA(code);
    return response; 
  }, {
    onSuccess: () => {
      setUser2FAEnabled(true);
      setUserQrCodeData('');  // Hide the QR code
      alert('2FA verified and enabled successfully!');
    },
    onError: () => {
      alert('Failed to verify or enable 2FA. Please try again.');
    }
  });
  

  const handleVerifyCode = () => {
    verify2FACodeMutation.mutate(userEnteredCode);
  };
  

  // UPDATE AVATAR & NICKNAME
  const handleNicknameSave = async () => {
    try {
      await UserService.updateNickname(userId, { nickname: userNick });
      queryClient.invalidateQueries(['user']);
    } catch (error) {
      console.error('Failed to update nickname:', error);
    }
  };
  
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      try {
        // Code pour télécharger le fichier avatar ici
        await UserService.uploadAvatar(userId, file);
        // Mettez à jour les données de l'utilisateur après le téléchargement de l'avatar
        queryClient.invalidateQueries(['user']);
      } catch (error) {
        console.error('Failed to upload avatar:', error);
      }
    }
  };
  
  const handleAvatarSave = async () => {
    try {
      queryClient.invalidateQueries(['user']);
    } catch (error) {
      console.error('Failed to update avatar:', error);
    }
  };
  

  const handleSettingsClick = () => {
    setShowEditProfile(!showEditProfile);
  };

  let editProfileForm = null;
  if (showEditProfile) {
    editProfileForm = (
      
      <div className="pl-lg-4">
        <h6 className="heading-small text-muted mb-4">Edit Profile</h6>
        <div className="row">
          <div className="col-lg-6">
            <div className="form-group focused">
              <label className="form-control-label" htmlFor="input-file">Avatar</label>
              <input className="form-control" type="file" accept="image/*" onChange={handleAvatarUpload} id="formFile"/>
            </div>
            <button className="btn btn-sm btn-primary ghost" onClick={handleAvatarSave}>Save</button>
          </div>
          <div className="col-lg-6">
            <div className="form-group">
              <label className="form-control-label" htmlFor="input-username">NickName</label>
              <input type="text" id="input-username" value={userNick} onChange={e => setUserNick(e.target.value)} className="form-control form-control-alternative" placeholder="new Username" />
            </div>
            <button className="btn btn-sm btn-primary ghost" onClick={handleNicknameSave}>Save</button>
          </div>
        </div>
        <hr className="my-4" />
        <h6 className="heading-small text-muted mb-4">2FA</h6>
        <div className="pl-lg-4">
          <div className="form-group focused">
            <Checkbox size='md' type="checkbox"
              checked={user2FAEnabled}
              onChange={handle2FAToggle}
              disabled={!!userQrCodeData}
              className="form-control form-control-alternative">
              Active 2FA
            </Checkbox>
            {userQrCodeData && (
              <div className="pl-lg-4">
                <label className="form-control-label">Veuillez scanner ce QR Code avec votre application d'authentification:</label>
                <img className="img-qrcode" style={{ margin: "auto" }} src={userQrCodeData} />
                <input
                  type="text"
                  value={userEnteredCode}
                  onChange={(e) => setUserEnteredCode(e.target.value)}
                  className="form-control form-control-alternative"
                  placeholder="Enter the code"
                  style={{ margin: "auto" }}
                />
                <a className="btn btn-sm btn-primary ghost" onClick={handleVerifyCode} style={{ marginTop: "10px" }}>Verify Code</a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="profile-page">

      <div className="main-content">
        <div className="header pb-8 pt-5 pt-lg-8 d-flex align-items-center" style={{ backgroundSize: "cover", backgroundPosition: "center top" }} >
          <span className="mask bg-gradient-default opacity-8"></span>
          <div className="container-fluid d-flex align-items-center">
            <div className="col-lg-7 col-md-10">
              <h1 className="display-2 text-white">Hello {userName}</h1>
            </div>
          </div>
        </div>
        <div className="container-fluid mt--7">
          <div className="row">
            <div className="col-xl-4 order-xl-2 mb-5 mb-xl-0">
              <div className="card card-profile shadow">
                <div className="row justify-content-center">
                  <div className="col-lg-3 order-lg-2">
                    <div className="card-profile-image">
                      <img src={userAvatar} alt={'userAvatar'} className="rounded-circle" />
                    </div>
                  </div>
                </div>
                <div className="card-header text-center border-0 pt-8 pt-md-4 pb-0 pb-md-4">
                </div>
                <div className="card-body pt-0 pt-md-4">
                  <div className="row">
                    <div className="col">
                      <div className="card-profile-stats d-flex justify-content-center mt-md-5">
                        <div>
                          <span className="heading">{userLevel}</span>
                          <span className="description">Elo</span>
                        </div>
                        <div>
                          <span className="heading">{userWins}</span>
                          <span className="description">Wins</span>
                        </div>
                        <div>
                          <span className="heading">{userLosses}</span>
                          <span className="description">Losses</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 style={{textTransform: 'capitalize', color: '#3aafa9'}}>
                      {userName}
                    </h3>
                    <h4 style={{color: '#2b7A78'}}>{userNick}</h4>
                    <div className="h5 font-weight-300">
                      <i style={{
                        color: userProfile?.status === "ONLINE"
                          ? '#006400'
                          : userProfile?.status === "INGAME"
                            ? '#FFD700'
                            : userProfile?.status === "OFFLINE"
                              ? '#8B0000'
                              : 'black'
                      }}>
                        {userProfile?.status}
                      </i>
                    </div>
                    <div className="h5 mt-4">
                      <i className="ni business_briefcase-24 mr-2"></i>Joined at
                    </div>
                    <div>
                      <i className="ni education_hat mr-2"></i>{userSubDate}
                    </div>
                    <hr className="my-4" />
                    <h3>
                      2FA:
                      <p style={{ color: user2FAEnabled ? 'green' : 'red' }}>
                        {user2FAEnabled ? ' activated' : ' disabled'}
                      </p>
                    </h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-8 order-xl-1">
              <div className="card bg-secondary shadow">
                <div className="card-header bg-white border-0">
                  <div className="row align-items-center">
                    <div className="col-8">
                      <h3 className="mb-0">My Profile</h3>
                    </div>
                    <div className="col-4 text-right">
                    <a className="btn btn-sm btn-primary ghost" onClick={handleSettingsClick}>Settings</a>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <form>
                    {editProfileForm}
                  </form>
                  <div className="tab-container">
                    <div className="tabs-profile">
                      <div className="tab-2">
                        <label htmlFor="tab2-1">My Friends</label>
                        <input id="tab2-1" name="tabs-two" type="radio" />
                        <div>
                          <div className="friends-content">
                            <ul className="team">
                              {userFriends && userFriends.map((friend) => (
                                <li className="member" key={friend.id}>
                                  <div className="thumb">
                                    {friend.username && (
                                      <img
                                        src={friend.avatar}
                                        alt={`${friend.username}'s avatar`}
                                      />
                                    )}
                                  </div>
                                  <div className="description">
                                    <h3>{friend.username}</h3>
                                    <p>You can send a chat message, play games, or visit this friend's profile and more &#128521;</p>
                                    <a href={`/profile/${friend.id}`} className="btn btn-sm btn-primary ghost">Profile</a>
                                    <a href="/chat" className="btn btn-sm btn-primary ghost">Message</a>
                                    <a href="/game" className="btn btn-sm btn-primary ghost">Invite to Game</a>
                                    <button className="btn btn-sm btn-no ghost">Delete</button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="tab-2">
                        <label htmlFor="tab2-2">Request Friends</label>
                        <input id="tab2-2" name="tabs-two" type="radio" />
                        <div>
                          <div className="request-content">
                            <ul className="team">
                            {userRequestFriends && userRequestFriends.map((requestFriend) => (
                              <li className="member" key={requestFriend.id}>
                                <div className="thumb"><img src={requestFriend.avatar} alt={`${requestFriend.username}'s avatar`} /></div>
                                <div className="description">
                                  <h3>{requestFriend.username}</h3>
                                  <p>You sent a friend request</p>
                                  <button className="btn btn-sm btn-primary ghost">Accept</button>
                                  <button className="btn btn-sm btn-no ghost">Refuse</button>
                                </div>
                              </li>
                            ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="tab-2">
                        <label htmlFor="tab2-3">Game Histories</label>
                        <input id="tab2-3" name="tabs-two" type="radio" />
                        <div>

                          <div className="table-wrapper">
                            <table className="fl-table">
                              <thead>
                                <tr>
                                  <th>GAME_ID</th>
                                  <th>OPPONENT</th>
                                  <th>RANK</th>
                                  <th>ELO</th>
                                  <th>SCORE</th>
                                  <th>WINNER</th>
                                </tr>
                              </thead>
                              <tbody>
                                {matchHistory.map(game => (
                                  <tr key={game.id}>
                                    <td>{game.id}</td>
                                    <td>{game.winnerId}</td>
                                    <td>{game.loserId}</td>
                                    <td>{game.scoreWinner}</td>
                                    <td>{game.scoreLoser}</td>
                                  </tr>
                                ))}
                              </tbody>
                                </table>
                              </div>

                          </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default MyProfile;