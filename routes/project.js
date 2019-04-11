const express = require('express');
const projectRouter = express.Router();
const {brand, title} = require('../modules/titles');
const connection = require('../modules/database');
const sql = require('../modules/sql-queries');

projectRouter.route('/:slug')
  .get((req, res) => {
    connection.query(sql.select.by.projectSlug, req.params.slug, (err, result) =>{
      if(!err) {
        res.render('project', {
          title: `${result[0].project_title} - Open Project | ${brand}`,
          user: res.locals.user,
          project: result[0]
        });
      }else {
        res.render('error-404', {
          title: title.error,
          user: res.locals.user
        });
      }
    });
  });


module.exports = projectRouter;