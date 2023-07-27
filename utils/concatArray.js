function concatArray() {
    let newArr = Array.prototype.concat.apply([], arguments)
    return Array.from(new Set(newArr))
}

module.exports = concatArray;