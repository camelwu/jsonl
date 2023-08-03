const { render } = require('../../utils');

function page(req, res) {
    render(res, 'home', 'home-page', {}, url = '')
}

module.exports = {
    page
}