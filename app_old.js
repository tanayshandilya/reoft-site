// Required packages
const express  = require('express');
const path     = require('path');
const bp       = require('body-parser');
const mysql    = require('mysql');
const cryptojs = require('crypto-js');
const jwt      = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();

// App and SQL Configurations
let reoftTokenInit = {
    tokenData : '63b7fd1e6fa199f060b823531a9ce32be657a1571ba42b893331c15795a0905123b70cf',
    tokenDate : new Date().toISOString().slice(0,10),
    tokenCopyright : 'REOFT Technologies Pvt.Ltd',
};

let AUTH = {
    SALT : 'BW8EnvIE1IGBgRGwTtJsf8MosAekI4uPYhEbCD3V9vcZmKtgiFrPtiogfC5bICzRlmeetLezf7S94WxPwIv3yBC3dqqvRbsryXHVvWiBhXnPTkvK9keu7C2zq1jHGEXgV5hQFLzfoJgTUiZVLBjXBqMbRzkqxWex6mvFWIT1dBVRxov0XzvK90tQdLQenaDjUn4FFwEl',
    SESSION : {}
};

const reoftTokenKey = '@nJ7-%+Yj9MHa5%%Y,]8Fp)zWEaD(aZ:-Q#L!^9dJR4<y';
const reoftLoginTokenKey = '?#M<&7hbJ*-K=)*/gH^_WSZ9^3pB#-C^Un7u!rJwJ_tL:Hv2bwPa))cFRc';
const reoftSessionKey = '?#M<&7hbJ*-K=)*/gH^_WSZ9^3pB#-C^Un7u!rJwJ_tL:Hv2bwPa))cFRc';

const encryptionKey = cryptojs.SHA3(JSON.stringify(reoftTokenInit)).toString();

const apiToken = {
    blog : cryptojs.SHA384(encryptionKey+'BlogApiToken').toString(),
    product : cryptojs.SHA384(encryptionKey+'ProductApiToken').toString(),
    taxes : cryptojs.SHA384(encryptionKey+'TaxesApiToken').toString(),
    subscription : cryptojs.SHA384(encryptionKey+'SubscriptionApiToken').toString(),
    contact : cryptojs.SHA384(encryptionKey+'ContactApiToken').toString(),
    auth : cryptojs.SHA384(encryptionKey+'AuthApiToken').toString()
};

const validateToken = (rexToken) => {
    if ( rexToken.tokenData === reoftTokenInit.tokenData && rexToken.tokenDate === reoftTokenInit.tokenDate && rexToken.tokenCopyright === reoftTokenInit.tokenCopyright ) {
        return true;
    } else { return false };
};

const connection = mysql.createPool({
    connectionLimit : 1000,
    host     : 'reoftapi.cn5ycqth9imu.ap-south-1.rds.amazonaws.com',
    user     : 'reoftapiuser',
    password : '#Re0FtapiT3sT',
    database : 'reoft_site'
});

const sql = {
    getBlogPosts : "SELECT `post_title`, `post_slug`, `post_feature_image`, `post_excerpt` FROM `posts` WHERE `post_status` = 'published' ORDER BY `post_created_at` DESC LIMIT 20",
    getOpenProjects : "SELECT `project_title`, `project_slug`, `project_feature_image`, `project_excerpt`, `project_category_slug` FROM `open_projects` WHERE `project_status` = 'published' ORDER BY `project_created_at` DESC",
    getSinglePostData : "SELECT * FROM `posts` WHERE `post_slug` = ",
    getSingleProjectData : "SELECT * FROM `open_projects` WHERE `project_slug` = ",
    getProjectCategories : 'SELECT * FROM `categories` WHERE `category_type` = "project"',
    getRegularProducts : "SELECT `product_name`, `product_code`, `product_price`, `product_highlight`, `product_featured_image`, `product_rating` FROM `shop` WHERE `product_type` = 'regular'",
    getFeaturedProducts : "SELECT `product_name`, `product_code`, `product_price`, `product_highlight`, `product_featured_image` FROM `shop` WHERE `product_type` = 'featured'",
    getSingleProductData : "SELECT * FROM `shop` WHERE `product_code` = ",
    getSimilarProducts : "SELECT `product_name`, `product_code`, `product_price`, `product_highlight`, `product_featured_image` FROM `shop` ORDER BY `product_id` DESC LIMIT 10",
    getCartProducts : 'SELECT `product_name`, `product_price`, `product_featured_image`, `product_code`, `product_tax`, `product_shipping_cost`, `product_other_charges` FROM `shop` WHERE `product_code` IN ',
    getAllProductsCode : 'SELECT `product_code`, `product_price`, `product_name` FROM `shop`',
    checkSubscriber : 'SELECT `user_role` FROM `users` WHERE `user_email` = ',
    addNewSubscriber : 'INSERT INTO `users`(`user_role`,`user_account_status`, `user_email`,`user_registered_at`) VALUES ( "subscriber", 1, ',
    submitContactForm : 'INSERT INTO `contact_form`(`contact_name`, `contact_email`, `contact_phone`, `contact_company`, `contact_subject`, `contact_message`, `contact_date`) VALUES (',
    checkUserEmail : 'SELECT * FROM `users` WHERE `user_email` = '
}

