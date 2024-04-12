import {
    Bag,
    BagState,
    Property,
    State,
    TypeInfo
} from "../../registry.mjs";
export class TypeMemberInfo extends BagState {
    /**
     * @param { String } name
     * @param { TypeInfo } typeInfo
     * @param { Boolean } isMethod
     * @param { Boolean } isGetterProperty
     * @param { Boolean } isSetterProperty
     * @param { SecureContext } secureContext
    */
    constructor(name, typeInfo, isConstructor, isMethod, isProperty, isGetterProperty, isSetterProperty, secureContext) {
        const targetClass = new.target;
        if (targetClass !== TypeMemberInfo) {
            throw new Error(`${TypeMemberInfo.name} is a sealed class.`);
        }
        if (name == null || name === undefined || typeof name !== 'string') {
            throw new Error(`The name argument is null, undefined or not a string.`);
        }
        super(`Id: 5cb7458d-e96f-4acd-8c18-3703b55fc027, name: ${name}-member-info`, secureContext);
        if (this.isAtState(State.CONSTRUCT)) {
            if (typeInfo == null || typeInfo === undefined || !(typeInfo instanceof TypeInfo)) {
                throw new Error(`The typeInfo argument is not an instance of a ${TypeInfo.name}.`);
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
            Bag.setProperty(this, secureContext, new Property('name', name));
            Bag.setProperty(this, secureContext, new Property('typeInfo', typeInfo));
            Bag.setProperty(this, secureContext, new Property('isConstructor', isConstructor));
            Bag.setProperty(this, secureContext, new Property('isMethod', isMethod));
            Bag.setProperty(this, secureContext, new Property('isProperty', isProperty));
            Bag.setProperty(this, secureContext, new Property('isGetterProperty', isGetterProperty));
            Bag.setProperty(this, secureContext, new Property('isSetterProperty', isSetterProperty));
            Bag.setState(this, secureContext, State.HYDRATE);
        }
    }
    /**
     * @returns { String }
    */
    get name() {
        return this.getPropertyValue({ name: null });
    }
    /**
     * @returns { TypeInfo }
    */
    get typeInfo() {
        return this.getPropertyValue({ typeInfo: null });
    }
    /**
     * @returns { Boolean }
    */
    get isConstructor() {
        return this.getPropertyValue({ isConstructor: null });
    }
    /**
     * @returns { Boolean }
    */
    get isMethod() {
        return this.getPropertyValue({ isMethod: null });
    }
    /**
     * @returns { Boolean }
    */
    get isProperty() {
        return this.getPropertyValue({ isProperty: null });
    }
    /**
     * @returns { Boolean }
    */
    get isGetterProperty() {
        return this.getPropertyValue({ isGetterProperty: null });
    }
    /**
     * @returns { Boolean }
    */
    get isSetterProperty() {
        return this.getPropertyValue({ isSetterProperty: null });
    }
}