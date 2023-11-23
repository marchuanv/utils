const classCtorMatch = new RegExp(/constructor\s*\((\s*[A-z0-9,=]\s*)+\)\s*\{/g);
const classCtorParamMatch = new RegExp(/((?<=\()[a-zA-Z0-9\=\s\{\}]+(?=\,))|((?<=\,\s)[a-zA-Z0-9\=\s\{\}]+(?=\,))|((?<=\()[a-zA-Z0-9\s\=\}\{]+(?=\)))|(?<=\,\s)[a-zA-Z0-9\=\{\}\s]+(?=\))/g);

export class Reflection {
    getClassCtorParams(obj) {
        const script = obj.toString();
        classCtorMatch.lastIndex = -1;
        let match = classCtorMatch.exec(script);
        if (!match) {
            return null;
        }
        match = match.filter(m =>m);
        classCtorParamMatch.lastIndex = -1;
        match = classCtorParamMatch.exec(match[0]);
        if (!match) {
            return null;
        }
        match = [...new Set(match.filter(m =>m))];
        return match;
    }
}