var mongoose = require('mongoose');
const cheerio = require("cheerio");
const request = require('sync-request');
const fsPromises = require('fs').promises;
var dotenv = require('dotenv'),
    MongoDB = require('../config/mongodb'),
    Mongoose = require('../config/mongoose');

dotenv.config();
MongoDB();
Mongoose();

const Team = mongoose.model('Team');

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
  }else {
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1688552621/sports-logo_xaotub.png";
  }

}

async function writeJsonToFile(data, filePath) {
  try {
    // Write the JSON data to the file
    console.log('Writing to json, length', data.length);
    await fsPromises.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log('JSON data has been written to the file successfully.');
  } catch (error) {
    console.error('Error writing JSON data to the file:', error);
  }
}

const scrapeTopGames = async () => {
  const dbTeams = await Team.find({});

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
    const teamName = ($(topTeamsLink).find('a div').text()).trim();
    // const image = await getImage(teamName);
    const image = dbTeams.find(team => team.teamName === teamName);
    
    let teamImage = image ?? $(topTeamsLink).find('a div img').attr('src');
    const res = request('GET', link);
    const teamsHtml = res.getBody('utf8');

    const $_ = cheerio.load(teamsHtml);

    const teamTitle = $_(".col-md-9.pt-1.pb-1.text-center.m-auto.bg-white.rounded").text();

    const fixtures = $_(".col-md-9.pt-1.pb-1.text-center.m-auto.bg-white.rounded div");
    console.log('length of fixtures', fixtures.length);
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
      console.log('team fixtures length', teamFixtures.length);
    }
    await Team.findOne({teamName: teamName})
    .then(async (team) => {
        if (team) {
          teamImage = team.teamImage;
          console.log('Team exists!');
        } else {
        await Team.create({teamName: teamName, teamImage: teamImage}).then((err, team)=>{
            if(err) console.log(err);
            console.log('Team added to db');
        });
        }
    })
    .catch((err) => {
        console.error('Error finding user:', err);
    });

    console.log("Team and fixtures Added" );
    teamFixtures.push({
      teamName: teamName,
      teamImage: teamImage,
      fixtures: games
    })
  }

  // Loop through the li elements and log their text content
  writeJsonToFile(teamFixtures, "data/topTeams.json");
}

scrapeTopGames();
