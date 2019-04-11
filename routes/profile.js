const express = require('express');
const profileRouter = express.Router();
const {brand} = require('../modules/titles');
const connection = require('../modules/database');
const sql = require('../modules/sql-queries');

profileRouter.route('/:id')
  .get((req, res) => {
    connection.query(sql.select.by.userUname, req.params.id.replace('@',''), (err, result) => {
      if(!err) {
        if(result) {
          res.render('profile', {
            title: result[0].user_firstname+' '+result[0].user_lastname+' - Member | '+brand,
            profile: result[0],
            user: res.locals.user
          });
        }else{
          res.render('error-404');
        }
      }else{
        res.render('error-404');
      }
    });
  });


module.exports = profileRouter;