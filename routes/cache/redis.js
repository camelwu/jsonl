const {
    redis
} = require('../../controllers/cache');

module.exports = function (app) {
    app.get('/redis/clear', redis.clear)
    app.get('/redis/warm', redis.warm)
}