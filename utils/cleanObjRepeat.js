function cleanObjRepeat(ary, type = 'id') {
    let obj = {}
    let result = ary.reduce((cur, next) => {
        obj[next.id] ? "" : obj[next.id] = true && cur.push(next);
        return cur;
    }, [])
    return result
}

module.exports = cleanObjRepeat;