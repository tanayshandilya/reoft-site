const express = require('express');
const logoutRouter = express.Router();
const {sessionKey} = require('../modules/kms');
const cryptojs = require('crypto-js');

logoutRouter.route('/')
  .get((req, res) => {
    let tokenUUID = cryptojs.HmacSHA224(req.headers['user-agent'], sessionKey);
    if(typeof req.cookies[`--reoft-${tokenUUID}`] !== 'undefined') {
      res.clearCookie(req.cookies[`--reoft-${tokenUUID}`]);
      res.redirect(req.get('referer'));
    }else{
      res.redirect(req.get('referer'));
    }
  });


module.exports = logoutRouter;