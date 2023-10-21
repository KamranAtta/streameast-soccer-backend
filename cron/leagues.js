var mongoose = require('mongoose');
const cheerio = require("cheerio");
const request = require('sync-request');
const fsPromises = require('fs').promises;
const MongoDB = require('../config/mongodb'),
      Mongoose = require('../config/mongoose');

MongoDB();
Mongoose();

const League = mongoose.model('League');

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

const scrapeTopLeagues = async () => {
    console.log('Scraping Leagues');

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
        const leagueName = ($(topLeagueLink).find('a div').text()).trim();

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
            console.log('team fixtures length', teamFixtures.length);
        }
        }
        console.log("Team and fixtures Added" );
        let league = {
            leagueName:leagueName,
            leagueImage: leagueImage        
        }

        await League.findOne({ leagueName: league.leagueName })
        .then(async (leag) => {
            if (leag) {
                league = {...league, leagueImage: leag.leagueImage }
                console.log('League exists!');
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
            description: '',
            fixtures: games
        })
    }
    // Loop through the li elements and log their text content
    writeJsonToFile(teamFixtures, "data/topLeagues.json");

    mongoose.connection.close();
}

scrapeTopLeagues();
