const express = require('express');
const checkoutRouter = express.Router();
const {title} = require('../modules/titles');
const connection = require('../modules/database');
const sql = require('../modules/sql-queries');
const cart = require('../modules/cart');

checkoutRouter.route('/')
  .get((req, res) => {
    if(res.locals.user){
      connection.query(sql.select.by.userUname, res.locals.user.username,(err,result)=>{
        if(!err){
          if(typeof req.cookies['reoft%3AeShSd68lT75Lorm4epeU9hoCxB8656VpQHMBwmbA'] !== 'undefined') {
            cart.products = JSON.parse(req.cookies['reoft%3AeShSd68lT75Lorm4epeU9hoCxB8656VpQHMBwmbA']);
            connection.query(sql.select.all.allProducts, (err1, result1) => {
              if(!err1){
                cart.results = cart.filterProducts(result1);
                res.render('checkout', {
                  title: title.checkout,
                  user: res.locals.user,
                  products: cart.results,
                  calc: cart.calculateTaxes(),
                  userDetails: result[0]
                });
            }else {
              cart.results = cart.filterProducts(result1);
              res.render('checkout', {
                title: title.checkout,
                user: res.locals.user,
                products: [],
                calc: {},
                userDetails: result[0]
              });
            }
            });
          }
        }else{
          res.render('checkout', {
            title: title.checkout,
            user: res.locals.user,
            userDetails: {}
          });
        }
      });
    }else{
      res.render('checkout', {
        title: title.checkout,
        user: res.locals.user
      });
    }
  });


module.exports = checkoutRouter;