const express = require('express');
const multer = require('multer');
const path = require('path');
const date = require('date-and-time');
const uuid = require('uuid');
const bcrypt = require('bcrypt-nodejs');
const cryptojs = require('crypto-js');
const {sessionKey} = require('../modules/kms');
const apiRouter = express.Router();
const connection = require('../modules/database');
const sql = require('../modules/sql-queries');
const cart = require('../modules/cart');
const kms = require('../modules/kms');
const token = require('../modules/token');
const JSEncrypt = require('node-jsencrypt');
const rsa = new JSEncrypt();
rsa.setPrivateKey(kms.privateKey);
var storage = multer.diskStorage({  
  destination: function (req, file, callback) {  
    callback(null, path.join(__dirname,'../uploads'));  
  },  
  filename: function (req, file, callback) {
    let generatedFileName = new Date().getTime()+'-'+cryptojs.MD5(file.originalname+new Date().getTime())+'-'+date.format(new Date(), 'DD-MM-YYYY--HH-mm-ss')+path.extname(file.originalname);
    callback(null, generatedFileName);
  }  
});
var resumeUpload = multer({ 
  storage : storage,
  limits: {
    fileSize: 1024 * 1024 * 10
  }
}).single('resume');  

/* ====================================== PULL APIS =========================================== */
apiRouter.route('/pull/products')
  .post((req, res) => {
    connection.query(sql.select.all.products, (err, result)=>{
      if(!err) {
        res.json({
          status: 'success',
          data: result
        });
      }else{
        res.json({
          status: 'error',
          message: err
        });
      }
    });
  });

apiRouter.route('/pull/blog')
  .post((req, res) => {
    connection.query(sql.select.all.apiPosts, (err, result)=>{
      if(!err) {
        res.json({
          status: 'success',
          data: result
        });
      }else{
        res.json({
          status: 'error',
          message: err
        });
      }
    });
  });

apiRouter.route('/pull/taxes')
  .post((req, res) => {
    cart.products = JSON.parse(req.body.CART_contents);
    connection.query(sql.select.all.allProducts, (err, result)=>{
      if(!err){
        cart.results = cart.filterProducts(result);
        res.json({
          status: 'success',
          data: cart.calculateTaxes()
        });
      }else {
        res.json({
          status: 'error'
        });
      }
    });
  });

/* ====================================== /PULL APIS =========================================== */


/* ====================================== PUSH APIS =========================================== */

apiRouter.route('/push/subscription')
  .post((req, res) => {
    let email = rsa.decrypt(req.body.email);
    connection.query(sql.insert.email, [uuid.v4(), email, date.format(new Date(), 'DD-MMMM-YYYY, hh:mm:ss A')], (err) => {
      if(!err) {
        res.json({
          status: 'success',
          message: 'You have successfuly subscribed'
        });
      }else {
        res.json({
          status: 'error',
          message: err
        });
      }
    });
  });

apiRouter.route('/push/contact')
  .post((req, res) => {
    let name = rsa.decrypt(req.body.name);
    let email = rsa.decrypt(req.body.email);
    let phone = rsa.decrypt(req.body.phone);
    let company = rsa.decrypt(req.body.company);
    let subject = req.body.subject;
    let message = req.body.message;
    connection.query(sql.insert.contact, 
      [uuid.v4(), name, email, phone, company, subject, message, date.format(new Date(), 'DD-MMMM-YYYY, hh:mm:ss A')], 
    (err) => {
      if(!err) {
        res.json({
          status: 'success',
          message: 'Your has been submitted successfully'
        });
      }else {
        res.json({
          status: 'error',
          message: err
        });
      }
    });
  });

apiRouter.route('/push/feedback')
  .post((req, res) => {
    connection.query(sql.update[req.body.action], [(1+parseInt(req.body.oldCount)), req.body.slug], (err) => {
      if(!err) {
        res.json({
          status: 'success',
          message: 'Thank you for your feedback'
        });
      }else {
        res.json({
          status: 'error',
          message: err
        });
      }
    });
  });

apiRouter.route('/push/blog/comment/:post_id')
  .post((req, res) => {
    connection.query(sql.insert.postComment, [
      req.params.post_id,
      new Date().getTime().toString(36),
      req.body.firstname+' '+req.body.lastname,
      req.body.email,
      '/static/img/dummy/u4.png',
      
    ], (err) => {
      if(!err) {
        res.json({
          status: 'success',
          message: 'Thank you for your feedback'
        });
      }else {
        res.json({
          status: 'error',
          message: err
        });
      }
    });
  });

apiRouter.route('/push/post/feedback/:post_slug')
  .post((req, res) => {
    connection.query(sql.update[req.body.value], [(parseInt(req.body.count)+1), req.params.post_slug], (err)=>{
      if(!err){
        connection.query(sql.select.by.feedbackPostSlug, [req.params.post_slug], (err, result)=>{
          if(!err){
            res.json({
              status: 'success',
              data: {
                like: ( parseInt(result[0].post_positive_feedback_count) / (parseInt(result[0].post_positive_feedback_count) + parseInt(result[0].post_negative_feedback_count)) ) * 100,
                dislike: ( parseInt(result[0].post_negative_feedback_count) / (parseInt(result[0].post_positive_feedback_count) + parseInt(result[0].post_negative_feedback_count)) ) * 100
              }
            });
          }else{
            res.json({
              status: 'success',
              data: {
                message: 'Thank You for your response'
              }
            });
          }
        });
      }else {
        res.json({
          status: 'error',
          message: err
        });
      }
    });
  });

