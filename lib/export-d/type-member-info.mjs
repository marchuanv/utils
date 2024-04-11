import {
    Bag,
    BagState,
    Property,
    State,
    TypeInfo,
    TypeMemberInfoSchema
} from "../../registry.mjs";
const secureContext = Bag.getSecureContext();
export class TypeMemberInfo extends BagState {
    /**
     * @param { String } name
     * @param { TypeInfo } typeInfo
     * @param { Boolean } isMethod
     * @param { Boolean } isGetterProperty
     * @param { Boolean } isSetterProperty
    */
    constructor(name, typeInfo, isMethod, isGetterProperty, isSetterProperty) {
        super(`Id: 5cb7458d-e96f-4acd-8c18-3703b55fc027, name: ${name}-member-info`, secureContext);
        if (this.isAtState(State.CONSTRUCT)) {
            if (!(this instanceof TypeMemberInfoSchema)) {
                throw new Error(`${TypeMemberInfoSchema.name} does not extend ${TypeMemberInfo.name}`);
            }
            Bag.setProperty(this, secureContext, new Property('name', name));
            Bag.setProperty(this, secureContext, new Property('typeInfo', typeInfo));
            Bag.setProperty(this, secureContext, new Property('isMethod', isMethod));
            Bag.setProperty(this, secureContext, new Property('isGetterProperty', isGetterProperty));
            Bag.setProperty(this, secureContext, new Property('isSetterProperty', isSetterProperty));
            Bag.setState(this, secureContext, State.HYDRATE);
        }
    }
    /**
     * @returns { String }
    */
    get name() {
        return Bag.getProperty(this, secureContext, { name: null });
    }
    /**
     * @returns { TypeInfo }
    */
    get typeInfo() {
        return Bag.getProperty(this, secureContext, { typeInfo: null });
    }
    /**
     * @returns { Boolean }
    */
    get isMethod() {
        return Bag.getProperty(this, secureContext, { isMethod: null });
    }
    /**
     * @returns { Boolean }
    */
    get isProperty() {
        return this.isSetterProperty || this.isGetterProperty;
    }
    /**
     * @returns { Boolean }
    */
    get isGetterProperty() {
        return Bag.getProperty(this, secureContext, { isGetterProperty: null });
    }
    /**
     * @returns { Boolean }
    */
    get isSetterProperty() {
        return Bag.getProperty(this, secureContext, { isSetterProperty: null });
    }
}