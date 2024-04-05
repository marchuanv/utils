import {
    Bag,
    Schema,
    TypeInfo,
    UUID
} from "../registry.mjs";
const secureContext = Bag.getSecureContext();
class TypeMemberInfoSchema extends Schema {}
export class TypeMemberInfo {
    /**
     * @param { String } name
     * @param { TypeInfo } typeInfo
     * @param { Boolean } isMethod
     * @param { Boolean } isGetterProperty
     * @param { Boolean } isSetterProperty
    */
    constructor(name, typeInfo, isMethod, isGetterProperty, isSetterProperty) {
        if (!Bag.hasSchema(TypeMemberInfoSchema)) {
            new TypeMemberInfoSchema();
        }
        const properties = {
            name,
            type: typeInfo,
            isMethod,
            isGetterProperty,
            isSetterProperty
        };
        this._Id = new UUID();
        Bag.set(this._Id, secureContext, this, TypeMemberInfo, TypeMemberInfoSchema);
        Bag.setData(this._Id, secureContext, properties, TypeMemberInfo);
        Object.freeze(properties);
        Object.freeze(this);
    }
    /**
     * @returns { String } universally unique identifier
    */
    get Id() {
        return this._Id;
    }
    /**
     * @returns { String }
    */
    get name() {
        const { name } = Bag.getData(this.Id, secureContext, TypeMemberInfo);
        return name;
    }
    /**
     * @returns { TypeInfo }
    */
    get type() {
        const { type } = Bag.getData(this.Id, secureContext, TypeMemberInfo);
        return type;
    }
    /**
     * @returns { Boolean }
    */
    get isMethod() {
        const { isMethod } = Bag.getData(this.Id, secureContext, TypeMemberInfo);
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
        const { isGetterProperty } = Bag.getData(this.Id, secureContext, TypeMemberInfo);
        return isGetterProperty;
    }
    /**
     * @returns { Boolean }
    */
    get isSetterProperty() {
        const { isSetterProperty } = Bag.getData(this.Id, secureContext, TypeMemberInfo);
        return isSetterProperty;
    }
}