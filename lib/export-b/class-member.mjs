import {
    Bag,
    JSType,
    BagState
} from "../../registry.mjs";
const secureContext = Bag.getSecureContext();
export class ClassMember extends Bag {
    /**
     * @param { String } name
     * @param { JSType } jsType
     * @param { Boolean } isConstructor
     * @param { Boolean } isMethod
     * @param { Boolean } isProperty
     * @param { Boolean } isGetterProperty
     * @param { Boolean } isSetterProperty
    */
    constructor(name, jsType, isConstructor = null, isMethod = null, isProperty = null, isGetterProperty = null, isSetterProperty = null) {
        if (name == null || name === undefined || typeof name !== 'string') {
            throw new Error(`The name argument is null, undefined or not a string.`);
        }
        super(`Id: 5cb7458d-e96f-4acd-8c18-3703b55fc027, TypeId: ${jsType} MemberName: ${name}`, secureContext);
        if (this.hasState(secureContext, BagState.CONSTRUCT)) {
            if (jsType == null || jsType === undefined || !(jsType instanceof JSType)) {
                throw new Error(`The jsType argument is null, undefined or not an instance of ${JSType.name}.`);
            }
            if (isConstructor == null || isConstructor === undefined || typeof isConstructor !== 'boolean') {
                throw new Error(`The isConstructor argument is null, undefined or not a boolean.`);
            }
            if (isMethod == null || isMethod === undefined || typeof isMethod !== 'boolean') {
                throw new Error(`The isMethod argument is null, undefined or not a boolean.`);
            }
            if (isProperty == null || isProperty === undefined || typeof isProperty !== 'boolean') {
                throw new Error(`The isProperty argument is null, undefined or not a boolean.`);
            }
            if (isGetterProperty == null || isGetterProperty === undefined || typeof isGetterProperty !== 'boolean') {
                throw new Error(`The isGetterProperty argument is null, undefined or not a boolean.`);
            }
            if (isSetterProperty == null || isSetterProperty === undefined || typeof isSetterProperty !== 'boolean') {
                throw new Error(`The isSetterProperty argument is null, undefined or not a boolean.`);
            }
            this.setProperty(secureContext, { name });
            this.setProperty(secureContext, { jsType });
            this.setProperty(secureContext, { isConstructor });
            this.setProperty(secureContext, { isMethod });
            this.setProperty(secureContext, { isProperty });
            this.setProperty(secureContext, { isGetterProperty });
            this.setProperty(secureContext, { isSetterProperty });
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
     * @returns { JSType }
    */
    get type() {
        return this.getProperty(secureContext, { jsType: null });
    }
    /**
     * @returns { Boolean }
    */
    get isConstructor() {
        return this.getProperty(secureContext, { isConstructor: null });
    }
    /**
     * @returns { Boolean }
    */
    get isMethod() {
        return this.getProperty(secureContext, { isMethod: null });
    }
    /**
     * @returns { Boolean }
    */
    get isProperty() {
        return this.getProperty(secureContext, { isProperty: null });
    }
    /**
     * @returns { Boolean }
    */
    get isGetterProperty() {
        return this.getProperty(secureContext, { isGetterProperty: null });
    }
    /**
     * @returns { Boolean }
    */
    get isSetterProperty() {
        return this.getProperty(secureContext, { isSetterProperty: null });
    }
}