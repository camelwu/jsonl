const
    fs = require('fs'),
    config = require('../configs');

function render(res, path, tit, db, url = '', data = {
    title: '',
    description: ''
}) {
    let exists = fs.existsSync('./views/' + path + '.html')
    if (exists) {
        res.render(path, {
            title: tit,
            db: db,
            current_page: {
                data: data,
                url: url
            },
            config: config
        })
    } else {
        res.redirect('/404')
    }
}

module.exports = render;