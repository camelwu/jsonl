const cache = require('./cache')
const redis = require('./redis')

module.exports = function (app) {
    cache(app)
    redis(app)
}