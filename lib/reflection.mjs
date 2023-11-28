const methodMatch = new RegExp(/(\b(?<!\.|for|switch|new\s|get\s|set\s|=\s)\b(?!for|switch|new\s|get\s|set\s)[\w]+\([\w\,\=\s\{\}\[\]\'\"]*\))/g);
const gettersetterMatch = new RegExp(/(?<=get\s|set\s)[\w]+\([\w\,\=\s\{\}\[\]]*\)/g);
const memberNameRegEx = new RegExp(/[\w]+(?=\()/g);
const paramRegEx = new RegExp(/(?<=\()[\w\,\[\]\{\}\=\:\s\'\"]+(?=\))/g);

class Member {
    /**
     * @param { String } name
     * @param { String } value
     * @param { Boolean } isClass
     * @param { Boolean } isProperty
     * @param { Boolean } isMethod
     * @param { Object } type
     * @returns { Member }
    */
    constructor(name, value, isClass, isProperty, isMethod, type) {
        this._name = name;
        this._member = null;
        this._children = [];
        this._value = value;
        this._index = -1;
        this._isClass = isClass;
        this._isProperty = isProperty;
        this._isMethod = isMethod;
        this._type = type;
    }
    /**
     * @returns { String }
     */
    get name() {
        return this._name;
    }
    /**
     * @returns { Boolean }
    */
    get next() {
        if (this._children.length > 0) {
            this._index = this._index + 1;
            const _child = this._children[this._index];
            if (_child) {
                return true
            }
        }
        return false;
    }
    /**
     * @param { String } name
     * @param { Boolean } isClass
     * @param { Boolean } isProperty
     * @param { Boolean } isMethod
     * @returns { Member }
    */
    find(name, isClass, isProperty, isMethod) {
        this.reset();
        while(this.next) {
            if (this.child.name === name) {
                if (this._isClass === isClass) {
                    return this.child;
                }
                if (this._isProperty === isProperty) {
                    return this.child;
                }
                if (this._isMethod === isMethod) {
                    return this.child;
                }
            }
        }
        this.reset();
    }
    /**
     * @param { String } name
     * @param { Boolean } isClass
     * @param { Boolean } isProperty
     * @param { Boolean } isMethod
     * @returns { Member }
    */
    findAll(name, isClass, isProperty, isMethod) {
        this.reset();
        const found = [];
        while(this.next) {
            if (this.child.name === name) {
                if (this._isClass === isClass) {
                    found.push(this.child);
                }
                if (this._isProperty === isProperty) {
                    found.push(this.child);
                }
                if (this._isMethod === isMethod) {
                    found.push(this.child);
                }
            }
        }
        this.reset();
        return found;
    }
    reset() {
        this._index = -1;
    }
    /**
     * @returns { Member }
    */
    get child() {
        return this._children[this._index];
    }
    /**
     * @param { Member } value
    */
    set child(value) {
        this._children.push(value);
    }
    get value() {
        return this._value;
    }
    /**
     * @returns { Object }
    */
    get type() {
        return this._type;
    }
}

export class Reflection {
    /**
     * @template T
     * @template T2
     * @param { T } Class
     * @param { T2 } baseClass
     * @returns { Member }
    */
    getMember(Class, baseClass) {
        const member = new Member(Class.name, null, true, false, false);
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
        for(const match of results) {
            const memberName = getMemberName(match);
            const member = new Member(memberName, null, false, false, true);
            for(const param of this.getMemberParams(match)) {
                member.child = param;
            }
            members.push(member);
        }

        results = getMatches(gettersetterMatch, script);
        for(const match of results) {
            const memberName = getMemberName(match);
            const member = new Member(memberName, null, false, true, false);
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
        if (matches.find(x => x.indexOf(',') > -1)) {
            for(let index = 0; index < matches.length; index++) {
                matches[index] = matches[index].replace(/\s*\=\s*\[.*\]/g,'=[$token$]');
                matches[index] = matches[index].replace(/\s*\=\s*\{.*\}/g,'=[$token$]');
            }
        }
        matches = [...new Set(matches.filter(m => m))];
        const parameters = [];
        for(const match of matches) {
            const paramSplit = match.replace(/\s/g,'').split('=');
            const key = paramSplit[0] || match;
            const value = paramSplit[1];
            let type = 'Unknown';
            if (value && value.indexOf('[') > -1) {
                type = Array;
            }
            if (value && value.indexOf(/\'/g) > -1) {
                type = String;
            }
            if (value && value.indexOf(/\"/g) > -1) {
                type = String;
            }
            if (value && !isNaN(value)) {
                type = Number;
            }
            parameters.push(new Member(key, value, false, false, false, type));
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