
const fs = require('fs');
const path = require("path");
const { parseJson, walkSync, isAssetTypeAnImage, outputJson, base64_encode } = require("../util.js");
const request = require('request');
// const schedule = require('node-schedule');
/*
let rule = new schedule.RecurrenceRule();
let seconds = [], s = 0;
while (s < 60) {
    seconds.push(s);
    s++
}
rule.second = seconds;
let Job = schedule.scheduleJob(rule, () => { request()})
Job.cancel();
*/
const AK = "Odc9QlyB0i1kzC3nxT4fCoaS"
const SK = "W8oMGBkoMPp1eAAbGkqfbHRrEiX9GAne"
let accessToken = '';
/**
 * 返回请求promise，放入数组，并调用带并发限制的函数执行
 */
getAccessToken().then(function (token) {
    accessToken = token;
    let req = [];
    let dirpath = path.resolve("./", "upload");

    walkSync(dirpath, function (filePath, stat) {
        // if(o<1) return;
        if (filePath) {
            // o--;
            let basename = path.basename(filePath), index = basename.lastIndexOf('.') + 1;
            if (stat.isFile() && isAssetTypeAnImage(basename.substring(index))) {
                req.push(() => main(filePath));
            }
        } else {
            console.log('walkSync error');
        }
    });
    
    // req.push(() => main('./upload/兆科-粉色-血液-ZYK.jpg'));
    console.table(req)
    reqAll(req).then(() => {
        console.log('All done!');
    })
});

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
    console.log('main filepath', filepath);
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
    // request(options, function (error, response) {
    //     if (error) throw new Error(error);
    //     console.log(response.body);
    //     return JSON.parse(response.body).access_token;
    // });
    return new Promise((resolve, reject) => {
        request(options, (error, response) => {
            if (error) { reject(error) }
            else { resolve(JSON.parse(response.body).access_token) }
        })
    })
}


