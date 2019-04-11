const express = require('express');
const shopRouter = express.Router();
const {title} = require('../modules/titles');
const connection = require('../modules/database');
const sql = require('../modules/sql-queries');

shopRouter.route('/')
  .get((req, res) => {
    if(req.query.sort_by && req.query.category_type){
      if(req.query.category_type === 'product'){
        featuredProducts = sql.select.all.featuredProducts+` AND \`product_category_slug\` = "${req.query.sort_by}"`;
        regularProducts = sql.select.all.regularProducts+` AND \`product_category_slug\` = "${req.query.sort_by}"`;
      }
    }else{
      featuredProducts = sql.select.all.featuredProducts;
      regularProducts = sql.select.all.regularProducts;
    }
    connection.query(featuredProducts, (err, result) => {
      if(!err) {
        connection.query(regularProducts, (err1, result1) => {
          if(!err1) {
            connection.query(sql.select.all.productCategories, (err2, result2) => {
              if(!err2){
                res.render('shop', {
                  title: title.shop,
                  user: res.locals.user,
                  product: {
                    featured: result,
                    regular: result1,
                    categories: result2
                  }
                });
              }else{
                res.render('shop', {
                  title: title.shop,
                  user: res.locals.user,
                  product: {
                    featured: result,
                    regular: result1,
                    categories: []
                  }
                });
              }
            });
          }else {
            connection.query(sql.select.all.productCategories, (err2, result2) => {
              if(!err2){
                res.render('shop', {
                  title: title.shop,
                  user: res.locals.user,
                  product: {
                    featured: result,
                    regular: [],
                    categories: result2
                  }
                });
              }else{
                res.render('shop', {
                  title: title.shop,
                  user: res.locals.user,
                  product: {
                    featured: result,
                    regular: [],
                    categories: []
                  }
                });
              }
            });
          }
        });
      }else {
        connection.query(regularProducts, (err1, result1) => {
          if(!err1) {
            connection.query(sql.select.all.productCategories, (err2, result2) => {
              if(!err2){
                res.render('shop', {
                  title: title.shop,
                  user: res.locals.user,
                  product: {
                    featured: [],
                    regular: result1,
                    categories: result2
                  }
                });
              }else{
                res.render('shop', {
                  title: title.shop,
                  user: res.locals.user,
                  product: {
                    featured: [],
                    regular: result1,
                    categories: []
                  }
                });
              }
            });
          }else {
            connection.query(sql.select.all.productCategories, (err2, result2) => {
              if(!err2){
                res.render('shop', {
                  title: title.shop,
                  user: res.locals.user,
                  product: {
                    featured: [],
                    regular: [],
                    categories: result2
                  }
                });
              }else{
                res.render('shop', {
                  title: title.shop,
                  user: res.locals.user,
                  product: {
                    featured: [],
                    regular: [],
                    categories: []
                  }
                });
              }
            });
          }
        });
      }
    });
  });


module.exports = shopRouter;