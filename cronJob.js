const { fork } = require('child_process');
const schedule = require('node-schedule');
const fs = require('fs');

// Assuming you have an array of URLs for your sitemap
const urls = [
  { loc: 'https://sportsfeed24.com/', priority: 1.0 },
  { loc: 'https://sportsfeed24.com/news', priority: 0.9 },
  { loc: 'https://sportsfeed24.com/about', priority: 0.8 }
  
];

// Generate the sitemap dynamically
const generateSitemap = () => {
  const currentDate = new Date().toISOString().slice(0, 10);

  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const url of urls) {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${url.loc}</loc>\n`;
    sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
    sitemap += `    <priority>${url.priority}</priority>\n`;
    sitemap += '  </url>\n';
  }

  sitemap += '</urlset>';

  return sitemap;
};

// Function to update the <lastmod> value of the home page URL with the current date
const updateHomePageLastMod = () => {
  const currentDate = new Date().toISOString().slice(0, 10);
  const sitemapPath  = process.env.NODE_ENV === 'local' ? 'frontend/src/sitemap.xml' : 'public/sitemap.xml';; 

  fs.readFile(sitemapPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading sitemap:', err);
      return;
    }

    // Update the <lastmod> value of the home page URL with the current date
    const updatedData = data.replace(
      /<loc>https:\/\/sportsfeed24.com\/<\/loc>\s+<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/,
      `<loc>https://sportsfeed24.com/</loc>\n  <lastmod>${currentDate}</lastmod>`
    );

    // Write the updated sitemap back to the file
    fs.writeFile(sitemapPath, updatedData, (writeErr) => {
      if (writeErr) {
        console.error('Error updating sitemap:', writeErr);
      } else {
        console.log(`Lastmod of home page updated to ${currentDate} in sitemap.xml.`);
      }
    });
  });
};

module.exports = () => {
  const prodSportsInterval = '00 21,23,01,05 * * *';
  const prodTeamInterval = '08 10,2 * * *';
  const prodLeagueInterval = '30 10 * * *';


  // Schedule the task to run every 5 seconds
  const sports = schedule.scheduleJob(prodSportsInterval, () => {
    // Spawn a new process to run the task
    const child = fork(__dirname + '/cron/sports.js');

    // Send a message to the child process to start the task
    child.send('start');

    // // Call the generateSitemap function to get the dynamically generated sitemap
    // const sitemap = generateSitemap();
    // // Save the sitemap as an XML file
    // const folderpath  = process.env.NODE_ENV === 'local' ? './frontend/src/sitemap.xml' : './public/sitemap.xml';
    // fs.writeFile(folderpath, sitemap, (err) => {
    //   if (err) {
    //     console.error('Error saving sitemap:', err);
    //   } else {
    //     console.log('Sitemap saved successfully!');
    //   }
    // });
    updateHomePageLastMod();
    // Listen for the child process to exit
    child.on('exit', (code) => {
      console.log(`Sports scraping exited with code ${code}`);
    });
  });

    // Schedule the task to run every 5 seconds
    const teams = schedule.scheduleJob(prodTeamInterval, () => {
      // Spawn a new process to run the task
      const child = fork(__dirname + '/cron/teams.js');
  
      // Send a message to the child process to start the task
      child.send('start');
  
      // Listen for the child process to exit
      child.on('exit', (code) => {
        console.log(`Team scraping exited with code ${code}`);
      });
    });

      // Schedule the task to run every 5 seconds
  const leagues = schedule.scheduleJob(prodLeagueInterval, () => {
    // Spawn a new process to run the task
    const child = fork(__dirname + '/cron/leagues.js');

    // Send a message to the child process to start the task
    child.send('start');

    // Listen for the child process to exit
    child.on('exit', (code) => {
      console.log(`League scraping exited with code ${code}`);
    });
  });

  // const news = schedule.scheduleJob(newsInterval, () => {
  //   const child = fork(__dirname + '/cron/latestNews.js');

  //   child.send('start');

  //   child.on('exit', (code) => {
  //     console.log(`News scraping exited with code ${code}`);
  //   });
  // });

};
