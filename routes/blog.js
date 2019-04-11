const express = require('express');
const blogRouter = express.Router();
const {title} = require('../modules/titles');
const connection = require('../modules/database');
const sql = require('../modules/sql-queries');

blogRouter.route('/')
  .get((req, res) => {
    connection.query(sql.select.all.posts, (err, result) => {
      if(!err) {
        res.render('blog', {
          title: title.blog,
          user: res.locals.user,
          posts: result
        });
      }else {
        res.render('blog', {
          title: title.blog,
          user: res.locals.user,
          posts: []
        });
      }
    });
  });


module.exports = blogRouter;