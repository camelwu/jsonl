const
    error = require('./404.js'),
    single_guide = require('./single_guide')
// multi_guides = require('./multi_guides');

module.exports = function (app) {
    error(app)
    // multi_guides(app)
    single_guide(app)
}