const percentage = (num, per) => {
  return (num/100)*per;
}

app.use(express.static('resources'));
app.use(express.static('files'));
app.use('/static', express.static('resources'));
app.use('/static', express.static(path.join(__dirname, 'resources')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));
app.use(bp.urlencoded({ extended: true }));
app.use(bp.json());
app.use(cookieParser());
app.use(session({
    key: 'user_sid',
    resave: false,
    saveUninitialized: false,
    secret: reoftSessionKey,
    cookie : {
        expires : 43200
    }
}));
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
    }
    next();
});
let sessionChecker = (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        return req.session.user.userDetails;
    } else {
        return false;
    }    
};

// Server Variables
let serverPort = 3200;
let baseUrl    = 'http://127.0.0.1:'+serverPort;
let CART       = {
    KEY : 'reoft%3AeShSd68lT75Lorm4epeU9hoCxB8656VpQHMBwmbA',
    contents : [],
    find(product_code){
        let match = CART.contents.filter(item=>{
            if(item.product_code == product_code)
                return true;
        });
        if(match && match[0])
            return match[0];
    },
    findIn(product_code,arr){
        let match = arr.filter(item=>{
            if(item.product_code == product_code)
                return true;
        });
        if(match && match[0])
            return match[0];
    },
    serializeCode(){
        let _contents = [];
        for ( let i = 0; i < CART.contents.length; i++ ) {
            _contents.push('"'+CART.contents[i].product_code+'"');
        } return _contents.join(', ');
    },
    productTotal(arr) {
        if ( arr.length > 0 ) { let _price = 0;
            for (let i = 0; i < arr.length; i++) {
                let _qty = CART.find(arr[i].product_code).qty;
                _price = _price + ( parseInt(arr[i].product_price) * _qty);
            } return _price;
        } return 0;
    },
    productTax(arr) { // tax per product
        if ( arr.length > 0 ) { let _tax = 0;
            for (let i = 0; i < arr.length; i++) {
                let _qty = CART.find(arr[i].product_code).qty;
                _tax = _tax + ( _qty * percentage( parseInt(arr[i].product_price), arr[i].product_tax ) );
            } return Math.round(_tax);
        } return 0;
    },
    shippingTax(arr){ // shipping per product
        if ( arr.length > 0 ) { let _shipping = 0;
            for (let i = 0; i < arr.length; i++) {
                let _qty = CART.find(arr[i].product_code).qty;
                _shipping = _shipping + ( _qty * percentage( parseInt(arr[i].product_price), arr[i].product_shipping_cost ) );
            } return Math.round(_shipping);
        } return 0;
    },
    otherTax(arr) { // other tax per product
        if ( arr.length > 0 ) { let _other = 0;
            for (let i = 0; i < arr.length; i++) {
                let _qty = CART.find(arr[i].product_code).qty;
                _other = _other + ( arr[i].product_other_charges * _qty );
            } return _other;
        } return 0;
    }
}

