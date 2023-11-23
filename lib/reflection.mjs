const classCtorMatch = new RegExp(/constructor\s*\((\s*[A-z0-9,=]\s*)+\)\s*\{/g);
const classCtorParamMatch = new RegExp(/((?<=\()[a-zA-Z0-9\=\s\{\}]+(?=\,))|((?<=\,\s)[a-zA-Z0-9\=\s\{\}]+(?=\,))|((?<=\()[a-zA-Z0-9\s\=\}\{]+(?=\)))|(?<=\,\s)[a-zA-Z0-9\=\{\}\s]+(?=\))/g);

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
        match = match.filter(m =>m);
        classCtorParamMatch.lastIndex = -1;
        match = classCtorParamMatch.exec(match[0]);
        if (!match) {
            return [];
        }
        match = [...new Set(match.filter(m =>m))];
        const parameters = [];
        for(const param of match) {
            let _param = param.replace(/\s+/g,'');
            if (param.startsWith('{')){
                _param = _param.split('{');
                _param.splice(0,1);
                _param = _param.split('}');
                _param = _param[0].replace(/\s+/g,'');
                _param = _param.split('=');
                _param.splice(1,1);
                parameters.push({ name: _param, value: null });
            } else if (param.indexOf('=') > -1){
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