import {
    ClassIntegrity,
    GUID,
    MemberParameter,
    MethodMember,
    PrimitiveType,
    PropertyMember,
    ReferenceType,
    TypeDefinition
} from '../registry.mjs';
const privateBag = new WeakMap();
export class ClassInterface extends ClassIntegrity {
    /**
     * @param { Object } classInterfaceConfig
     * @param  { class } targetClass
    */
    constructor(classInterfaceConfig, targetClass) {
        const otherConfigurations = privateBag.get(ClassInterface);
        if (!privateBag.has(classInterfaceConfig)) {
            otherConfigurations.push(classInterfaceConfig);
            classInterfaceConfig.dependencies = {};
            TypeDefinition.registerClass(new GUID(classInterfaceConfig.Id), targetClass);
            const methods = [];
            const { Id, className, scriptFilePath, extend } = classInterfaceConfig;
            if (extend && extend.Id) {
                for (const method of extend.methods) {
                    if (!classInterfaceConfig.methods.find(x => x.name === method.name)) {
                        classInterfaceConfig.methods.push(method);
                    }
                }
                for (const property of extend.properties) {
                    if (!classInterfaceConfig.properties.find(x => x.name === property.name)) {
                        classInterfaceConfig.properties.push(property);
                    }
                }
                for (const ctorParam of extend.ctor.parameters) {
                    if (!classInterfaceConfig.ctor.parameters.find(x => x.name === ctorParam.name)) {
                        classInterfaceConfig.ctor.parameters.push(ctorParam);
                    }
                }
            }
            for (const methodName of classInterfaceConfig.methods) {
                const method = classInterfaceConfig.methods[methodName];
                const { isStatic, returns } = method;
                const { type: { $refId } } = returns;
                let returnType = null
                const { isReferenceType } = TypeDefinition.find({ Id: $refId });
                if (isReferenceType) {
                    returnType = new ReferenceType($refId);
                } else {
                    returnType = new PrimitiveType($refId);
                }
                const methodParameters = [];
                for (const paramName of Object.keys(method.parameters)) {
                    const { type: { $refId } } = method.parameters[paramName];
                    if (TypeDefinition.find({ Id: $refId })) {
                        const field = {};
                        field[paramName] = null;
                        const memberParameter = new MemberParameter(field, $refId, isReferenceType);
                        methodParameters.push(memberParameter);
                    } else {
                        throw new Error(`unable to resolve type ref id: ${$refId}`);
                    }
                }
                methods.push(new MethodMember(methodName, isStatic, false, methodParameters, returnType));
            }
            const ctorMemberParameters = [];
            for (const param of classInterfaceConfig.ctor.parameters) {
                const { Id, typeName } = param.typeDefinition;
                if (TypeDefinition.find({ Id })) {
                    const field = {};
                    field[param.name] = null;
                    const memberParameter = new MemberParameter(field, Id);
                    if (!memberParameter.typeDefinition.isObject && !memberParameter.typeDefinition.isArray && memberParameter.typeDefinition.isReferenceType) {
                        const otherClassInterfaceConfig = otherConfigurations.find(c => c.Id === memberParameter.typeDefinition.Id.toString());
                        const { className } = otherClassInterfaceConfig;
                        classInterfaceConfig.dependencies[className] = otherClassInterfaceConfig;
                    }
                    ctorMemberParameters.push(memberParameter);
                } else {
                    throw new Error(`unable to resolve type ref id: ${Id}, typeName: ${typeName}`);
                }
            }

            const ctorTypeDefinition = TypeDefinition.find({ Id: classInterfaceConfig.Id });
            const ctor = new MethodMember(className, false, true, ctorMemberParameters, ctorTypeDefinition);

            const properties = [];
            for (const property of classInterfaceConfig.properties) {
                const { isStatic, isGetter, isSetter } = property;
                const { Id, typeName } = property.typeDefinition;
                const typeDef = TypeDefinition.find({ Id });
                if (typeDef) {
                    const { isReferenceType } = typeDef;
                    let returnType = null;
                    if (isReferenceType) {
                        returnType = new ReferenceType(Id);
                    } else {
                        returnType = new PrimitiveType(Id);
                    }
                    const propertyParameters = [];
                    for (const param of property.parameters) {
                        const { Id, typeName } = param.typeDefinition;
                        if (TypeDefinition.find({ Id })) {
                            const field = {};
                            field[param.name] = null;
                            const memberParameter = new MemberParameter(field, Id);
                            propertyParameters.push(memberParameter);
                        } else {
                            throw new Error(`unable to resolve type ref id: ${$refId}`);
                        }
                    }
                    properties.push(new PropertyMember(property.name, isStatic, isGetter, isSetter, propertyParameters, returnType));
                } else {
                    throw new Error(`unable to resolve type ref id: ${Id}, typeName: ${typeName}`);
                }
            }
            privateBag.set(classInterfaceConfig, {
                Id,
                name: className,
                scriptFilePath,
                ctor,
                methods,
                properties,
                schema: null
            });
            super(ctor);
            privateBag.set(this, classInterfaceConfig);
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
    get dependencies() {
        const classInterfaceConfig = privateBag.get(this);
        return classInterfaceConfig.dependencies;
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
    /**
     * @param { String } Id
     * @returns { ClassInterface }
    */
    static find(Id) {
        const configurations = privateBag.get(ClassInterface);
        const classInterfaces = configurations.map(config => privateBag.get(config));
        return classInterfaces.find(ci => ci.Id === Id);
    }
}
privateBag.set(ClassInterface, []);