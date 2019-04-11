const express = require('express');
const postRouter = express.Router();
const {brand, title} = require('../modules/titles');
const connection = require('../modules/database');
const sql = require('../modules/sql-queries');

postRouter.route('/:slug')
  .get((req, res) => {
    connection.query(sql.select.by.postSlug, req.params.slug, (err, result) =>{
      if(!err) {
        res.render('post', {
          title: `${result[0].post_title} - Blog | ${brand}`,
          user: res.locals.user,
          post: result[0]
        });
      }else {
        res.render('error-404', {
          title: title.error,
          user: res.locals.user
        });
      }
    });
  });


module.exports = postRouter;