let siteInject = {
    home : {
        title : 'REOFT Technologies | Research and Engineering Of Futuristic Technologies',
        baseUrl : baseUrl,
        encryptionKey : encryptionKey,
        subscriptionApiToken : apiToken.subscription,
        authApiToken : apiToken.auth,
        loginStatus : 0
    },
    about : {
        title : 'About Us | REOFT Technologies',
        baseUrl : baseUrl,
        encryptionKey : encryptionKey,
        authApiToken : apiToken.auth,
        loginStatus : 0
    },
    services : {
        title : 'Our Services | REOFT Technologies',
        baseUrl : baseUrl,
        encryptionKey : encryptionKey,
        authApiToken : apiToken.auth,
        loginStatus : 0
    },
    blog : {
        title : 'Our Blog | REOFT Technologies',
        baseUrl : baseUrl,
        encryptionKey : encryptionKey,
        blogApiToken : apiToken.blog,
        authApiToken : apiToken.auth,
        loginStatus : 0
    },
    team : {
        title : 'Our Team | REOFT Technologies',
        baseUrl : baseUrl,
        encryptionKey : encryptionKey,
        authApiToken : apiToken.auth,
        loginStatus : 0
    },
    testimonials : {
        title : 'Testimonials | REOFT Technologies',
        baseUrl : baseUrl,
        encryptionKey : encryptionKey,
        authApiToken : apiToken.auth,
        loginStatus : 0
    },
    careers : {
        title : 'Careers | REOFT Technologies',
        baseUrl : baseUrl,
        encryptionKey : encryptionKey,
        authApiToken : apiToken.auth,
        loginStatus : 0
    },
    openProjects : {
        title : 'Open Projects | REOFT Technologies',
        baseUrl : baseUrl,
        encryptionKey : encryptionKey,
        authApiToken : apiToken.auth,
        loginStatus : 0
    },
    shop : {
        title : 'Store | REOFT Technologies',
        baseUrl : baseUrl,
        product : {
            featured : null,
            regular : null
        },
        encryptionKey : encryptionKey,
        productApiToken : apiToken.product,
        authApiToken : apiToken.auth,
        loginStatus : 0
    },
    contact : {
        title : 'Contact Us | REOFT Technologies',
        baseUrl : baseUrl,
        encryptionKey : encryptionKey,
        contactApiToken : apiToken.contact,
        authApiToken : apiToken.auth,
        loginStatus : 0
    },
    error : {
        title : 'Error 404 - Page Not Found | REOFT Technologies',
        baseUrl : baseUrl,
        encryptionKey : encryptionKey,
        authApiToken : apiToken.auth,
        loginStatus : 0
    },
    post : {
        baseUrl : baseUrl,
        encryptionKey : encryptionKey,
        authApiToken : apiToken.auth,
        loginStatus : 0
    },
    project : {
        baseUrl : baseUrl,
        encryptionKey : encryptionKey,
        authApiToken : apiToken.auth,
        loginStatus : 0
    },
    product : {
        baseUrl : baseUrl,
        encryptionKey : encryptionKey,
        productApiToken : apiToken.product,
        authApiToken : apiToken.auth,
        loginStatus : 0
    },
    cart : {
        title : 'Cart | REOFT Technologies',
        baseUrl : baseUrl,
        encryptionKey : encryptionKey,
        taxApiToken : apiToken.taxes,
        productApiToken : apiToken.product,
        authApiToken : apiToken.auth,
        loginStatus : 0
    },
    checkout : {
        title : 'Checkout | REOFT Technologies',
        baseUrl : baseUrl,
        encryptionKey : encryptionKey,
        authApiToken : apiToken.auth,
        loginStatus : 0
    }
};

// Page Routing
/*---------------------------------------- Static Pages ----------------------------------------*/

app.get('/about',function(request, response){
    response.render('about',siteInject.about);
});

app.get('/team',function(request, response){
    response.render('team',siteInject.team);
});

app.get('/testimonials',function(request, response){
    response.render('testimonials',siteInject.testimonials);
});

app.get('/services',function(request, response){
    response.render('services',siteInject.services);
});

/*---------------------------------------- Static Pages ----------------------------------------*/

/*---------------------------------------- Dynamic Pages ----------------------------------------*/

