import { Buffer, existsSync, join, lstatSync, readdirSync, statSync } from '../registry.mjs';
const whiteSpaceRegEx = new RegExp(/\s*/, "g");
const funcDestructionMatch = new RegExp(/\s*function\s*[A-z]+\s*\(\s*\{\s*(((?:\s*[A-z0-9]+\s*\,)+)(\s*[A-z0-9]+\s*)|(\s*[A-z0-9]+\s*)|\s*)\s*\}\s*\)/);
const funcParamMatch = new RegExp(/\s*function\s*[A-z]+\s*\((((?:\s*[A-z0-9]+\s*\,)+)(\s*[A-z0-9]+\s*)|(\s*[A-z0-9]+\s*)|\s*)\)/);
const classCtorParamMatch = new RegExp(/constructor\s*\((\s*[A-z0-9,]\s*)+\)\s*\{/);
const base64RegEx = new RegExp(/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/, "g");
export class General {
    sizeOf(obj) {
        let bytes = 0;
        switch (typeof obj) {
            case 'number':
                bytes += 8;
                break;
            case 'string':
                bytes += obj.length * 2;
                break;
            case 'boolean':
                bytes += 4;
                break;
            case 'object':
                const objClass = Object.prototype.toString.call(obj).slice(8, -1);
                if (objClass === 'Object' || objClass === 'Array') {
                    for (let key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            const prop = obj[key];
                            bytes = bytes + this.sizeOf(prop);
                        } else {
                            continue;
                        }
                    }
                } else if (objClass !== "Null") {
                    bytes += obj.toString().length * 2
                };
                break;
        }
        return bytes;
    };
    requireUncached(module) {
        delete require.cache[require.resolve(module)];
        return require(module);
    }
    toArrayBuffer(str) {
        const ab = new ArrayBuffer(str.length);
        const view = new Uint8Array(ab);
        for (let i = 0; i < buf.length; ++i) {
            view[i] = buf[i];
        }
        return ab;
    }
    toBuffer(str) {
        return new Buffer.from(str);
    }
    getByteLength(str) {
        return Buffer.byteLength(str, 'utf8');
    }
    syncObject(obj, sourceObj) {
        for (const propName in obj) {
            if (sourceObj[propName] !== undefined) {
                obj[propName] = sourceObj[propName];
            }
        };
    }
    mergeObject(obj, sourceObj) {
        for (const propName in sourceObj) {
            if (sourceObj[propName]) {
                obj[propName] = sourceObj[propName];
            }
        };
    };
    wait(intervalsInMilliseconds, timeoutInMilliseconds, cbInterval, cbComplete, cbTimeout) {
        let interval = setInterval(async () => {
            const obj = await cbInterval();
            if (obj) {
                clearInterval(interval);
                interval = null;
                await cbComplete(obj);
            }
        }, intervalsInMilliseconds);
        if (timeoutInMilliseconds > 0 && cbTimeout) {
            setTimeout(async () => {
                if (interval) {
                    clearInterval(interval);
                    await cbTimeout();
                }
            }, timeoutInMilliseconds);
        }
    };
    isEmptyObject(obj) {
        if (obj) {
            const properties = Object.getOwnPropertyNames(obj);
            for (const prop in properties) {
                return false;
            };
        }
        return true;
    };
    generateGUID() {
        return crypto.randomUUID();
    }
    getFunctionName = function (func) {
        let ret = func.toString();
        ret = ret.substr('function '.length);
        ret = ret.substr(0, ret.indexOf('('));
        return ret;
    }
    getFunctionParams(func) {

        whiteSpaceRegEx.lastIndex = -1;
        funcDestructionMatch.lastIndex = -1;
        classCtorParamMatch.lastIndex = -1;
        funcParamMatch.lastIndex = -1;

        const getParams = (regEx) => {
            let params = regEx.exec(func.toString());
            if (params && params.length > 0) {
                const firstMatch = params[0];
                params = params.filter(p => p && p !== firstMatch);
                if (params.length === 0 && firstMatch) {
                    return [];
                }
                for (let i = 0; i < params.length; i++) {
                    const param = params[i];
                    const paramSplit = param.split(',').filter(ps => ps);
                    if (paramSplit && paramSplit.length > 1) {
                        params.splice(i, 1);
                        i = -1;
                        params = params.concat(paramSplit);
                    }
                }
                params = params.map(ps => ps.replace(whiteSpaceRegEx, '').replace(/\,/g, ''));
                params = [...new Set(params)].map(param => {
                    return {
                        name: param
                    }
                });
                return params;
            } else {
                return null;
            }
        };
        let params = getParams(funcParamMatch);
        if (!params) {
            params = getParams(classCtorParamMatch);
        }
        if (!params) {
            params = getParams(funcDestructionMatch);
        }
        return params;
    }
    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    getJSONString(data, includeFunctions = false) {
        try {
            if (!data) {
                return "";
            }
            let jsonStr = JSON.stringify(data, (key, value) => {
                if (typeof value === "function" && includeFunctions === true) {
                    return "/Function(" + value.toString() + ")/";
                }
                return value;
            }, 4);
            jsonStr = jsonStr.replace(/\\n/g, '').replace(/\\/g, "");
            return jsonStr;
        } catch (err) {
            return "";
        }
    }
    getJSONObject(jsonString, includeFunctions = false) {
        try {
            const dateFormat = /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$/;
            const obj = JSON.parse(jsonString, (key, value) => {
                if (typeof value === "string" && dateFormat.test(value)) {
                    return new Date(value);
                }
                if (typeof value === "string" && value.startsWith("/Function(") && value.endsWith(")/") && includeFunctions === true) {
                    value = value.substring(10, value.length - 2);
                    return eval("(" + value + ")");
                }
                return value;
            });
            return obj;
        } catch (err) {
            return null;
        }
    }
    isValidUrl = function (url) {
        const pattern1 = new RegExp('^(http?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
        const pattern2 = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
        return pattern1.test(url) || pattern2.test(url);
    }
    getUrlPath(url) {
        const url_parts = require('url').parse(url);
        return url_parts.pathname;
    }
    getFunctions(obj, callback) {
        for (const prop in obj) {
            if (typeof obj[prop] === "function") {
                callback(prop, obj[prop]);
            }
        };
    }
    getCanvasMousePos(mouse, canvas) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: mouse.x - rect.left,
            y: mouse.y - rect.top
        };
    }
    getRemainingDays(month) {
        const currentDate = new Date();
        let year = currentDate.getFullYear();
        const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        const newDate = new Date();
        if (month < (currentDate.getMonth() + 1)) {
            year = year + 1;
        }
        newDate.setFullYear(year);
        newDate.setMonth(month - 1);
        const lastDayOfSelectedMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
        const currentDay = currentDate.getDate();
        newDate.setDate(lastDayOfSelectedMonth);

        return Math.round(Math.abs((newDate.getTime() - currentDate.getTime()) / (oneDay)));
    }
    getFullPaths(rootDir) {
        let paths = [];
        readdirSync(rootDir).forEach(file => {
            const fullPath = join(rootDir, file);
            if (lstatSync(fullPath).isDirectory()) {
                paths = paths.concat(this.getFullPaths(fullPath));
            } else {
                paths.push(fullPath);
            }
        });
        return paths;
    }
    getCurrentMonth() {
        const currentDate = new Date();
        return currentDate.getMonth() + 1;
    }
    createWhitespace(level) {
        let whitespace = "";
        for (let i = 0; i < level; i++) {
            whitespace = whitespace + " ";
        };
        return whitespace;
    }
    isBase64String(str) {
        base64RegEx.lastIndex = -1;
        const params = base64RegEx.exec(str);
        return params !== null && params.length > 0;
    }
    base64ToString(base64Str) {
        return Buffer.from(base64Str, "base64").toString("utf8");
    }
    walkDir(dir, callback) {
        if (existsSync(dir)) {
            const files = readdirSync(dir);
            for (const f of files) {
                let dirPath = join(dir, f);
                const stat = statSync(dirPath);
                var fileSizeInMegabytes = stat.size / (1024 * 1024);
                let isDirectory = stat.isDirectory();
                if (isDirectory) {
                    this.walkDir(dirPath, callback);
                } else {
                    callback(join(dir, f), fileSizeInMegabytes);
                }
            };
        }
    }
    createPropertyWithEvent(object, name, callback, eventCallback) {
        Object.defineProperty(object, name, {
            configurable: false,
            writable: false,
            value: (val) => {
                eventCallback.call(object, val);
                callback.call(object, val);
            }
        });
    };
}