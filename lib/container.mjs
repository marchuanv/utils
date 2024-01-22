import {
    ClassInterface,
    GUID,
    MemberParameter,
    existsSync,
    readFileSync
} from '../registry.mjs';
const privateBag = new WeakMap();
const configurations = [];
export class Container {
    /**
     * @param { Array<MemberParameter> } memberParameters
     * @param { GUID } referenceId
    */
    constructor(memberParameters, referenceId = null) {
        let targetClass = new.target;
        if (targetClass === Container.prototype) {
            throw new Error(`${Container.name} class is abstract`);
        }
        let _refId = referenceId;
        if (!_refId) {
            _refId = new GUID();
        }
        if (privateBag.has(_refId)) {
            const { classInterface } = privateBag.get(_refId);
            if (!classInterface) {
                throw new Error('call register method on the container');
            }
        } else {
            if (!privateBag.has(targetClass)) {
                throw new Error(`targetClass is not registered`);
            }
            const classInterface = privateBag.get(targetClass);
            privateBag.set(_refId, {
                members: memberParameters,
                targetClass,
                classInterface
            });
        }
        privateBag.set(this, _refId);
        Object.freeze(this);
    }
    /**
     * @returns { GUID }
    */
    get Id() {
        const refId = privateBag.get(this);
        return refId;
    }
    /**
     * @returns { ClassInterface }
    */
    get interface() {
        const { classInterface } = privateBag.get(this.Id);
        return classInterface;
    }
    /**
     * @returns { ClassInterface }
    */
    get targetClass() {
        const { targetClass } = privateBag.get(this.Id);
        return targetClass;
    }
    /**
     * @returns { Array<MemberParameter> }
    */
    get parameters() {
        const { members } = privateBag.get(this.Id);
        return members;
    }
    async serialise() {
        for (const memberParam of this.parameters) {
            if (memberParam.value instanceof Container) {
                const instance = memberParam.value;
                const serialisedStr = await instance.serialise();
                memberParam.value = JSON.parse(serialisedStr);
            }
        }
        const obj = this.parameters.reduce((_obj, memberParam) => {
            _obj[memberParam.name] = memberParam.value;
            return _obj;
        }, {});
        return JSON.stringify(obj);
    }
    /**
     * @param  { String } classInterfaceFilePath
     * @param  { class } targetClass
    */
    static register(classInterfaceFilePath, targetClass) {
        if (!existsSync(classInterfaceFilePath)) {
            throw new Error(`${classInterfaceFilePath} does not exist`);
        }
        if (!privateBag.has(targetClass)) {
            const configStr = readFileSync(classInterfaceFilePath, 'utf8');
            let classInterfaceConfig = JSON.parse(configStr);
            const configKey = Object.keys(classInterfaceConfig)[0];
            classInterfaceConfig = classInterfaceConfig[configKey];
            const { extend } = classInterfaceConfig;
            if (extend && Object.keys(extend).length > 0) {
                const { type } = extend;
                const { $refId } = type;
                const found = configurations.find(otherClassConfig => otherClassConfig.Id === $refId);
                classInterfaceConfig.extend = found;
            }
            configurations.push(classInterfaceConfig);
            const classInterface = new ClassInterface(classInterfaceConfig, targetClass);
            privateBag.set(targetClass, classInterface);
        }
    }
    /**
     * @template T
     * @param { String } data
     * @param { T } targetClass
     * @returns { T }
    */
    static async deserialise(data, targetClass) {
        const args = JSON.parse(data);
        const keys = Object.keys(args);
        const classInterface = getClassInterface(targetClass);
        if (!classInterface) {
            throw new Error('critical error');
        }
        for (const key of keys) {
            const value = args[key];
            const found = classInterface.ctor.parameters.find(mp => mp.name === key);
            if (found) {
                found.value = value;
            } else {
                throw new Error(`could not find ctor parameter called: ${key}`);
            }
        }
        await classInterface.schema.validate();
        return Reflect.construct(targetClass, classInterface.ctor.parameters.map(p => p.value));
    }
}
/**
 * @param { Object } targetClass
 * @returns { ClassInterface }
*/
function getClassInterface(targetClass) {
    const classInterface = privateBag.get(targetClass);
    return classInterface;
}