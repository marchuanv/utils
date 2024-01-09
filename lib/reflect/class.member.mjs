import { Container, GUID, Member, MemberParameter, MethodMember, PropertyMember, TypeMapper } from "../../registry.mjs";
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
     * @param { Object } targetClass
    */
    constructor(targetClass) {
        super();

        if (!TypeMapper.isRegistered(targetClass)) {
            const targetClassId = new GUID();
            TypeMapper.register(targetClassId, targetClass);
        }

        const referenceType = TypeMapper.getReferenceType(targetClass);
        const { name, type } = referenceType;

        super.update(name, true, false, false, false, false, false, false, type, []);
        
        let script = type.toString();
        let match = /\/\*\*[\w\\r\\n\@\{\}\s\*\<\>\:\,\'\[\]\=\:]+\*\//.exec(script);
        const members = [];
        let prevId = null;
        let currentId = null;

        while(match) {
            prevId = currentId;
            const Id = new GUID();
            currentId = Id;
            const comment = match;
            if (prevId) {
                script = script.replace(comment, `${prevId} ${Id}`);
            } else {
                script = script.replace(comment, Id);
            }
            match = /\/\*\*[\w\\r\\n\@\{\}\s\*\<\>\:\,\'\[\]\=\:]+\*\//.exec(script);
            if (!match) {
                script = script + Id;
            }
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
                const returnTypeCommentsRegEx = new RegExp(`(?<=@returns)\\s*\\{.*\\s+\\}`);
                const returnTypeCommentsRegExMatch = returnTypeCommentsRegEx.exec(member.comment);
                let returnTypeStr = returnTypeCommentsRegExMatch ? returnTypeCommentsRegExMatch[0] : null;
                if (returnTypeStr) {
                    try {
                        returnTypeStr = returnTypeStr.replace(/\s*/g,'');
                        returnTypeStr = returnTypeStr.substring(1, returnTypeStr.length-1);
                        if (returnTypeStr === 'T') {
                            returnTypeStr = 'Object';
                        }
                        member.type = TypeMapper.getPrimitiveType(returnTypeStr);
                        if (!member.type) {
                            member.type = TypeMapper.getReferenceType(returnTypeStr);
                        }
                        if (!member.type) {
                            throw new Error('unable to determine member return type');
                        }
                    } catch(error) {
                        console.error(error);
                        console.log(`unable to determine member return type`);
                    }
                }
            }

            if (member.isCtor) {
                member.type = referenceType;
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
                        if(!paramTypeCommentsRegExMatch) {
                            console.error(new Error(`could not find ${paramName} parameter in comments`));
                        }
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
                        member.parameters[paramName] = { type: null };
                        const parameter = member.parameters[paramName];
                        const isJsDocObjectMatch = isJsDocObject.exec(paramTypeStr);
                        if (isJsDocObjectMatch) {
                            parameter.type = TypeMapper.getReferenceType('object');
                        } else {
                            try {
                                parameter.type = TypeMapper.getPrimitiveType(paramTypeStr);
                                if (!parameter.type) {
                                    parameter.type = TypeMapper.getReferenceType(paramTypeStr);
                                }
                                if (!parameter.type) {
                                    throw new Error('unable to determine parameter type');
                                }
                            } catch(error) {
                                throw error;
                            }
                        }
                    }
                }
                const paramNames = Object.keys(member.parameters);
                for(const paramName of paramNames) {
                    const parameter = member.parameters[paramName];
                    let parameterValue = parameter.value;
                    if (!parameterValue) {
                        parameterValue = parameter.type.defaultValue;
                    }
                    const field = {};
                    field[paramName] = parameterValue;
                    const memberParameter = new MemberParameter(field);
                    memberParameters.push(memberParameter);
                }
            }
            if (member.isCtor || member.isMethod) {
                const methodMember = new MethodMember(member.name, member.isStatic, member.isCtor, memberParameters, member.type);
                super.child = methodMember;
            } else if (member.isProperty) {
                if (member.isGetter) {
                    const propertyMember = new PropertyMember(member.name, member.isStatic,true, false, memberParameters, member.type);
                    super.child = propertyMember;
                }
                if (member.isSetter) {
                    const propertyMember = new PropertyMember(member.name, member.isStatic, false, true, memberParameters, member.type);
                    super.child = propertyMember;
                }
            }
        }
        const _class = Object.getPrototypeOf(targetClass);
        if (_class && _class.constructor && _class.name && _class !== Container) {
            const subClass = new ClassMember(_class);
            super.child = subClass;
        }
    }
}