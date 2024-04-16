import { Bag, Reflection, State } from '../../registry.mjs';
const secureContext = Bag.getSecureContext();
export class JSType extends Bag {
    /**
     * @param { Function } func
     * @param { Object } defaultValue
     * @param { Boolean } isGenericType
     * @param { Boolean } isArray
    */
    constructor(func, defaultValue = null, isGenericType = false, isArray = false) {
        const targetClass = new.target;
        if (func === null || func === undefined || typeof func !== 'function') {
            throw new Error(`The func argument is null, undefined or not a function.`);
        }
        super(`Function Id: 8cc733a9-02e2-4ab2-bca2-df230e68a1bd, Name: ${func.name}`, secureContext);
        if (this.hasState(secureContext, State.CONSTRUCT)) {
            if (typeof isGenericType !== 'boolean') {
                throw new Error('The isGenericType argument is not a boolean.');
            }
            if (Reflection.isClass(func)) {
                this.setProperty(secureContext, { isClass: true });
            } else {
                this.setProperty(secureContext, { isClass: false });
            }
            if (func === Array) {
                isArray = true;
            }
            if (defaultValue === undefined) {
                throw new Error('The defaultValue argument is undefined.');
            }
            this.setProperty(secureContext, { name: func.name });
            this.setProperty(secureContext, { func });
            this.setProperty(secureContext, { defaultValue });
            this.setProperty(secureContext, { isGenericType });
            this.setProperty(secureContext, { isArray });
            if (targetClass === JSType) {
                this.setState(secureContext, State.HYDRATE);
            }
        } else {
            this.setState(secureContext, State.REHYDRATE);
        }
    }
    /**
     * @returns { String }
    */
    get name() {
        return this.getProperty(secureContext, { name: null });
    }
    /**
     * @returns { Function }
    */
    get func() {
        return this.getProperty(secureContext, { func: null });
    }
    /**
     * @returns { Object }
    */
    get defaultValue() {
        return this.getProperty(secureContext, { defaultValue: null });
    }
    /**
     * @returns { Boolean }
    */
    get isClass() {
        return this.getProperty(secureContext, { isClass: null });
    }
    /**
     * @returns { Boolean }
    */
    get isGenericType() {
        return this.getProperty(secureContext, { isGenericType: null });
    }
    /**
     * @returns { Boolean }
    */
    get isArray() {
        return this.getProperty(secureContext, { isArray: null });
    }
    static get NULL() {
    }
    static get UNDEFINED() {
    }
}
export class JSTypeMap extends JSType {
    /**
     * @param { Function | String } func
     * @param { Function | null | undefined } relatedFunc
    */
    constructor(func, relatedFunc = null) {
        if (func === null || func === undefined || !(typeof func === 'function' || typeof func === 'string')) {
            throw new Error(`The func argument is null, undefined, not a function or a string.`);
        }
        if (relatedFunc !== null && relatedFunc !== undefined && typeof relatedFunc !== 'function') {
            throw new Error(`The relatedFunc argument is not a function .`);
        }
        super(JSTypeMap);
        if (this.hasState(secureContext, State.CONSTRUCT)) {
            this.setProperty(secureContext, { mappings: [] });
            this.setState(secureContext, State.HYDRATE);
        } else {
            this.setState(secureContext, State.REHYDRATE);
        }
        const functionName = typeof func === 'function' ? func.name : func;
        const mappings = this.getProperty(secureContext, { mappings: null });
        if (relatedFunc) {
            mappings.push({ name: functionName, func: relatedFunc });
        }
        const mapping = mappings.find(mapping => mapping.name === functionName);
        if (mapping) {
            return new JSType(mapping.func);
        } else {
            throw new Error(`no mapping found for ${functionName}.`);
        }
    }
    /**
     * @param { Function | String } func
     * @returns { Boolean }
    */
    static has(func) {
        try {
            new JSTypeMap(func);
            return true;
        } catch {
            return false;
        }
    }
    /**
     * @param { Function | String } func
     * @returns { JSType }
    */
    static get(func) {
        return new JSTypeMap(func);
    }
    /**
     * @param { Function } funcA
     * @param { Function } funcB
     * @param { Object } defaultValue
     * @param { Boolean } isGenericType
     * @param { Boolean } isArray
    */
    static register(funcA, funcB, defaultValue = null, isGenericType = false, isArray = false) {
        if (funcA === null || funcA === undefined || typeof funcA !== 'function') {
            throw new Error(`The funcA argument is null, undefined or not a function.`);
        }
        if (funcB === null || funcB === undefined || typeof funcB !== 'function') {
            throw new Error(`The funcB argument is null, undefined or not a function.`);
        }
        if (typeof isGenericType !== 'boolean') {
            throw new Error('The isGenericType argument is not a boolean.');
        }
        new JSType(funcA, defaultValue, isGenericType, isArray);
        new JSType(funcB, defaultValue, isGenericType, isArray);
        return new JSTypeMap(funcA, funcB);
    }
    /**
     * @param { Function } func
    */
    static unregister(func) {
        if (func === null || func === undefined || typeof func !== 'function') {
            throw new Error(`The func argument is null, undefined or not a function.`);
        }
        const mapping = new JSTypeMap(func);
        mapping.dispose(State.HYDRATE);
        mapping.dispose(State.REHYDRATE);
    }
}