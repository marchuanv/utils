import {
    Bag,
    DataSchema,
    Properties,
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
        const typeMemberId = new UUID(`Id: 5cb7458d-e96f-4acd-8c18-3703b55fc027, name: ${name}-member-info`);
        if (Bag.has(typeMemberId, secureContext)) {
            return Bag.get(typeMemberId, secureContext);
        } else {
            Bag.set(typeMemberId, secureContext, this);
        }
        this._propertiesId = new UUID();
        Bag.set(this._propertiesId, secureContext, new Properties([
            new Property('name', name),
            new Property('typeInfo', typeInfo),
            new Property('isMethod', isMethod),
            new Property('isGetterProperty', isGetterProperty),
            new Property('isSetterProperty', isSetterProperty)
        ]));
        Object.freeze(this);
    }
    /**
     * @returns { String } universally unique identifier
    */
    get Id() {
        return typeMemberId;
    }
    /**
     * @returns { String }
    */
    get name() {
        const { name } = Bag.get(this._propertiesId, secureContext, TypeMemberInfoSchema.prototype);
        return name;
    }
    /**
     * @returns { TypeInfo }
    */
    get typeInfo() {
        const { typeInfo } = Bag.get(this._propertiesId, secureContext, TypeMemberInfoSchema.prototype);
        return typeInfo;
    }
    /**
     * @returns { Boolean }
    */
    get isMethod() {
        const { isMethod } = Bag.get(this._propertiesId, secureContext, TypeMemberInfoSchema.prototype);
        return isMethod;
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
        const { isGetterProperty } = Bag.get(this._propertiesId, secureContext, TypeMemberInfoSchema.prototype);
        return isGetterProperty;
    }
    /**
     * @returns { Boolean }
    */
    get isSetterProperty() {
        const { isSetterProperty } = Bag.get(this._propertiesId, secureContext, TypeMemberInfoSchema.prototype);
        return isSetterProperty;
    }
}