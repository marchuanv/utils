import { Member, MemberParameter, MethodMember, PropertyMember, randomUUID } from "../../registry.mjs";
const commentsExpression = /\/\*\*[\w\\r\\n\@\{\}\s\*\<\>\:\,\'\[\]\=\:]+\*\//g;
const memberNameRegEx = new RegExp(/\b[\w]+(?=\()/g);
const paramRegEx = new RegExp(/(?<=\()[\w\,\[\]\{\}\=\:\s\'\"]+(?=\))/g);
const paramNameRegEx = /(([\w]+(?=\s\=\s))|((?<!\s\=\s)[\w]+(?=\,)))/g;
const getterRegEx = new RegExp(/(?<=\sget\s)[\w]+\(\)/g);
const setterRegEx = new RegExp(/(?<=\sset\s)[\w]+\(/g);
const methodRegEx = new RegExp(/(\b(?<!\.|for|switch|super|this|new\s|get\s|set\s|=\s)\b(?!for|switch|super|this|new\s|get\s|set\s)([\w]+\([\w\,\=\s\{\}\[\]\'\"\:]*\))|(static\s[\w]+\([\w\,\=\s\{\}\[\]\'\"\:]*\)))/g);
const isStatic = new RegExp(/(?<=\sstatic\s)[\w]+\(/g);
const isJsDocObject = /(?<=\{)[\w\:]+(?=\})/g;
export class ClassMember extends Member {
    /**
     * @param { Object } Class
    */
    constructor(Class) {
        super();
        super.update(Class.name, true, false, false, false, false, Class, []);
        
        let script = Class.toString();
        commentsExpression.lastIndex = -1;
        let match = commentsExpression.exec(script);
        const members = [];
        let prevId = null;
        let currentId = null;

        while(match) {
            prevId = currentId;
            const Id = randomUUID();
            currentId = Id;
            const comment = match;
            match = commentsExpression.exec(script);
            members.push({
                Id,
                name: null,
                comment,
                script: null,
                parameters: { },
                isGetter: false,
                isSetter: false,
                isProperty: false,
                isMethod: false,
                isStatic: false,
                isCtor: false,
                type: null
            });
            if (prevId) {
                script = script.replace(comment, `${prevId} ${Id}`);
                if (!match) {
                    script = script + Id;
                }
            } else {
                script = script.replace(comment, Id);
            }
        }
        for(const member of members) {
            
            memberNameRegEx.lastIndex = -1;
            getterRegEx.lastIndex = -1;
            setterRegEx.lastIndex = -1;
            methodRegEx.lastIndex = -1;
            paramRegEx.lastIndex = -1;
            paramNameRegEx.lastIndex = -1;
            isStatic.lastIndex = -1;
            isJsDocObject.lastIndex = -1;

            const { Id } = member;
            const memberExpression = new RegExp(`(?<=${Id})[^]*(?=${Id})`);
            const memberExpressionMatch = memberExpression.exec(script);
            member.script = memberExpressionMatch[0];
            const memberNameRegExMatch = memberNameRegEx.exec(member.script);
            member.name = memberNameRegExMatch[0];

            const getterRegExMatch = getterRegEx.exec(member.script);
            const setterRegExMatch = setterRegEx.exec(member.script);
            const methodRegExMatch = methodRegEx.exec(member.script);

            if (getterRegExMatch) {
                member.isGetter = true;
                member.isProperty = true;
            } else if (setterRegExMatch) {
                member.isSetter = true;
                member.isProperty = true;
            } else if (methodRegExMatch) {
                member.isMethod = true;
                if (member.name === 'constructor') {
                    member.isCtor = true;
                }
            }

            if (!member.isCtor && !member.isSetter) {
                try {
                    member.type = getMemberReturnType(member.comment);
                } catch(error) {
                    console.log(`unable to determine member return type`);
                }
            }

            const isStaticMatch = isStatic.exec(member.script);
            if (isStaticMatch) {
                member.isStatic = true;
            }

            const memberParameters = [];
            if (member.isSetter || member.isMethod) {
                let paramRegExMatch = paramRegEx.exec(member.script);
                if (paramRegExMatch) {
                    paramRegExMatch = paramRegExMatch[0];
                    let params = [];
                    let paramNameRegExMatch = paramNameRegEx.exec(paramRegExMatch);
                    paramNameRegExMatch = paramNameRegExMatch ? paramNameRegExMatch.filter(x => x) : null;
                    while(paramNameRegExMatch) {
                        params.push(paramNameRegExMatch[0]);
                        paramNameRegExMatch = paramNameRegEx.exec(paramRegExMatch);
                        paramNameRegExMatch = paramNameRegExMatch ? paramNameRegExMatch.filter(x => x) : null;
                    }
                    if (params.length === 0 && paramRegExMatch) {
                        params.push(paramRegExMatch);
                    }
                    for(const paramName of params) {
                        const paramTypeCommentsRegEx = new RegExp(`(?<=@param)\\s*\\{[^]*\\}\\s*(?=${paramName})`);
                        const paramTypeCommentsRegExMatch = paramTypeCommentsRegEx.exec(member.comment);
                        let paramTypeStr = paramTypeCommentsRegExMatch[0] ? paramTypeCommentsRegExMatch[0] : null;
                        if (!paramTypeStr) {
                            throw new Error(`${member.name} member does not have JSDoc comments`);
                        }
                        if (paramTypeStr.indexOf('@param') > -1 && paramTypeStr.indexOf(paramName) === -1) {
                            paramTypeStr = paramTypeStr.split('@param');
                            paramTypeStr = paramTypeStr[paramTypeStr.length-1];
                        }
                        paramTypeStr = paramTypeStr.replace(/\s*/g,'');
                        paramTypeStr = paramTypeStr.substring(1,paramTypeStr.length-1);
                        paramTypeStr = paramTypeStr.toLowerCase();
                        member.parameters[paramName] = {};
                        let paramType = null;
                        const isJsDocObjectMatch = isJsDocObject.exec(paramTypeStr);
                        if (isJsDocObjectMatch) {
                            paramType = Object;
                        } else {
                            paramType = getPrimitiveType(paramTypeStr);
                        }
                        member.parameters[paramName].type = paramType;
                    }
                }
                const paramNames = Object.keys(member.parameters);
                for(const paramName of paramNames) {
                    const parameter = member.parameters[paramName];
                    const parameterType = parameter.type;
                    const parameterValue = parameter.value;
                    const memberParameter = new MemberParameter(paramName, parameterValue, parameterType);
                    memberParameters.push(memberParameter);
                }
            }
            if (member.isCtor || member.isMethod) {
                const methodMember = new MethodMember(member.name, member.isStatic, member.isCtor, memberParameters, member.type);
                super.child = methodMember;
            } else if (member.isProperty) {
                const propertyMember = new PropertyMember(member.name, member.isStatic, memberParameters, member.type);
                super.child = propertyMember;
            }
        }
        const _class = Object.getPrototypeOf(Class);
        if (_class && _class.constructor && _class.name) {
            const subClass = new ClassMember(_class);
            super.child = subClass;
        }
    }
}

function getPrimitiveType(typeString) {
    const _typeString = typeString.toLowerCase();
    switch(_typeString) {
        case 'string': {
            return String;
        }
        case 'number': {
            return Number;
        }
        case 'object': {
            return Object;
        }
        case 'array': {
            return Array;
        }
        case 'array<string>': {
            return Array;
        }
        case 'boolean': {
            return Boolean;
        }
        default: {
            throw new Error('unable to determine parameter type');
        }
    }
}

function getMemberReturnType(memberJSDoc) {
    const returnTypeCommentsRegEx = new RegExp(`(?<=@returns)\\s*\\{.*\\s+\\}`);
    const returnTypeCommentsRegExMatch = returnTypeCommentsRegEx.exec(memberJSDoc);
    let returnTypeStr = returnTypeCommentsRegExMatch ? returnTypeCommentsRegExMatch[0] : null;
    returnTypeStr = returnTypeStr.replace(/\s*/g,'');
    returnTypeStr = returnTypeStr.substring(1, returnTypeStr.length-1);
    return getPrimitiveType(returnTypeStr);
}
