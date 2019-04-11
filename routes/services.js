const express = require('express');
const servicesRouter = express.Router();
const {title} = require('../modules/titles');

servicesRouter.route('/')
  .get((req, res) => {
    res.render('services', {
      title: title.services,
      user: res.locals.user
    });
  });


module.exports = servicesRouter;