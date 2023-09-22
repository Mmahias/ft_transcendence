import React from "react";
import './Request.style.css';
import userImage from '../../assets/user.png';
import { Link as RouterLink } from "react-router-dom";

const Request: React.FC = () => {
    return (
        <div className="content">
            <h1 style={{justifyContent: "center", marginTop: "100px"}}>
                <span className="request-p">Friend Requests</span>
            </h1>
            <ul className="team" style={{marginTop: '250px'}}>
                {/* Ici, vous pouvez répliquer le code pour chaque demande d'ami */}
                <li className="member">
                    <div className="thumb"><img src={userImage} alt="friend_img"/></div>
                    <div className="description">
                        <h3>Name Request1</h3>
                        <p>Description of the friend request...</p>
                        <button className="button-32">Accept</button>
                        <button className="button-32">Refuse</button>
                    </div>
                </li>
                {/* Répliquez ici pour d'autres demandes d'amis */}
            </ul>
        </div>
    );
};

export default Request;
