const
    web = require('./web'),
    cache = require('./cache');

module.exports = function (app) {
    web(app)
    cache(app)
}