import {
    Interface,
    InterfaceMember,
    State
} from "../../registry.mjs";
export class SchemaMember extends InterfaceMember {
    /**
     * @param { String } name
     * @param { Interface } $interface
     * @param { Boolean } isConstructor
     * @param { Boolean } isMethod
     * @param { Boolean } isProperty
     * @param { Boolean } isGetterProperty
     * @param { Boolean } isSetterProperty
     * @param { Boolean } isArray
    */
    constructor(name, $interface, isConstructor, isMethod, isProperty, isGetterProperty, isSetterProperty, isArray) {
        super(name, $interface, isConstructor, isMethod, isProperty, isGetterProperty, isSetterProperty, isArray);
        if (this.hasState(secureContext, State.CONSTRUCT)) {
            this.setProperty(secureContext, { type: $interface.targetClass });
            this.setState(secureContext, State.HYDRATE);
        } else {
            this.setState(secureContext, State.REHYDRATE);
        }
    }
    /**
     * @returns { class }
    */
    get type() {
        return this.getProperty(secureContext, { type: null });
    }
}