var mongoose = require('mongoose');
const League = mongoose.model('League');
const Team = mongoose.model('Team');
const News = mongoose.model('News');
const cheerio = require("cheerio");
const request = require('sync-request');
const fs = require('fs');
const cloudinary = require("cloudinary").v2;
const fsPromises = require('fs').promises;

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET 
});

const scrapeTopGames = async () => {
  try {
  
    // const dbTeams = await Team.find({});
  
    const apiURL = "https://totalsportek.pro/";
  
    const response = request('GET', apiURL);
    const html = response.getBody('utf8');
  
    const $ = cheerio.load(html);
  
    const divElement = $(".col-md-3.order-md-1.mb-3");
  
    const topTeamsLinks = divElement.find(".col-md-12.border.rounded-3.my-3 a");
    console.log('total teams: ', topTeamsLinks.length);
    let teamFixtures = []
    for (let i = 0; i < topTeamsLinks.length;i++ ) {
      const topTeamsLink = topTeamsLinks[i];
      const link = $(topTeamsLink).attr('href');
      const teamName = $(topTeamsLink).find('a div').text();
      // const image = await getImage(teamName);
      // const team = await dbTeams.find(team => team.teamName === teamName);
      const team = await Team.findOne({teamName: teamName});
  
      const teamImage = team.teamImage ?? $(topTeamsLink).find('a div img').attr('src');
  
      const res = request('GET', link);
      const teamsHtml = res.getBody('utf8');
  
      const $_ = cheerio.load(teamsHtml);
  
      // const teamTitle = $_(".col-md-9.pt-1.pb-1.text-center.m-auto.bg-white.rounded").text();
  
      const fixtures = $_(".col-md-9.pt-1.pb-1.text-center.m-auto.bg-white.rounded div");
      let games = [];
      for(let i = 0; i < fixtures.length; i++) {
        const fixture = fixtures[i];
        const attributes = $_(fixture).find("a span");
        const fixtureLink = $_(fixture).find("a").first().attr('href');
        const fixtureDate = $_(attributes[0]).text();
        const teamA = $_(attributes[1]).text();
        const fixtureTime = $_(attributes[2]).text();
        const teamB = $_(attributes[3]).text();
        games.push({
          fixtureLink:fixtureLink,
          fixtureDate: fixtureDate,
          fixtureTime: fixtureTime,
          teamA: teamA,
          teamB: teamB
        })
      }
      console.log("Team and fixtures Added" );
      teamFixtures.push({
        teamName: teamName,
        teamImage: teamImage,
        fixtures: games
      })
    }
  
    // Loop through the li elements and log their text content
    writeJsonToFile(teamFixtures, "data/topTeams.json");
  } catch (error) {
    console.log(error)
  }
  
}

const scrapeTopLeagues = async () => {

    const apiURL = "https://totalsportek.pro/";

    const response = request('GET', apiURL);
    const html = response.getBody('utf8');

    const $ = cheerio.load(html);

    const divElement = $(".col-md-3.order-md-1.mb-3").find('div').first();


    const topLeaguesLinks = divElement.find("a");
    console.log('total leagues: ', topLeaguesLinks.length);
    let teamFixtures = []
    for (let i = 0; i < topLeaguesLinks.length;i++ ) {
      const topLeagueLink = topLeaguesLinks[i];
      const link = $(topLeagueLink).attr('href');
      const leagueImage = $(topLeagueLink).find('a div img').attr('src');
      const leagueName = $(topLeagueLink).find('a div').text();

      const res = request('GET', link);
      const leaguesHtml = res.getBody('utf8');
    
      const $_ = cheerio.load(leaguesHtml);

      const fixtures = $_(".col-md-9.pt-1.pb-1.text-center.m-auto.bg-white.rounded div");
      let games = [];
      if(fixtures.length > 0){
        for(let i = 0; i < fixtures.length; i++) {
          const fixture = fixtures[i];
          const attributes = $_(fixture).find("a span");
          const fixtureLink = $_(fixture).find("a").first().attr('href');
          const fixtureDate = $_(attributes[0]).text();
          const teamA = $_(attributes[1]).text();
          const fixtureTime = $_(attributes[2]).text();
          const teamB = $_(attributes[3]).text();
          games.push({
            fixtureLink:fixtureLink,
            fixtureDate: fixtureDate,
            fixtureTime: fixtureTime,
            teamA: teamA,
            teamB: teamB
          })
        }
      }
      console.log("Team and fixtures Added");
      const league = {
        leagueName: leagueName,
        leagueImage: leagueImage     
      }
      await League.findOne({leagueName: leagueName})
      .then(async (doc) => {
        if (doc) {
          console.log('League exists!');
          doc.leagueImage = leagueImage;
          doc.save();
        } else {
          await League.create(league).then((err, leag)=>{
            if(err) console.log(err);
            console.log('League added to db');
          });
        }
      })
      .catch((err) => {
        console.error('Error finding user:', err);
      });

        teamFixtures.push({
        ...league,
        fixtures: games
      })
    }
    // Loop through the li elements and log their text content
    writeJsonToFile(teamFixtures, "data/topLeagues.json");
}