app.get('/',function(request, response){
    connection.getConnection(function(err, connection){
        console.log(err,connection)
        connection.query(sql.getOpenProjects, function(err, rows, fields){
            if (!err) {
                siteInject.home['project'] = rows;
                connection.query(sql.getProjectCategories, function(err1, rows1, fields1){
                    connection.release();
                    if (!err1) {
                        siteInject.home['category'] = rows1;
                        reoftTokenInit.tokenDataSignature = cryptojs.SHA3(JSON.stringify(reoftTokenInit)).toString();
                        jwt.sign({tokenData:reoftTokenInit},reoftTokenKey,function(err,token){
                            siteInject.home.token = token;
                            if (request.session.auth) {
                                if (request.cookies.user) {
                                    let loginEmail = request.cookies.user;
                                    console.log(request.session);
                                    if (request.session.auth[loginEmail].loginStatus) {
                                        jwt.verify(request.session.auth[loginEmail].loginToken,reoftLoginTokenKey, (err, auth) => {
                                            if(!err){
                                                response
                                                .setHeader('User-data',request.session.auth[loginEmail].userDetails)
                                                .render('home',siteInject.home);
                                            }else {
                                                request.session.destroy();
                                                siteInject.home.loginStatus = 0;
                                                siteInject.home.loginDetails = {};
                                                response.render('home',siteInject.home);
                                            }
                                        });
                                    }else {
                                        request.session.destroy();
                                        siteInject.home.loginStatus = 0;
                                        siteInject.home.loginDetails = {};
                                        response.render('home',siteInject.home);
                                    }
                                }else {
                                    request.session.destroy();
                                    siteInject.home.loginStatus = 0;
                                    siteInject.home.loginDetails = {};
                                    response.render('home',siteInject.home);
                                }
                            }else {
                                response.render('home',siteInject.home);
                            }
                        });
                    }else{
                        response.render('error-404',siteInject.error);
                    }
                });
            } else {
                response.render('error-404',siteInject.error);
            }
        });
    });
});

app.get('/contact',function(request, response){
    jwt.sign({tokenData:reoftTokenInit},reoftTokenKey,function(err,token){
        siteInject.contact.token = token;
        response.render('contact',siteInject.contact);
    });
});

app.get('/blog',function(request, response){
    connection.getConnection(function(err, connection){
        connection.query(sql.getBlogPosts, function(err, rows, fields) {
            connection.release();
            if (!err) {
                siteInject.blog['post'] = rows;
                response.render('blog',siteInject.blog);
            } else {
                siteInject.blog['post'] = [];
            }
        });
    });
});

app.get('/post/[a-f0-9]{64}',function(request, response){
    connection.getConnection(function(err, connection){ let hash = request.path.split('/'); 
        connection.query(sql.getSinglePostData+"'"+hash[2]+"'", function(err, rows, fields) {
            connection.release();
            if (!err) {
                if (!rows.length) {
                    response.render('error-404',siteInject.error);
                }else {
                    siteInject.post.title = rows[0]['post_title']+' | REOFT Technologies';
                    siteInject.post.post = rows;
                    response.render('post',siteInject.post);
                }
            }else {
                response.render('error-404',siteInject.error);
            }
        });
    });
});

app.get('/open-projects',function(request, response){
    connection.getConnection(function(err, connection){
        connection.query(sql.getOpenProjects, function(err, rows, fields) {
            connection.release(); 
            if (!err) {
                siteInject.openProjects['project'] = rows;
                response.render('open-projects',siteInject.openProjects);
            }else {
                siteInject.openProjects['project'] = [];
            }
        });
    });
});

app.get('/project/[a-f0-9]{64}',function(request, response){
    connection.getConnection(function(err, connection){ let hash = request.path.split('/');
        connection.query(sql.getSingleProjectData+"'"+hash[2]+"'", function(err, rows, fields) {
            // console.log(sql.getSingleProjectData+"'"+hash[2]+"'");
            connection.release(); 
            if (!err) {
                if (!rows.length) {
                    response.render('error-404',siteInject.error);
                    // console.log('row error');
                }else {
                    siteInject.project.title = rows[0]['project_title']+' | REOFT Technologies';
                    siteInject.project.project = rows;
                    response.render('project',siteInject.project);
                }
            }else{
                response.render('error-404',siteInject.error);
                // console.log(err);
            }
        });
    });
});

