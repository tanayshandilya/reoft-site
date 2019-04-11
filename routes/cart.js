const express = require('express');
const cartRouter = express.Router();
const {title} = require('../modules/titles');
const connection = require('../modules/database');
const sql = require('../modules/sql-queries');
const cart = require('../modules/cart');

cartRouter.route('/')
  .get((req, res) => {
    if(typeof req.cookies['reoft%3AeShSd68lT75Lorm4epeU9hoCxB8656VpQHMBwmbA'] !== 'undefined') {
      cart.products = JSON.parse(req.cookies['reoft%3AeShSd68lT75Lorm4epeU9hoCxB8656VpQHMBwmbA']);
      connection.query(sql.select.all.allProducts, (err, result) => {
        if(!err){
          cart.results = cart.filterProducts(result);
          res.render('cart', {
              title: title.cart,
              user: res.locals.user,
              products: cart.results,
              calc: cart.calculateTaxes()
          });
        }else {
          cart.results = cart.filterProducts(result);
          res.render('cart', {
            title: title.cart,
            user: res.locals.user,
            products: [],
            calc: {}
          });
        }
      });
    }else {
        cart.results = cart.filterProducts(result);
        res.render('cart', {
          title: title.cart,
          user: res.locals.user,
          products: [],
          calc: {}
        });
      }
  });


module.exports = cartRouter;