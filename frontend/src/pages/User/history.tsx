import React from "react";
import './history.style.css';

const History: React.FC = () => {
    return (

        <section>
            <h1 style={{ justifyContent: "center", marginTop: "100px" }}><span className="history-p">Games Histories</span></h1>
            <div className="tbl-header">
                <table>
                    <thead>
                        <tr>
                            <th>GAME_ID</th>
                            <th>OPPONENT</th>
                            <th>POINT WINS</th>
                            <th>POINT LOSES</th>
                            <th>WINNER</th>
                        </tr>
                    </thead>
                </table>
            </div>
            <div className="tbl-content">
                <table>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>FRIEND_1</td>
                            <td>3</td>
                            <td>2</td>
                            <td>WINNER_NAME</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>FRIEND_1</td>
                            <td>1</td>
                            <td>3</td>
                            <td>WINNER_NAME</td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td>FRIEND_4</td>
                            <td>3</td>
                            <td>0</td>
                            <td>WINNER_NAME</td>
                        </tr>
                        <tr>
                            <td>4</td>
                            <td>FRIEND_5</td>
                            <td>2</td>
                            <td>3</td>
                            <td>WINNER_NAME</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default History;