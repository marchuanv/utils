import {
    Bag,
    DataSchema,
    Property,
    TypeInfo,
    TypeMemberInfoSchema,
    UUID
} from "../../registry.mjs";
const secureContext = Bag.getSecureContext();
export class TypeMemberInfo extends DataSchema {
    /**
     * @param { String } name
     * @param { TypeInfo } typeInfo
     * @param { Boolean } isMethod
     * @param { Boolean } isGetterProperty
     * @param { Boolean } isSetterProperty
    */
    constructor(name, typeInfo, isMethod, isGetterProperty, isSetterProperty) {
        super();
        if (!(this instanceof TypeMemberInfoSchema)) {
            throw new Error(`${TypeMemberInfoSchema.name} does not extend ${TypeMemberInfo.name}`);
        }
        this._typeMemberId = new UUID(`Id: 5cb7458d-e96f-4acd-8c18-3703b55fc027, name: ${name}-member-info`);
        if (Bag.hasUUID(this._typeMemberId, secureContext)) {
            return Bag.get(this._typeMemberId, secureContext);
        } else {
            Bag.set(this._typeMemberId, secureContext, this);
            Bag.setProperty(this._typeMemberId, secureContext, new Property('name', name));
            Bag.setProperty(this._typeMemberId, secureContext, new Property('typeInfo', typeInfo));
            Bag.setProperty(this._typeMemberId, secureContext, new Property('isMethod', isMethod));
            Bag.setProperty(this._typeMemberId, secureContext, new Property('isGetterProperty', isGetterProperty));
            Bag.setProperty(this._typeMemberId, secureContext, new Property('isSetterProperty', isSetterProperty));
            Object.freeze(this);
        }
    }
    /**
     * @returns { String }
    */
    get name() {
        return Bag.getProperty(this._typeMemberId, secureContext, { name: null });
    }
    /**
     * @returns { TypeInfo }
    */
    get typeInfo() {
        return Bag.getProperty(this._typeMemberId, secureContext, { typeInfo: null });
    }
    /**
     * @returns { Boolean }
    */
    get isMethod() {
        return Bag.getProperty(this._typeMemberId, secureContext, { isMethod: null });
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
        return Bag.getProperty(this._typeMemberId, secureContext, { isGetterProperty: null });
    }
    /**
     * @returns { Boolean }
    */
    get isSetterProperty() {
        return Bag.getProperty(this._typeMemberId, secureContext, { isSetterProperty: null });
    }
}