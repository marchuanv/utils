import { GUID } from "../../registry.mjs";
const privateBag = new WeakMap();
export class Type {
    /**
     * @param { String } name
     * @param { GUID } Id
     * @param { Object } nativeType
     * @param { Object } defaultValue
    */
    constructor(name, Id, nativeType, defaultValue) {
        let _targetClass = new.target;
        if (_targetClass === Type.prototype) {
            throw new Error(`${Type.name} class is abstract`);
        }
        if (!name) {
            throw new Error('name argument is empty, null or undefined');
        }
        const _name = name.toLowerCase();
        if (!Id) {
            throw new Error('Id argument is empty, null or undefined');
        }
        if (!nativeType) {
            throw new Error('nativeType argument is null or undefined');
        }
        if (!nativeType.name) {
            throw new Error('nativeType agrument does not have a name');
        }
        privateBag.set(this, { name: _name, Id, nativeType, defaultValue });
    }
    /**
     * @returns { GUID }
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
     * @returns { Object }
    */
    get nativeType() {
        const { nativeType } = privateBag.get(this);
        return nativeType;
    }
    /**
     * @returns { Boolean }
    */
    get isArray() {
        const { nativeType } = privateBag.get(this);
        return nativeType === Array;
    }
    /**
     * @returns { Boolean }
    */
    get isObject() {
        const { nativeType } = privateBag.get(this);
        return nativeType === Object;
    }
    /**
     * @returns { Object }
    */
    get defaultValue() {
        const { defaultValue } = privateBag.get(this);
        return defaultValue;
    }
    /**
     * @returns { String }
    */
    toString() {
        const { nativeType } = privateBag.get(this);
        return nativeType.name.toLowerCase();
    }
}