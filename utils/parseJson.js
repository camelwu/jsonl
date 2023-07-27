const segmenter = new Intl.Segmenter(
    'cn', { granularity: 'word' }
);
function split2Word(str) {
    // 使用map+segmenter.segment 效率更快
    let words = Array.from(
        segmenter.segment(`${str}`),
        s => s.segment
    )
    return words;
}