// test json
var josnStr = '{"words_result":[{"words":"中国抗癌协会","location":{"top":52,"left":308,"width":217,"height":20}},{"words":"中国医科大学附属盛京医院","location":{"top":58,"left":624,"width":216,"height":21}},{"words":"CHINA ANTI-CANCER ASSOCIATION","location":{"top":77,"left":310,"width":216,"height":11}},{"words":"SHENG JING HOSPIIAL OF CHINA MEDICAL UNIVERSIT","location":{"top":84,"left":626,"width":209,"height":5}},{"words":"第29届","location":{"top":169,"left":376,"width":324,"height":75}},{"words":"全国肿瘤防治宣传周","location":{"top":262,"left":136,"width":803,"height":72}},{"words":"会议时间","location":{"top":411,"left":246,"width":106,"height":28}},{"words":"2023年4月17日（周一）14：00-17：00","location":{"top":415,"left":383,"width":435,"height":21}},{"words":"主办：中国抗癌协会皮肤肿瘤专业委员会","location":{"top":485,"left":325,"width":426,"height":21}},{"words":"附属肿瘤医院","location":{"top":626,"left":109,"width":21,"height":126}},{"words":"哈尔滨医科大学","location":{"top":626,"left":133,"width":21,"height":146}},{"words":"曲国蕃教授","location":{"top":626,"left":156,"width":35,"height":168}},{"words":"附属盛京医院","location":{"top":626,"left":398,"width":21,"height":124}},{"words":"中国医科大学","location":{"top":626,"left":421,"width":21,"height":126}},{"words":"商冠宁教授","location":{"top":626,"left":445,"width":35,"height":168}},{"words":"暨南大学附属第一医院","location":{"top":626,"left":696,"width":21,"height":206}},{"words":"邓列华教授","location":{"top":626,"left":723,"width":30,"height":164}},{"words":"附属皮肤病医院","location":{"top":1094,"left":33,"width":21,"height":146}},{"words":"山东第一医科大学","location":{"top":1095,"left":57,"width":21,"height":163}},{"words":"刘国艳教授","location":{"top":1092,"left":81,"width":35,"height":169}},{"words":"江苏省肿瘤医院","location":{"top":1100,"left":322,"width":21,"height":144}},{"words":"张琰教授","location":{"top":1097,"left":347,"width":35,"height":154}},{"words":"附属肿瘤医院","location":{"top":1099,"left":723,"width":23,"height":124}},{"words":"广西医科大学","location":{"top":1099,"left":745,"width":27,"height":126}},{"words":"吴振杰教授","location":{"top":1099,"left":774,"width":30,"height":166}},{"words":"附属肿瘤医院","location":{"top":1099,"left":970,"width":20,"height":126}},{"words":"哈尔滨医科大学","location":{"top":1097,"left":990,"width":27,"height":149}},{"words":"包俊杰教授","location":{"top":1099,"left":1015,"width":35,"height":168}},{"words":"直播日程","location":{"top":1317,"left":453,"width":167,"height":42}},{"words":"时间","location":{"top":1396,"left":99,"width":69,"height":30}},{"words":"主题","location":{"top":1395,"left":457,"width":72,"height":35}},{"words":"讲者主持","location":{"top":1395,"left":811,"width":183,"height":35}},{"words":"14:00-14:05","location":{"top":1460,"left":68,"width":132,"height":23}},{"words":"致辞","location":{"top":1457,"left":467,"width":52,"height":28}},{"words":"商冠宁","location":{"top":1457,"left":928,"width":74,"height":28}},{"words":"14:05-14:35","location":{"top":1524,"left":69,"width":133,"height":20}},{"words":"“明察秋毫、见微知著”-皮肤恶性肿瘤的早期识别","location":{"top":1522,"left":243,"width":519,"height":21}},{"words":"刘国艳","location":{"top":1521,"left":811,"width":75,"height":26}},{"words":"曲国蕃","location":{"top":1551,"left":928,"width":74,"height":26}},{"words":"14:35-15:05","location":{"top":1586,"left":69,"width":133,"height":20}},{"words":"浅谈皮肤淋巴瘤","location":{"top":1583,"left":409,"width":167,"height":28}},{"words":"张琰","location":{"top":1583,"left":811,"width":75,"height":26}},{"words":"15:05-15:35","location":{"top":1648,"left":69,"width":133,"height":20}},{"words":"肢端黑色素瘤的外科治疗","location":{"top":1648,"left":364,"width":256,"height":21}},{"words":"吴振杰","location":{"top":1645,"left":811,"width":75,"height":26}},{"words":"邓列华","location":{"top":1679,"left":928,"width":74,"height":26}},{"words":"15:35-16:05","location":{"top":1711,"left":67,"width":135,"height":20}},{"words":"皮肤里的肉瘤-皮肤隆突性纤维肉瘤","location":{"top":1711,"left":313,"width":357,"height":21}},{"words":"包俊杰","location":{"top":1707,"left":811,"width":75,"height":26}},{"words":"16:05-16:10","location":{"top":1773,"left":69,"width":133,"height":20}},{"words":"总结","location":{"top":1769,"left":467,"width":52,"height":26}},{"words":"商冠宁","location":{"top":1771,"left":928,"width":74,"height":26}},{"words":"扫码观看直播","location":{"top":2158,"left":423,"width":231,"height":35}},{"words":"专家介绍","location":{"top":2252,"left":453,"width":165,"height":43}},{"words":"·医学博士、主任医师、三级教授、硕士生导师","location":{"top":2368,"left":423,"width":475,"height":21}},{"words":"·沈阳市骨肿瘤临床医学研究中心主任","location":{"top":2401,"left":423,"width":383,"height":21}},{"words":"·中国抗癌协会皮肤肿瘤专业委员会主任委员","location":{"top":2435,"left":421,"width":454,"height":24}},{"words":"·中华医学会骨科学分会青年委员","location":{"top":2470,"left":420,"width":337,"height":21}},{"words":"·中国医师协会骨科学分会青年委员","location":{"top":2500,"left":420,"width":362,"height":28}},{"words":"·中国抗癌协会肉瘤专业委员会委员","location":{"top":2539,"left":421,"width":361,"height":20}},{"words":"·中国抗癌协会骨肿瘤与骨转移瘤专业委员会委员","location":{"top":2573,"left":421,"width":499,"height":20}},{"words":"·中国抗癌协会肿瘤微创专业委员会骨肿瘤学组副组长","location":{"top":2606,"left":421,"width":548,"height":21}},{"words":"·辽宁省抗癌协会肉瘤专业委员会候任主任委员","location":{"top":2640,"left":423,"width":475,"height":21}},{"words":"·辽宁省细胞生物学学会骨肿瘤专业委员会主任委员","location":{"top":2674,"left":423,"width":523,"height":23}},{"words":"·辽宁省生命科学学会皮肤肿瘤专业委员会主任委员","location":{"top":2707,"left":423,"width":523,"height":21}},{"words":"商冠宁教授","location":{"top":2722,"left":135,"width":190,"height":35}},{"words":"·国际保肢学会(ISOLS)会员","location":{"top":2743,"left":421,"width":310,"height":20}},{"words":"中国医科大学附属盛京医院","location":{"top":2768,"left":86,"width":290,"height":21}},{"words":"·国际矫形与创伤外科学会(SICOT)中国部骨肿瘤分会委员","location":{"top":2776,"left":423,"width":615,"height":21}},{"words":"·辽宁省优秀科技工作者","location":{"top":2810,"left":421,"width":243,"height":21}},{"words":"·辽宁省百千万人才百层次人选","location":{"top":2843,"left":421,"width":313,"height":23}},{"words":"·沈阳市高层次领军人才","location":{"top":2877,"left":421,"width":241,"height":21}},{"words":"·医学博士、主任医师、二级教授、博士研究生导师","location":{"top":2986,"left":423,"width":523,"height":20}},{"words":"中国抗癌协会常务理事","location":{"top":3018,"left":423,"width":248,"height":21}},{"words":"·中国抗癌协会骨肿瘤和骨转移瘤专业委员会副主任委员","location":{"top":3053,"left":423,"width":575,"height":21}},{"words":"·中国抗癌协会皮肤肿瘤专业委员会副主任委员","location":{"top":3087,"left":421,"width":484,"height":21}},{"words":"·中国抗癌协会医院管理专业委员会常务委员","location":{"top":3121,"left":423,"width":458,"height":21}},{"words":"·中国抗癌协会肉瘤专业委员会常务委员","location":{"top":3154,"left":423,"width":411,"height":23}},{"words":"中国癌症基金会理事","location":{"top":3188,"left":423,"width":226,"height":21}},{"words":"中国临床肿瘤学会(CSCO)肉瘤专家委员会常务委员","location":{"top":3223,"left":423,"width":568,"height":21}},{"words":"·中华医学会骨科分会骨肿瘤学组委员","location":{"top":3257,"left":423,"width":388,"height":21}},{"words":"·SICOT中国部骨肿瘤学会委员","location":{"top":3292,"left":423,"width":324,"height":20}},{"words":"·黑龙江省抗癌协会肉瘤专业委员会名誉主任委员","location":{"top":3326,"left":423,"width":504,"height":20}},{"words":"曲国蕃教授","location":{"top":3369,"left":134,"width":190,"height":35}},{"words":"·黑龙江省医师协会常务理事","location":{"top":3359,"left":421,"width":296,"height":21}},{"words":"·黑龙江省医学会理事","location":{"top":3393,"left":423,"width":224,"height":21}},{"words":"哈尔滨医科大学附属肿瘤医院","location":{"top":3415,"left":72,"width":317,"height":21}},{"words":"·黑龙江省医学会骨与软组织肿瘤分会主任委员","location":{"top":3427,"left":421,"width":482,"height":21}},{"words":"·《中国肿瘤临床与康复》《国际肿瘤学》等副主编、编委","location":{"top":3460,"left":423,"width":594,"height":23}},{"words":"·医学博士、主任医师、教授、博士生导师、博士后合作导师","location":{"top":3581,"left":423,"width":617,"height":20}},{"words":"·中国医药教育协会副会长","location":{"top":3615,"left":421,"width":275,"height":21}},{"words":"·中国医药教育协会皮肤病专业委员会主任委员","location":{"top":3650,"left":423,"width":480,"height":20}},{"words":"·中国抗癌协会皮肤肿瘤专业委员会副主任委员","location":{"top":3684,"left":421,"width":482,"height":20}},{"words":"·粤港澳大湾区皮肤科医师联盟主席","location":{"top":3717,"left":423,"width":364,"height":20}},{"words":"·广东省医院协会皮肤性病科管理专业委员会主任委员","location":{"top":3751,"left":423,"width":551,"height":21}},{"words":"·广东省基层医药学会皮肤专业委员会主任委员","location":{"top":3785,"left":423,"width":482,"height":21}},{"words":"·广东省医学会皮肤科分会副主任委员","location":{"top":3820,"left":423,"width":394,"height":20}},{"words":"·广东省中西医结合学会皮肤科分会副主任委员","location":{"top":3854,"left":423,"width":482,"height":21}},{"words":"邓列华教授","location":{"top":3914,"left":135,"width":190,"height":35}},{"words":"暨南大学附属第一医院","location":{"top":3959,"left":109,"width":243,"height":21}},{"words":"·医学博士、主任医师、教授、中西医结合科、外科主任","location":{"top":4126,"left":423,"width":570,"height":21}},{"words":"·院长助理、毛发和瘢痕专病门诊负责人，硕士研究生导师","location":{"top":4161,"left":423,"width":594,"height":20}},{"words":"·山东省富民兴鲁劳动奖章获得者","location":{"top":4195,"left":421,"width":337,"height":20}},{"words":"山东省十佳女医师","location":{"top":4228,"left":423,"width":195,"height":20}},{"words":"·山东省优秀中青年皮肤科医师","location":{"top":4262,"left":423,"width":312,"height":21}},{"words":"·中国女医师协会皮肤病专委会常务委员","location":{"top":4296,"left":423,"width":405,"height":21}},{"words":"·中华中医药学会皮肤病专业委员会常务委员","location":{"top":4331,"left":423,"width":452,"height":20}},{"words":"山东省医学会皮肤病专委会银屑病学组副组长","location":{"top":4364,"left":423,"width":475,"height":21}},{"words":"山东中医药学会毛发学组组长","location":{"top":4398,"left":423,"width":312,"height":21}},{"words":"·中西医结合学会毛发学组组长","location":{"top":4432,"left":423,"width":312,"height":21}},{"words":"刘国艳教授","location":{"top":4459,"left":133,"width":192,"height":35}},{"words":"山东第一医科大学","location":{"top":4504,"left":133,"width":194,"height":21}},{"words":"附属皮肤病医院","location":{"top":4536,"left":143,"width":175,"height":26}},{"words":"·医学博士、副主任医师、副教授、博士后、硕士研究生导师","location":{"top":4677,"left":423,"width":617,"height":21}},{"words":"·黑龙江省骨与软组织肿瘤治疗中心副主任","location":{"top":4711,"left":423,"width":430,"height":21}},{"words":"·哈尔滨医科大学附属肿瘤医院骨外科副主任","location":{"top":4746,"left":421,"width":455,"height":20}},{"words":"·美国杜克大学及西雅图癌症中心访问学者","location":{"top":4780,"left":423,"width":428,"height":20}},{"words":"·中华医学会骨科学分会骨肿瘤学组青年委员","location":{"top":4813,"left":421,"width":453,"height":20}},{"words":"·中国抗癌协会肉瘤专业委员会青年委员","location":{"top":4847,"left":423,"width":404,"height":21}},{"words":"·中国抗癌协会皮肤肿瘤专业委员会委员","location":{"top":4880,"left":423,"width":405,"height":23}},{"words":"·中国抗癌协会肉瘤专业委员会创新与转化学组委员","location":{"top":4916,"left":423,"width":521,"height":20}},{"words":"·中国抗癌协会肉瘤专业委员会基础与转化学组委员","location":{"top":4949,"left":423,"width":521,"height":20}},{"words":"·中国抗癌协会骨肿瘤和骨转移瘤专业委员会药物及精准治疗","location":{"top":4983,"left":423,"width":615,"height":21}},{"words":"学组委员","location":{"top":5017,"left":431,"width":92,"height":21}},{"words":"包俊杰教授","location":{"top":5044,"left":136,"width":189,"height":35}},{"words":"·国际肿瘤学杂志通讯编委等学术任职","location":{"top":5052,"left":421,"width":384,"height":20}},{"words":"哈尔滨医科大学附属肿瘤医院","location":{"top":5089,"left":72,"width":317,"height":20}},{"words":"·副主任医师、教授、硕士生导师","location":{"top":5277,"left":423,"width":335,"height":21}},{"words":"广西医科大学附属肿瘤医院骨软组织外科","location":{"top":5311,"left":423,"width":428,"height":23}},{"words":"·广西医科大学附属肿瘤医院黑色素瘤诊治中心副主任","location":{"top":5346,"left":423,"width":553,"height":20}},{"words":"·中国抗癌协会皮肤肿瘤专业委员会委员","location":{"top":5380,"left":423,"width":410,"height":20}},{"words":"广西医师协会皮肤科医师分会委员","location":{"top":5413,"left":423,"width":364,"height":21}},{"words":"·广西抗癌协会骨与软组织肿瘤专业委员会委员","location":{"top":5447,"left":423,"width":482,"height":21}},{"words":"·广西抗癌协会肿瘤标志专业委员会委员","location":{"top":5481,"left":423,"width":411,"height":23}},{"words":"吴振杰教授","location":{"top":5591,"left":135,"width":190,"height":35}},{"words":"广西医科大学附属肿瘤医院","location":{"top":5637,"left":86,"width":290,"height":21}},{"words":"·医学博士、主任医师、副教授、硕士研究生导师","location":{"top":5791,"left":423,"width":499,"height":20}},{"words":"·德国海德堡大学医学院访问学者","location":{"top":5822,"left":421,"width":339,"height":28}},{"words":"·中国抗癌协会皮肤肿瘤专业委员会常委","location":{"top":5859,"left":421,"width":408,"height":21}},{"words":"·中国抗癌协会淋巴瘤专业委员会委员","location":{"top":5892,"left":423,"width":383,"height":23}},{"words":"·中国抗癌协会肿瘤标志物专业委员会胃癌标志物协作组委员","location":{"top":5928,"left":423,"width":615,"height":20}},{"words":"·中国老年学和老年医学学会肿瘤康复分会青年委员","location":{"top":5961,"left":423,"width":523,"height":20}},{"words":"·江苏省免疫学会转化医学专业委员会秘书长","location":{"top":5995,"left":421,"width":455,"height":21}},{"words":"·江苏省免疫学会科普工作委员会委员","location":{"top":6028,"left":423,"width":381,"height":21}},{"words":"张琰教授","location":{"top":6081,"left":143,"width":173,"height":35}},{"words":"江苏省肿瘤医院","location":{"top":6126,"left":145,"width":170,"height":21}},{"words":"整合资源","location":{"top":6324,"left":840,"width":182,"height":43}},{"words":"科学防癌","location":{"top":6380,"left":840,"width":182,"height":45}}],"words_result_num":148,"log_id":1682280063524212008}'
const data = JSON.parse(josnStr);
// parseJson(data);
