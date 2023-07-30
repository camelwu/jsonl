const
    web = require('../../controller/web/index'),
    api = require('../../controller/api/index');

module.exports = function (app) {
    // home
    app.get('/', web.home.page)
    // app.get('/:category_slug', web.home.page)
    // app.post('/upload', api.upload)
    app.post('/scan', api.scan)
};