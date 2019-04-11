const express = require('express');
const supportRouter = express.Router();
const {brand} = require('../modules/titles');
const connection = require('../modules/database');
const sql = require('../modules/sql-queries');

supportRouter.route('/:pageSlug')
  .get((req, res) => {
    connection.query(sql.select.by.pageSlug, req.params.pageSlug, (err, result) => {
      if(!err) {
        if(result) {
          res.render('support', {
            title: result[0].page_title+' - '+result[0].page_type[0].toUpperCase()+result[0].page_type.slice(1)+' | '+brand,
            content: result[0],
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


module.exports = supportRouter;