apiRouter.route('/push/job-application/:uuid')
  .post((req, res) => {
    let apply_question_answers = [];
    for (let i = 0; i < parseInt(req.body.apply_question_count); i++) {
      apply_question_answers.push({
        questionId: i,
        questionAns: req.body[`apply_question_${i}`]
      });
    }
    connection.query(sql.insert.jobApplication,
      [
        uuid.v1(),
        req.params.uuid,
        date.format(new Date(), 'DD-MMMM-YYYY, hh:mm:ss A'),
        rsa.decrypt(req.body.apply_firstname),
        rsa.decrypt(req.body.apply_lastname),
        rsa.decrypt(req.body.apply_email),
        rsa.decrypt(req.body.apply_phone),
        rsa.decrypt(req.body.apply_dob),
        req.body.apply_permanent_address1,
        req.body.apply_permanent_address2,
        req.body.apply_permanent_city,
        req.body.apply_permanent_province,
        req.body.apply_permanent_postal,
        req.body.apply_permanent_country,
        req.body.apply_communication_address1,
        req.body.apply_communication_address2,
        req.body.apply_communication_city,
        req.body.apply_communication_province,
        req.body.apply_communication_postal,
        req.body.apply_communication_country,
        req.body.apply_education_institute,
        req.body.apply_education_course,
        req.body.apply_education_city,
        req.body.apply_education_province,
        req.body.apply_education_from,
        req.body.apply_education_to,
        req.body.apply_education_cgpa,
        req.body.apply_education_total,
        req.body.apply_experience_from,
        req.body.apply_experience_to,
        req.body.apply_experience_organization,
        req.body.apply_experience_city,
        req.body.apply_experience_postal,
        req.body.apply_experience_province,
        req.body.apply_experience_country,
        JSON.stringify(apply_question_answers),
        req.body.apply_resume
      ], (err) => {
      if(!err) {
        res.json({
          status: 'success',
          message: 'Your job application has been submitted successfully'
        });
      }else {
        res.json({
          status: 'error',
          message: err
        });
      }
    });
  });

/* ====================================== /PUSH APIS =========================================== */


/* ====================================== UPDATE APIS =========================================== */

apiRouter.route('/update/account')
  .post((req, res) => {
    connection.query(sql.update.accountInfo,
      [
        rsa.decrypt(req.body.firstname),
        rsa.decrypt(req.body.lastname),
        rsa.decrypt(req.body.email),
        rsa.decrypt(req.body.phone),
        rsa.decrypt(req.body.facebook),
        rsa.decrypt(req.body.linkedin),
        req.body.introduction,
        req.body.description,
        rsa.decrypt(req.body.company_name),
        rsa.decrypt(req.body.company_site),
        rsa.decrypt(req.body.designation),
        rsa.decrypt(req.body.address1),
        rsa.decrypt(req.body.address2),
        rsa.decrypt(req.body.city),
        rsa.decrypt(req.body.postcode),
        rsa.decrypt(req.body.province),
        rsa.decrypt(req.body.country),
        res.locals.user.uuid
      ], (err) => {
        if(!err){
          res.json({
            status: 'success',
            message: 'Your account settings have been saved successfully'
          });
        }else{
          res.json({
            status: 'error',
            message: err
          });
        }
      });
  });

apiRouter.route('/update/password')
  .post((req, res) => {
    connection.query(sql.select.by.userUname,res.locals.user.username, (err,result) => {
        if(!err){
          oldPass = rsa.decrypt(req.body.oldPass);
          newPass = rsa.decrypt(req.body.newPass);
          if(bcrypt.compareSync(oldPass, result[0].user_password)){
            connection.query(sql.update.passwordInfo, 
              [
                bcrypt.hashSync(newPass, 10), 
                res.locals.user.uuid
              ],
              (err)=>{
                if(!err) {
                  res.json({
                    status: 'success',
                    message: 'Password Changed Successfully'
                  });
                }else{
                  res.json({
                    status: 'error',
                    message: 'Password could not be updated'
                  });
                }
            });
          }else{
            res.json({
              status: 'error',
              message: 'Invalid Current Password'
            });
          }
        }else{
          res.json({
            status: 'error',
            message: 'Invalid Action'
          });
        }
      });
  });

/* ====================================== /UPDATE APIS =========================================== */

/* ====================================== AUTH APIS =========================================== */

apiRouter.route('/auth/login')
  .post((req, res) => {
    let email = rsa.decrypt(req.body.email);
    let pass = rsa.decrypt(req.body.password);
    connection.query(sql.select.loginDetails, email, (err, result) => {
      if(!err) {
        if(result.length) {
          if(bcrypt.compareSync(pass, result[0].user_password)) {
            res.json({
              status: 'success',
              data: {
                token: {
                  name: `--reoft-${cryptojs.HmacSHA224((req.headers['x-forwarded-for'] || req.connection.remoteAddress)+req.headers['user-agent']+date.format(new Date(),'DD-MM-YYYY'), sessionKey).toString()}`,
                  value: token.generate({
                    uuid: result[0].user_uuid, 
                    username: result[0].user_username, 
                    email: result[0].user_email
                  })
                }
              }
            });
          }else{
            res.json({
              status: 'error',
              message: 'invalid Password'
            });  
          }
        }else{
          res.json({
            status: 'error',
            message: 'invalid user'
          });  
        }
      }else {
        res.json({
          status: 'error',
          message: err
        });
      }
    });
  });

/* ====================================== /AUTH APIS =========================================== */

/* ====================================== UPLOAD API =========================================== */

apiRouter.route('/upload/resume')
  .post((req, res) => {
    resumeUpload(req, res, (err)=>{
      if(err){
        res.json({
          status:'error',
          message:'File could not be uploaded'
        })
      }else{
        res.json({
          status: 'success',
          message: 'Your resume has been uploaded successfully',
          filename: res.req.file.filename
        })
      }
    });
  });

/* ====================================== /UPLOAD API =========================================== */

module.exports = apiRouter;