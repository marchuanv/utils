import {
    GUID,
    MemberParameter,
    MethodMember,
    PrimitiveType,
    PropertyMember,
    ReferenceType,
    TypeDefinition
} from '../registry.mjs';
const privateBag = new WeakMap();
export class ClassInterface {
    /**
     * @param { Object } classInterfaceConfig
     * @param  { class } targetClass
    */
    constructor(classInterfaceConfig, targetClass) {
        if (!privateBag.has(classInterfaceConfig)) {
            const ctorDependencies = [];
            TypeDefinition.registerClass(new GUID(classInterfaceConfig.Id), targetClass);
            const methods = [];
            const { Id, className, classFilePath, extend } = classInterfaceConfig;
            if (extend && extend.Id) {
                for (const methodName of Object.keys(extend.methods)) {
                    if (classInterfaceConfig.methods[methodName] === undefined) {
                        classInterfaceConfig.methods[methodName] = extend.methods[methodName];
                    }
                }
                for (const properyName of Object.keys(extend.properties)) {
                    if (classInterfaceConfig.properties[properyName] === undefined) {
                        classInterfaceConfig.properties[properyName] = extend.properties[properyName];
                    }
                }
                for (const ctorParamName of Object.keys(extend.ctor.parameters)) {
                    if (classInterfaceConfig.ctor.parameters[ctorParamName] === undefined) {
                        classInterfaceConfig.ctor.parameters[ctorParamName] = extend.ctor.parameters[ctorParamName]
                    }
                }
            }
            for (const methodName of Object.keys(classInterfaceConfig.methods)) {
                const method = classInterfaceConfig.methods[methodName];
                const { isStatic, returns } = method;
                const { type } = returns;
                const { typeName, isReferenceType } = type;
                let returnType = null
                if (typeName) {
                    if (isReferenceType) {
                        returnType = TypeMapper.getReferenceType(typeName);
                    } else {
                        returnType = TypeMapper.getPrimitiveType(typeName);
                    }
                }
                const methodParameters = [];
                for (const paramName of Object.keys(method.parameters)) {
                    const { type: { refId } } = method.parameters[paramName];
                    if (TypeDefinition.find({ Id: refId })) {
                        const field = {};
                        field[paramName] = null;
                        const memberParameter = new MemberParameter(field, refId, isReferenceType);
                        methodParameters.push(memberParameter);
                    } else {
                        throw new Error(`unable to resolve type ref id: ${refId}`);
                    }
                }
                methods.push(new MethodMember(methodName, isStatic, false, methodParameters, returnType));
            }
            const ctorMemberParameters = [];
            for (const paramName of Object.keys(classInterfaceConfig.ctor.parameters)) {
                const { type: { refId } } = classInterfaceConfig.ctor.parameters[paramName];
                if (TypeDefinition.find({ Id: refId })) {
                    const field = {};
                    field[paramName] = null;
                    const memberParameter = new MemberParameter(field, refId);
                    if (!memberParameter.typeDefinition.isObject && memberParameter.typeDefinition.isReferenceType) {
                        ctorDependencies.push({ Id: refId, paramName });
                    }
                    ctorMemberParameters.push(memberParameter);
                } else {
                    throw new Error(`unable to resolve type ref id: ${refId}`);
                }
            }
            const ctor = new MethodMember(className, false, true, ctorMemberParameters, null);
            const properties = [];
            for (const propertyName of Object.keys(classInterfaceConfig.properties)) {
                const property = classInterfaceConfig.properties[propertyName];
                const { isStatic, returns, isGetter, isSetter } = property;
                const { type: { refId } } = returns;
                let returnType = null
                const { isReferenceType } = TypeDefinition.find({ Id: refId });
                if (isReferenceType) {
                    returnType = new ReferenceType(refId);
                } else {
                    returnType = new PrimitiveType(refId);
                }
                const propertyParameters = [];
                for (const paramName of Object.keys(property.parameters)) {
                    const { type: { refId } } = property.parameters[paramName];
                    if (TypeDefinition.find({ Id: refId })) {
                        const field = {};
                        field[paramName] = null;
                        const memberParameter = new MemberParameter(field, refId);
                        propertyParameters.push(memberParameter);
                    } else {
                        throw new Error(`unable to resolve type ref id: ${refId}`);
                    }
                }
                properties.push(new PropertyMember(propertyName, isStatic, isGetter, isSetter, propertyParameters, returnType));
            }
            privateBag.set(classInterfaceConfig, {
                Id,
                name: className,
                classFilePath,
                ctor,
                methods,
                properties,
                ctorDependencies
            });
        }
        privateBag.set(this, classInterfaceConfig);
    }
    /**
     * @returns { String }
    */
    get Id() {
        const classInterfaceConfig = privateBag.get(this);
        const { Id } = privateBag.get(classInterfaceConfig);
        return Id;
    }
    /**
     * @param { String } paramName
     * @returns { String }
    */
    getDependencyId(paramName) {
        const classInterfaceConfig = privateBag.get(this);
        const { ctorDependencies } = privateBag.get(classInterfaceConfig);
        return ctorDependencies.find(x => x.paramName === paramName);
    }
    /**
     * @returns { String }
    */
    get name() {
        const targetClass = privateBag.get(this);
        const { name } = privateBag.get(targetClass);
        return name;
    }
    /**
    * @returns { String }
    */
    get filePath() {
        const targetClass = privateBag.get(this);
        const { filePath } = privateBag.get(targetClass);
        return filePath;
    }
    /**
     * @returns { Array<MethodMember> }
    */
    get methods() {
        const targetClass = privateBag.get(this);
        const { methods } = privateBag.get(targetClass);
        return methods;
    }
    /**
     * @returns { MethodMember }
    */
    get ctor() {
        const targetClass = privateBag.get(this);
        const { ctor } = privateBag.get(targetClass);
        return ctor;
    }
    /**
     * @returns { Array<PropertyMember> }
    */
    get properties() {
        const targetClass = privateBag.get(this);
        const { properties } = privateBag.get(targetClass);
        return properties;
    }
}