const
    web = require('../../controllers/web');

module.exports = function (app) {
    // tags
    app.get('/:guide(landlords|mortgage)/tags', web.tags.page)
    app.get('/:guide(landlords|mortgage)/tags/:tag_slug', web.tags.page)
    // search
    app.get('/:guide(landlords|mortgage)/search/:key', web.search.page)
    // home
    app.get('/', web.home.page)
    // home
    app.get('/:guide(landlords|mortgage)', web.guide.page)
    app.get('/:guide(landlords|mortgage)/:category_slug', web.guide.page)
    // topic_detail
    // <landlords|mortgage>/<main_category>/<topic>
    app.get('/:guide(landlords|mortgage)/:category_slug/:topic_slug', web.topic.multiGuidePage)
    // old router way <main_category>/<sub_category>/<topic>
    app.get('/:category_slug/:sub_category/:topic_slug/', web.topic.page)
};