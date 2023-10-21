var bodyParser = require('body-parser'),
    express = require('express'),
    passport = require('passport'),
    path = require('path');
var cors = require('cors');
const compression = require('compression');
const fileUpload = require('express-fileupload');
module.exports = () => {
    var app = express();
    app.use(compression())
    // // for parsing application/json
    app.use(bodyParser.json());
    // // for parsing application/xwww-
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, "../public")));
    app.use(cors());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(fileUpload({
        useTempFiles: true
    }));
    // routes
    require('../routes/index')(app);
    require('../routes/Product.routes')(app);
    require('../routes/User.routes')(app);
       //if(process.env.NODE_ENV === "development")
    //{
        // CORS rquests
        app.use("/", (req, res, next) => {
            res.header("Access-Control-Allow-Origin", process.env.REQ_URL);
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Content-Type, Accept, Authorization");
            next();
        });
        // app.use((req, res, next) => {
        //     res.setHeader('Cache-Control', 'no-cache');
        //     next();
        //   });
        app.get('*',(req,res)=>{
            res.sendFile(path.join(__dirname, '../public/index.html'));
        })
    //}
    return app;
};