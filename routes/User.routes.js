var user = require("../controllers/User.Controller");

module.exports = (app) => {
  app.post("/userlogin", user.login);
};