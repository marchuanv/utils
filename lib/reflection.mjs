import { Member, randomUUID } from "../registry.mjs";

const methodMatch = new RegExp(/(\b(?<!\.|for|switch|super|this|new\s|get\s|set\s|=\s)\b(?!for|switch|super|this|new\s|get\s|set\s)([\w]+\([\w\,\=\s\{\}\[\]\'\"\:]*\))|(static\s[\w]+\([\w\,\=\s\{\}\[\]\'\"\:]*\)))/g);
const gettersetterMatch = new RegExp(/(static\sget\s[\w]+\([\w\,\=\s\{\}\[\]]*\))|(static\sset\s[\w]+\([\w\,\=\s\{\}\[\]]*\))|(\sget\s[\w]+\([\w\,\=\s\{\}\[\]]*\))|(\sset\s[\w]+\([\w\,\=\s\{\}\[\]]*\))/g);
const memberNameRegEx = new RegExp(/[\w]+(?=\()/g);
const paramRegEx = new RegExp(/(?<=\()[\w\,\[\]\{\}\=\:\s\'\"]+(?=\))/g);


export class Reflection {
    /**
     * @template T
     * @template T2
     * @param { T } Class
     * @param { T2 } baseClass
     * @returns { Member }
    */
    getMember(Class, baseClass) {
        const member = new Member(Class.name, Class, true, false, false, false, Object);
        for(const _member of this.getMembers(Class)) {
            member.child = _member;
        }
        if (Class !== baseClass) {
            const _class = Object.getPrototypeOf(Class);
            if (!_class || !_class.constructor) {
                throw new Error('critical error');
            }
            member.child = this.getMember(_class, baseClass);
        }
        return member;
    }
    /**
     * @param { class } Class
     * @returns { Array<Member> }
    */
    getMembers(Class) {

        const script = Class.toString();
        let members = [];

        methodMatch.lastIndex = -1;
        gettersetterMatch.lastIndex = -1;

        let results = getMatches(methodMatch, script);
        results = [...new Set(results.filter(m => m))];

        for(const match of results) {
            const memberName = getMemberName(match);
            let isStatic = false;
            if (match.indexOf('static') > -1) {
                isStatic = true;
            }
            const member = new Member(memberName, null, false, false, isStatic, true);
            for(const param of this.getMemberParams(match)) {
                member.child = param;
            }
            members.push(member);
        }

        results = getMatches(gettersetterMatch, script);
        results = [...new Set(results.filter(m => m))];

        for(const match of results) {
            const memberName = getMemberName(match);
            let isStatic = false;
            if (match.indexOf('static') > -1) {
                isStatic = true;
            }
            const member = new Member(memberName, null, false, true, false, isStatic, Object);
            for(const param of this.getMemberParams(match)) {
                member.child = param;
            }
            members.push(member);
        }
        return members;
    }
    /**
     * @param { String } memberStr
     * @returns { Array<Member> }
    */
    getMemberParams(memberStr) {
        paramRegEx.lastIndex = -1;
        let matches = getMatches(paramRegEx, memberStr);
        matches = matches.map(x => x.replace(/\s+/g,''));
        const tokens = [];
        if (matches.find(x => x.indexOf(',') > -1)) {
            const originalLength = matches.length;
            for(let index = 0; index < originalLength; index++) {
                if (matches[index]) {
                    let match = /\s*\=\s*\[.*\]/g.exec(matches[index]);
                    if (match) {
                        let tokenId = randomUUID();
                        let tokenValue = match[0];
                        tokens.push({ key: tokenId, value: tokenValue });
                        matches[index] = matches[index].replace(/\s*\=\s*\[.*\]/g,`=${tokenId}`);
                    }
                    if (match) {
                        let tokenId = randomUUID();
                        let tokenValue = /\s*\=\s*\{.*\}/g.exec(matches[index])[0];
                        tokens.push({ key: tokenId, value: tokenValue });
                        matches[index] = matches[index].replace(/\s*\=\s*\{.*\}/g,`=${tokenId}`);
                    }
                    const split =  matches[index].split(',');
                    matches = matches.concat(split);
                    matches.splice(index, 1);
                }
            }
        }
        matches = [...new Set(matches.filter(m => m))];
        const parameters = [];
        isArrayRegEx.lastIndex = -1;
        isStringRegEx.lastIndex = -1;
        isObjRegEx.lastIndex = -1;
        for(const match of matches) {
            const paramSplit = match.replace(/\s/g,'').split('=');
            const key = paramSplit[0] || match;
            let value = paramSplit[1];
            const token = tokens.find(x => x.key === value);
            if (token) {
                value = token.value;
            }
            let type = Object;
            if (value !== undefined) {
                if (value && isArrayRegEx.test(value)) {
                    type = Array;
                } else if (value && !isNaN(value)) {
                    type = Number;
                } else if (value && isStringRegEx.test(value)) {
                    type = String;
                } else if (value && isObjRegEx.test(value)) {
                    type = Object;
                }
            }
            parameters.push(new Member(key, value, false, false, false, false, type));
        }
        return parameters;
    }
}

function getMemberName(script) {
    memberNameRegEx.lastIndex = -1;
    const _match = memberNameRegEx.exec(script);
    if (!_match) {
        throw new Error('could not determine member name');
    }
    return _match[0];
}

function getMatches(regExp, script) {
    let matches = [];
    let match = regExp.exec(script);
    while(match) {
        matches = matches.concat(match);
        match = regExp.exec(script);
    }
    return matches;
}