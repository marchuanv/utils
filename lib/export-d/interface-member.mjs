import {
    Bag,
    BagState,
    State,
    Interface
} from "../../registry.mjs";
export class InterfaceMember extends BagState {
    /**
     * @param { String } name
     * @param { Interface } $interface
     * @param { Boolean } isMethod
     * @param { Boolean } isGetterProperty
     * @param { Boolean } isSetterProperty
     * @param { SecureContext } secureContext
    */
    constructor(name, $interface, isConstructor, isMethod, isProperty, isGetterProperty, isSetterProperty, secureContext) {
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
            this.setPropertyValue({ name });
            this.setPropertyValue({ $interface });
            this.setPropertyValue({ isConstructor });
            this.setPropertyValue({ isMethod });
            this.setPropertyValue({ isProperty });
            this.setPropertyValue({ isGetterProperty });
            this.setPropertyValue({ isSetterProperty });
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
     * @returns { Interface }
    */
    get interface() {
        return this.getPropertyValue({ $interface: null });
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