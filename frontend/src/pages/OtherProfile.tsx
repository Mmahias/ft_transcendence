import '../styles/Profile.css';
import React from "react";
import UserService from "../api/users-api";
import { Match, User } from "../api/types";
import userImage from '../assets/user2.png';
import { useState, useEffect } from "react";
import { Link as RouterLink, useParams, Navigate, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks";

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

  const { auth } = useAuth();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!auth?.accessToken);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [matchHistory, setMatchHistory] = useState<MatchDetail[]>([]);
  const { reqUsername } = useParams<RouteParams>();

  
  if (!isLoggedIn || !reqUsername) {
    navigate("/error");
    return null;
  }

  // listening to login/logout
  useEffect(() => {
    console.log('isLoggedIn: ', isLoggedIn );
    setIsLoggedIn(!!auth?.accessToken);
  }, [auth]);
  
  const userProfileQuery = useQuery(['user', reqUsername], 
  () => {
    return UserService.getUserByUsername(reqUsername);
  },
  {
    refetchOnWindowFocus: false,
    enabled: isLoggedIn && !!reqUsername,
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
      UserService.getMatchHistory(userProfileQuery.data.id)
      .then(async matchHistory => {
        const processedMatchDetails = await Promise.all(
          matchHistory.map(async game => fetchMatchProperties(game, userProfileQuery.data.id))
        );
        console.log("processedMatchDetails", processedMatchDetails);
        setMatchHistory(processedMatchDetails);
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
    enabled: isLoggedIn ? true : false,
    onSuccess: () => {
      if (reqUsername === myProfileQuery.data?.username) {
        navigate("/user/profile");
      }
    }
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
                    <a href="/chat" className="btn btn-sm btn-primary ghost">Message</a>
                    <a href="/game" className="btn btn-sm btn-primary ghost">Invite Game</a>
                    <a href="#!" className="btn btn-sm btn-primary ghost">Add</a>
                    <a href="#!" className="btn btn-sm btn-no ghost">Delete</a>
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
