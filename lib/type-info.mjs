import {
    Bag,
    NULL,
    Reflection,
    Schema,
    Type,
    TypeMemberInfo,
    UNDEFINED,
    UUID,
    UNKNOWN,
    ANY
} from "../registry.mjs";
const secureContext = Bag.getSecureContext();
class TypeInfoSchema extends Schema {
    constructor() {
        super([]);
    }
}
export class TypeInfo {
    /**
     * @param { Type | Function | Array<Function> } type
     * @param { Boolean } isStatic
    */
    constructor(type, isStatic = false) {
        if (typeof type === 'function' || (Array.isArray(type) && typeof type[0] === 'function')) {
            type = new Type(null, type);
        }
        if (type === null || type === undefined || !(type instanceof Type)) {
            throw new Error(`The type argument is null, undefined or not an instance of ${Type.name}.`);
        }
        if (type.func == UNKNOWN) {
            throw new Error('type is unknown.');
        }
        let defaultValue = null;
        const isClass = Reflection.isClass(type.func);
        if (isClass) {
            if (isStatic) {
                const instance = new type.func();
                if (type.isArray) {
                    defaultValue = [instance];
                } else {
                    defaultValue = instance;
                }
            }
        } else {
            switch (type.func) {
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
                    throw new Error(`unable to determine default value for ${type.name}`);
                }
            }
            if (type.isArray) {
                defaultValue = [defaultValue];
            }
        }
        let memberKeys = [];
        this._Id = new UUID(`${type}-info`);
        if (Bag.has(this._Id, secureContext)) {
            return Bag.get(this._Id, secureContext);
        }
        const properties = {};
        properties.type = type;
        properties.members = [];
        properties.defaultValue = defaultValue;
        properties.isClass = isClass;
        if (properties.isClass) {
            const prototype = Object.getPrototypeOf(properties.type.func);
            memberKeys = Reflect.ownKeys(prototype);
        } else {
            if (properties.type.func === Object) {
                memberKeys = Object.keys(properties.type.func);
            }
        }
        for (const key of memberKeys) {
            const descriptor = Reflect.getOwnPropertyDescriptor(properties.type.func.prototype, key);
            if (descriptor) {
                const isGetterProperty = descriptor.get ? true : false;
                const isSetterProperty = descriptor.set ? true : false;
                let isMethod = true;
                if (isGetterProperty || isSetterProperty) {
                    isMethod = false;
                } else {
                    isMethod = true;
                }
                const memberInfo = new TypeMemberInfo(key, this, isMethod, isGetterProperty, isSetterProperty);
                properties.members.push(memberInfo);
            }
        };
        Object.freeze(properties);
        Bag.set(this._Id, secureContext, this, new TypeInfoSchema());
        Bag.setData(this._Id, secureContext, properties);
        Object.freeze(this);
    }
    /**
     * @returns { UUID } universally unique identifier
    */
    get Id() {
        return this._Id;
    }
    /**
     * @returns { Function | NULL | UNDEFINED }
    */
    get type() {
        const { type } = Bag.getData(this.Id, secureContext, TypeInfoSchema.prototype);
        return type;
    }
    /**
     * @returns { Boolean }
    */
    get isClass() {
        const { isClass } = Bag.getData(this.Id, secureContext, TypeInfoSchema.prototype);
        return isClass;
    }
    /**
     * @returns { Array<TypeMemberInfo> }
    */
    get members() {
        const { members } = Bag.getData(this.Id, secureContext, TypeInfoSchema.prototype);
        return members;
    }
    /**
     * @returns { Object, NULL }
    */
    get defaultValue() {
        const { defaultValue } = Bag.getData(this.Id, secureContext, TypeInfoSchema.prototype);
        return defaultValue;
    }
}