var mongoose = require('mongoose');
const User = mongoose.model('User');
passport = require('passport');
var randtoken = require('rand-token')
const refreshTokens = {};

exports.signin = (req, res) => {
    if (!req.body.emailAddress) {
        return res.status(400).json({ message: "All fields required" });
    }
    User.findOne({ emailAddress: req.body.emailAddress }, (err, admin) => {
        if (admin) {
            return res.status(500).json('User Already  Exists');
        }else{
            const user = new User(req.body);
            user.accessToken = 'access-token-' + Math.random();
            user.refreshToken = 'access-token-' + Math.random();
            tempPass = user.hash;
    
            if(req.body.password && req.body.password != ''){
                user.setPassword(req.body.password);
            }
            else if (req.body.hash && req.body.hash != ''){
                user.setPassword(req.body.hash);
            }
            else {
                user.hash = tempPass;
            }
            user.save((err,user)=>{
                if(err){
                    res.status(400).json(err)
                }else{
                    delete user.password
                    return res.json(userObj);
                }
            });
        }

    });
}

exports.login = (req, res) => {
    if (!req.body.emailAddress || !req.body.hash) {
        return res.status(400).json('error logging in!');
    }
    passport.authenticate("user", (err, client, info) => {
    let token;
    if (err) {
        return res.status(200).json(false);
    }
    if (client) {
        var user = {
        email: client.emailAddress,
        }
        token = jwt.sign(user, 'secret',
        {expiresIn: '4h'});
        const refreshToken = randtoken.uid(256);
        refreshTokens[refreshToken] = client.emailAddress;
        client.accessToken = token;
        client.refreshToken = refreshToken;
        res.status(200).json({'accessToken':client.accessToken,'refreshToken':client.refreshToken});
    } else {
        res.status(200).json(false);
    }
    })(req, res);
};