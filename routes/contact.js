const express = require('express');
const contactRouter = express.Router();
const {title} = require('../modules/titles');

contactRouter.route('/')
  .get((req, res) => {
    res.render('contact', {
      title: title.contact,
      user: res.locals.user
    });
  });


module.exports = contactRouter;