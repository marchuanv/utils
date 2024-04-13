import { Bag, State } from "../export-a/bag.mjs";
import { Reflection } from "../reflection.mjs";
import { UUID } from "../uuid.mjs";
import { BagState } from "./bag-state.mjs";
const secureContext = Bag.getSecureContext();
export class JSTypeMap extends BagState {
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
        if (this.isAtState(State.CONSTRUCT)) {
            if (typeof func !== 'function') {
                throw new Error('The func argument is not a function.');
            }
            if (typeof isGenericType !== 'boolean') {
                throw new Error('The isGenericType argument is not a boolean.');
            }
            if (Reflection.isClass(func)) {
                this.setPropertyValue({ isClass: true });
            } else {
                this.setPropertyValue({ isClass: false });
            }
            if (defaultValue === undefined) {
                throw new Error('The defaultValue argument is undefined.');
            }
            this.setPropertyValue({ name: func.name });
            this.setPropertyValue({ func });
            this.setPropertyValue({ defaultValue });
            this.setPropertyValue({ isGenericType });
            this.setPropertyValue({ link: [] });
            this.setState(State.HYDRATE);
        }
    }
    /**
     * @returns { String }
    */
    get name() {
        return this.getPropertyValue({ name: null });
    }
    /**
     * @returns { Function }
    */
    get func() {
        return this.getPropertyValue({ func: null });
    }
    /**
     * @returns { Object }
    */
    get defaultValue() {
        return this.getPropertyValue({ defaultValue: null });
    }
    /**
     * @returns { Boolean }
    */
    get isClass() {
        return this.getPropertyValue({ isClass: null });
    }
    /**
     * @returns { Boolean }
    */
    get isGenericType() {
        return this.getPropertyValue({ isGenericType: null });
    }
    /**
     * @returns { Array<UUID> }
    */
    get link() {
        return this.getPropertyValue({ link: null });
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