var mongoose = require('mongoose');
const cheerio = require("cheerio");
const request = require('sync-request');
const axios = require('axios');
const fs = require('fs');
var dotenv = require('dotenv'),
    MongoDB = require('../config/mongodb'),
    Mongoose = require('../config/mongoose');

dotenv.config();
MongoDB();
Mongoose();

const News = mongoose.model('News');

// Function to download and store the image
async function downloadImage(url, path) {
    try {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream'
      });
  
      response.data.pipe(fs.createWriteStream(path));
  
      return new Promise((resolve, reject) => {
        response.data.on('end', () => {
          resolve();
        });
  
        response.data.on('error', (err) => {
          reject(err);
        });
      });
    } catch (err) {
      console.log('Error downloading image!')
      return
      // throw new Error(`Error downloading image: ${err.message}`);
    }
  }
  
  const scrapeLatestNews = async () => {
    console.log('Scraping News...');
  
    const apiURL = "https://www.soccerblog.com/";
  
    const response = request('GET', apiURL);
    const html = response.getBody('utf8');
  
    const $ = cheerio.load(html);
  
    const newsLinks = $("#grid-wrap div article");
  
    console.log('total News: ', newsLinks.length);
    const existingNews = await News.distinct('title');
    for (let i = 0; i < newsLinks.length; i++) {
        const article = newsLinks[i];
        const title = $(article).find('header h2').text();
        if(!existingNews.includes(title)){
          console.log('New Game!');
          const link = $(article).find('header h2 a').attr('href');
          const imageSource = $(article).find('div.imgthumb img').first().attr('src');
          const category = $(article).find('footer.entry-meta span.cat-meta-color a').text();
          let image = '';
  
          if(imageSource){
            const f = imageSource.split('/');
            const filename = f[f.length - 1];
            console.log('File name', filename);
  
            const imagePath = './frontend/src/assets/img/news/' + filename;
    
            await downloadImage(imageSource, imagePath)
            .then(() => {
                console.log('Image downloaded successfully!');
                console.log('Image path:', imagePath);
                image = '/assets/img/news/' + filename;
            })
            .catch((err) => {
                console.error('Error:', err);
            });
          }
  
          let description = '';
          const res = request('GET', link);
          const htmlDes = res.getBody('utf8');
        
          const $_ = cheerio.load(htmlDes);
        
          const paragraphs = $_("div.entry-content.post-content p");
          for(let j = 0; j < paragraphs.length; j++){
            const para = paragraphs[j];
            const paraText = $_(para).text();
            description = description + paraText + '\n';
          }
          const news = {
            title: title,
            image: image ?? 'https://res.cloudinary.com/dp7udccyf/image/upload/v1688552200/sports-logo_uxg2pv.webp',
            category: category,
            description: description,
          }
          await News.create(news).then((err, news)=>{
            if(err) console.log(err);
            console.log('News added to db');
          });
        } else {
          console.log('News exists!');
        }
    }
    mongoose.connection.close();
  }
  
scrapeLatestNews()