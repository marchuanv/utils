import {
    Bag,
    JSType,
    BagState,
    Reflection
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
        if (!Reflection.isTypeOf(name, String)) {
            throw new Error(`The name argument is not a string.`);
        }
        super(`Id: 5cb7458d-e96f-4acd-8c18-3703b55fc027, TypeId: ${jsType} MemberName: ${name}`, secureContext);
        if (this.hasState(secureContext, BagState.CONSTRUCT)) {
            if (!Reflection.isTypeOf(jsType, JSType)) {
                throw new Error(`The jsType argument is not an instance of ${JSType.name}.`);
            }
            if (!Reflection.isTypeOf(isConstructor, Boolean)) {
                throw new Error(`The isConstructor argument is not a boolean.`);
            }
            if (!Reflection.isTypeOf(isMethod, Boolean)) {
                throw new Error(`The isMethod argument is not a boolean.`);
            }
            if (!Reflection.isTypeOf(isProperty, Boolean)) {
                throw new Error(`The isProperty argument is not a boolean.`);
            }
            if (!Reflection.isTypeOf(isGetterProperty, Boolean)) {
                throw new Error(`The isGetterProperty argument is not a boolean.`);
            }
            if (!Reflection.isTypeOf(isSetterProperty, Boolean)) {
                throw new Error(`The isSetterProperty argument is not a boolean.`);
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