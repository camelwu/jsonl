
const fs = require('fs');
const path = require("path");
const { parseJson, walkSync } = require("../utils");

// let dirpath = path.resolve("./", "json");
// walkSync(dirpath, function (filePath, stat) {
//     if (filePath) {
//         let basename = path.basename(filePath), index = basename.lastIndexOf('.') + 1;
//         if (stat.isFile() && basename.substring(index) === 'json') {
//             const jsonStr = fs.readFileSync(filePath, 'utf8');
//             parseJson(JSON.parse(jsonStr), filePath);
//         }
//     } else {
//         console.log('walkSync json file error');
//     }
// });

let filePath = './json/爱博诺德-大咖塑语-眼科-儿童-卡通-蓝色-多人-YF.png.json', jsonStr = fs.readFileSync(filePath, 'utf8');
parseJson(JSON.parse(jsonStr), filePath);