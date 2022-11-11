const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

let db = null;
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};
//API 1

app.get("/players/", async (request, response) => {
  const getplayersQuery = `
        SELECT 
            *
        FROM
            player_details
        GROUP BY 
            player_id;

    `;
  const players = await db.all(getplayersQuery);
  response.send(players.map((each) => convertDbObjectToResponseObject(each)));
});

//API 2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
        SELECT
            *
        FROM
            player_details
        WHERE player_id = ${playerId};
    `;
  const player = await db.get(getPlayer);
  response.send(convertDbObjectToResponseObject(player));
});

//API 3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayer = `
        UPDATE
            player_details
        SET
            player_name = '${playerName}';
    `;
  const updateName = await db.run(updatePlayer);
  response.send("Player Details Updated");
});

const convertDbObjectToResponseObject1 = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

//API 4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const matchQuery = `
        SELECT
            *
        FROM
            match_details
        WHERE  
            match_id = ${matchId};
    `;
  const matchDetails = await db.get(matchQuery);
  response.send(convertDbObjectToResponseObject1(matchDetails));
});

//APP 5
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const playerMatches = `
        SELECT
            match_id,match,year 
        FROM
            match_details INNER JOIN player_match_score ON match_details.match_id = player_match_score.player_match_id
        WHERE 
            player_match_score.player_id = ${playerId}
    `;
  const players = await db.all(playerMatches);
  response.send(players.map((each) => convertDbObjectToResponseObject1(each)));
});

module.exports = app;
