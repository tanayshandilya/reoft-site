const express = require('express');
const productRouter = express.Router();
const {brand, title} = require('../modules/titles');
const connection = require('../modules/database');
const sql = require('../modules/sql-queries');

productRouter.route('/:slug')
  .get((req, res) => {
    connection.query(sql.select.by.productSlug, req.params.slug, (err, result) =>{
      if(!err) {
        connection.query(sql.select.similarProducts, (err1, result1)=>{
          if(!err1) {
            res.render('product', {
              title: `${result[0].product_name} - Shop | ${brand}`,
              user: res.locals.user,
              product: result[0],
              similar: result1
            });
          }else {
            res.render('product', {
              title: `${result[0].product_name} - Shop | ${brand}`,
              user: res.locals.user,
              product: result[0],
              similar: []
            });
          }
        });
      }else {
        res.render('error-404', {
          title: title.error,
          user: res.locals.user
        });
      }
    });
  });


module.exports = productRouter;