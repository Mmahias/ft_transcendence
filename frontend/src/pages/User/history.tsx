import React from "react";
import './history.style.css';

const History: React.FC = () => {
  const [gamesHistory, setGamesHistory] = React.useState([
    {
      id: 1,
      opponent: 'FRIEND_1',
      opponentRank: 5,
      opponentLevel: 10,
      pointWins: 3,
      pointLoses: 2,
      winner: 'WINNER_NAME'
    },
    {
      id: 2,
      opponent: 'FRIEND_1',
      opponentRank: 5,
      opponentLevel: 10,
      pointWins: 1,
      pointLoses: 3,
      winner: 'WINNER_NAME'
    },
    {
      id: 3,
      opponent: 'FRIEND_4',
      opponentRank: 4,
      opponentLevel: 8,
      pointWins: 3,
      pointLoses: 0,
      winner: 'WINNER_NAME'
    },
    {
      id: 4,
      opponent: 'FRIEND_5',
      opponentRank: 6,
      opponentLevel: 12,
      pointWins: 2,
      pointLoses: 3,
      winner: 'WINNER_NAME'
    }
  ]);

  return (
    <section>
      <h1 style={{ justifyContent: "center", marginTop: "100px" }}>
        <span className="history-p">Games Histories</span>
      </h1>
      <div className="tbl-header">
        <table>
          <thead>
            <tr>
              <th>GAME_ID</th>
              <th>OPPONENT</th>
              <th>RANK</th>
              <th>LEVEL</th>
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
            {gamesHistory.map(game => (
              <tr key={game.id}>
                <td>{game.id}</td>
                <td>{game.opponent}</td>
                <td>{game.opponentRank}</td>
                <td>{game.opponentLevel}</td>
                <td>{game.pointWins}</td>
                <td>{game.pointLoses}</td>
                <td>{game.winner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default History;
