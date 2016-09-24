/*=========   Range 支持模块  ========*/
/*
暂且不支持多区间吧。于是遇见逗号，就报416错误吧
 */

exports.parseRange = function (str, size) {
    if (str.indexOf(",") != -1) {
        return;
    }

    var range = str.split("-"),
        start = parseInt(range[0], 10),
        end = parseInt(range[1], 10);

    // Case: -100
    if (isNaN(start)) {
        start = size - end;
        end = size - 1;

    // Case: 100-
    } else if (isNaN(end)) {
        end = size - 1;
    }

    // Invalid
    if (isNaN(start) || isNaN(end) || start > end || end > size) {
        return;
    }

    return {start: start, end: end};
};





