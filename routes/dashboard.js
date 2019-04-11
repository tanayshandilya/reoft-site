const express = require('express');
const dashboardRouter = express.Router();
const {brand} = require('../modules/titles');
const connection = require('../modules/database');
const sql = require('../modules/sql-queries');

dashboardRouter.route('/')
  .get((req, res) => {
    if(res.locals.user){
      connection.query(sql.select.by.userUname, res.locals.user.username, (err, result) => {
        if(!err) {
          res.render('dashboard/dashboard', {
            title: `Dashboard - ${result[0].user_firstname+' '+result[0].user_lastname} | ${brand}`,
            user: res.locals.user,
            userDetails: result[0]
          });
        }else {
          res.render('dashboard/dashboard', {
            title: `Dashboard | ${brand}`,
            user: res.locals.user,
            userDetails: []
          });
        }
      });
    }else {
      res.redirect('/');
    }
  });

dashboardRouter.route('/account')
  .get((req, res) => {
    if(res.locals.user){
      connection.query(sql.select.by.userUname, res.locals.user.username, (err, result) => {
        if(!err) {
          res.render('dashboard/account', {
            title: `My Account - ${result[0].user_firstname+' '+result[0].user_lastname} | ${brand}`,
            user: res.locals.user,
            userDetails: result[0]
          });
        }else {
          res.render('dashboard/account', {
            title: `My Account | ${brand}`,
            user: res.locals.user,
            userDetails: []
          });
        }
      });
    }else {
      res.redirect('/');
    }
  });

dashboardRouter.route('/settings')
  .get((req, res) => {
    if(res.locals.user){
      connection.query(sql.select.by.userUname, res.locals.user.username, (err, result) => {
        if(!err) {
          res.render('dashboard/settings', {
            title: `My Settings - ${result[0].user_firstname+' '+result[0].user_lastname} | ${brand}`,
            user: res.locals.user,
            userDetails: result[0]
          });
        }else {
          res.render('dashboard/settings', {
            title: `My Settings | ${brand}`,
            user: res.locals.user,
            userDetails: []
          });
        }
      });
    }else {
      res.redirect('/');
    }
  });

dashboardRouter.route('/wishlist')
  .get((req, res) => {
    if(res.locals.user){
      connection.query(sql.select.by.wishlistUUID, res.locals.user.uuid, (err, result) => {
        if(!err) {
          res.render('dashboard/wishlist', {
            title: `My Wishlist - @${res.locals.user.username} | ${brand}`,
            user: res.locals.user,
            wishlist: result[0]
          });
        }else {
          res.render('dashboard/wishlist', {
            title: `My Wishlist - @${res.locals.user.username} | ${brand}`,
            user: res.locals.user,
            wishlist: []
          });
        }
      });
    }else {
      res.redirect('/');
    }
  });


module.exports = dashboardRouter;