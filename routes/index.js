var index = require("../controllers/index");
module.exports = (app) => {
    app.get("/", index.render);
};