const {
    cache
} = require('../../controllers/cache');

module.exports = function (app) {
    app.get('/api/v1/resource_guides/search/:key', cache.searchTopics)
    app.get('/api/v1/resource_guides/landlords', cache.landlord)
    app.get('/api/v1/resource_guides/landlords/:type', cache.landlordData)
    app.get('/api/v1/resource_guides/:type/:id/topics', cache.categoriesByType)
    app.get('/api/v1/resource_guides/topics/:slug', cache.topics)
}