import {
    Bag,
    NULL,
    Reflection,
    Schema,
    SecureContext,
    TypeMemberInfo,
    UNDEFINED,
    randomUUID
} from "../registry.mjs";
export function UNKNOWN() { }
export function DEFAULT_VALUE() { }
const secureContext = new SecureContext();
export class TypeInfo {
    /**
     * @param { { name: String, type: Function } | { name: String, type: NULL } | { name: String, type: UNDEFINED } } info
    */
    constructor(info = { name: UNKNOWN.name, type: UNKNOWN }) {

        if (info === null || info === null || typeof info !== 'object') {
            throw new Error(`The info argument is null, undefined or not an object.`);
        }

        let isPrimitiveType = false;
        let isClass = false;

        let invalidName =
            info.name === null ||
            info.name === undefined ||
            typeof info.name !== 'string' ||
            Reflection.isEmptyString(info.name) ||
            info.name === UNKNOWN.name ||
            !Bag.getTypes().some(type => type.name.toLowerCase() === info.name.toLowerCase())

        let invalidType =
            info.type === null ||
            info.type === undefined ||
            typeof info.type !== 'function' ||
            info.type === UNKNOWN ||
            !Bag.getTypes().some(type => type === info.type);

        if (invalidType) {
            if (invalidName) {
                throw new Error(`The info.name is null, undefined, not a string, empty string, unknown or not found.`);
            }
            const { type } = Reflection.getPrimitiveType(info.name);
            info.type = type;
            isPrimitiveType = true;
        } else {
            isClass = Reflection.isClass(info.type);
            isPrimitiveType = Reflection.isPrimitiveType(info.type);
        }

        info.name = info.type.name;
        if (info.type === undefined) {
            info.type = UNDEFINED;
            info.name = UNDEFINED.name.toLowerCase();
            info.defaultValue = undefined;
        } else if (info.type === null) {
            info.type = NULL;
            info.name = NULL.name.toLowerCase();
            info.defaultValue = null;
        } else {
            if (isPrimitiveType) {
                const primitiveTypeInfo = Reflection.getPrimitiveType(info.type);
                info.defaultValue = primitiveTypeInfo.default;
            } else if (isClass) { //Reference type
                info.defaultValue = null
            }
        }

        let memberKeys = [];

        const properties = {};
        properties.type = info.type;
        properties.name = info.name;
        properties.members = [];
        properties.defaultValue = info.defaultValue;
        properties.isPrimitive = isPrimitiveType;
        properties.isClass = isClass;
        if (properties.isPrimitive) {
            if (properties.type === Object) {
                memberKeys = Object.keys(properties.type);
            }
        } else if (properties.isClass) {
            const prototype = Object.getPrototypeOf(properties.type);
            memberKeys = Reflect.ownKeys(prototype);
        }
        for (const key of memberKeys) {
            const descriptor = Reflect.getOwnPropertyDescriptor(properties.type.prototype, key);
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
        Object.setPrototypeOf(properties, TypeInfo);
        Object.freeze(properties);
        this._Id = randomUUID();
        Bag.set(this._Id, this, typeInfoSchema, this, secureContext);
        const bagKey = Bag.getKey(this._Id, secureContext);
        Bag.setData(bagKey, properties);
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
        const bagKey = Bag.getKey(this.Id, secureContext);
        const { name } = Bag.getData(bagKey, TypeInfoSchema.prototype);
        return name;
    }
    /**
     * @returns { Function | NULL | UNDEFINED }
    */
    get type() {
        const bagKey = Bag.getKey(this.Id, secureContext);
        const { type } = Bag.getData(bagKey, TypeInfoSchema.prototype);
        return type;
    }
    /**
     * @returns { Boolean }
    */
    get isPrimitive() {
        const bagKey = Bag.getKey(this.Id, secureContext);
        const { isPrimitive } = Bag.getData(bagKey, TypeInfoSchema.prototype);
        return isPrimitive;
    }
    /**
     * @returns { Boolean }
    */
    get isClass() {
        const bagKey = Bag.getKey(this.Id, secureContext);
        const { isClass } = Bag.getData(bagKey, TypeInfoSchema.prototype);
        return isClass;
    }
    /**
     * @returns { Array<TypeMemberInfo> }
    */
    get members() {
        const bagKey = Bag.getKey(this.Id, secureContext);
        const { members } = Bag.getData(bagKey, TypeInfoSchema.prototype);
        return members;
    }
    /**
     * @returns { Object, NULL }
    */
    get defaultValue() {
        const bagKey = Bag.getKey(this.Id, secureContext);
        const { defaultValue } = Bag.getData(bagKey, TypeInfoSchema.prototype);
        return defaultValue;
    }
    /**
     * @param { String } Id universally unique identifier
     * @returns { TypeInfo }
    */
    static get(Id) {
        const bagKey = Bag.getKey(Id, secureContext);
        return Bag.get(bagKey, TypeInfo.prototype);
    }
    /**
     * @param { Function | Array<Function> } type
    */
    static register(type) {
        Bag.addTypes(type);
    }
}
let primitiveTypes = Reflection.getPrimitiveTypes().map(x => x.type);
TypeInfo.register(primitiveTypes);
class TypeInfoSchema extends Schema {
    constructor() {
        super([]);
    }
}
const typeInfoSchema = new TypeInfoSchema();