import React from "react";
import './friends.style.css';
import userImage from '../../assets/user.png'
import { Link as RouterLink } from "react-router-dom";

const Friends: React.FC = () => {
    return (
        <div className="content">
            <h1 style={{justifyContent: "center", marginTop: "100px"}}><span className="friends-p">Friends List</span></h1>
            <ul className="team" style={{marginTop: '300px'}}>
                <li className="member co-funder">
                    <div className="thumb"><img src= {userImage} /></div>
                    <div className="description">
                        <h3>Name Friend1</h3>
                        <p>Chris is a front-end developer and designer. He writes a bunch of HTML, CSS, and JavaScript and shakes the pom-poms for CodePen.</p>
                        <RouterLink to='/game'><button className="button-32-f" role="button">Invit Game</button></RouterLink>
                        <RouterLink to='/chat'><button className="button-32-f" role="button">Message</button></RouterLink>
                        <RouterLink to='/user/profile'><button className="button-32-f" role="button">Profile</button></RouterLink>
                    </div>
                </li>
                <li className="member co-funder">
                    <div className="thumb"><img src= {userImage} /></div>
                    <div className="description">
                        <h3>Name Friend2</h3>
                        <p>Chris is a front-end developer and designer. He writes a bunch of HTML, CSS, and JavaScript and shakes the pom-poms for CodePen.</p>
                        <RouterLink to='/game'><button className="button-32-f" role="button">Invit Game</button></RouterLink>
                        <RouterLink to='/chat'><button className="button-32-f" role="button">Message</button></RouterLink>
                        <RouterLink to='/user/profile'><button className="button-32-f" role="button">Profile</button></RouterLink>
                    </div>
                </li>
                <li className="member co-funder">
                    <div className="thumb"><img src= {userImage} /></div>
                    <div className="description">
                        <h3>Name Friend3</h3>
                        <p>Chris is a front-end developer and designer. He writes a bunch of HTML, CSS, and JavaScript and shakes the pom-poms for CodePen.</p>
                        <RouterLink to='/game'><button className="button-32-f" role="button">Invit Game</button></RouterLink>
                        <RouterLink to='/chat'><button className="button-32-f" role="button">Message</button></RouterLink>
                        <RouterLink to='/user/profile'><button className="button-32-f" role="button">Profile</button></RouterLink>
                    </div>
                </li>
                <li className="member co-funder">
                    <div className="thumb"><img src= {userImage} /></div>
                    <div className="description">
                        <h3>Name Friend4</h3>
                        <p>Chris is a front-end developer and designer. He writes a bunch of HTML, CSS, and JavaScript and shakes the pom-poms for CodePen.</p>
                        <RouterLink to='/game'><button className="button-32-f" role="button">Invit Game</button></RouterLink>
                        <RouterLink to='/chat'><button className="button-32-f" role="button">Message</button></RouterLink>
                        <RouterLink to='/user/profile'><button className="button-32-f" role="button">Profile</button></RouterLink>
                    </div>
                </li>
            </ul>

        </div>
    );
};

export default Friends;