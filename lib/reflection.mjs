const classCtorMatch = new RegExp(/(constructor\s*\((\s*[a-zA-Z0-9\,\=\'\s\:\{\}]+\s*)+\)\s*\{)/g);
const classCtorParamMatch = new RegExp(/(((?<=\()[a-zA-Z0-9\'\:\=\s\{\}]+(?=\,))|((?<=\,\s)[a-zA-Z0-9\'\:\=\s\{\}]+(?=\,))|((?<=\()[a-zA-Z0-9\'\:\s\=\}\{]+(?=\)))|((?<=\()[a-zA-Z0-9\'\:\s\=\}\{]+(?=\)))|(?<=\,\s)[a-zA-Z0-9\'\:\=\{\}\s]+(?=\)))/g);

const classCtorParam = [
    new RegExp(/((?<=\()[a-zA-Z0-9\'\:\=\s\{\}]+(?=\,))/g),
    new RegExp(/((?<=\,\s)[a-zA-Z0-9\'\:\=\s\{\}]+(?=\,))/g),
    new RegExp(/((?<=\()[a-zA-Z0-9\'\:\s\=\}\{]+(?=\)))/g),
    new RegExp(/(?<=\,\s)[a-zA-Z0-9\'\:\=\{\}\s]+(?=\))/g)
];


export class Reflection {
    /**
     * @template T
     * @template T2
     * @param { T } Class
     * @param { T2 } baseClass
     * @returns { Array<T> }
    */
    getClassInfo(Class, baseClass) {
        const info = {
            Class,
            ctorParams: {},
            properties: []
        };
        info.ctorParams = this.getClassCtorParams(Class);
        let classes = [info];
        info.properties = Object.getOwnPropertyNames(Class.prototype)
                            .filter(pName => pName !== 'constructor');
        if (info.Class === baseClass) {
            return classes;
        }
        const _class = Object.getPrototypeOf(Class);
        if (!_class || !_class.constructor) {
            throw new Error('critical error');
        }
        const _classes = this.getClassInfo(_class, baseClass);
        if (_classes.length > 0) {
            classes = classes.concat(_classes);
        }
        return classes;
    }
    getClassCtorParams(obj) {
        const script = obj.toString();
        classCtorMatch.lastIndex = -1;
        let match = classCtorMatch.exec(script);
        if (!match) {
            return [];
        }
        const ctorStr = match[0];
        classCtorParamMatch.lastIndex = -1;
        let matches = [];
        let expressions = classCtorParam.map(x => x);
        let expression = expressions.shift();
        expression.lastIndex = -1;
        while(expression) {
            match = expression.exec(ctorStr);
            if (match) {
                matches.push(match[0]);
            }
            expression = expressions.shift();
        }
        if (matches.length === 0) {
            return [];
        }
        matches = [...new Set(matches.filter(m => m))];
        const parameters = [];
        for(const match of matches) {
            let _param = match.replace(/\s+/g,'');
            if (_param.startsWith('{')) {
                _param = _param.split('{');
                _param.splice(0,1);
                _param = _param.split('}');
                _param = _param[0].replace(/\s+/g,'');
                _param = _param.split('=');
                _param.splice(1,1);
                parameters.push({ name: _param, value: null });
            } else if (_param.indexOf('=') > -1) {
                _param = _param.split('=');
                _param.splice(1,1);
                parameters.push({ name: _param[0], value: null });
            } else {
                parameters.push({ name: _param, value: null });
            }
        }
        return parameters;
    }
}