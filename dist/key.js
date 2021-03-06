"use strict";

let KeyMirror = obj => {
    var ret = {};

    Object.keys(obj).forEach(key => {
        ret[key] = key;
    });

    return ret;
};

module.exports = KeyMirror({
    profile: null,
    current_path: null,
    workspace_list: null,
    username: null,
    password: null,
    domains: null,
    domainsSize: null,
    ip: null,
    mac: null,
    random: null,
    normal: null
});