app.get('/shop',function(request, response){
    connection.getConnection(function(err, connection){
        connection.query(sql.getFeaturedProducts, function(err, rows, fields){
            if (!err) {
                siteInject.shop.product.featured = rows;
                connection.query(sql.getRegularProducts, function(err1, rows1, feilds1) {
                    connection.release();
                    if (!err1) {
                        siteInject.shop.product.regular = rows1;
                        response.render('shop',siteInject.shop);
                    }else {
                        console.log(err1);
                    }
                });
            }else{
                console.log(err);
            }
        });
    });
});

app.get('/product/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}', function(request, response) {
    connection.getConnection(function(err, connection){ let hash = request.path.split('/'); 
        connection.query(sql.getSingleProductData+"'"+hash[2]+"'", function(err, rows, fields) {
            siteInject.product.title = rows[0]['product_name']+'- Store | REOFT Technologies';
            siteInject.product.product = rows;
            if (!err) {
                if (!rows.length) {
                    response.render('error-404',siteInject.error);
                }else {
                    connection.query(sql.getSimilarProducts, function(err1, rows1, feilds1){
                        connection.release();
                        if (!err1) {
                            if (!rows1.length) {
                                response.render('error-404',siteInject.error);
                            }else {
                                siteInject.product.similar = rows1;
                                response.render('product',siteInject.product);
                            }
                        }else {
                            response.render('error-404',siteInject.error);
                        }
                    });
                }
            }else {
                response.render('error-404',siteInject.error);
            }
        });
    });
});

app.get('/cart',function(request, response){
    if (request.cookies[CART.KEY]) {
        CART.contents = _CARTcontents = JSON.parse(request.cookies[CART.KEY]);
        if ( CART.contents.length > 0 ) { 
            connection.getConnection(function(err, connection){
                connection.query(sql.getCartProducts+'('+CART.serializeCode()+')', function(err, rows, feilds) {
                    connection.release();
                    if (!err) {
                        if (!rows.length) {
                            response.render('error-404',siteInject.error);
                        }else {
                            siteInject.cart.products = rows;
                            CART.contents = [];
                            for ( let i = 0; i < _CARTcontents.length; i++ ){
                                let _prod = CART.findIn( _CARTcontents[i].product_code, rows );
                                _prod.qty = _CARTcontents[i].qty;
                                CART.contents.push( _prod );
                            }
                            siteInject.cart.calc = {
                                calcProduct : CART.productTotal(CART.contents),
                                calcTax     : CART.productTax(CART.contents),
                                calcShip    : CART.shippingTax(CART.contents),
                                calcOther   : CART.otherTax(CART.contents)
                            }
                            response.render('cart',siteInject.cart);
                        }
                    }else {
                        response.render('error-404',siteInject.error);
                    }
                });
            });
        } else {
            siteInject.cart.products = [];
            response.render('cart',siteInject.cart);
        }
    }else{
        siteInject.cart.products = [];
        response.render('cart',siteInject.cart);
    }
});

app.get('/checkout',function(request, response){
    siteInject.checkout.auth = {
        loginStatus : 1,
        userName    : 'System User',
        userEmail   : 'system_user@reoft.com'
    }
    response.render('checkout',siteInject.checkout);
});

app.get('/careers',function(request, response){
    response.render('careers',siteInject.careers);
});

/*---------------------------------------- Dynamic Pages ----------------------------------------*/

/*---------------------------------------- API Routing ----------------------------------------*/

