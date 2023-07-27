
const fs = require('fs');
const path = require('path')
const { promises: { readFile, writeFile, mkdir } } = fs;
const { position, splitPre, splitPro } = require('./config/position');
const { table } = require('console');
// 中文字符分割
const segmenter = new Intl.Segmenter(
    'cn', { granularity: 'word' }
);
// 行，列的阈值
const w = 30, h = 30;
/**
 * 结果格式化
 * @param()
 * @returns 
 * @returns
 * {
 *     "log_id": uint64	唯一的log id，用于问题定位
 *     "words_result_num": 2
 *     "words_result": [
 *         {
 *             "words": " OCR",
 *             "location": {
 *                 "top": 19,
 *                 "left": 54,
 *                 "width": 119,
 *                 "height": 46
 *             }
 *         },
 *     ],
 * }
 */
function parseJson(obj, filePath) {
    console.log('匹配result：', obj);
    let textList = obj.words_result, len = obj.words_result_num;
    let keys = new Map(), way = ''; // table 4 theme
    for (let i = 0; i < len; i++) {
        // read line by line
        let item = textList[i], { words, location } = item, { top, height } = location;
        words = replaceUnused(words);
        if (splitPre.indexOf(words) > -1) {// 四个字标题，下个循环
            continue;
        }
        // 日程
        if (splitPro.indexOf(words) > -1) {
            // 策略不同
            way = 'table';
            continue;
        }
        if (top + height < 200) {
            console.log('Top line is useless and discarded');
            continue;
        } else {
            // console.log('This line maybe is the meeting theme');
            if (way === 'table') {
                console.log('table');
            }
            let ary = split2Word(words);
            if (ary.length <= 5) {
                /**
                 * 匹配策略：姓名 职称(*) =>> 找医院 医院(*)，少数： 医院 =>> 姓名 职称(*)
                 */
                let middleW = location.left + location.width / 2, spaceH = location.top + location.height;
                let findFunc = (element) => (element.location.top > spaceH && element.location.top < spaceH + 50 && Math.abs(middleW - (element.location.left + element.location.width / 2)) < 10);
                let found = textList.find(findFunc)
                // 符合 姓名，职务，医院
                if (position.indexOf(ary[ary.length - 1]) > -1) {
                    let name = ary.slice(0, -1).join('').trim();
                    if (keys.has(name) && keys.get(name).title === '') {// 没有title，需覆盖
                        keys.set(name, { "name": name, "title": ary[ary.length - 1], "hospital": keys.get(name).hospital });
                    }
                    if (!keys.has(name)) {//第一次记录
                        keys.set(name, { "name": name, "title": ary[ary.length - 1], "hospital": found ? found.words : '' });
                    }
                } else if (position.indexOf(ary[ary.length - 2] + ary[ary.length - 1]) > -1) {//三字职称，需要组合
                    let name = ary.slice(0, -2).join('').trim();
                    if (!keys.has(name)) {
                        keys.set(name, { "name": name, "title": ary[ary.length - 2] + ary[ary.length - 1], "hospital": found ? found.words : '' });
                    } else {
                        // keys.get(trim(ary.slice(0, -1).join('')))
                    }
                } else {
                    if (found) {
                        keys.forEach((value, key, map) => {
                            value['hospital'] === words ? map.set(key, { "name": value['name'], "title": value['title'], "hospital": value['hospital'] + found.words }) : null;
                        });
                        // (!keys.has(words)) ? keys.set(words, { "name": words, "title": '', "hospital": found.words }) : null;
                    }
                    if (ary[ary.length - 1] === '医院' && location.height > 100) {
                        let element = textList[i + 1], arr = split2Word(element.words)
                        // 符合 医院， 姓名，职务
                        if (position.indexOf(arr[arr.length - 1]) > -1) {
                            if (!keys.get(element.words)) {
                                keys.set(element.words, { "name": arr.slice(0, -1).join(''), "title": arr[arr.length - 1], "hospital": words });
                            }
                        }
                    }
                }
            } else {
                // console.log(words)

            }
        }
    }
    // console.log('结束', keys);
    // return array;

    let array = [];
    for (var v of keys.values()) {
        array.push(v);
    }
    let file = path.basename(filePath)
    let index = file.indexOf('.'), fileName = file.substring(0, index)
    outputCsv(array, fileName);
}
/**
 * 文字处理匹配，要么碰到否则返回间距{}
 * @param {*} o1 {"location": {"top": 19, "left": 54, "width": 119, "height": 46}}
 * @param {*} o2 381
 * @description 同一行，同一段，
 */
