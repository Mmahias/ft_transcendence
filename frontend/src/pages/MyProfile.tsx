import React from "react";
import '../styles/Profile.css';
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import UserService from "../api/users-api";
import FriendsService from "../api/friends-api";
import AuthService from "../api/auth-api";
import { Match } from "../api/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks";
import { Checkbox, CheckboxGroup } from '@chakra-ui/react'
import '../styles/Request.style.css'
import { User, UserAchievement, FriendRequest } from '../api/types';
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

type MatchDetail = {
  id: number;
  opponentName: string;
  score: string;
  result: string;
  duration: number;
};

const MyProfile: React.FC = () => {

  const { auth, login, refreshToken, isAuthAvailable } = useAuth();
  const navigate = useNavigate();

  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<number>(0);
  const [userNick, setUserNick] = useState<string>('');
  const [userWins, setUserWins] = useState<number>(0);
  const [userLosses, setUserLosses] = useState<number>(0);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [userSubDate, setUserSubDate] = useState<string>('');
  const [qrCodeData, setQRCodeData] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!auth?.accessToken);
  const [showEditProfile, setShowEditProfile] = useState<boolean>(false);
  const [userAvatar, setUserAvatar] = useState('');
  const [userFriends, setUserFriends] = useState<User[]>([]);
  const [userRequestFriends, setUserRequestFriends] = useState<FriendRequest[]>([]);
  const [matchHistory, setMatchHistory] = useState<MatchDetail[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);

  const queryClient = useQueryClient();

  const { data: userProfile } = useQuery({
    queryKey: ['me'],
    queryFn: UserService.getMe,
    enabled: isLoggedIn ? true : false,
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

  const fetchMatchProperties = async (match: Match, userId: number) => {
    const isWinner = match.winnerId === userId;
    const opponentName = isWinner ? match.loser.username : match.winner.username;
    console.log(match);
    
    return {
      id: match.id,
      opponentName: opponentName,
      score: isWinner ? `${match.scoreWinner} - ${match.scoreLoser}` : `${match.scoreLoser} - ${match.scoreWinner}`,
      result: isWinner ? 'W' : 'L',
      duration: match.duration / 1000
    };
  };

  useEffect(() => {
    if (userProfile) {
      setUserName(userProfile.username);
      setUserNick(userProfile.nickname);
      setUserId(userProfile.id);
      setUserWins(userProfile.wins);
      setUserLosses(userProfile.losses);
      setUserLevel(userProfile.level);
      setIs2FAEnabled(userProfile.authenticationEnabled)
      setUserFriends(userProfile.friends);
      setUserRequestFriends(userProfile.friendsRequestReceived);
      
      // Subscription date
      const date = new Date(userProfile.createdAt);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');  // months are 0-indexed in JavaScript
      const year = date.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      setUserSubDate(formattedDate);

      // Achievements
      UserService.getAchievements(userProfile.id)
      .then(async achievements => {
        setAchievements(achievements);
      })
      .catch(error => {
        console.error("Failed to fetch match history", error);
      });

      // Game history
      UserService.getMatchHistory(userProfile.id)
      .then(async matchHistory => {
        const processedMatchDetails = await Promise.all(
          matchHistory.map(async game => fetchMatchProperties(game, userProfile.id))
        );
        console.log("processedMatchDetails", processedMatchDetails);
        setMatchHistory(processedMatchDetails);
      })
      .catch(error => {
        console.error("Failed to fetch match history", error);
      });
      check2FAStatus(userProfile.id);
    }
  }, [userProfile]);

  // AVATARS
  useEffect(() => {
    async function fetchUserAvatar() {
      if (userProfile) {
        const avatar = await UserService.getUserAvatar(userId);
        setUserAvatar(avatar);
      }
    }
    fetchUserAvatar();
  }, [userProfile]);

  // 2FA

// // Appelez la méthode check2FAStatus sur cette instance
  const check2FAStatus = async (userId: number) => {
    try {
      const is2FAEnabled = await AuthService.check2FAStatus(userId);
      setIs2FAEnabled(is2FAEnabled);
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    }
  };

  const handleEnable2FA = async () => {
    try {
      const qrData = await AuthService.generate2FAQRCode();
      setQRCodeData(qrData);
    } catch (error) {
      console.error('Error enabling 2FA:', error);
    }
  };

  const handleVerify2FACode = async () => {
    try {
      await AuthService.enable2FA(verificationCode);
  
      const oldAccessToken = auth?.accessToken;
  
      const newAccessToken = await refreshToken();

      if (isAuthAvailable({ accessToken: newAccessToken })) {
        login({ accessToken: newAccessToken });
        console.log('login:', newAccessToken);
        setQRCodeData(null);
        setVerificationCode('');
        setIs2FAEnabled(true);
  
        console.log('Access token updated successfully:', newAccessToken);
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


  // ACCEPT / REFUSE FRIENDS REQUEST
  // Fonction pour accepter une demande d'ami
  const acceptFriendRequest = async (friendUsername: string) => {
    try {
      await FriendsService.acceptFriendRequest(friendUsername);
      setUserRequestFriends((prevRequests) =>
        prevRequests.filter((request) => request.from.username !== friendUsername)
      );
      const updatedUserProfile = await UserService.getMe();
      setUserFriends(updatedUserProfile.friends);
    } catch (error) {
      console.error('Échec de l\'acceptation de la demande d\'ami :', error);
    }
  };
  
  // Fonction pour refuser une demande d'ami
  const refuseFriendRequest = async (friendUsername: string) => {
    try {
      await FriendsService.refuseFriendRequest(friendUsername);
      setUserRequestFriends((prevRequests) =>
        prevRequests.filter((request) => request.from.username !== friendUsername)
      );
    } catch (error) {
      console.error('Failed to refuse friend request:', error);
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
            <Checkbox
              size="md"
              type="checkbox"
              checked={is2FAEnabled}
              onChange={handleEnable2FA}
              disabled={!!qrCodeData}
              className="form-control form-control-alternative"
            >
              Active 2FA
            </Checkbox>
            {qrCodeData && (
              <div className="pl-lg-4">
                <label className="form-control-label">
                  Please scan this QR Code with your authentication app:
                </label>
                <img
                  className="img-qrcode"
                  style={{ margin: "auto" }}
                  src={qrCodeData}
                  alt="QR Code"
                />
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="form-control form-control-alternative"
                  placeholder="Enter the code"
                  style={{ margin: "auto" }}
                />
                <a
                  className="btn btn-sm btn-primary ghost"
                  onClick={handleVerify2FACode}
                  style={{ marginTop: "10px" }}
                >
                  Verify Code
                </a>
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
                      <p style={{ color: is2FAEnabled ? 'green' : 'red' }}>
                        {is2FAEnabled ? ' activated' : ' disabled'}
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
                                    {/* {friend.username && (
                                      <img
                                        src={friend.avatar}
                                        alt={`${friend.username}'s avatar`}
                                      />
                                    )} */}
                                  </div>
                                  <div className="description">
                                    <h3>{friend.username}</h3>
                                    <p>You can send a chat message, play games, or visit this friend's profile and more &#128521;</p>
                                    <a href={`/user/profile/${friend.username}`} className="btn btn-sm btn-primary ghost">
                                      Profile
                                    </a>
                                    <a href="/chat" className="btn btn-sm btn-primary ghost">Message</a>
                                    <a href="/game" className="btn btn-sm btn-primary ghost">Invite to Game</a>
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
                                  {/* <div className="thumb"><img src={requestFriend.avatar} alt={`${requestFriend.from.username}'s avatar`} /></div> */}
                                  <div className="description">
                                    <h3>{requestFriend.from.username}</h3>
                                    <p>You received a friend request</p>
                                    <button
                                      className="btn btn-sm btn-primary ghost"
                                      onClick={() => acceptFriendRequest(requestFriend.from.username)}
                                    >
                                      Accept
                                    </button>
                                    <button
                                      className="btn btn-sm btn-no ghost"
                                      onClick={() => refuseFriendRequest(requestFriend.from.username)}
                                    >
                                      Refuse
                                    </button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="tab-2">
                        <label htmlFor="tab2-3">Match History</label>
                        <input id="tab2-3" name="tabs-two" type="radio" />
                        <div>

                          <div className="table-wrapper">
                            <table className="fl-table">
                              <thead>
                                <tr>
                                  <th>RESULT</th>
                                  <th>SCORE</th>
                                  <th>OPPONENT</th>
                                </tr>
                              </thead>
                              <tbody>
                                {matchHistory.map((detail, index) => (
                                  <tr key={matchHistory[index].id}>
                                    <td>{detail.result}</td>
                                    <td>{detail.score}</td>
                                    <td>{detail.opponentName}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                      <div className="tab-2">
                        <label htmlFor="tab2-4">Achievements</label>
                        <input id="tab2-4" name="tabs-two" type="radio" />
                        <div>

                          <div className="table-wrapper">
                            <table className="fl-table">
                              <thead>
                                <tr>
                                  <th>TITLE</th>
                                  <th>DESCRIPTION</th>
                                </tr>
                              </thead>
                              <tbody>
                                {achievements.map((detail, index) => (
                                  <tr key={achievements[index].id}>
                                    <td>{detail.achievement.title}</td>
                                    <td>{detail.achievement.description}</td>
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