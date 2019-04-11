const express = require('express');
const careersRouter = express.Router();
const {title} = require('../modules/titles');
const connection = require('../modules/database');
const sql = require('../modules/sql-queries');

careersRouter.route('/')
  .get((req, res) => {
    connection.query(sql.select.all.jobs, (err, result) =>{
      if(!err) {
        res.render('careers', {
          title: title.careers,
          user: res.locals.user,
          jobs: result
        });
      }else {
        res.render('careers', {
          title: title.careers,
          user: res.locals.user,
          jobs: []
        });
      }
    });
  });


module.exports = careersRouter;