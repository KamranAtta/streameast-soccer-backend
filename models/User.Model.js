var mongoose = require('mongoose');
jwt = require('jsonwebtoken'),
crypto = require('crypto');

var UserSchema = new mongoose.Schema({
    id:{type:Number},
    emailAddress: { type: String, required: true },
    password: {type: String,default:'123456'},
    hash: { type: String },
    salt: { type: String },
    accessToken:{ type: String },
    refreshToken:{ type: String },
}, { toJSON: { getters: true } });

UserSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

UserSchema.methods.ValidPassword = function(password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
};

UserSchema.methods.generateJwt = function() {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 1);
    return jwt.sign({
            _id: this._id,
            exp: Math.floor(Date.now() / 1000) + (60 * 60)
        }, // 1 Hour
        process.env.JWT_SECRET);
};

module.exports = mongoose.model('User', UserSchema);