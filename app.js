const express      = require('express');
const path         = require('path');
const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const slug         = require('slug');
const chalk        = require('chalk');
const date         = require('date-and-time');
const app = express();

const connection   = require('./modules/database');
const session      = require('./modules/sessions');
const {brand, title}      = require('./modules/titles');
const sql          = require('./modules/sql-queries');

const PORT = process.env.PORT || 3200;

app.use(express.static('resources'));
app.use(express.static('files'));
app.use('/static', express.static('resources'));
app.use('/static', express.static(path.join(__dirname, 'resources')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session.isLoggedIn);

const aboutRoute = require('./routes/about');
const blogRouter = require('./routes/blog');
const careersRouter = require('./routes/careers');
const contactRouter = require('./routes/contact');
const openProjectsRouter = require('./routes/open-projects');
const servicesRouter = require('./routes/services');
const shopRouter = require('./routes/shop');
const profileRouter = require('./routes/profile');
const cartRouter = require('./routes/cart');
const checkoutRouter = require('./routes/checkout');
const commentRouter = require('./routes/comment');
const jobRouter = require('./routes/job');
const serviceRouter = require('./routes/service');
const postRouter = require('./routes/post');
const productRouter = require('./routes/product');
const projectRouter = require('./routes/project');
const dashboardRouter = require('./routes/dashboard');
const adminRouter = require('./routes/admin');
const apiRouter = require('./routes/api');
const logoutRouter = require('./routes/logout');
const supportRouter = require('./routes/support');

app.get('/', (req, res) => {
  connection.query(sql.select.all.openProjects, (err, result) => {
    if(!err) {
      connection.query(sql.select.all.projetcCategories, (err1, result1) => {
        if(!err1){
          res.render('home',{
            title: title.home,
            projects: result,
            categories: result1,
            user: res.locals.user
          });
        }else {
          res.render('home',{
            title: title.home,
            projects: [],
            categories: [],
            user: res.locals.user
          });
        }
      });
    }else {
      res.render('home',{
        title: title.home,
        projects: [],
        categories: [],
        user: res.locals.user
      });
    }
  });
});

app.use('/about', aboutRoute);
app.use('/careers', careersRouter);
app.use('/services', servicesRouter);
app.use('/blog', blogRouter);
app.use('/open-projects', openProjectsRouter);
app.use('/shop', shopRouter);
app.use('/contact',contactRouter);
app.use('/cart', cartRouter);
app.use('/checkout', checkoutRouter);


app.use('/job', jobRouter);
// app.use('/service', serviceRouter);
app.use('/post', postRouter);
app.use('/project', projectRouter);
app.use('/product', productRouter);
app.use('/dashboard', dashboardRouter);
app.use('/user', profileRouter);
// app.use('/comment', commentRouter);

// app.use('/admin', adminRouter);
app.use('/api', apiRouter);
app.use('/logout', logoutRouter);
app.use('/support', supportRouter);

app.listen(PORT,function(){
    console.log.bind(console,'--->')(chalk.green(`Server started at port: ${PORT}; time: ${date.format(new Date(), 'hh:mm:ss A')}`));
});