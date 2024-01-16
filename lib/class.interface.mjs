import {
    InterfaceRegistry,
    MemberParameter,
    MethodMember,
    PropertyMember,
    TypeMapper
} from '../registry.mjs';
const privateBag = new WeakMap();
export class ClassInterface {
    /**
     * @param { class } targetClass
    */
    constructor(targetClass) {
        if (!privateBag.has(targetClass)) {
            const config = InterfaceRegistry.getConfig(targetClass);
            const methods = [];
            const { Id, className, classFilePath, classExtendedFilePath } = config;
            for (const methodName of Object.keys(config.methods)) {
                const method = config.methods[methodName];
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
                    const { type } = method.parameters[paramName];
                    const { typeName, isReferenceType } = type;
                    const field = {};
                    field[paramName] = null;
                    const memberParameter = new MemberParameter(field, typeName, isReferenceType);
                    methodParameters.push(memberParameter);
                }
                methods.push(new MethodMember(methodName, isStatic, false, methodParameters, returnType));
            }

            const ctorMemberParameters = [];
            for (const paramName of Object.keys(config.ctor.parameters)) {
                const { type } = config.ctor.parameters[paramName];
                const { typeName, isReferenceType } = type;
                const field = {};
                field[paramName] = null;
                const memberParameter = new MemberParameter(field, typeName, isReferenceType);
                ctorMemberParameters.push(memberParameter);
            }
            const ctor = new MethodMember(className, false, true, ctorMemberParameters, null);

            const properties = [];
            for (const propertyName of Object.keys(config.properties)) {
                const property = config.properties[propertyName];
                const { isStatic, returns, isGetter, isSetter } = property;
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
                const propertyParameters = [];
                for (const paramName of Object.keys(property.parameters)) {
                    const { type } = property.parameters[paramName];
                    const { typeName, isReferenceType } = type;
                    const field = {};
                    field[paramName] = null;
                    const memberParameter = new MemberParameter(field, typeName, isReferenceType);
                    propertyParameters.push(memberParameter);
                }
                properties.push(new PropertyMember(propertyName, isStatic, isGetter, isSetter, propertyParameters, returnType));
            }

            privateBag.set(targetClass, {
                Id,
                name: className,
                classFilePath,
                classExtendedFilePath,
                ctor,
                methods,
                properties
            });
        }
        privateBag.set(this, targetClass);
    }
    /**
     * @returns { String }
    */
    get Id() {
        const targetClass = privateBag.get(this);
        const { Id } = privateBag.get(targetClass);
        return Id;
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