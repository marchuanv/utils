import { Bag, BagAttribute, Reflection, State } from '../../registry.mjs';
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
        if (func === null || func === undefined || !(typeof func === 'function' || typeof func === 'string')) {
            throw new Error(`The func argument is null, undefined, not a function or a string.`);
        }
        const functionName = typeof func === 'function' ? func.name : func;
        super(`Function Id: 8cc733a9-02e2-4ab2-bca2-df230e68a1bd, Name: ${functionName}`, secureContext);
        if (this.hasState(secureContext, State.CONSTRUCT)) {
            if (func !== Undefined && func !== Null) {
                if (func === null || func === undefined || typeof func !== 'function') {
                    throw new Error(`The func argument is null, undefined, or not a function.`);
                }
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
            this.setProperty(secureContext, { attributeIds: [] });
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
     * @param { Function } func
     * @param { class } attType
    */
    setAtt(func) {
        if (func === null || func === undefined) {
            throw new Error(`The func argument is null or undefined.`);
        }
        if (attType === null || attType === undefined) {
            throw new Error(`The attType argument is null or undefined.`);
        }
        if (this.hasAtt(func, attType)) {
            throw new Error(`attribute alreay exists.`);
        }
        const newAtt = new attType(func);
        this.setAttribute(secureContext, newAtt);
        const attributeIds = this.getProperty(secureContext, { attributeIds: null });
        attributeIds.push(newAtt.Id);
    }
    /**
     * @param { Function } func
     * @param { class } attType
    */
    hasAtt(func = null, attType = null) {
        if (func !== null && func !== undefined && typeof func !== 'function') {
            throw new Error(`The func argument is not a function.`);
        }
        if (attType !== null && attType !== undefined && !Reflection.isClass(attType) || !Reflection.hasExtendedClass(attType, JSTypeAtt)) {
            throw new Error(`The attType argument is not a class or does not extend ${JSType.name}.`);
        }
        const attributeIds = this.getProperty(secureContext, { attributeIds: null });
        if (func && attType) {
            return attributeIds.some(attId => this.hasAttribute(secureContext, attId));
        } else if (attributeIds.length > 0) {
            return true;
        } else {
            return false;
        }
    }
    /**
     * @param { Function } func
     * @param { class } attType
     * @returns { Array<JSTypeAtt> }
    */
    *getAtt(func = null, attType = null) {
        if (!this.hasAtt(func, attType)) {
            throw new Error(`no attribute(s) found.`);
        }
        if (func && attType) {
            const att = new attType(func);
            return yield super.getAttribute(secureContext, att);
        } else {
            const attributeIds = this.getProperty(secureContext, { attributeIds: null });
            for (const attId of attributeIds) {
                yield super.getAttribute(secureContext, attId);
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