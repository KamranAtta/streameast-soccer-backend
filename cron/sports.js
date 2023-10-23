const cheerio = require("cheerio");
const request = require('sync-request');
const fsPromises = require('fs').promises;
var mongoose = require('mongoose');
var dotenv = require('dotenv'),
    MongoDB = require('../config/mongodb'),
    Mongoose = require('../config/mongoose');

dotenv.config();
MongoDB();
Mongoose();

const Team = mongoose.model('Team');
const League = mongoose.model('League');

let data = [];

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
  }else if (teamName.includes("Nottingham Forest")){
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1692371799/teams/nottingham-forest-fc_nz7bvk.webp"
  }else if (teamName.includes("Sheffield United")){
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1692372049/teams/sheffield-united-fc-logo_gsov54.webp"
  }else if (teamName == "Croatia"){
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1694193662/countries/Carotia-logo_d9prlw.webp"
  }else if (teamName.includes("Turkey")){
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1694193663/countries/Turkey-logo_xg9qe2.webp"
  }else if (teamName.includes("Portugal")){
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1694193663/countries/Portugal-logo_tczrzk.webp"
  }else if (teamName.includes("Spain")){
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1694193663/countries/Spain-logo_am9e6d.webp"
  }else if (teamName.includes("Canada")){
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1688573119/countries/Canada-Flag_xw1q8d.webp"
  }else if (teamName.includes('UFC')){
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1697877528/teamLogos/ufc_logo_bspjcx.webp"
  }else if (teamName.includes('Bayern')){
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1697881181/teamLogos/Bayern_Munchen_logo_uydtu3.webp"
  }else if (teamName.includes('Formula 1')){
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1697881762/teamLogos/f1-logo_bx4i5v.webp"
  }else if (teamName.includes("Brighton & Hove Albion")){
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1697882349/teamLogos/Brighton_Hove_Albion_kefsik.webp"
  }else if (teamName.includes("Wolverhampton Wanderers")){
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1697882348/teamLogos/Wolverhampton_Wanderers_gzzza3.webp"
  }else if (teamName.includes("Manchester City")){
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1697882881/teamLogos/ManCity_logo_cn6j5b.webp"
  }else {
    return "https://res.cloudinary.com/dp7udccyf/image/upload/v1698084766/teamLogos/soccer_oiowlt.webp";
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

const scrapeSports = async () => {
  const dbTeams = await Team.find({});
  const otherCats = ['F1', 'Tennis', 'Boxing', 'Cricket']
  const subCatLogos = {
    F1: 'https://res.cloudinary.com/dp7udccyf/image/upload/v1697881762/teamLogos/f1-logo_bx4i5v.webp',
    Tennis: 'https://res.cloudinary.com/dp7udccyf/image/upload/v1698082101/teamLogos/tennis_logo_lov6vr.webp',
    Boxing: 'https://res.cloudinary.com/dp7udccyf/image/upload/v1697879641/teamLogos/boxing-logo_polxhx.jpg',
    Cricket: 'https://res.cloudinary.com/dp7udccyf/image/upload/v1698082101/teamLogos/cricket_logo_cdhdjy.webp',
    Soccer: 'https://res.cloudinary.com/dp7udccyf/image/upload/v1698084766/teamLogos/soccer_oiowlt.webp'
  }; 
  const dbLeagues = await League.find({});

  const apiURL = "https://totalsportek.pro/";

  const response = await request('GET', apiURL);
  const html = await response.getBody('utf8');

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
    if(categoryName != "Soccer Streams"){
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
        // subCategoryImage = $(subCategory).find('img').attr('src');
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
        let matchTime = $__('div[id="timer"]').text();

        if(matchTime.trim() === 'LIVE'){
          const now = new Date();
          const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
          matchTime = now.toLocaleTimeString('en-US', timeOptions) + ' UTC';
        }

        const teams = $(subCategory).find('div.row.my-auto');
        const teamImages = $(subCategory).find('div.row.my-auto div.col-1.my-auto img');
        const teamA = $(teams[0]).text();
        const teamB = $(teams[1]).text();

        let imageA = '';
        let imageB = '';

        if(otherCats.includes(subCategoryName)){
          subCategoryImage = subCatLogos[subCategoryName];
          imageA = subCategoryImage;
          imageB = subCategoryImage;
        }else {
          const leagueObj = dbLeagues.find(league => league.leagueName === subCategoryName);
          if(leagueObj) {
            subCategoryImage = leagueObj?.subCategoryImage;
          }else {
            subCategoryImage = subCatLogos.Soccer;
          }

          const teamAOnj = dbTeams.find(team => team.teamName === teamA);
          const teamBOnj = dbTeams.find(team => team.teamName === teamB);

          imageA = teamAOnj?.teamImage;
          imageB = teamBOnj?.teamImage;

          if(!imageA){
            imageA = await getImage(teamA);
          }
          if(!imageB){
            imageB = await getImage(teamB);
          }
        }

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
        console.log('game added');
        subCats[index].games.push(game);
      }
    }
    data.push({
      categoryName: categoryName,
      subCategories: subCats
    });
    console.log('New Sports added');
    }
    
  }
  // writeJsonToFile(data);
  // console.log('Data Written');
}

// scrapeSports();

async function run() {
  await scrapeSports();
  writeJsonToFile(data, 'data/sports.json');
}

run();