app.post('/api/v1/push/[a-z0-9]{0,20}/[a-f0-9]{96}',function(request,response){
    let PUSH = {};
    PUSH.name = request.path.split('/')[4];
    PUSH.token = request.path.split('/')[5];
    if ( PUSH.name === 'subscription' && PUSH.token === apiToken.subscription ) {
        let dex = cryptojs.AES.decrypt(request.body.data,encryptionKey).toString(cryptojs.enc.Utf8);
        if (dex) { 
            dex = JSON.parse(dex);
            jwt.verify(dex.token,reoftTokenKey, function(err, auth){
                if (err) {
                    response.json({
                        status  : 'error',
                        message : 'Invalid authentication token'
                    });
                } else {
                    if (validateToken(auth.tokenData)) {
                        connection.getConnection(function(err, connection){
                            connection.query(sql.checkSubscriber+'"'+dex.email+'"', function(err, rows, feilds){
                            if (!err) {
                                if (!rows.length) {
                                        connection.query(sql.addNewSubscriber+'"'+dex.email+'", "'+Date()+'" )', function(err, result){
                                            connection.release();
                                            if (!err) {
                                                response.json({
                                                    status  : 'success',
                                                    message : 'You have been subscribed to our mailing list successfully'
                                                });
                                            }else{
                                                response.json({
                                                    status  : 'error',
                                                    message : 'Oops!! Something went wrong while processing your request'
                                                });
                                            }
                                        });
                                }else{
                                        response.json({
                                            status  : 'error',
                                            message : 'User with email "'+dex.email+'" is already registered'
                                        });
                                }
                            }else{
                                    response.json({
                                        status  : 'error',
                                        message : 'Oops!! Something went wrong while processing your request'
                                    });
                            } 
                            });
                        });
                    }else {
                        response.json({
                            status  : 'error',
                            message : 'Invalid authentication token'
                        });
                    }
                }
            });
        } else {
            response.json({
                status  : 'error',
                message : 'Invalid encryption key'
            });
        }
    } else if ( PUSH.name === 'contact' && PUSH.token === apiToken.contact ) {
        let cxtData = cryptojs.AES.decrypt(request.body.data,encryptionKey).toString(cryptojs.enc.Utf8);
        if ( cxtData ) { cxtData = JSON.parse(cxtData);
            jwt.verify(cxtData.token,reoftTokenKey, function(err, auth){
                if (!err){
                    let insertValues = '"'+cxtData.name+'","'+cxtData.email+'","'+cxtData.phone+'","'+cxtData.company+'","'+cxtData.subject+'","'+cxtData.message+'","'+Date()+'" )';
                    connection.getConnection(function(err, connection){
                        connection.query(sql.submitContactForm+insertValues, function(err, result){
                            connection.release();
                            if(!err) {
                                response.json({
                                    status  : 'success',
                                    message : 'Thanks for your interest in us. We will get back to you ASAP'
                                });
                            } else {
                                response.json({
                                    status  : 'error',
                                    message : 'Oops!! Something went wrong while processing your request'
                                });
                            }
                        });
                    });
                }else{
                    response.json({
                        status  : 'error',
                        message : 'Invalid authentication token'
                    });
                }
            });
        } else {
            response.json({
                status  : 'error',
                message : 'Invalid encryption key'
            });
        }
    }
});

app.post('/api/v1/pull/[a-z0-9]{0,10}/[a-f0-9]{96}',function(request,response){
    const PULL = {};
    PULL.name = request.path.split('/')[4];
    PULL.token = request.path.split('/')[5];
    if ( PULL.name === 'blog' && PULL.token === apiToken.blog ) {
        connection.getConnection(function(err, connection){
            connection.query(sql.getBlogPosts, function(err, rows, feilds){
                connection.release();
                if (!err) {
                    response.json(rows);
                }else{
                    response.json({status:'error'});
                }
            });
        });
    }else if ( PULL.name === 'product' && PULL.token === apiToken.product ) {
        connection.getConnection(function(err, connection){
            connection.query(sql.getAllProductsCode, function(err, rows, feilds){
                connection.release();
                if (!err) {
                    response.json(rows);
                }else{
                    response.json({status:'error'});
                }
            });
        });
    }else if ( PULL.name === 'taxes' && PULL.token === apiToken.taxes ) {
        if (request.body['CART_contents']) {
            let _CARTcontents = JSON.parse(request.body['CART_contents']);
            if ( _CARTcontents.length > 0 ) { let _productCode = [];
                for ( let x = 0; x < _CARTcontents.length; x++ ) {
                    _productCode.push( '"'+_CARTcontents[x].product_code+'"' );
                } if ( _productCode.length > 0 ) {
                    connection.getConnection(function(err, connection){
                        connection.query(sql.getCartProducts+'( '+_productCode.join(', ')+' )', function(err, rows, feilds){
                            connection.release();
                            if (!err) {
                                CART.contents = [];
                                for ( let i = 0; i < _CARTcontents.length; i++ ){
                                    let _prod = CART.findIn( _CARTcontents[i].product_code, rows );
                                    _prod.qty = _CARTcontents[i].qty;
                                    CART.contents.push( _prod );
                                }
                                response.json({
                                    status : 'success',
                                    data   : {
                                        calcProduct  : CART.productTotal(CART.contents),
                                        calcTax      : CART.productTax(CART.contents),
                                        calcShip     : CART.shippingTax(CART.contents),
                                        calcOther    : CART.otherTax(CART.contents),
                                        cartContents : CART.contents
                                    }
                                });
                            }else{
                                response.json({status:'error', details : err});
                            }
                        });
                    });
                }
            }
        }
    }else {
        response.json({status:'error', details : err});
    }
});

