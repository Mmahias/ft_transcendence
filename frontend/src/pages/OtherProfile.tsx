import '../styles/Profile.css';
import React from "react";
import UserService from "../api/users-api";
import userImage from '../assets/user2.png';
import { useState, useEffect } from "react";
import { Link as RouterLink, useParams, Navigate, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks";


type RouteParams = {
  reqUsername: string;
};

const OtherProfile: React.FC = () => {

  const { auth } = useAuth();

  const { reqUsername } = useParams<RouteParams>();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!auth?.accessToken);
  
  if (!isLoggedIn || !reqUsername) {
    navigate("/error");
    return null;
  }

  // listening to login/logout
  useEffect(() => {
    console.log('isLoggedIn: ', isLoggedIn );
    setIsLoggedIn(!!auth?.accessToken);
  }, [auth]);

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

  // need the user profile to display it
  const userProfileQuery = useQuery(['user', reqUsername], 
    () => {
      return UserService.getUserByUsername(reqUsername);
    }, 
    {
      refetchOnWindowFocus: false,
      enabled: isLoggedIn && !!reqUsername,
    }
  );

  const userProfile = userProfileQuery.data;

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
    <div className="wrapper">
      <div className="profile-card js-profile-card" style={{ marginTop: '25px' }}>
        <div className="profile-card__img">
          <img src={userImage} alt="profile card" />
        </div>
        <div className="profile-card__cnt js-profile-cnt">
          <div className="profile-card__name">{userProfile?.username}</div>
          <div className="profile-card-loc">
            <p style={{
              color: userProfile?.status === "ONLINE" 
                ? '#006400'  
                : userProfile?.status === "INGAME"
                ? '#FFD700'
                : userProfile?.status === "OFFLINE"
                ? '#CB0000'
                : 'black'
            }}>
              {userProfile?.status}
            </p>
          </div>
          <div className="profile-card-stats">
            <div className="profile-card-stats__item">
              <div className="profile-card-stats__title">Level</div>
              <div className="profile-card-stats__value">{userProfile?.level}</div>
            </div>
            <div className="profile-card-stats__item">
              <div className="profile-card-stats__title">Wins</div>
              <div className="profile-card-stats__value">{userProfile?.wins}</div>
            </div>
            <div className="profile-card-stats__item">
              <div className="profile-card-stats__title">Losses</div>
              <div className="profile-card-stats__value">{userProfile?.losses}</div>
            </div>
            <div className="profile-card-stats__item">
              <div className="profile-card-stats__title">Joined</div>
              <div className="profile-card-inf__txt">
                {userProfile?.createdAt && formatDate(String(userProfile.createdAt))}
              </div>
            </div>
          </div>
          <div className="profile-card-inf">
            <div className="button-container">
              <RouterLink to='/user/request'><button className="button-32">Add as friend</button></RouterLink>
              <RouterLink to='/game'><button className="button-32">Play Game</button></RouterLink>
              <RouterLink to='/user/history'><button className="button-32">Game history</button></RouterLink>
              <RouterLink to='/user/friends'><button className="button-32">Friends</button></RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtherProfile;
