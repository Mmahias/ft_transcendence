import '../styles/Profile.css';
import React from "react";
import UserService from "../api/users-api";
import userImage from '../assets/user2.png'
import { useEffect, useState } from "react";
import { Link as RouterLink, useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

type RouteParams = {
  reqUsername: string;
};

const OtherProfile: React.FC = () => {

  const { reqUsername } = useParams<RouteParams>();
  
  if (!reqUsername) {
    return <Navigate to="/error" />; // Redirect to an error page or any other page
  }

  const [userName, setUserName] = useState<string>('');
  const [userStatus, setUserStatus] = useState<string>('');
  const [userWins, setUserWins] = useState<number>(0);
  const [userLosses, setUserLosses] = useState<number>(0);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [userSubDate, setUserSubDate] = useState<string>('');
  
  const myProfileQuery = useQuery(['me'], UserService.getMe, {
    refetchOnWindowFocus: false,
  });

  const userProfileQuery = useQuery(['user'], () => UserService.getUserByUsername(reqUsername), {
    refetchOnWindowFocus: false,
  });
  
  const userProfile = userProfileQuery.data;

  useEffect(() => {
    if (userProfile)
    {
      if (userProfile.username) {
        setUserName(userProfile.username);
      } if (userProfile.status) {
        setUserStatus(userProfile.status);
      } if (userProfile.wins) {
        setUserWins(userProfile.wins);
      } if (userProfile.losses) {
        setUserLosses(userProfile.losses);
      } if (userProfile.level) {
        setUserLevel(userProfile.level);
      } if (userProfile.createdAt) {
        const date = new Date(userProfile.createdAt);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');  // months are 0-indexed in JavaScript
        const year = date.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;
        setUserSubDate(formattedDate);
      }
    }
  }, [userProfileQuery]);


  if (myProfileQuery.isLoading || userProfileQuery.isLoading) {
    return <div className="loading-screen-user"></div>;
  }

  if (myProfileQuery.isError || userProfileQuery.isError) {
    return <div>Error fetching user profile.</div>;
  }

  if (myProfileQuery.isSuccess && reqUsername === myProfileQuery.data?.username) {
    return <Navigate to="/user/profile" />;
  }

  return (
    <div className="wrapper">
      {(myProfileQuery.isLoading || userProfileQuery.isLoading)
        && <div className="loading-screen-user"></div>}
      {(myProfileQuery.isError || userProfileQuery.isError)
        && <div>Error fetching user profile.</div>}
      {myProfileQuery.isSuccess && userProfileQuery.isSuccess && 
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
              <p style={{
                color: userStatus === "ONLINE" 
                  ? '#006400'  // dark green
                  : userStatus === "INGAME"
                  ? '#FFD700'  // gold (as a substitute for dark yellow)
                  : userStatus === "OFFLINE"
                  ? '#CB0000'  // dark red
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
                <RouterLink to='/user/request'><button className="button-32">Add as friend</button></RouterLink>
                <RouterLink to='/game'><button className="button-32">Play Game</button></RouterLink>
                <RouterLink to='/user/history'><button className="button-32">Game history</button></RouterLink>
                <RouterLink to='/user/friends'><button className="button-32">Friends</button></RouterLink>
              </div>
            </div>
        </div>
      </div>
      }
    </div>
  );
};

export default OtherProfile;