import {
    GUID,
    InterfaceRegistry,
    MemberParameter,
    MethodMember,
    PropertyMember,
    Type,
    readFileSync
} from '../registry.mjs';
const privateBag = new WeakMap();
export class ClassInterface {
    /**
     * @param { class } targetClass
    */
    constructor(targetClass) {
        const config = InterfaceRegistry.getConfig(targetClass);
        privateBag.set(this, config);
    }
    /**
     * @returns { String }
    */
    get Id() {
        const { Id } = privateBag.get(this);
        return Id;
    }
    /**
     * @returns { String }
    */
    get name() {
        const { name } = privateBag.get(this);
        return name;
    }
    /**
    * @returns { String }
    */
    get filePath() {
        const { filePath } = privateBag.get(this);
        return filePath;
    }
    /**
     * @returns { class }
    */
    get class() {
        const { classScriptFilePath } = privateBag.get(this);
        const scriptCode = readFileSync(classScriptFilePath);
        const script = new vm.Script(scriptCode);
        console.log(script);
    }
    /**
     * @returns { Array<MethodMember> }
    */
    get methods() {
        const config = privateBag.get(this);
        const methods = [];
        for (const method of config.methods) {
            const { name, isStatic, type } = method;
            const typeName = '';
            const nativeType = '';
            const _type = new Type(typeName, new GUID(), nativeType, null);
            const memberParameters = [];
            for (const param of method.parameters) {
                const memberParameter = new MemberParameter(param);
                memberParameters.push(memberParameter);
            }
            methods.push(new MethodMember(name, isStatic, false, memberParameters, _type));
        }
        return methods;
    }
    /**
     * @returns { MethodMember }
    */
    get ctor() {
        const config = privateBag.get(this);
        const { name, isStatic } = config.ctor;
        const memberParameters = [];
        for (const param of config.ctor.parameters) {
            const memberParameter = new MemberParameter(param);
            memberParameters.push(memberParameter);
        }
        return new MethodMember(name, isStatic, true, memberParameters, null);
    }
    /**
     * @returns { Array<PropertyMember> }
    */
    get properties() {
        const config = privateBag.get(this);
        const properties = [];
        for (const property of config.properties) {
            const { name, isStatic, isGetter, isSetter, returns } = property;
            const typeName = returns.typeName;
            const nativeType = returns.nativeType;
            let _type = null;
            if (typeName && nativeType) {
                _type = new Type(typeName, new GUID(), nativeType, null);
            }
            const memberParameters = [];
            for (const param of method.parameters) {
                const memberParameter = new MemberParameter(param);
                memberParameters.push(memberParameter);
            }
            properties.push(new PropertyMember(name, isStatic, isGetter, isSetter, memberParameters, _type));
        }
        return properties;
    }
}