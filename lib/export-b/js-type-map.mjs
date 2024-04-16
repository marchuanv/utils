import { Bag, Reflection, State, UUID, UUIDMap } from '../../registry.mjs';
const secureContext = Bag.getSecureContext();
export class JSType extends Bag {
    /**
     * @param { Function } func
     * @param { Object } defaultValue
     * @param { Boolean } isGenericType
    */
    constructor(func, defaultValue = null, isGenericType = false) {
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
            if (defaultValue === undefined) {
                throw new Error('The defaultValue argument is undefined.');
            }
            this.setProperty(secureContext, { name: func.name });
            this.setProperty(secureContext, { func });
            this.setProperty(secureContext, { defaultValue });
            this.setProperty(secureContext, { isGenericType });
            this.setState(secureContext, State.HYDRATE);
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
}
export class JSTypeMap extends Bag {
    /**
     * @param { String } name
     * @param { Array<JSType> } jsTypes
    */
    constructor(name, jsTypes = []) {
        if (name === null || name === undefined || typeof name !== 'string') {
            throw new Error(`The name argument is null, undefined or not a string.`);
        }
        super(`Map Id: 4aac740e-1c8e-442e-935a-d9db24d83e15, Name: ${name}`, secureContext);
        if (this.hasState(secureContext, State.CONSTRUCT)) {
            if (jsTypes=== null || jsTypes === undefined || !Array.isArray(jsTypes) || jsTypes.length === 0 || !jsTypes.every(jsType => jsType instanceof JSType) ) {
                throw new Error('The functions argument is null, undefined or not an array of functions.');
            }
            this.setProperty(secureContext, { name });
            this.setProperty(secureContext, { jsTypes });
            this.setState(secureContext, State.HYDRATE);
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
     * @returns { Array<JSType> }
    */
    get types() {
        return this.getProperty(secureContext, { jsTypes: null });
    }
    /**
     * @param { Function | String } func
     * @returns { Boolean }
    */
    static has(func) {
        if (func === null || func === undefined || typeof func !== 'function') {
            throw new Error(`The func argument is null, undefined or not a function.`);
        }
        try {
            const name = typeof func === 'function' ? func.name : func;
            new JSTypeMap(name);
            return true;
        } catch {
            return false;
        }
    }
    /**
     * @param { Function | String } func
     * @returns { Array<JSType> }
    */
    static get(func) {
        if (func === null || func === undefined || !(typeof func === 'function' || typeof func === 'string') ) {
            throw new Error(`The func argument is null, undefined, not a function or a string.`);
        }
        const name = typeof func === 'function' ? func.name : func;
        if (!JSTypeMap.has(func)) {
            throw new Error(`no mapping found for ${name}.`)
        }
        const mapping = new JSTypeMap(name);
        return mapping.types;
    }
    /**
     * @param { Function } funcA
     * @param { Function } funcB
     * @param { Object } defaultValue
     * @param { Boolean } isGenericType
    */
    static register(funcA, funcB, defaultValue = null, isGenericType = false) {
        if (funcA === null || funcA === undefined || typeof funcA !== 'function') {
            throw new Error(`The funcA argument is null, undefined or not a function.`);
        }
        if (funcB === null || funcB === undefined || typeof funcB !== 'function') {
            throw new Error(`The funcB argument is null, undefined or not a function.`);
        }
        if (typeof isGenericType !== 'boolean') {
            throw new Error('The isGenericType argument is not a boolean.');
        }
        new JSTypeMap(funcA.name, [ new JSType(funcB, defaultValue, isGenericType) ]);
    }
    /**
     * @param { Function } func
    */
    static unregister(func) {
        if (func === null || func === undefined || typeof func !== 'function') {
            throw new Error(`The func argument is null, undefined or not a function.`);
        }
        const mapping = new JSTypeMap(func.name);
        mapping.dispose(State.HYDRATE);
        mapping.dispose(State.REHYDRATE);
    }
}