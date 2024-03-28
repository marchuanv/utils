import { GUID, Reflection, TypeMemberInfo } from "../registry.mjs";
import { General } from "./general.mjs";
export function NULL() { return null; }
export function UNDEFINED() { }
export function UNKNOWN() { }
const privateBag = new WeakMap();
export class TypeInfo extends GUID {
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
        super(info);
        if (!privateBag.has(this)) {
            const properties = {};
            let memberKeys = [];
            privateBag.set(this, properties);
            privateBag.set(properties, this);
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
                memberKeys = Reflect.ownKeys(properties.type.prototype);
            }
            for(const key of memberKeys) {
                const descriptor = Reflect.getOwnPropertyDescriptor(properties.type.prototype, key);
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
            };
            Object.setPrototypeOf(properties, TypeInfo);
            Object.freeze(properties);
        }
    }
    /**
     * @param { String } typeInfoId universally unique identifier
     * @returns { TypeInfo }
    */
    static get(typeInfoId) {
        if (typeInfoId !== null && typeInfoId !== undefined && typeof typeInfoId === 'string') {
            if (!General.validateUuid(typeInfoId)) {
                throw new Error(`The typeInfoId argument is not a universally unique identifier`);
            }
            const typeInfo = privateBag.get(new GUID(typeInfoId));
            if (typeInfo === null || typeInfo === undefined) {
                throw new Error(`typeInfo not found by by Id.`);
            }
            if (Object.getPrototypeOf(typeInfo) === TypeInfo) {
                return privateBag.get(typeInfo);
            } else {
                throw new Error(`typeInfo not found by by Id.`);
            }
        } else {
            throw new Error('The typeInfoId argument is not a string.');
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
     * @returns { Function | NULL | UNDEFINED }
    */
    get type() {
        const { type } = privateBag.get(this);
        return type;
    }
    /**
     * @returns { Boolean }
    */
    get isPrimitive() {
        const { isPrimitive } = privateBag.get(this);
        return isPrimitive;
    }
    /**
     * @returns { Boolean }
    */
    get isClass() {
        const { isClass } = privateBag.get(this);
        return isClass;
    }
    /**
     * @returns { Array<{ classId: GUID, propertyId: GUID, Class: class, name: String, isMethod: Boolean, isProperty: Boolean, isGetter: Boolean, isSetter: Boolean }> }
    */
    get members() {
        const { members } = privateBag.get(this);
        return members;
    }
}