
const AK = "Odc9QlyB0i1kzC3nxT4fCoaS"
const SK = "W8oMGBkoMPp1eAAbGkqfbHRrEiX9GAne"
const path = require("path");
const { walkSync, isAssetTypeAnImage, outputJson, base64_encode } = require("../../utils");
const request = require('request');

let accessToken = '';
/**
 * 返回请求promise，放入数组，并调用带并发限制的函数执行
 */
// getAccessToken().then(function (token) {
//     accessToken = token;
//     let req = [];
//     let dirpath = path.resolve("./", "upload");

//     walkSync(dirpath, function (filePath, stat) {
//         if (filePath) {
//             let basename = path.basename(filePath), index = basename.lastIndexOf('.') + 1;
//             if (stat.isFile() && isAssetTypeAnImage(basename.substring(index))) {
//                 req.push(() => main(filePath));
//             }
//         } else {
//             console.log('walkSync error');
//         }
//     });
//     // req.push(() => main('./upload/兆科-粉色-血液-ZYK.jpg'));
//     // console.table(req)
//     reqAll(req).then(() => {
//         console.log('All done!');
//     })
// });

async function reqAll(tasks, limit = 2) {
    const taskPool = new Set();
    for (const task of tasks) {
        const promise = task();
        taskPool.add(promise);
        promise.then(({ data, file }) => {
            outputJson(data, file);
            taskPool.delete(promise);
        }).catch(e => console.log(e));
        if (taskPool.size >= limit) await Promise.race(taskPool);
    }
    return Promise.allSettled(taskPool);
}
/**
 * 
 * @param {*} filepath 图片文件地址
 * @returns 返回请求promise
 */
async function main(filepath) {
    if (accessToken === '') accessToken = await getAccessToken();
    // console.log('main filepath', filepath);
    let base64str = base64_encode(filepath); // base64编码
    let options = {
        'method': 'POST',
        'url': 'https://aip.baidubce.com/rest/2.0/ocr/v1/accurate?access_token=' + accessToken,
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        form: {
            image: base64str
        }
    };
    return new Promise((resolve, reject) => {
        request(options, function (error, response) {
            let file = path.basename(filepath);
            console.log('time', new Date());
            if (error) {
                reject(error)
                // throw new Error(error);
            }
            // console.log(response.body);
            resolve({ data: JSON.parse(response.body), file: file });
        });
    })
}
/**
 * 使用 AK，SK 生成鉴权签名（Access Token）
 * @return string 鉴权签名信息（Access Token）
 */
function getAccessToken() {
    console.log('getAccessToken');
    let options = {
        'method': 'POST',
        'url': 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=' + AK + '&client_secret=' + SK,
    }
    return new Promise((resolve, reject) => {
        request(options, (error, response) => {
            if (error) { reject(error) }
            else { resolve(JSON.parse(response.body).access_token) }
        })
    })
}

module.exports = {
    getAccessToken,
    main,
    reqAll
}