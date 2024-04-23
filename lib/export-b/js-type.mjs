import { Bag, BagAttribute, Reflection, BagState } from '../../registry.mjs';
export class JSTypeAtt extends BagAttribute { }
const secureContext = Bag.getSecureContext();
export class JSType extends Bag {
    /**
     * @param { Function } func
     * @param { Object } defaultValue
     * @param { Boolean } isGenericType
     * @param { Boolean } isArray
    */
    constructor(func, defaultValue = null, isGenericType = false, isArray = false) {
        if (!Reflection.isTypeOf(func, [ Function, String ])) {
            throw new Error(`The func argument is not a function or a string.`);
        }
        const functionName = typeof func === 'function' ? func.name : func;
        super(`Function Id: 8cc733a9-02e2-4ab2-bca2-df230e68a1bd, Name: ${functionName}`, secureContext);
        if (this.hasState(secureContext, BagState.CONSTRUCT)) {
            if (!Reflection.isTypeOf(func, [Undefined, Null]) && Reflection.isTypeOf(func, Function)) {
                if (!Reflection.isTypeOf(isGenericType, Boolean)) {
                    throw new Error('The isGenericType argument is not a boolean.');
                }
                if (Reflection.isClass(func)) {
                    this.setProperty(secureContext, { isClass: true });
                } else {
                    this.setProperty(secureContext, { isClass: false });
                }
                if (Reflection.isTypeOf(func, Array)) {
                    isArray = true;
                }
                if (defaultValue === undefined) {
                    throw new Error('The defaultValue argument is undefined.');
                }
            }
            const extended = Reflection.getPrototypes(func);
            const index = extended.findIndex(x => x === func);
            extended.splice(0, index + 1);
            this.setProperty(secureContext, { name: func.name });
            this.setProperty(secureContext, { func });
            this.setProperty(secureContext, { defaultValue });
            this.setProperty(secureContext, { isGenericType });
            this.setProperty(secureContext, { isArray });
            this.setProperty(secureContext, { extended });
            this.setState(secureContext, BagState.HYDRATE);
        } else {
            this.setState(secureContext, BagState.REHYDRATE);
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
    /**
     * @returns { Array<class> }
    */
    get extended() {
        return this.getProperty(secureContext, { extended: null });
    }
    /**
     * @param { class } attType
     * @param { Function } func
    */
    hasAtt(attType = null, func = null) {
        if (Reflection.isTypeOf(attType, JSTypeAtt)) {
            if (Reflection.isTypeOf(func, Function)) {
                return this.hasAttribute(secureContext, new attType(func));
            } else {
                return this.hasAttributeType(secureContext, attType);
            }
        } else {
            return this.hasAttributes(secureContext);
        }
    }
    /**
     * @param { Function } func
     * @param { class } attType
    */
    setAtt(attType, func) {
        if (attType === null || attType === undefined) {
            throw new Error(`The attType argument is null or undefined.`);
        }
        if (func === null || func === undefined) {
            throw new Error(`The func argument is null or undefined.`);
        }
        if (this.hasAtt(attType, func)) {
            throw new Error(`attribute alreay exists.`);
        }
        const newAtt = new attType(func);
        this.setAttribute(secureContext, newAtt);
    }
    /**
     * @param { Function } func
     * @param { class } attType
     * @returns { Array<JSTypeAtt> }
    */
    *getAtt(attType, func = null) {
        if (attType === null || attType === undefined) {
            throw new Error(`The attType argument is null or undefined.`);
        }
        if (!this.hasAtt(attType, func)) {
            throw new Error(`no attribute(s) found.`);
        }
        if (func) {
            return yield this.getAttribute(secureContext, new attType(func));
        } else {
            for (const att of this.getAttributes(secureContext, attType)) {
                yield att;
            }
        }
    }
    /**
     * @returns { JSType }
    */
    static get NULL() {
        return new JSType(Null);
    }
    /**
     * @returns { JSType }
    */
    static get UNDEFINED() {
        return new JSType(Undefined);
    }
}
function Undefined() { }
function Null() { }