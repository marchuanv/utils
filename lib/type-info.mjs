import {
    Bag,
    Reflection,
    Schema,
    SecureContext,
    TypeMemberInfo,
    randomUUID
} from "../registry.mjs";
export function NULL() { return null; }
export function UNDEFINED() { }
export function UNKNOWN() { }
const secureContext = new SecureContext();
export class TypeInfo {
    /**
     * @param { { name: String, type: Function } | { name: String, type: NULL } | { name: String, type: UNDEFINED } } info
    */
    constructor(info = { name: UNKNOWN.name, type: UNKNOWN }) {
        if (info === null || info === null || typeof info !== 'object') {
            throw new Error(`The info argument is null, undefined or not an object.`);
        }
        let invalidName = false;
        let invalidType = false;
        if ((info.name === null || info.name === undefined || typeof info.name !== 'string' || Reflection.isEmptyString(info.name) || info.name === UNKNOWN.name)) {
            invalidName = true;
        }
        if (info.type === null || info.type === undefined || typeof info.type !== 'function' || info.type === UNKNOWN) {
            invalidType = true;
        }
        if (invalidName && !invalidType) {
            info.name = info.type.name;
            if (info.type.name === undefined || info.type.name === null) {
                invalidType = true;
            }
        } else if (!invalidName && invalidType) {
            const found = Reflection.getPrimitiveTypes().find(x => x.name.toLowerCase() === info.name.toLowerCase());
            if (found) {
                info.type = found.type;
                if (info.type === undefined) {
                    info.type = UNDEFINED;
                    info.name = UNDEFINED.name.toLowerCase();
                } else if (info.type === null) {
                    info.type = NULL;
                    info.name = NULL.name.toLowerCase();
                } else {
                    info.name = info.type.name;
                }
            } else {
                invalidName = true;
            }
        }
        if (invalidName && invalidType) {
            throw new Error(`The info.name is null, undefined, not a string, empty string or unknown, and the info.type is null, undefined, not a function or unknown.`);
        }
        const properties = {};
        let memberKeys = [];
        properties.type = info.type;
        properties.name = info.name;
        properties.members = [];
        properties.isPrimitive = Reflection.isPrimitiveType(info.type);
        properties.isClass = Reflection.isClass(info.type);
        if (properties.isPrimitive) {
            if (properties.type === Object) {
                memberKeys = Object.keys(properties.type);
            }
        } else if (properties.isClass) {
            const prototype = Object.getPrototypeOf(properties.type);
            memberKeys = Reflect.ownKeys(prototype);
        }
        for(const key of memberKeys) {
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
        const bagKey = Bag.getBagKey(this._Id, secureContext);
        Bag.setData(bagKey, properties);
        Object.freeze(this);
    }
    /**
     * @param { String } Id universally unique identifier
     * @returns { TypeInfo }
    */
    static get(Id) {
        const bagKey = Bag.getBagKey(Id, secureContext);
        return Bag.get(bagKey, TypeInfo.prototype);
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
        const bagKey = Bag.getBagKey(this.Id, secureContext);
        const { name } = Bag.getData(bagKey, TypeInfoSchema.prototype);
        return name;
    }
    /**
     * @returns { Function | NULL | UNDEFINED }
    */
    get type() {
        const bagKey = Bag.getBagKey(this.Id, secureContext);
        const { type } = Bag.getData(bagKey, TypeInfoSchema.prototype);
        return type;
    }
    /**
     * @returns { Boolean }
    */
    get isPrimitive() {
        const bagKey = Bag.getBagKey(this.Id, secureContext);
        const { isPrimitive } = Bag.getData(bagKey, TypeInfoSchema.prototype);
        return isPrimitive;
    }
    /**
     * @returns { Boolean }
    */
    get isClass() {
        const bagKey = Bag.getBagKey(this.Id, secureContext);
        const { isClass } = Bag.getData(bagKey, TypeInfoSchema.prototype);
        return isClass;
    }
    /**
     * @returns { Array<TypeMemberInfo> }
    */
    get members() {
        const bagKey = Bag.getBagKey(this.Id, secureContext);
        const { members } = Bag.getData(bagKey, TypeInfoSchema.prototype);
        return members;
    }
}
class TypeInfoSchema extends Schema {
    constructor() {
        super([]);
    }
}
const typeInfoSchema = new TypeInfoSchema();