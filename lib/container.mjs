import {
    ClassInterface,
    GUID,
    MemberParameter,
    Schema,
    existsSync,
    readFileSync
} from '../registry.mjs';
const privateBag = new WeakMap();
const configurations = [];
export class Container extends Schema {
    /**
     * @param { Array<MemberParameter> } memberParameters
     * @param { GUID } referenceId
    */
    constructor(memberParameters, referenceId = null) {
        let targetClass = new.target;
        if (targetClass === Container.prototype) {
            throw new Error(`${Container.name} class is abstract`);
        }
        super();
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
        super.create();
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
            if (classInterfaceConfig.extend && classInterfaceConfig.extend.Id) {
                const found = configurations.find(otherClassConfig => {
                    return otherClassConfig.Id === classInterfaceConfig.extend.Id
                });
                const otherKey = Object.keys(found)[0];
                classInterfaceConfig.extend = found[otherKey];
            }
            configurations.push(classInterfaceConfig);
            const classInterface = new ClassInterface(classInterfaceConfig, targetClass);
            privateBag.set(targetClass, classInterface);
        }
    }
}