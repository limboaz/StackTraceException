module.exports = function (array, compare, item) {
    let r = array.length - 1;
    let l = 0;
    let mid;
    let c;

    while (l <= r) {
        mid = (l + r) >> 1;
        c = compare(item, array[mid]);

        if (c > 0) {
            l = mid + 1;
        } else if (c < 0) {
            r = mid - 1;
        } else
            return {found:true, index: mid};
    }
    return {found: false, index: mid, c: compare(item, array[mid])};
};