const
    ocr = require('./ocr'),
    upload = require('./upload')

module.exports = {
    ocr,
    scan: upload,
}