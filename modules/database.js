const mysql = require('mysql');
const date = require('date-and-time');
const chalk = require('chalk');
// const con = mysql.createConnection({
//     host     : 'tirbhinnat.com',
//     user     : 'tirbhinn_nodejs',
//     password : 'h(mDr]z?C7+Z',
//     database : 'tirbhinn_reoft_site'
// });

const con = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'reoft_site'
});

con.connect(function(err) {
    if (err) throw err;
    console.log.bind(console,'--->')(chalk.green(`MySQL Database connected: ${date.format(new Date(), 'hh:mm:ss A')}`));
});
  
module.exports = con;