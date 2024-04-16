import { Bag, JSTypeAttribute, Reflection, State } from '../../registry.mjs';
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
            this.setProperty(secureContext, { attributes: {} });
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
     * @param { JSTypeAttribute } att
    */
    setAtt(att) {
        if (att === null || att === undefined || !(att instanceof JSTypeAttribute)) {
            throw new Error(`The att argument is null, undefined or not an instance of a ${JSTypeAttribute.name}`);
        }
        const attributes = this.getProperty(secureContext, { attributes: null });
        const { constructor } = Object.getPrototypeOf(att);
        if (attributes[constructor] === undefined) {
            attributes[constructor] = att;
        }
    }
    /**
     * @param { class } attType
    */
    hasAtt(attType) {
        if (attType === null || attType === undefined || !Reflection.isClass(attType) || Reflection.hasExtendedClass(JSTypeAttribute)) {
            throw new Error(`The attType argument is null, undefined, not a class or does not extend ${JSTypeAttribute.name}.`);
        }
        const attributes = this.getProperty(secureContext, { attributes: null });
        return attributes[attType] !== undefined;
    }
    /**
     * @param { class } attType
     * @returns { JSTypeAttribute }
    */
    getAtt(attType) {
        if (!this.hasAtt(attType)) {
            throw new Error(`${attType.name} does not exist.`);
        }
        const attributes = this.getProperty(secureContext, { attributes: null });
        return attributes[attType];
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