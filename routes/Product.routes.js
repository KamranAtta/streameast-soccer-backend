var ProductObj = require("../controllers/Product.Controller");
// const auth = require("../middleware/auth");

module.exports = (product) => {

  product.post("/getFixtures", ProductObj.getFixtures);
  product.post("/getFixtureByName", ProductObj.getFixtureByName);
  product.post("/getTopGames", ProductObj.topGames);
  product.post("/getdbTeams", ProductObj.dbTeams);
  product.post("/getTopLeagues", ProductObj.topLeagues);
  product.post("/getdbleagues", ProductObj.dbLeagues);
  product.post("/getTeamFixtures", ProductObj.teamFixtures);
  product.post("/getLeagueFixtures", ProductObj.leagueFixtures);
  product.post("/getGamesByLeague", ProductObj.gamesByLeague);
  product.post("/scrapeSports", ProductObj.scrapeSports);
  product.post("/getLinksByMatch", ProductObj.linksByMatch);
  product.post("/getLiveStreams", ProductObj.liveStreams);
  product.post("/addTeamLeague", ProductObj.addTeamLeague);
  product.post("/getTeamsAndLeagues", ProductObj.teamsAndLeagues);
  product.post("/getDescription", ProductObj.teamLeagueDescription);
  product.post("/getAllNews", ProductObj.allNews);
  product.post("/getLatestNews", ProductObj.latestNews);
  product.post("/getNewsById", ProductObj.newsById);
  product.post("/addNewsCard", ProductObj.addNewsCard);
  product.post("/updateNewsCard", ProductObj.updateNewsCard);
  product.post("/authenticateUser", ProductObj.authenticateUser);

};