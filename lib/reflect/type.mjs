const privateBag = new WeakMap();
export class Type {
    /**
     * @param { String } name
     * @param { Object } nativeType
    */
    constructor(name, nativeType) {
        if (!name) {
            throw new Error('name argument is empty, null or undefined');
        }
        if (!nativeType) {
            throw new Error('nativeType argument is null or undefined');
        }
        if (!nativeType.name) {
            throw new Error('nativeType agrument does not have a name');
        }
        privateBag.set(this, { name, nativeType });
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
     * @returns { String }
    */
    toString() {
        const { nativeType } = privateBag.get(this);
        return nativeType.name.toLowerCase();
    }
}