
const fs = require('fs');
const path = require("path");
const { parseJson, walkSync } = require("./util");

let dirpath = path.resolve("./", "json");
walkSync(dirpath, function (filePath, stat) {
    if (filePath) {
        let basename = path.basename(filePath), index = basename.lastIndexOf('.') + 1;
        if (stat.isFile() && basename.substring(index) === 'json') {
            const jsonStr = fs.readFileSync(filePath, 'utf8');
            parseJson(JSON.parse(jsonStr), filePath);
        }
    } else {
        console.log('walkSync json file error');
    }
});