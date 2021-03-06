'use strict';

let HTTP = require('http'),
    Const = require('./const'),
    timeoutLimit = 5000,
    host = Const.URL_SERVER,
    Request;

Request = path => {
    return new Promise((resolve, reject) => {
        path = path.replace(/\s+/g, '');

        if (path.indexOf('/') != 0) {
            path = '/' + path;
        }

        let result = '',
            option = {
            host, path
        },
            timeoutID,
            req;

        req = HTTP.request(option, res => {
            clearTimeout(timeoutID);
            res.setEncoding('utf8');

            res.on('data', data => {
                result += data;
            });

            res.on('end', () => {
                try {
                    result = JSON.parse(result);
                } catch (e) {
                    result = {
                        code: -1,
                        msg: `服务器端返回的不是有效的 JSON 格式:
                            ${ result }`
                    };
                } finally {
                    resolve(result);
                }
            });
        });

        log(`http://${ host }${ path }`, 'debug');

        req.setTimeout(timeoutLimit, () => {
            reject({
                code: -1,
                msg: '网络请求超时.'
            });
        });

        req.on('error', err => {
            reject({
                code: -1,
                msg: `网络请求失败, 失败原因:\n${ err.code }`
            });
        });

        req.end();
    }).catch(e => {
        log(e.msg, 'error');
    });
};

module.exports = Request;