import { GUID, TypeInfo } from "../registry.mjs";
const privateBag = new WeakMap();
export class TypeMemberInfo extends GUID {
    /**
     * @param { String } name
     * @param { TypeInfo } typeInfo
     * @param { Boolean } isMethod
     * @param { Boolean } isGetterProperty
     * @param { Boolean } isSetterProperty
    */
    constructor(name, typeInfo, isMethod, isGetterProperty, isSetterProperty) {
        const properties = { name, typeInfo, isMethod, isGetterProperty, isSetterProperty};
        super(properties);
        if (!privateBag.has(this)) {
            privateBag.set(this, properties);
        }
    }
    /**
     * @returns { String }
    */
    get name() {
        const { name } = privateBag.get(this);
        return name;
    }
    /**
     * @returns { TypeInfo }
    */
    get type() {
        const { type } = privateBag.get(this);
        return type;
    }
    /**
     * @returns { Boolean }
    */
    get isMethod() {
        const { isMethod } = privateBag.get(this);
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
        const { isGetterProperty } = privateBag.get(this);
        return isGetterProperty;
    }
    /**
     * @returns { Boolean }
    */
    get isSetterProperty() {
        const { isSetterProperty } = privateBag.get(this);
        return isSetterProperty;
    }
}