
const fs = require('fs');
const path = require('path')
const { promises: { readFile, writeFile, mkdir } } = fs;
const { position, splitPre, splitPro } = require('../config/position');
const segmenter = new Intl.Segmenter(
    'cn', { granularity: 'word' }
);
// 行，列的阈值
const w = 20, h = 13;
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
    // console.log('匹配result：', obj);
    const textList = obj.words_result, len = obj.words_result_num;
    let keys = new Map(), way = ''; // table 4 theme
    for (let i = 0; i < len; i++) {
        let item = textList[i],
            { words, location } = item,
            { top, height } = location;

        if (top + height < 200) {
            console.log('Top line is useless and discarded');
            continue;
        } else {
            const ary = split2Word(words);
            if (words.length === 4 && splitPre.indexOf(words) > -1) {// 四个字标题，下个循环
                continue;
            }
            // 日程，议程，可以用ary 判断length=2 && 最后元素是不是日程｜议程
            if ((splitPro.indexOf(words) > -1 && words.length == 3) || (words.length == 4 && ary.length===2 && (ary[1]==='议程' ||ary[1]==='议程'))) {
                // console.log('find table===============', words);
                way = 'table';
                continue;
            }
            if (way === 'table') {
                // console.log('table');
            }

            words = replaceUnused(words);
            if (ary.length <= 5) {
                /**
                 * 匹配策略：姓名 职称(*) =>> 找医院 医院(*)，少数： 医院 =>> 姓名 职称(*)
                 */
                // let middleW = location.left + location.width / 2, spaceH = location.top + location.height;
                // let findFunc = (element) => (element.location.top > spaceH && element.location.top < spaceH + 30 && Math.abs(middleW - (element.location.left + element.location.width / 2)) < 10);
                let found = isSection(i, textList);
                console.log('===', words, 'find the same paragh', found);
                // 符合 姓名，职务，医院
                if (position.indexOf(ary[ary.length - 1]) > -1) {
                    let name = ary.slice(0, -1).join('').trim();
                    if (name.length > 1) {
                        if (keys.has(name) && keys.get(name).title === '') {// 没有title，需覆盖
                            keys.set(name, { "name": name, "title": ary[ary.length - 1], "hospital": keys.get(name).hospital });
                        }
                        if (!keys.has(name)) {//第一次记录
                            // console.log('====第一次记录', name);
                            let arr = found ? split2Word(found.words) : [];
                            if (position.indexOf(arr[arr.length - 1]) > -1) continue;
                            keys.set(name, { "name": name, "title": ary[ary.length - 1], "hospital": found ? found.words : '' });
                        }
                    }
                } else if (position.indexOf(ary[ary.length - 2] + ary[ary.length - 1]) > -1) {//三字职称，需要组合
                    let name = ary.slice(0, -2).join('').trim();
                    if (name.length > 1 && !keys.has(name)) {
                        keys.set(name, { "name": name, "title": ary[ary.length - 2] + ary[ary.length - 1], "hospital": found ? found.words : '' });
                    }
                } else {
                    console.log('=======单姓名');
                    if (found) {
                        let insert = true;
                        keys.forEach((value, key, map) => {
                            if (value['hospital'] === words) {
                                insert = false;
                                map.set(key, { "name": value['name'], "title": value['title'], "hospital": value['hospital'] + found.words })
                            }
                        });
                        let arr = found ? split2Word(found.words) : [];
                        if (position.indexOf(arr[arr.length - 1]) > -1 || !insert) continue;
                        (!keys.has(words)) ? keys.set(words, { "name": words, "title": '', "hospital": found.words }) : null;
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
    // console.log('结束',  new Date().getTime() - timestr);
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
 * 文字是同一段或同一行
 * @param {*} index
 * @param {*} ary 整体数组 [{words: "", location: {"top": 19, "left": 54, "width": 119, "height": 46}}]
 * @returns index in array
 */
function isSection(index, ary) {
    if (ary.length < 2 || index + 1 >= ary.length) return null;
    const x = 10, y = 10;
    const o = index < 1 ? null : ary[index - 1]['location'],
        o1 = ary[index]['location'],
        o2 = ary[index + 1]['location'];
    if (o2.top - (o1.top + o1.height) > 3 * x) return null;
    if (o && Math.abs(o1.top - o.top) < y) {
        if (Math.abs((o2.left + o2.width / 2) - (o.left + (o1.left - o.left + o1.width) / 2)) < x) {
            console.log('三个连到一起的');
            return ary[index + 1];
        }
    }
    const middleW = o1.left + o1.width / 2, spaceH = o1.top + o1.height;
    // 数组查找
    let found = ary.find((element, i) => (
        i > index && element.location.top > spaceH && element.location.top < spaceH + 3 * y && Math.abs(middleW - (element.location.left + element.location.width / 2)) < x
    ));
    if (found) return found;
    found = ary.find((element, i) => {
        return i > index && Math.abs(o1.top - o.top) < y && element.location.top > spaceH && element.location.top < spaceH + 3 * y && Math.abs((element.location.left + element.location.width / 2) - (o.left + (o1.left - o.left + o1.width) / 2)) < 1.3 * x
    });
    return found;
}
/**
 * 原始json存储
 * @param {*} list Array | String
 * @param {*} fileName 
 */
async function outputJson(list, fileName = '') {
    const dir = 'json';
    // 生成文件夹存储生成的文件
    if (!fs.existsSync(path.resolve('./', dir))) {
        await mkdir(dir)
    }
    const jsonStr = typeof (list) === 'string' ? list : JSON.stringify(list);
    await writeFile(`${dir}/${fileName}.json`, jsonStr);
    console.log(`原始"${fileName}"json存储完毕`);
}
/**
 * 根据入参list 结构化（姓名、职位、医院）结果 写到csv和json文件
 * @param {*} list Map
 * @param {*} fileName 
 */
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
/**
 * 同步读取目录下所有文件，可一级级遍历
 * @param {*} currentDirPath 
 * @param {*} callback 
 */
function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath, { withFileTypes: true }).forEach((dirent) => {
        var filePath = path.join(currentDirPath, dirent.name);
        if (dirent.isFile()) {
            callback(filePath, dirent);
        } else if (dirent.isDirectory()) {
            // walkSync(filePath, callback);
            console.log('is Directory');
        }
    });
}
/**
 * 文字长度小于5直接返回，相反才开始replace
 * @param {*} str 
 * @returns 
 */
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
 * @returns Array
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
 * 根据后缀判断文件是否图片
 * @param {*} ext 
 * @returns boolean
 */
function isAssetTypeAnImage(ext) {
    return [
        'png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'psd', 'svg', 'tiff'].
        indexOf(ext.toLowerCase()) !== -1;
}
/**
 * 对图片的base64
 * @param {*} file 
 * @returns base64
 */
function base64_encode(file) {
    var bitmap = fs.readFileSync(file);
    return Buffer.from(bitmap, 'binary').toString('base64');
}

module.exports = { parseJson, walkSync, isAssetTypeAnImage, outputJson, outputCsv, base64_encode };
