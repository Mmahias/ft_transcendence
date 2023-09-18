import React from "react";
import './edit.style.css';
import userImage from '../../assets/user.png'
import { Link as RouterLink } from "react-router-dom";

const Edit: React.FC = () => {
    return (
        <div className="wrapper">
            <h1 style={{ justifyContent: "center", marginTop: "100px" }}><span className="profile-p">Edit Profile</span></h1>
            <div className="profile-card js-profile-card" style={{ marginTop: '250px' }}>
                <div className="profile-card__img">
                    <img
                        src={userImage}
                        alt="profile card"
                    />
                </div>

                <div className="profile-card__cnt js-profile-cnt">
                    {/* <input type="file" accept="image/*" className="input-img" style={{alignContent: 'center', marginTop: '5%', display: 'none'}} /> */}

                    <div className="mb-3">
                        <label htmlFor="formFile" className="form-label"></label>
                        <input className="form-control" type="file" id="formFile" />
                    </div>

                    <div className="profile-card__name" style={{ marginTop: '6%' }}>New UserName</div>
                    <input type="text" className="input-txt" style={{ alignContent: 'center' }} />
                    <div className="profile-card-inf">
                        <div className="button-container" style={{ marginTop: '0' }}>
                            <RouterLink to=''><button className="button-32" style={{ marginLeft: '50px' }}>Save</button></RouterLink>
                            <RouterLink to='/user/profile'><button className="button-32">Cancel</button></RouterLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Edit;