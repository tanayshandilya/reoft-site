const express = require('express');
const openProjectsRouter = express.Router();
const {title} = require('../modules/titles');
const connection = require('../modules/database');
const sql = require('../modules/sql-queries');

openProjectsRouter.route('/')
  .get((req, res) => {
    connection.query(sql.select.all.openProjects, (err, result) => {
      if(!err) {
        res.render('open-projects', {
          title: title.openProjects,
          user: res.locals.user,
          projects: result
        });
      }else {
        res.render('open-projects', {
          title: title.openProjects,
          user: res.locals.user,
          projects: []
        });
      }
    });
  });


module.exports = openProjectsRouter;