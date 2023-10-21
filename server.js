var dotenv = require('dotenv'),
  Express = require('./config/express'),
  Mongoose = require('./config/mongoose'),
  MongoDB = require('./config/mongodb'),
  Passport = require('./config/passport');
  Cron = require('./cronJob');

dotenv.config();
MongoDB();
Mongoose();
Cron();
var server = Express();
Passport();

var port = process.env.PORT || 8080;
// var port = 5000
server.get('/', function (req, res) {
  res.send('Hello World!');
});
server.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