const getImage = async (teamName) => {
  if(teamName == "Manchester United"){
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1688569655/teams/Manchester-United-Logo_fwdq43.webp"
  }else if(teamName == "AFC Bournemouth") {
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1688929430/teams/AFC_Bournemouth-fc_rhi9gl.webp"
  }else if(teamName == "Tottenham Hotspur") {
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1688567609/teams/tmp-2-1687089759241_lv9s0r.webp"
  }else if(teamName == "Brentford") {
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1688929495/teams/Brentford-fc_htwvfm.webp"
  }else if(teamName == "Everton") {
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1688567560/teams/tmp-2-1687108472888_fnzdza.webp"
  }else if(teamName == "Arsenal") {
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1688567677/teams/tmp-1-1687090085322_bjkyfy.webp"
  }else if(teamName == "Chelsea") {
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1688567862/teams/tmp-1-1687104135908_enycqa.webp"
  }else if(teamName == "Liverpool") {
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1688567984/teams/tmp-1-1687087769299_fvtcjd.webp"
  }else if(teamName == "Newcastle United") {
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1688567831/teams/tmp-2-1687104985958_a3iaxn.webp"
  }else if(teamName == "Olympique Lyonnais") {
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1689336493/teams/Olympique_Lyonnais_qf6ym2.webp"
  }else if(teamName == "Mainz 05") {
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1689336626/teams/Mainz_05_jcepd8.webp"
  }else if(teamName == "Getafe") {
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1689336766/teams/Getafe_ob6024.webp"
  }else if(teamName == "Union Berlin") {
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1689338472/teams/Union_Berlin_edpqky.webp"
  }else if(teamName == "Borussia Dortmund") {
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1688569222/teams/Borussia-Dortmund-Logo_m0mkdj.webp"
  }else if(teamName == "Southampton") {
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1689338744/teams/Southampton_t11hig.webp"
  }else if(teamName == "Leeds United") {
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1689338880/teams/Leeds_United_uihfui.webp"
  }else {
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1688552621/sports-logo_xaotub.png";
  }
}

async function writeJsonToFile(data, filePath) {
  try {
    // Write the JSON data to the file
    await fsPromises.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log('JSON data has been written to the file successfully.');
  } catch (error) {
    console.error('Error writing JSON data to the file:', error);
  }
}