app.post('/api/v1/auth/[a-z]{0,10}/[a-f0-9]{96}', function(request, response){
    AUTH.type = request.path.split('/')[4];
    AUTH.token = request.path.split('/')[5];
    if ( AUTH.type === 'login' && AUTH.token === apiToken.auth ) {
        AUTH.data = cryptojs.AES.decrypt(request.body.data,encryptionKey).toString(cryptojs.enc.Utf8);
        if ( AUTH.data ) {
            AUTH.data = JSON.parse(AUTH.data);
            if ( AUTH.data.email !== '' ) {
                if ( AUTH.data.password !== '' ) {
                    connection.getConnection(function(err, connection){
                        if ( !err ) {
                            connection.query(sql.checkUserEmail+'"'+AUTH.data.email+'"', function(err, rows, feilds) {
                                if (!err) {
                                    if ( rows.length ) {
                                        if ( rows[0].user_account_status == 1 ) {
                                            AUTH.data.password = cryptojs.SHA3(AUTH.data.password.split('').join(AUTH.SALT)).toString();
                                            if ( AUTH.data.password === rows[0].user_password ) {
                                                AUTH.data.loginTime = Date();
                                                jwt.sign(AUTH.data,reoftLoginTokenKey,{ expiresIn: '24h' }, function(err, token){
                                                    if (!err){
                                                        request.session.user = {
                                                            loginStatus : 1,
                                                            userDetails : {
                                                                email: rows[0].user_email,
                                                                firstname : rows[0].user_firstname,
                                                                lastname : rows[0].user_lastname,
                                                                image : baseUrl+'/'+rows[0].user_image,
                                                                phone : rows[0].user_phone,
                                                                profile : rows[0].user_profile_slug,
                                                                username : rows[0].user_username
                                                            },
                                                            loginToken  : token
                                                        };
                                                        response.json({
                                                            status : 'success',
                                                            email : AUTH.data.email
                                                        });
                                                    }else {
                                                        response.json({
                                                            status : 'error',
                                                            message : 'Token signing error. Please try again later'
                                                        });
                                                    }
                                                });
                                            }else {
                                                response.json({
                                                    status : 'error',
                                                    message : 'Invalid password for <b>"'+AUTH.data.email+'"</b>'
                                                });
                                            }
                                        }else {
                                            response.json({
                                                status : 'error',
                                                message : 'This account is temporarily disabled. Please contact the administrator.'
                                            });
                                        }
                                    }else {
                                        response.json({
                                            status : 'error',
                                            message : 'No user with email <b>"'+AUTH.data.email+'"</b> exist'
                                        });
                                    }
                                }else {
                                    response.json({
                                        status : 'error',
                                        message : 'There was a connection error. Please try after some time.'
                                    });
                                }
                            });
                        }else {
                            response.json({
                                status : 'error',
                                message : 'There was a connection error. Please try after some time.'
                            });
                        }
                    });
                }else {
                    response.json({
                        status : 'error',
                        message : 'Password is required'
                    });
                }
            }else {
                response.json({
                    status : 'error',
                    message : 'Email is required'
                });
            }
        }
    }else {
        response.json({
            status : 'error',
            message : [ AUTH, apiToken.auth ]
        });
    }
});

/*---------------------------------------- API Routing ----------------------------------------*/

// Error page routing
app.use(function (request, response) {
    response.render('error-404',siteInject.error);
});

app.listen(serverPort,function(){
    console.log('server is live at port '+serverPort);
    // let tempPass = 'admin@reoft';
    // console.log(cryptojs.SHA3(tempPass.split('').join(AUTH.SALT)).toString());
});