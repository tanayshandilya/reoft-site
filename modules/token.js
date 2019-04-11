const jwt = require('jsonwebtoken');
const tokenKey = `MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAN8Fy8gAAgBvsnnG+a/f7K29kTNK4g0yb3Ygaz/A5V2FofoIaKB5Lw70Lt2uU7RtQu2HJ5E/fUizRAkJItn+IlMCAwEAAQ==`;
const i  = 'REOFT Technologies Pvt.Ltd';  // Issuer 
const s  = 'info@reoft.com';              // Subject 
const a  = 'https://reoft.com';           // Audience
var signOptions = {
    issuer:     i,
    subject:    s,
    audience:   a,
    expiresIn:  "2h"
}
module.exports = {
    /**
     * 
     * @param {Object} payload
     * @param {String} payload.uuid
     * @param {String} payload.username
     * @param {String} payload.email
     */
    generate( payload ) {
        return jwt.sign(payload, tokenKey, signOptions);
    },

    /**
     * 
     * @param {String} token 
     * @param {Function} callback
     */
    verify( token, callback ) {
        jwt.verify(token, tokenKey, signOptions, (err, deco) => {
            callback(err, deco);
        });
    }
}