const scrapeSports = async () => {
  let data = [];

  const apiURL = "https://totalsportek.pro/";

  const response = request('GET', apiURL);
  const html = response.getBody('utf8');

  const $ = cheerio.load(html);

  // Select the div element with id "myDiv"
  const catLinks = $(".m-auto .d-flex").first().find('a.text-decoration-none');

  console.log('Total Categories:', catLinks.length);
  for (let i = 0; i < catLinks.length; i++) {

    const liElement = catLinks[i];
    // Find the a tag inside the li element
    const categoryLink = $(liElement).attr("href");

    // Get the text content of the a tag
    let categoryName = $(liElement).find('div').first().text();

    if(categoryName === "All"){
    categoryName = "Streams today";
    }
    console.log('categotyName: ', categoryName);
    console.log('categotyLink: ', categoryLink);

    const newRes = await request('GET', categoryLink);
    const categoryHtml = await newRes.getBody('utf8');

    const $_ = cheerio.load(categoryHtml);

    // Select the div element with class name "myDiv"
    const subCategories = $_(".col-md-12.border.rounded").children();
    console.log('Total sub Categories:', subCategories.length);

    // Loop through the div and a tags and log their content
    let subCats = [];
    let subCategoryName = '';
    let subCategoryImage = '';
    for (let i = 0; i < subCategories.length; i++){
      const subCategory = subCategories[i];
      if($_(subCategory).is('div')){
        subCategoryName = $(subCategory).find('div span').first().text();
        subCategoryImage = $(subCategory).find('img').attr('src');
        console.log('Sub Cat Name', subCategoryName);
        if(subCategoryName){
          const hasObjectWithName = subCats.some(obj => obj.subCategoryName === subCategoryName);
          if(!hasObjectWithName){
            subCats.push({
              subCategoryName: subCategoryName,
              subCategoryImage: subCategoryImage,
              games: []
            });
          }
        }
      }else if($_(subCategory).is('a')){
        const detailPageLink = $(subCategory).attr('href');
        let game = {
          sourceLink: detailPageLink,
          streamerLinks: []
        };

        const matchDate = new Date().toUTCString();

        const mt = request('GET', detailPageLink);
        const matchTimeHtml = mt.getBody('utf8');
    
        const $__ = cheerio.load(matchTimeHtml);
        const matchTime = $__('div[id="timer"]').text();

        const teams = $(subCategory).find('div.row.my-auto');
        const teamImages = $(subCategory).find('div.row.my-auto div.col-1.my-auto img');
        const teamA = $(teams[0]).text();
        const teamB = $(teams[1]).text();
        const imageA = await getImage(teamA);
        const imageB = await getImage(teamB);

        const teamAImage = imageA ??  $(teamImages[0]).attr('src');
        const teamBImage = imageB ?? $(teamImages[1]).attr('src');

        game = {
          ...game,
          matchDate: matchDate,
          matchTime: matchTime,
          teamA:teamA,
          teamB: teamB,
          teamAImage: teamAImage,
          teamBImage:teamBImage,
        };
        const index = subCats.findIndex(obj => obj.subCategoryName === subCategoryName);
        console.log('game added', game.teamA);
        subCats[index].games.push(game);
      }
    }
    if(subCats.length > 0) {
      const hasObjectWithName = data.some(obj => obj.categoryName === categoryName);
      if(!hasObjectWithName){
        data.push({
          categoryName: categoryName,
          subCategories: subCats
      });
      console.log('New Sports added');
      }
    }
  }
  writeJsonToFile(data, "data/sports.json");
}

const updateStreamLink = (reqData) => {
  const categoryName = reqData["categoryName"];
  const subCategoryName = reqData["subCat"];
  const teamA = reqData["teamA"];
  const teamB = reqData["teamB"];
  const links = reqData["links"];

  const validJson = validateJSONFile('data/sports.json');
  if(validJson){
    fs.readFile("data/sports.json", 'utf8', (err, data) => {
      if (err) throw err;
      let jsonData = JSON.parse(data);
  
      for (let i = 0; i < jsonData.length; i++) {
        let cat = jsonData[i];
        if (cat.categoryName === categoryName) {
          for(let j = 0; j < cat.subCategories.length; j++) {
            let leag = cat.subCategories[j];
            if(leag.subCategoryName === subCategoryName){
              for (let k = 0; k < leag.games.length; k ++){
                let game = leag.games[k];
                try {
                  if((game?.teamA === teamA && game?.teamB === teamB) ||
                  (!teamB && (game?.teamA === teamA)) ) {
                    jsonData[i].subCategories[j].games[k].streamerLinks = links;
                    try {
                      writeJsonToFile(jsonData, 'data/sports.json');
                    } catch (error) {
                      break;
                    }
                    break;
                  }
                } catch (error) {
                  break;
                }
              }
              break;
            }
          }
          break;
        }
      }
    });
  }
}

function validateJSONFile(filePath) {
  try {
    const jsonString = fs.readFileSync(filePath, 'utf-8');
    const jsonObj = JSON.parse(jsonString);
    return true; // If it reaches here, the JSON file is valid.
  } catch (e) {
    return false; // An error occurred, so the JSON file is invalid.
  }
}

