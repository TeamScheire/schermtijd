const auth = require('basic-auth');
let path = require("path");
require('dotenv').config({
    path: path.join(__dirname, ".env")
});

module.exports = function (request, response, next) {
    var user = auth(request);
    if (!user || process.env.adminPass !== user.pass) {
        console.log('correct password: ' + process.env.adminPass);
        if (user) console.log('user password: ' + user.pass);
        response.set('WWW-Authenticate', 'Basic realm="Log in"');
        return response.status(401).send();
    }
    return next();
};