import {
    Bag,
    State,
    Interface
} from "../../registry.mjs";
const secureContext = Bag.getSecureContext();
export class InterfaceMember extends Bag {
    /**
     * @param { String } name
     * @param { Interface } $interface
     * @param { Boolean } isMethod
     * @param { Boolean } isGetterProperty
     * @param { Boolean } isSetterProperty
    */
    constructor(name, $interface, isConstructor, isMethod, isProperty, isGetterProperty, isSetterProperty) {
        const targetClass = new.target;
        if (targetClass !== InterfaceMember) {
            throw new Error(`${InterfaceMember.name} is a sealed class.`);
        }
        if (name == null || name === undefined || typeof name !== 'string') {
            throw new Error(`The name argument is null, undefined or not a string.`);
        }
        super(`Id: 5cb7458d-e96f-4acd-8c18-3703b55fc027, name: ${name}-member-info`, secureContext);
        if (this.isAtState(State.CONSTRUCT)) {
            if ($interface == null || $interface === undefined || !($interface instanceof Interface)) {
                throw new Error(`The $interface argument is not an instance of a ${Interface.name}.`);
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
            Bag.setProperty(secureContext, { name });
            this.setPropertyValue(secureContext,{ $interface });
            this.setPropertyValue(secureContext,{ isConstructor });
            this.setPropertyValue(secureContext,{ isMethod });
            this.setPropertyValue(secureContext,{ isProperty });
            this.setPropertyValue(secureContext,{ isGetterProperty });
            this.setPropertyValue(secureContext,{ isSetterProperty });
            this.setState(secureContext, State.HYDRATE);
        }
    }
    /**
     * @returns { String }
    */
    get name() {
        return this.getPropertyValue(secureContext, { name: null });
    }
    /**
     * @returns { Interface }
    */
    get interface() {
        return this.getPropertyValue(secureContext, { $interface: null });
    }
    /**
     * @returns { Boolean }
    */
    get isConstructor() {
        return this.getPropertyValue(secureContext, { isConstructor: null });
    }
    /**
     * @returns { Boolean }
    */
    get isMethod() {
        return this.getPropertyValue(secureContext, { isMethod: null });
    }
    /**
     * @returns { Boolean }
    */
    get isProperty() {
        return this.getPropertyValue(secureContext, { isProperty: null });
    }
    /**
     * @returns { Boolean }
    */
    get isGetterProperty() {
        return this.getPropertyValue(secureContext, { isGetterProperty: null });
    }
    /**
     * @returns { Boolean }
    */
    get isSetterProperty() {
        return this.getPropertyValue(secureContext, { isSetterProperty: null });
    }
}