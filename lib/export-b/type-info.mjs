import {
    ANY,
    Bag,
    DataSchema,
    NULL,
    Properties,
    Property,
    Reflection,
    Type,
    TypeInfoSchema,
    TypeMemberInfoSchema,
    TypeSchema,
    UNDEFINED,
    UNKNOWN,
    UUID
} from "../../registry.mjs";
const secureContext = Bag.getSecureContext();
export class TypeInfo extends DataSchema {
    /**
     * @param { Type } type
     * @param { Boolean } isStatic
    */
    constructor(type, isStatic = false) {
        let _type = type;
        if (typeof _type === 'function' || (Array.isArray(_type) && typeof _type[0] === 'function')) {
            _type = new TypeSchema(null, _type);
        }
        if (_type === null || _type === undefined || !(_type instanceof Type)) {
            throw new Error(`The type argument is null, undefined or not an instance of ${Type.name}.`);
        }
        if (_type.func == UNKNOWN) {
            throw new Error('type is unknown.');
        }
        super();
        if (!(this instanceof TypeInfoSchema)) {
            throw new Error(`${TypeInfo.name} does not have a schema.`);
        }
        const typeInfoId = new UUID(`Id: 88f04fb8-ca8f-47f6-b591-0df045a4c36b, name: ${_type.name}-info`);
        if (Bag.has(typeInfoId, secureContext)) {
            return Bag.get(typeInfoId, secureContext);
        } else {
            Bag.set(typeInfoId, secureContext, this);
        }
        let defaultValue = null;
        const isClass = Reflection.isClass(_type.func);
        if (isClass) {
            if (isStatic) {
                const instance = new _type.func();
                if (_type.isArray) {
                    defaultValue = [instance];
                } else {
                    defaultValue = instance;
                }
            }
        } else {
            switch (_type.func) {
                case String: {
                    defaultValue = '';
                    break;
                }
                case Boolean: {
                    defaultValue = false;
                    break;
                }
                case BigInt: {
                    defaultValue = 0;
                    break;
                }
                case Number: {
                    defaultValue = 0;
                    break;
                }
                case NULL: {
                    defaultValue = null;
                    break;
                }
                case Object: {
                    defaultValue = {};
                    break;
                }
                case UNDEFINED: {
                    defaultValue = undefined;
                    break;
                }
                case Array: {
                    defaultValue = [];
                    break;
                }
                case Array: {
                    defaultValue = [];
                    break;
                }
                case Date: {
                    defaultValue = new Date();
                    break;
                }
                case RegExp: {
                    defaultValue = new RegExp('');
                    break;
                }
                case ANY: {
                    defaultValue = ANY;
                    break;
                }
                default: {
                    throw new Error(`unable to determine default value for ${_type.name}`);
                }
            }
            if (_type.isArray) {
                defaultValue = [defaultValue];
            }
        }
        let memberKeys = [];
        if (isClass) {
            memberKeys = memberKeys.concat(Reflect.ownKeys(_type.func.prototype));
        } else {
            if (_type.func === Object) {
                memberKeys = Object.keys(_type.func);
            }
        }
        const membersProperty = new Property('members', []);
        const memberDescriptors = [];
        for (const key of memberKeys) {
            const descriptor = Reflect.getOwnPropertyDescriptor(_type.func.prototype, key);
            if (descriptor) {
                const isGetterProperty = descriptor.get ? true : false;
                const isSetterProperty = descriptor.set ? true : false;
                const isProperty = isGetterProperty || isSetterProperty;
                let memberTypeInfo = false;
                let isMethod = true;
                let isConstructor = false;
                if (isGetterProperty || isSetterProperty) {
                    isMethod = false;
                } else {
                    isMethod = true;
                    if (key === 'constructor') {
                        isConstructor = true;
                    }
                }
                let body = null;
                if (isConstructor) {
                    memberTypeInfo = this;
                    isMethod = true;
                } else if (isMethod) {
                    body = descriptor.value.toString();
                } else if (isProperty) {
                    if (isGetterProperty) {
                        body = descriptor.get.toString();
                    }
                } else {
                    throw new Error('critical error.');
                }
                const isMemberTypeInfo = (body === null || body === undefined) ? false : body.indexOf(`return new ${TypeInfoSchema.name}(`) > -1;
                if (isMemberTypeInfo) {
                    if (isMethod) {
                        memberTypeInfo = this[key]();
                    } else if (isProperty) {
                        memberTypeInfo = this[key];
                    } else {
                        throw new Error('critical error.');
                    }
                }
                memberDescriptors.push({
                    key,
                    isProperty,
                    isGetterProperty,
                    isSetterProperty,
                    isMethod,
                    memberTypeInfo
                });
            }
        }
        for (const { key, isMethod, isGetterProperty, isSetterProperty, memberTypeInfo } of memberDescriptors) {
            if (!(memberTypeInfo instanceof TypeInfoSchema)) {
                throw new Error(`${key} member has an invalid member type.`);
            }
            membersProperty.value.push(new TypeMemberInfoSchema(
                key,
                memberTypeInfo,
                isMethod,
                isGetterProperty,
                isSetterProperty
            ));
        };
        this._propertiesId = new UUID();
        Bag.set(this._propertiesId, secureContext, new Properties([
            new Property('type', _type),
            new Property('isClass', isClass),
            membersProperty,
            new Property('defaultValue', defaultValue),
        ]));
        Object.freeze(this);
    }
    /**
     * @returns { Type }
    */
    get type() {
        const { type } = Bag.get(this._propertiesId, secureContext, TypeInfoSchema.prototype);
        return type;
    }
    /**
     * @returns { Boolean }
    */
    get isClass() {
        const { isClass } = Bag.get(this._propertiesId, secureContext, TypeInfoSchema.prototype);
        return isClass;
    }
    /**
     * @returns { Array<TypeMemberInfoSchema> }
    */
    get members() {
        const { members } = Bag.get(this._propertiesId, secureContext, TypeInfoSchema.prototype);
        return members;
    }
    /**
     * @returns { Object, NULL }
    */
    get defaultValue() {
        const { defaultValue } = Bag.get(this._propertiesId, secureContext, TypeInfoSchema.prototype);
        return defaultValue;
    }
}