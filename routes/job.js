const express = require('express');
const jobRouter = express.Router();
const {title,brand} = require('../modules/titles');
const connection = require('../modules/database');
const sql = require('../modules/sql-queries');
const states = require('../modules/states');

jobRouter.route('/:slug')
  .get((req, res) => {
    connection.query(sql.select.by.jobSlug, req.params.slug, (err, result) =>{
      if(!err) {
        res.render('job', {
          title: result[0].job_title+' - Careers | '+brand,
          user: res.locals.user,
          job: result[0]
        });
      }else {
        res.render('error-404', {
          title: title.error,
          user: res.locals.user
        });
      }
    });
  });

jobRouter.route('/apply/:uuid')
  .get((req, res) => {
      connection.query(sql.select.by.jobUUID, req.params.uuid, (err, result) =>{
        if(!err){
          res.render('job-application', {
            title: `Apply - ${result[0].job_title} - Careers | ${brand}`,
            job: result[0],
            states: states,
            user: res.locals.user
          });
        }else{
          res.render('error-404', {
            title: title.error,
            user: res.locals.user
          });
        }
      });
    });


module.exports = jobRouter;