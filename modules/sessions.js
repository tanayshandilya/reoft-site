const cryptojs = require('crypto-js');
const token = require('./token');
const date = require('date-and-time');
const {sessionKey} = require('./kms');

const Session = {
  isLoggedIn: (req, res, next) => {
    let tokenUUID = cryptojs.HmacSHA224((req.headers['x-forwarded-for'] || req.connection.remoteAddress)+req.headers['user-agent']+date.format(new Date(),'DD-MM-YYYY'), sessionKey).toString();
    if(typeof req.cookies[`--reoft-${tokenUUID}`] !== 'undefined') {
      token.verify(req.cookies[`--reoft-${tokenUUID}`], (err, decoded) => {
        if(!err){
          decoded.tokenId = tokenUUID;
          res.locals.user = decoded;
          next(); 
        }else{
          res.locals.user = 0;
          next();
        }
      });
    }else {
      res.locals.user = 0;
      next();
    }
  }
}

module.exports = Session;
// req.headers['x-forwarded-for'] || req.connection.remoteAddress