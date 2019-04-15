module.exports = function(to_filter, is_in, not_in){
    let cb_in = (e) => is_in.includes(e);
    let cb_nin = (e) => !not_in.includes(e);

    if (is_in.length === 0)
        cb_in = (e) => true;
    if (not_in.length === 0)
        cb_nin = (e) => true;

    return Object.keys(to_filter)
        .filter(key => cb_in(key) && cb_nin(key))
        .reduce((obj, key) => {
            obj[key] = to_filter[key];
            return obj;
        }, {});
};
