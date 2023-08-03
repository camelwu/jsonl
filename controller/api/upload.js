const fs = require('fs');
const path = require('path');

const ud = path.join(__dirname, './upload')
function upload(req, res, next) {
    let patt = /^data:image\/\w+;base64,/;
    //接收前台POST过来的base64
    var imgData = req.body.image;
    let ary = imgData.match(patt);
    let type = ary[0].replace('data:image/','').replace(';base64,', '');
    //过滤data:URL
    var base64Data = imgData.replace(patt, "");
    var dataBuffer = Buffer.from(base64Data, 'base64');
    let timeData = new Date();
    let time = timeData.getSeconds();
    fs.writeFile(`${ud}/${time}.${type}`, dataBuffer, (err) => {
        if (err) {
            res.send(err);
        } else {
            res.send("保存成功！");
        }
    });
}

module.exports = upload