exports.getFixtures = async (req, res) => {
  try {
    // await scrapeSports();
    const validJson = validateJSONFile('data/sports.json');
    const filename = validJson ? 'data/sports.json': 'data/defaultSports.json';

    fs.readFile('data/sports.json', 'utf8', (err, d) => {
      if (err) throw err;
      let data = JSON.parse(d);
      // const index = data.findIndex(category => category.categoryName === "Tennis");
      // const subCatIndex = data[index].subCategories.findIndex(subCategory => subCategory.subCategoryName === "tennis");
      // data[index].subCategories = [data[index].subCategories[subCatIndex]];
      res.status(200).json(data);
    });
  } catch (error) {
    res.status(500).send("data not found");
  }
}

exports.teamFixtures = (req, res) => {
  try {
    const validJson = validateJSONFile('data/topTeams.json');
    const filename = validJson ? 'data/topTeams.json': 'data/defaultTeams.json';

    fs.readFile(filename, 'utf8', (err, d) => {
      if (err) throw err;
      const jsonData = JSON.parse(d);
      const teamName = req.body.teamName;
      let teamFixture = {}
      for (let i = 0; i < jsonData.length; i++) {
        const team = jsonData[i];
        if (team.teamName === teamName) {
          teamFixture = team;
          break;
        }
      }
      res.status(200).json(teamFixture);
    });
  } catch (error) {
    res.status(500).send("data not found");
  }
}

exports.leagueFixtures = (req, res) => {
  try {
    const validJson = validateJSONFile('data/topLeagues.json');
    const filename = validJson ? 'data/topLeagues.json': 'data/defaultLeagues.json';
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) throw err;
      const jsonData = JSON.parse(data);
      const leagueName = req.body.leagueName;
      let leagueFixture = {}
      for (let i = 0; i < jsonData.length; i++) {
        const league = jsonData[i];
        if (league.leagueName === leagueName) {
          leagueFixture = league;
          break;
        }
      }
      res.status(200).json(leagueFixture);
    });
  } catch (error) {
    res.status(500).send("data not found");
  }
}
exports.scrapeSports = async (req, res) => {
  await scrapeSports();
  res.status(200).json({'message': "Data scrape successfully!"});
}

exports.topGames = (req, res) => {
  try {
    // scrapeTopGames();
    const validJson = validateJSONFile('data/topTeams.json');
    const filename = validJson ? 'data/topTeams.json': 'data/defaultTeams.json';

    fs.readFile(filename, 'utf8', (err, d) => {
      if (err) throw err;
      res.status(200).json(JSON.parse(d));
    });
  } catch (error) {
    res.status(500).send("data not found");
  }
}

exports.dbTeams = async (req, res) => {
  try {
    const filter = req.body;
    const teams = await Team.find(filter).sort({createdAt: 1}).limit(25);
    res.status(200).json(teams);

  } catch (error) {
    res.status(500).send("data not found");
  }
}

exports.topLeagues = (req, res) => {
  try {
    // scrapeTopLeagues();
    const validJson = validateJSONFile('data/topLeagues.json');
    const filePath = validJson ? 'data/topLeagues.json': 'data/defaultLeagues.json';

    fs.readFile(filePath, 'utf8', (err, d) => {
      if (err) throw err;
      res.status(200).json(JSON.parse(d));
    });

  } catch (error) {
    res.status(500).send("data not found");
  }
}

exports.dbLeagues = async (req, res) => {
  try {
    const filter = req.body;
    const leagues = await League.find(filter).sort({createdAt: 1}).limit(20);
    res.status(200).json(leagues);

  } catch (error) {
    res.status(500).send("data not found");
  }
}

exports.gamesByLeague = async (req, res) => {
  try {
    const validJson = await validateJSONFile('data/sports.json');
    const filePath = validJson ? 'data/sports.json': 'data/defaultSports.json';
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) throw err;
      const jsonData = JSON.parse(data);
      const category = req.body.category;
      const league = req.body.league;
      let fixtures = {}
  
      for (let i = 0; i < jsonData.length; i++) {
        const cat = jsonData[i];
        if (cat.categoryName === category) {
          for(let j = 0; j < cat.subCategories.length; j++) {
            const leag = cat.subCategories[j];
            if(leag.subCategoryName === league){
              fixtures = {
                category: cat.categoryName,
                subCategory: leag.subCategoryName,
                subCategoryImage: leag.subCategoryImage,
                games: leag.games
              }
              break;
            }
          }
          break;
        }
      }
      res.status(200).json(fixtures);
    });
  } catch (error) {
    res.status(500).send("data not found");
  }
}

