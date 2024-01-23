import {
    ClassIntegrity,
    Container,
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
        if (!TypeDefinition.find({ type: targetClass })) {
            throw new Error(`${targetClass.name} type defintion is not registered.`);
        }
        if (privateBag.has(classInterfaceConfig)) {
            const { ctor } = privateBag.get(classInterfaceConfig);
            super(ctor);
            privateBag.set(this, classInterfaceConfig);
            return;
        }
        let classExtends = [];
        let prototype = Object.getPrototypeOf(targetClass);
        while (prototype) {
            if (prototype.name) {
                classExtends.push(prototype);
            }
            prototype = Object.getPrototypeOf(prototype);
        }
        if (!classExtends.find(x => x === Container)) {
            throw new Error(`${targetClass.name} does not directly or indirectly extend ${Container.name}`);
        }
        classExtends = classExtends.filter(x => x !== Container);
        const { dependencies } = classInterfaceConfig;
        const classExtDepConfigurations = dependencies
            .map(dep => {
                const { classConfig } = TypeDefinition.find(dep);
                return classConfig;
            })
            .filter(config => classExtends.find(ext => ext.name === config.className));
        if (classExtDepConfigurations.length !== classExtends.length) {
            throw new Error(`class and class config mismatch, not all class extends, i.e. dependencies are configured in ${classInterfaceConfig}`);
        }
        for (const config of classExtDepConfigurations) {
            if (!privateBag.has(config)) {
                const { type } = TypeDefinition.find({ Id: config.Id });
                new ClassInterface(config, type);
            }
            for (const method of config.methods) {
                if (!classInterfaceConfig.methods.find(x => x.name === method.name)) {
                    classInterfaceConfig.methods.push(method);
                }
            }
            for (const property of config.properties) {
                if (!classInterfaceConfig.properties.find(x => x.name === property.name)) {
                    classInterfaceConfig.properties.push(property);
                }
            }
            for (const ctorParam of config.ctor.parameters) {
                if (!classInterfaceConfig.ctor.parameters.find(x => x.name === ctorParam.name)) {
                    classInterfaceConfig.ctor.parameters.push(ctorParam);
                }
            }
        }
        const ctorClassDepConfigurations = classInterfaceConfig.dependencies
            .map(dep => {
                const { classConfig } = TypeDefinition.find(dep);
                return classConfig;
            })
            .filter(config => classInterfaceConfig.ctor.parameters.find(param => param.typeDefinition.typeName === config.className));
        for (const ctorClassDepConfig of ctorClassDepConfigurations) {
            if (!privateBag.has(ctorClassDepConfig)) {
                const { type } = TypeDefinition.find({ Id: ctorClassDepConfig.Id });
                new ClassInterface(ctorClassDepConfig, type);
            }
        }
        const ctorMemberParameters = [];
        for (const param of classInterfaceConfig.ctor.parameters) {
            const { Id, typeName } = param.typeDefinition;
            if (TypeDefinition.find({ Id })) {
                const field = {};
                field[param.name] = null;
                const memberParameter = new MemberParameter(field, Id);
                ctorMemberParameters.push(memberParameter);
            } else {
                throw new Error(`unable to resolve type ref id: ${Id}, typeName: ${typeName}`);
            }
        }
        const ctorTypeDefinition = TypeDefinition.find({ Id: classInterfaceConfig.Id });
        const ctor = new MethodMember(classInterfaceConfig.ctor.name, false, true, ctorMemberParameters, ctorTypeDefinition);
        const methods = [];
        const { Id, className, scriptFilePath } = classInterfaceConfig;
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
            schema: null,
            dependencies: ctorClassDepConfigurations
        });
        super(ctor);
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
        const { dependencies } = privateBag.get(classInterfaceConfig);
        return dependencies;
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