function hitTest(o1, o2) {
    // 同一行，中心线像素差小于10，间距少于50？
    if (Math.abs((o2.top + o2.height / 2) - (o1.top + o1.height / 2)) <= 10 && o2.left - (o1.left + o1.width) < w) {
        console.log('同一行');
    }
    // 同一段，中心线像素差小于10，间距少于50？
    if (o1.top + o1.height + h >= o2.top && Math.abs(o1.left + o1.width / 2 - o2.left + o2.width / 2) < w) {
        console.log('同一段');
    }
    if (o2.top - o1.top - o1.height > h) {
        console.log('间距超过，跳出循环');
        return false
    }
    // if (o1.top + o1.height >= o2.top + o2.height) {
    //     console.log('同一行');
    // }
}

async function outputJson(list, fileName = '') {
    const dir = 'json';
    // 生成文件夹存储生成的文件
    if (!fs.existsSync(path.resolve('./', dir))) {
        await mkdir(dir)
    }
    // 生成JOSN
    await writeFile(`${dir}/${fileName}.json`, JSON.stringify(list));
    console.log(`原始"${fileName}"json存储完毕`);
}

async function outputCsv(list, fileName) {
    list = list.length == 0 ? [{ "name": '', "title": '', "hospital": '' }] : list;
    // 生成表头，\ufeff 是防止乱码，csv中以 `,` 换列，`\n`换行
    let title = Object.keys(list[0])
    let csvContent = '\ufeff' + title.join(',') + '\n'

    // 添加表体
    list.forEach((item, index) => {
        let c = Object.values(item).join(',') + '\n'
        csvContent += c
    })
    const dir = './download';
    // 生成文件夹存储生成的文件
    if (!fs.existsSync(dir)) {
        await mkdir('download')
    }
    // 生成csv文件
    await writeFile(`${dir}/${fileName}.csv`, csvContent)
    // 生成JOSN
    await writeFile(`${dir}/${fileName}.json`, JSON.stringify(list))
    console.log('File generated successfully，open download to check')
}

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath, { withFileTypes: true }).forEach(function (dirent) {
        var filePath = path.join(currentDirPath, dirent.name);
        if (dirent.isFile()) {
            callback(filePath, dirent);
        } else if (dirent.isDirectory()) {
            // walkSync(filePath, callback);
            console.log('is Directory');
        }
    });
}

function replaceUnused(str) {
    if (str.length < 5) return str;
    for (let i = 0; i < splitPre.length; i++) {
        str = str.replace(splitPre[i], '')
    }
    return str
}
/**
 * 中文的分隔，事物、地区会识别
 * @param {*} str 
 * @returns 
 */
function split2Word(str) {
    // 使用map+segmenter.segment 效率更快
    let words = Array.from(
        segmenter.segment(`${str}`),
        s => s.segment
    )
    return words;
}
/**
 * 根据后缀判断文件
 */
function isAssetTypeAnImage(ext) {
    return [
        'png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'psd', 'svg', 'tiff'].
        indexOf(ext.toLowerCase()) !== -1;
}
/**
 * 对图片的base64
 * @param {*} file 
 */
function base64_encode(file) {
    var bitmap = fs.readFileSync(file);
    return Buffer.from(bitmap, 'binary').toString('base64');
}

module.exports = { parseJson, walkSync, isAssetTypeAnImage, outputJson, base64_encode };