exports.linksByMatch = (req, res) => {
  const categoryName = req.body["categoryName"];
  const subCategoryName = req.body["subCat"];
  const teamA = req.body["teamA"];
  const teamB = req.body["teamB"];
  try {
    fs.readFile('data/sports.json', 'utf8', (err, data) => {
      if (err) throw err;
      const jsonData = JSON.parse(data);
      let linksData = {}
      for (let i = 0; i < jsonData.length; i++) {
        const cat = jsonData[i];
        if (cat.categoryName === categoryName) {
          for(let j = 0; j < cat.subCategories.length; j++) {
            const leag = cat.subCategories[j];
            if(leag.subCategoryName === subCategoryName){
              for (let k = 0; k < leag.games.length; k ++){
                const game = leag.games[k];
                if((game.teamA === teamA && game.teamB === teamB) || (!teamB && game.teamA === teamA) ) {
                  linksData = {
                    categoryName: categoryName,
                    subCategoryName: subCategoryName,
                    game: game
                  }
                  break;
                }
              }
              break;
            }
          }
          break;
        }
      }
      res.status(200).json(linksData);
    });
  } catch (error) {
    console.log('ERROR getting link');
  }
}

exports.liveStreams = async (req, res) => {
  const data = req.body;
  const sourceLink = req.body.link;
  const response = await request('GET', sourceLink);
  const html = await response.getBody('utf8');
  const $ = cheerio.load(html);
  const rows = $('.container div.row div.col-md-12.data-row');
  let streamerLinks = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const onClick = $(row).attr('onclick');
    const linkAddress = onClick.split("',")[0].split("open('")[1];
    const linkTitle = $(row).find('div.row div.col-md-3.col-5 i').parent().text();
    // const linkAddress = $(row).find('div a').first().attr('href');
    const streamer = $(row).find('div.row div.col-md-3.col-5').last().text();
    const mobileSupport = $(row).find('div.row div.col-md-1.display-small').first().text();
    const language = $(row).find('div.row div.col-md-1.display-small').last().text();
    if(linkAddress){
        streamerLinks.push({
            website: linkTitle,
            websiteLink: linkAddress,
            streamer: streamer,
            language: language,
            mobileSupport: mobileSupport
        });
    }
  }
  if(streamerLinks.length > 0){
    updateStreamLink({...data, links: streamerLinks});
  }
  res.status(200).json(streamerLinks);
}

const getTeams = async ()=> {
  let teams = []
  await fs.readFile('data/teams.json', 'utf8', (err, data) => {
    if (err) throw err;
    const jsonData = JSON.parse(data);

    for (let i = 0; i < jsonData.length; i++) {
      const team = jsonData[i];
      teams.push(team.teamName);
    }
  });
  return teams;
} 

const getLeagues = async ()=> {
  let leagues = []
  await fs.readFile('data/leagues.json', 'utf8', (err, data) => {
    if (err) throw err;
    const jsonData = JSON.parse(data);

    for (let i = 0; i < jsonData.length; i++) {
      const league = jsonData[i];
      leagues.push(league.leagueName);
    }
  });
  return leagues;
} 

exports.teamsAndLeagues = async (req, res) => {
  try {
    const teams = await Team.find({});
    const leagues = await League.find({});
    
    res.status(200).json({
      teams: teams,
      leagues: leagues
    });
    // fs.readFile('data/teams.json', 'utf8', (err, data) => {
    //   if (err) throw err;
    //   const teams = JSON.parse(data);
    //   fs.readFile('data/leagues.json', 'utf8', (err, l) => {
    //     if (err) throw err;
    //     const leagues = JSON.parse(l);
    //     res.status(200).json({
    //       teams: teams,
    //       leagues: leagues
    //     });
    //   });
    // });
  } catch (error) {
    res.status(500).send("data not found");
  }
}

exports.teamLeagueDescription = async (req, res) => {
  try {
    const name = req.body.name;
    const isTeam = req.body.isTeam;
    if(isTeam){
      const team = await Team.findOne({teamName: name});
      res.status(200).json(team.description);
    }else {
      const league = await League.findOne({leagueName: name});
      res.status(200).json(league.description);
    }
  
    // fs.readFile('data/teams.json', 'utf8', (err, data) => {
    //   if (err) throw err;
    //   const teams = JSON.parse(data);
    //   fs.readFile('data/leagues.json', 'utf8', (err, l) => {
    //     if (err) throw err;
    //     const leagues = JSON.parse(l);
    //     res.status(200).json({
    //       teams: teams,
    //       leagues: leagues
    //     });
    //   });
    // });
  } catch (error) {
    res.status(500).send("data not found");
  }
}

