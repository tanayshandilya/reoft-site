const express = require('express');
const aboutRouter = express.Router();
const {title} = require('../modules/titles');
const connection = require('../modules/database');
const sql = require('../modules/sql-queries');
aboutRouter.get('/',(req, res) => {
    res.render('about', {
      title: title.about,
      user: res.locals.user
    });
  });

aboutRouter.route('/team')
  .get((req, res) => {
    connection.query(sql.select.all.teamMembers, (err, result) => {
      if(!err) {
        res.render('team', {
          title: title.team,
          user: res.locals.user,
          members: result
        });
      }else {
        res.render('team', {
          title: title.team,
          user: res.locals.user,
          members: []
        });
      }
    });
  });

aboutRouter.route('/testimonials')
  .get((req, res) => {
    connection.query(sql.select.all.testimonials, (err, result) => {
      if(!err) {
        res.render('testimonials', {
          title: title.testimonials,
          user: res.locals.user,
          testimonials: result
        });
      }else {
        res.render('testimonials', {
          title: title.testimonials,
          user: res.locals.user,
          testimonials: err
        });
      }
    });
  });


module.exports = aboutRouter;