import { GUID, Reflection } from "../registry.mjs";
import { General } from "./general.mjs";
export function NULL() { }
export function UNDEFINED() { }
export function UNKNOWN() { }
const privateBag = new WeakMap();
export class TypeInfo extends GUID {
    /**
     * @param { { name: String, type: Function } | { name: String, type: NULL } | { name: String, type: UNDEFINED } } info
     * @param { String } typeInfoId universally unique identifier
    */
    constructor(info = { name: UNKNOWN.name, type: UNKNOWN }, typeInfoId = null) {
        let isUUID = false;
        if (typeInfoId !== null && typeInfoId !== undefined) {
            if (General.validateUuid(typeInfoId) && typeof typeInfoId === 'string') {
                isUUID = true;
            } else {
                throw new Error(`The typeInfoId argument is not a universally unique identifier`);
            }
        }
        if (isUUID) {
            super(typeInfoId);
            if (!(this instanceof TypeInfo)) {
                throw new Error(`${TypeInfo.name} with Id: ${typeInfoId} was not found.`);
            }
        } else {
            if (info === null || info === null) {
                throw new Error(`The info argument is null or undefined.`);
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
                privateBag.set(this, properties);
                properties.type = info.type;
                properties.name = info.name;
                properties.isPrimitive = Reflection.isPrimitiveType(this.type);
                if (!properties.isPrimitive) {
                    properties.isPrimitive = Reflection.isPrimitiveType(properties.name);
                }
                properties.isClass = Reflection.isClass(properties.type);
                if (properties.isClass) {
                    properties.members = Reflection.getClassMetadata(properties.type);
                }
            }
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
     * @returns { Object }
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