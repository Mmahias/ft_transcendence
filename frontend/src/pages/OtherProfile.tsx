import '../styles/Profile.css';
import React from "react";
import UserService from "../api/users-api";
import FriendsService from '../api/friends-api';
import ChatService from '../api/chat-api';
import { Match, User } from "../api/types";
import userImage from '../assets/user2.png';
import { useState, useEffect } from "react";
import { Link as RouterLink, useParams, Navigate, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth, useSocket } from "../hooks";
import { UserAchievement } from "../api/types";
import toast from 'react-hot-toast';

type MatchDetail = {
  id: number;
  opponentName: string;
  score: string;
  result: string;
  duration: number;
};

type RouteParams = {
  reqUsername: string;
};

const OtherProfile: React.FC = () => {

  const { isAuthenticated } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [matchHistory, setMatchHistory] = useState<MatchDetail[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const { reqUsername } = useParams<RouteParams>();
  const [isFriend, setIsFriend] = useState<boolean>(false);
  
  if (!reqUsername) {
    navigate("/error");
    return null;
  }
  
  const userProfileQuery = useQuery(['user', reqUsername], 
  () => {
    return UserService.getUserByUsername(reqUsername);
  },
  {
    refetchOnWindowFocus: false,
    enabled: isAuthenticated && !!reqUsername,
  }
  );

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
    if (userProfileQuery.data) {
      // match history
      UserService.getMatchHistory(userProfileQuery.data.id)
      .then(async matchHistory => {
        const processedMatchDetails = await Promise.all(
          matchHistory.map(async game => fetchMatchProperties(game, userProfileQuery.data.id))
        );
        setMatchHistory(processedMatchDetails);
      })
      .catch(error => {
        console.error("Failed to fetch match history", error);
      });

      // Achievements
      UserService.getAchievements(userProfileQuery.data.id)
      .then(async achievements => {
        setAchievements(achievements);
      })
      .catch(error => {
        console.error("Failed to fetch match history", error);
      });
    }
  }, [userProfileQuery.data?.id]);

  useEffect(() => {
    const fetchUserAvatar = async () => {
      try {
        const avatarUrl = await UserService.getUserAvatarByUsername(reqUsername);
        setUserAvatar(avatarUrl);
      } catch (error) {
        console.error("Error fetching user avatar:", error);
      }
    };
    
    if (reqUsername && userProfileQuery.data) {
      fetchUserAvatar();
    }
  }, [reqUsername, userProfileQuery.data?.id]);

  // need my name to compare with the one in the url
  const myProfileQuery = useQuery(
    ['me'],
    () => {
      return UserService.getMe();
    }, {
    refetchOnWindowFocus: false,
    enabled: isAuthenticated ? true : false,
    onSuccess: () => {
      if (reqUsername === myProfileQuery.data?.username) {
        navigate("/user/profile");
      }
    }
  });

  useEffect(() => {
    if (myProfileQuery.isSuccess && myProfileQuery.data) {
      // Utilisez votre propre fonction pour obtenir la liste d'amis de l'utilisateur connecté (via getMe)
      const myFriends = myProfileQuery.data.friends;
  
      if (myFriends) {
        // Vérifiez si l'utilisateur cible est dans votre liste d'amis
        const isFriend = myFriends.some((friend) => friend.username === reqUsername);
        
        // Mettez à jour l'état en conséquence
        setIsFriend(isFriend);
        console.log(isFriend);
      }
    }
  }, [myProfileQuery]);

  const handleAddFriend = async () => {
    try {
      // Utilisez votre propre fonction pour envoyer une demande d'ami
      await FriendsService.sendFriendRequest(reqUsername);
      setIsFriend(true);
      toast.success('Your friend request has been sent successfully!', {
        duration: 2000,
      });
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error("Error sending your friend request", {
        duration: 2000,
    })
    }
  };

  const handleDeleteFriend = async () => {
    try {
      // Utilisez votre propre fonction pour supprimer un ami
      await FriendsService.deleteFriend(reqUsername);
      setIsFriend(false);
      toast.success('Friend removed from your list successfully!', {
        duration: 2000,
      });
    } catch (error) {
      console.error("Error deleting friend:", error);
      toast.error('Error removing the friend', {
        duration: 2000,
      });
    }
  };

  const handleInvitation = (username: string) => {
    socket?.emit('invite match', username);
    toast.success('Invitation sent', {id: 'invite'});
  }

  const handleDM = (sender: string, receiver: string) => {
    ChatService.getDMs(sender, receiver);
    setTimeout(() => {
      navigate("/chat");
    }, 500);
  }
  socket?.on('match invitation declined', (username: string) => {
    toast.error(`${username} declined your invitation.`, {id: 'invite'});
  });

  if (myProfileQuery.isLoading || userProfileQuery.isLoading) {
    return <div className="loading-screen-user"></div>;
  }

  if (myProfileQuery.isError || userProfileQuery.isError) {
    return <div>Error fetching user profile.</div>;
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (!isAuthenticated) {
    navigate("/error");
    return null;
  }

  return (
    <div className="profile-page">
      <div className="main-content">
        <div className="header pb-8 pt-5 pt-lg-8 d-flex align-items-center" style={{ backgroundSize: "cover", backgroundPosition: "center top" }} >
          <span className="mask bg-gradient-default opacity-8"></span>
          <div className="container-fluid d-flex align-items-center">
            <div className="col-lg-7 col-md-10">
              <h1 className="display-2 text-white">Welcome to profile of {userProfileQuery.data?.username}</h1>
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
                      <img src={userAvatar || userImage} alt={'userAvatar'} className="rounded-circle" />
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
                          <span className="heading">{userProfileQuery.data?.level}</span>
                          <span className="description">Level</span>
                        </div>
                        <div>
                          <span className="heading">{userProfileQuery.data?.wins}</span>
                          <span className="description">Wins</span>
                        </div>
                        <div>
                          <span className="heading">{userProfileQuery.data?.losses}</span>
                          <span className="description">Losses</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3>
                      {userProfileQuery.data?.username}
                    </h3>
                    <div className="h5 font-weight-300">
                      <i style={{
                        color: userProfileQuery.data?.status === "ONLINE"
                          ? '#006400'
                          : userProfileQuery.data?.status === "INGAME"
                            ? '#FFD700'
                            : userProfileQuery.data?.status === "OFFLINE"
                              ? '#CB0000'
                              : 'black'
                      }}>
                        {userProfileQuery.data?.status}
                      </i>
                    </div>
                    <div className="h5 mt-4">
                      <i className="ni business_briefcase-24 mr-2"></i>Joined at
                    </div>
                    <div>
                      <i className="ni education_hat mr-2"></i>{userProfileQuery.data?.createdAt && formatDate(String(userProfileQuery.data?.createdAt))}
                    </div>
                    <hr className="my-4" />
                    <button className="btn btn-sm btn-primary ghost" onClick={() => handleDM(myProfileQuery.data.username, userProfileQuery.data.username)}>Invite to Chat</button>
                    <button className="btn btn-sm btn-primary ghost" onClick={() => handleInvitation(userProfileQuery.data.username)}>Invite to Game</button>
                    {isFriend ? (
                      <button className="btn btn-sm btn-no ghost" onClick={handleDeleteFriend}>Delete Friend</button>
                    ) : (
                      <button className="btn btn-sm btn-primary ghost" onClick={handleAddFriend}>Add as friend</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-8 order-xl-1">
              <div className="card bg-secondary shadow">
                <div className="card-header bg-white border-0">
                  <div className="row align-items-center">
                    <div className="col-8">
                      <h3 className="mb-0">Profile: {userProfileQuery.data?.username}</h3>
                    </div>
                    <div className="col-4 text-right">
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="tab-container">
                    <div className="tabs-profile">
                      <div className="tab-2">
                        <label htmlFor="tab2-3">Game Histories</label>
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

export default OtherProfile;
