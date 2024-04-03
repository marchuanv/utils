import {
    Bag,
    Schema,
    SecureContext,
    TypeInfo,
    UUID,
    randomUUID
} from "../registry.mjs";
const secureContext = new SecureContext();
export class TypeMemberInfo {
    /**
     * @param { String } name
     * @param { TypeInfo } typeInfo
     * @param { Boolean } isMethod
     * @param { Boolean } isGetterProperty
     * @param { Boolean } isSetterProperty
    */
    constructor(name, typeInfo, isMethod, isGetterProperty, isSetterProperty) {
        const properties = {
            name,
            type: typeInfo,
            isMethod,
            isGetterProperty,
            isSetterProperty
        };
        this._Id = new UUID();
        Bag.set(this._Id, secureContext, this, typeMemberInfoSchema);
        Bag.setData(this._Id, secureContext, properties);
        Object.freeze(properties);
        Object.freeze(this);
    }
    /**
     * @param { String } Id universally unique identifier
     * @returns { TypeMemberInfo }
    */
    static get(Id) {
        const bagKey = Bag.getKey(Id, secureContext);
        return Bag.get(bagKey, TypeMemberInfo.prototype);
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
        const bagKey = Bag.getKey(this.Id, secureContext);
        const { name } = Bag.getData(bagKey, TypeMemberInfoSchema.prototype);
        return name;
    }
    /**
     * @returns { TypeInfo }
    */
    get type() {
        const bagKey = Bag.getKey(this.Id, secureContext);
        const { type } = Bag.getData(bagKey, TypeMemberInfoSchema.prototype);
        return type;
    }
    /**
     * @returns { Boolean }
    */
    get isMethod() {
        const bagKey = Bag.getKey(this.Id, secureContext);
        const { isMethod } = Bag.getData(bagKey, TypeMemberInfoSchema.prototype);
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
        const bagKey = Bag.getKey(this.Id, secureContext);
        const { isGetterProperty } = Bag.getData(bagKey, TypeMemberInfoSchema.prototype);
        return isGetterProperty;
    }
    /**
     * @returns { Boolean }
    */
    get isSetterProperty() {
        const bagKey = Bag.getKey(this.Id, secureContext);
        const { isSetterProperty } = Bag.getData(bagKey, TypeMemberInfoSchema.prototype);
        return isSetterProperty;
    }
}
class TypeMemberInfoSchema extends Schema {
    constructor() {
        super([]);
    }
}
const typeMemberInfoSchema = new TypeMemberInfoSchema();