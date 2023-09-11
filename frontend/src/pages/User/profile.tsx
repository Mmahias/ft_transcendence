import React from "react";
import './profile.style.css';
import userImage from '../../assets/user.png'
import { Link as RouterLink } from "react-router-dom";


const Profile: React.FC = () => {
  return (
    <div className="wrapper">
    <div className="profile-card js-profile-card">
      <div className="profile-card__img">
        <img
          src= {userImage}
          alt="profile card"
        />
      </div>

      <div className="profile-card__cnt js-profile-cnt">
        <div className="profile-card__name">UserName</div>
        <div className="profile-card__txt">
          login_intra42
        </div>
          <div className="profile-card-loc">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right-circle" viewBox="0 0 16 16" style={{color: 'red'}}>
              <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z" />
            </svg>

          <p style={{marginTop: '3px', marginLeft: '3px', color: 'red'}}> Online </p>
          </div>

        <div className="profile-card-inf">
          <div className="profile-card-inf__item">
            <div className="profile-card-inf__title">user_id</div>
            <div className="profile-card-inf__txt">id</div>
          </div>

          <div className="profile-card-inf__item">
            <div className="profile-card-inf__title">email</div>
            <div className="profile-card-inf__txt">user@42.fr</div>
          </div>

          <div className="profile-card-inf__item">
            <div className="profile-card-inf__title">created_at</div>
            <div className="profile-card-inf__txt">12/02/2023</div>
          </div>
          <div className="button-container">
            <RouterLink to='/'><button className="button-32" role="button">Add/Edit</button></RouterLink>
            <RouterLink to='/user/history'><button className="button-32" role="button">History</button></RouterLink>
            <RouterLink to='/game'><button className="button-32" role="button">Play Game</button></RouterLink>
            <RouterLink to='/user/friends'><button className="button-32" role="button">Friends</button></RouterLink>
        </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Profile;