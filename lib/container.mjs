import {
    ClassInterface,
    GUID,
    MemberParameter,
    TypeDefinition
} from '../registry.mjs';
const privateBag = new WeakMap();
export class Container {
    /**
     * @param { Array<MemberParameter> } memberParameters
    */
    constructor(memberParameters) {
        let targetClass = new.target;
        if (targetClass === Container.prototype || targetClass === Container) {
            throw new Error(`${Container.name} class is abstract`);
        }
        if (privateBag.has(targetClass)) {
            const { classInterface } = privateBag.get(targetClass);
            if (!classInterface) {
                throw new Error('call register method on the container');
            }
        } else {
            const { classConfig } = TypeDefinition.find({ type: targetClass });
            const classInterface = new ClassInterface(classConfig, targetClass);
            privateBag.set(targetClass, { members: memberParameters, classInterface });
        }
        privateBag.set(this, targetClass);
        Object.freeze(this);
    }
    /**
     * @returns { GUID }
    */
    get Id() {
        const targetClass = privateBag.get(this);
        const { classInterface } = privateBag.get(targetClass);
        return classInterface.Id;
    }
    /**
     * @returns { ClassInterface }
    */
    get interface() {
        const targetClass = privateBag.get(this);
        const { classInterface } = privateBag.get(targetClass);
        return classInterface;
    }
    /**
     * @returns { ClassInterface }
    */
    get targetClass() {
        const targetClass = privateBag.get(this);
        return targetClass;
    }
    /**
     * @returns { Array<MemberParameter> }
    */
    get parameters() {
        const targetClass = privateBag.get(this);
        const { members } = privateBag.get(targetClass);
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
     * @template T
     * @param { String } data
     * @param { T } targetClass
     * @returns { T }
    */
    static async deserialise(data, targetClass) {
        const args = JSON.parse(data);
        const keys = Object.keys(args);
        const { classConfig } = TypeDefinition.find({ type: targetClass });
        const classInterface = new ClassInterface(classConfig, targetClass);
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
        await classInterface.validate();
        return Reflect.construct(targetClass, classInterface.ctor.parameters.map(p => p.value));
    }
}