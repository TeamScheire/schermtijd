const auth = require('basic-auth');
require('dotenv').config();

module.exports = function (request, response, next) {
    var user = auth(request);
    if (!user || process.env.adminPass !== user.pass) {
        response.set('WWW-Authenticate', 'Basic realm="Log in"');
        return response.status(401).send();
    }
    return next();
};