exports.allNews = async (req, res) => {
  try {
    const filter = req.body;
    const news = await News.find(filter).sort({createdAt: -1}).limit(20);
    res.status(200).json(news);

  } catch (error) {
    res.status(500).send("data not found");
  }
}

exports.latestNews = async (req, res) => {
  try {

    const news = await News.aggregate([
      { $unwind: "$category" },
      { $sort: {category: -1, createdAt: -1 } },
      {
        $group: {
          _id: "$category",
          records: { $push: "$$ROOT" }
        }
      }
    ]);
    
    res.status(200).json(news);

  } catch (error) {
    res.status(500).send("data not found");
  }
}

exports.addTeamLeague = async (req, res) => {
  try {
    // await Team.updateMany({}, {publicId: ''});
    // await League.updateMany({}, {publicId: ''});
    const isTeam = JSON.parse(req.body.isTeam);
    const id = req.body.id;
    const name = req.body.name;
    const description = req.body.description;
    console.log('Des', description);
    const file = req.files?.image;
    let imageURL = "";
    let public_id = req.body.publicId;
    console.log('Fileeee', file);

    if(file){
      try {
        let options = {use_filename: true, width: 100, height: 106}
        if(req.body.publicId){
          options = {...options, public_id: public_id, overwrite: true}
        }else {
          if(isTeam){
            options = {...options, folder: 'teams/'}
          }else {
            options = {...options, folder: 'leagues/'}
          }
        }
        await cloudinary.uploader.upload(file.tempFilePath, options ,async (error, result)=> {
          if(error){console.log(error)}
          imageURL = result.secure_url;
          public_id = result.public_id
        });
      } catch (error) {
        console.log(error);
      }
    }
    let data = {}
    if(description){
      data = {...data, description: description}
    }
    if(public_id){
      data = {...data, publicId: public_id}
    }
    if(isTeam){
      if(imageURL){
        data = {...data, teamImage: imageURL}
      }
      await Team.findOneAndUpdate({_id: id}, data , {upsert: true});
    }else {
      if(imageURL){
        data = {...data, leagueImage: imageURL}
      }
      await League.findOneAndUpdate({_id: id}, data, {upsert: true});
    }
    res.status(200).json({'status': "Record updated successfully!"});
  } catch (error) {
    res.status(500).json({'status': "Record not updated!"});
  }
}

exports.authenticateUser = async (req, res) => {
  try {
    const data = req.body;
    if(data.email === process.env.AUTH_EMAIL && data.password === process.env.AUTH_PASSWORD){
      res.status(200).json({"authenticated": true});
    }else {
      res.status(200).json({"authenticated": false});
    }
  } catch (error) {
    res.status(500).json({'status': "News Card not updated!"});
  }
}

exports.newsById = async (req, res) => {
  try {
    const newsId = req.body._id;
    const category = req.body.category;

    const news = await News.findOne({_id:newsId});
    const relatedNews = await News.find({_id: {$ne: newsId}}).limit(10);
    res.status(200).json({ news: news, relatedNews: relatedNews });
  } catch (error) {
    res.status(500).send("data not found");
  }
}

exports.addNewsCard = async (req, res) => {
  try {
    const newsCard = req.body;
    await News.create(newsCard).then((err, news)=>{
      if(err) console.log(err);
      res.status(200).json(news);
    });
  } catch (error) {
    res.status(500).json({'status': "News Card not updated!"});
  }
}

exports.updateNewsCard = async (req, res) => {
  try {
    const id = req.body.id;
    delete req.body.id;
    const newsCard = req.body;
    await News.findOneAndUpdate({ _id: id }, newsCard, { new: true })
    .then((result) => {
      res.status(200).json({'status': "News Card updated!"});
    })
    .catch((error) => {
      res.status(500).json({'status': "News Card not updated!"});
    });
  } catch (error) {
    res.status(500).json({'status': "News Card not updated!"});
  }
}