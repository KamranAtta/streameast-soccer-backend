var mongoose = require('mongoose');

module.exports = async() => {
  // local database
  return mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB successfully connected"))
    .catch(err => console.log(err));
};