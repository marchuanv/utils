import { Bag, Reflection, State, UUID } from '../../registry.mjs';
const secureContext = Bag.getSecureContext();
export class JSTypeMap extends Bag {
    /**
     * @param { UUID } Id
     * @param { Function } func
     * @param { Object } defaultValue
     * @param { Boolean } isGenericType
    */
    constructor(Id, func = null, defaultValue = null, isGenericType = false) {
        if (!(Id instanceof UUID)) {
            throw new Error(`The Id argument is not an instance of ${UUID.name}.`);
        }
        super(Id.toString(), secureContext);
        if (this.hasState(secureContext, State.CONSTRUCT)) {
            if (typeof func !== 'function') {
                throw new Error('The func argument is not a function.');
            }
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
            this.setProperty(secureContext, { link: [] });
            this.setState(secureContext, State.HYDRATE);
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
     * @returns { Array<UUID> }
    */
    get link() {
        return this.getProperty(secureContext, { link: null });
    }
    /**
     * @param { Function } funcA
     * @param { Function } funcB
     * @param { Object } defaultValue
     * @param { Boolean } isGenericType
    */
    static register(funcA, funcB, defaultValue, isGenericType = false) {
        if (typeof funcA !== 'function') {
            throw new Error('The funcA argument is not a function.');
        }
        if (typeof funcB !== 'function') {
            throw new Error('The funcB argument is not a function.');
        }
        if (typeof isGenericType !== 'boolean') {
            throw new Error('The isGenericType argument is not a boolean.');
        }
        map([funcA, funcB], defaultValue, isGenericType);
    }
    /**
     * @param { Function | String } func
     * @returns { Boolean }
    */
    static has(func) {
        const isFuncValid = func && (typeof func === 'function' || typeof func === 'string');
        if (isFuncValid) {
            const mappings = [];
            try {
                const jsTypeMap = map([func]);
                for (const link of jsTypeMap.link) {
                    mappings.push(new JSTypeMap(link));
                }
                mappings.push(jsTypeMap);
            } catch (error) {
                console.log(error);
            }
            return mappings.some(jsTypeMap => jsTypeMap.func !== func);
        }
        return false;
    }
    /**
     * @param { Function | String } func
     * @returns { Array<JSTypeMap> }
    */
    static *get(func) {
        const isFuncValid = func && (typeof func === 'function' || typeof func === 'string');
        if (isFuncValid) {
            const jsTypeMap = map([func]);
            for (const link of jsTypeMap.link) {
                yield new JSTypeMap(link);
            }
            yield jsTypeMap;
        } else {
            throw new Error('The func argument is not a function or a string.');
        }
    }
}
/**
 * @param { Array<Function> } functions
 * @param { Object } defaultValue
 * @param { Boolean } isGenericType
 * @returns { JSTypeMap }
*/
function map(functions, defaultValue = null, isGenericType = null) {
    let func = functions.shift();
    let functionName = typeof func === 'function' ? func.name : func;
    let Id = new UUID(functionName);
    let jsType = new JSTypeMap(Id, func, defaultValue, isGenericType);
    for (const otherFunc of functions) {
        functionName = typeof otherFunc === 'function' ? otherFunc.name : otherFunc;
        const _Id = new UUID(functionName);
        jsType.link.push(_Id);
        const _jsType = new JSTypeMap(_Id, otherFunc, defaultValue, isGenericType);
        _jsType.link.push(Id);
    }
    return jsType
}