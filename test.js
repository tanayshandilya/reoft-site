const cryprojs = require('crypto-js');
const JSEncrypt = require('node-jsencrypt');
const MASTER = 'BCAADF61FB121EE5A5D7E1C2924B3';

const tokenData = {
    user: {
        user_id: 135748445621,
        user_name: 'admin',
        user_email: 'admin@reoft.com'
    },
    issuer: 'REOFT Technologies PVT.LTD',
    issuedTo: 'Chrome',
    iat: new Date().getTime(),
    exp: new Date().getTime() + ( 30 * 60000 )
}

const randomString = (length, chars) => {
    chars = chars.split('');
    if (! length) {
        length = Math.floor(Math.random() * chars.length);
    } let str = '';
    for (let i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    } return str;
}

const generateToken = ( payload, issuer, issuedTo, exp ) => {
    let tokenData = {
        payload,
        issuer,
        issuedTo,
        iat: new Date().getTime(),
        exp: new Date().getTime() + ( exp * 60000 )
    }
    let key = cryprojs.SHA256('::ffff:127.0.0.1').toString();
    // Get Token Data Hmac
    let tokenHmac = cryprojs.HmacSHA224(JSON.stringify(tokenData),issuer).toString();
    // encrypt token hmac with token data
    return cryprojs.AES.encrypt(JSON.stringify({
        data: tokenData,
        hmac: tokenHmac,
        iat: tokenData.iat,
        exp: tokenData.exp
    }),key).toString()+'|'+cryprojs.RC4.encrypt(key,MASTER).toString();
}

const validateToken = ( token ) => {
    let AESKey, decrypted;
    token = token.split('|');
    AESKey = cryprojs.RC4.decrypt(token[1],MASTER).toString(cryprojs.enc.Utf8);
    decrypted = JSON.parse(cryprojs.AES.decrypt(token[0],AESKey).toString(cryprojs.enc.Utf8));
    if (decrypted.iat && decrypted.exp && decrypted.hmac) {
        if (decrypted.exp > new Date().getTime()) {
            if (decrypted.hmac === cryprojs.HmacSHA224(JSON.stringify(decrypted.data),decrypted.data.issuer).toString()) {
                return decrypted.data;
            }else{
                return 'Invalid Token Signature';
            }
        }else{
            return 'Token Expired';
        }
    }else {
        return false;
    }
}

token = generateToken({
    user_id: 135748445621,
    user_name: 'admin',
    user_email: 'admin@reoft.com'
},'REOFT Technologies Pvt.Ltd', 'Chrome', 30);

const  duplicateToken = 'U2FsdGVkX19b18vuWhfRub2GMqWJqDG8bvN5W1qIYLXmNe1uDEuw5jYpP0qLEPy+2h2CHC0gOONk22FlJrFrKCSiM3QttePTsuudQq6dhVZAZvIw9W1cMYp+8Rdq96LiJSHF+7CFsI1N0hQ/OlIoiAZ88oq5IL8ezkZH98O9rg1jREWHdHF/K1Lf6Q8JLOvZUIYAeZTLdC4CBRbxGncdPNqJZ0nY7tzFf7ApFmLY5ZlDsVHs5PcLr8igsww6KBhWlGqznRZhuC4Yg866Iy8FolBwEcR4mjAo5tiSzxG19SeWvx5MFcRkPsPXGYKYXRW4tXSlu0m2XDKGwTt/BJ0fZ5+mHfPdd8fVZlq84BJ7xEwKVfgd9Sjv7Hs4Zb4oCo0if9WezoihmBUzquY5eL7o0E+OH8iIhwerwvank+b/7oQ=|U2FsdGVkX1+66rD6U0Yx1+bg3OFZ1aws5KVttPZUpRvD2lf5RSsdXHcH4zGR8hJXAy1jNvzHsC4AuNtSY2egE+NSZHNEMkZ/LUUhnQ==';

console.log(token,validateToken(duplicateToken));

// let x = cryprojs.AES.decrypt('U2FsdGVkX1+tUa3UOZ2otQRqCKVnHIvo5lFkXXgmbHKdbVBSTvVMgz3XHY6ZTWyUb3RhFvTK0no3WtpZHhdWn6yqe/E9Y8bLVOAVH5bULlXcKuYS1Uaw4aIymMBGvb5T1gT4kUQf1JnTGlmISeyHF8Fnw5T6zXF3XYdPN3dt9DT9E6HkVcFCUW97+WXfeIkO57B4dlPFhz56So83EsWoo4EXzpPJNrO1Oa21wOyEG9rv97JgL2OMVenpMJ+sekV5GksMVZATV7jG4eBOsK6OAf9FdWJ4t+wxIBKjpXNojKIiuTxYB9P87x0XcOGreB8n25lV+rsxTkiJkqlkYw/Cuug3l89HC6H4WDeQcyam+BQGMo7+rb1AGgAest2o5LHG836dWwxhfzulg4PiQ7K1eU+WVglOoh6VYuLEmOSKhxg=','106be3e31a4b1551c342e34de4696999dfcc8012d5e4ea6ac9ee161db768').toString(cryprojs.enc.Utf8);
// console.log(x);