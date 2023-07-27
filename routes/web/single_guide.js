const
    web = require('../../controllers/web');

module.exports = function (app) {
    // tags
    app.get('/tags/:s', web.tags.page)
    app.get('/tags', web.tags.page)

    // search
    app.get('/search/:key', web.search.page)
    app.get('/search/landlords/:key', web.search.page)

    // home
    app.get('/', web.home.page)
    app.get('/:category_slug', web.home.page)

    // topic
    app.get('/topic/:slug', web.topic.redirect) // redirect to topic page
    app.get('/:a/:b/:c/', web.topic.page)
};