const whiteSpaceRegEx = new RegExp(/\s*/, "g");
const funcDestructionMatch = new RegExp(/\s*function\s*[A-z]+\s*\(\s*\{\s*(((?:\s*[A-z0-9]+\s*\,)+)(\s*[A-z0-9]+\s*)|(\s*[A-z0-9]+\s*)|\s*)\s*\}\s*\)/);
const funcParamMatch = new RegExp(/\s*function\s*[A-z]+\s*\((((?:\s*[A-z0-9]+\s*\,)+)(\s*[A-z0-9]+\s*)|(\s*[A-z0-9]+\s*)|\s*)\)/);
const classCtorParamMatch = new RegExp(/constructor\s*\((\s*[A-z0-9,=]\s*)+\)\s*\{/);
const constructorParamsRegEx = new RegExp('constructor(\s+)?\(.*?\)','g');

export class Reflection {
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
    getClassCtorParams(obj) {
        const script = obj.toString();
        classCtorParamMatch.lastIndex = -1;
        constructorParamsRegEx.lastIndex = -1;
        let match = classCtorParamMatch.exec(script);
        if (!match) {
            return null;
        }
        let params = match[0].split('(');
        params = params[1].split(')');
        if (!params || params.length === 0) {
            return null;
        }
        const ctorParams = params[0];
        return ctorParams;
    }
}