const jsonl = require("node-jsonl");
const fs = require('fs');
const path = require("path");
const { text } = require("stream/consumers");
const { promises: { readFile, writeFile, mkdir } } = fs;
const filepath = path.resolve("./", "json/[转文字]_合并多行.jsonl");
const rl = jsonl.readlines(filepath);
const splitPre = ['大会主席', '会议讲者', '大会讲者', '大会主持', '班主任', '特邀讲者'], splitPro = ['会议日程', '会议议程', '大会日程', '大会议程', '课程表'];
const position = require('./json/position');
let imgInfo = {};

async function outputCsv(list) {
    // 生成表头，\ufeff 是防止乱码，csv中以 `,` 换列，`\n`换行

    let title = Object.keys(list[1])
    let csvContent = '\ufeff' + title.join(',') + '\n'

    // 添加表体
    list.forEach((item, index) => {
        let c = Object.values(item).join(',') + '\n'
        csvContent += c
    })
    const dir = './download';
    // 生成文件夹存储生成的文件
    if (fs.existsSync(dir)) {
        console.log('exist');
    }else{
        await mkdir('download')
    }
    // 生成csv文件
    await writeFile('./download/data.csv', csvContent)

    // 生成JOSN
    await writeFile('./download/data.json', JSON.stringify(list))
    console.log('File generated successfully，open download to check')
}

async function readLines() {
    let array = [];
    console.log('read lines');// read line by line, until end
    while (true) {
        const { value, done } = await rl.next()
        if (done) break;
        // console.log(value.textBlockList); // value => T
        let textList = value.textBlockList
        imgInfo = value.imgInfo
        // console.table(imgInfo.name, imgInfo.size);
        for (let i = 0; i < textList.length; i++) {
            let item = textList[i], str = item.text;
            if (i === 0) {
                console.log('line1: ', str);
            } else {
                let ary = splitPro.filter(function (item) {
                    return str.indexOf(item) > -1;
                })
                // console.log('到底了，不要会议日程', ary.length);
                if (ary.length > 0) break;
                let cache = splitStr(str);
                if (!!cache) array.push(cache);
            }
        }
    }
    // return array;
    // console.table(array);
    await outputCsv(array);
}

// readLines();

function splitStr(str) {console.log('before replace', str)
    str = replaceUnused(str);console.log('after replace', str)
    let ary = position.filter(function (item) {
        // console.log(str.indexOf(item));
        return str.indexOf(item) > -1;
    })
    // console.log('find split position', str);
    // console.log('find split ', ary);
    if (ary.length < 1) return false;
    let item = ary[0];
    let cache = str.split(item);
    console.log(typeof (imgInfo.size));
    let size = imgInfo.size.join('x');
    // console.table({ "name": cache[0].trim(), "position": ary[0], "hosipital": cache[1].trim() });
    // csvlist.push({"imgInfo.name": imgInfo.name, "imgInfo.size": imgInfo.size, "name": cache[0].trim(), "position": ary[0], "hosipital": cache[1].trim() });
    return { "imgInfo.name": imgInfo.name, "imgInfo.size": size, "name": cache[0].trim(), "position": ary[0], "hosipital": cache[1].trim() };
}
function replaceUnused(str){
    for(let i=0;i<splitPre.length;i++){
        str = str.replace(splitPre[i],'')
    }
    return str
}
const str = "清河医师论坛";
const segmenterJa = new Intl.Segmenter('zh-cn', { granularity: 'word' });

const segments = segmenterJa.segment(str);
console.table(Array.from(segments));

const segmenter = new Intl.Segmenter(
    'cn', { granularity: 'word' }
);

console.log(
    Array.from(
        segmenter.segment(`浙江省肿瘤医院宋正波教授时间`),
        s => s.segment
    )
);