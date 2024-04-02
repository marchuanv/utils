import {
    General,
    Reflection,
    Schema,
    TypeInfo
} from '../registry.mjs';
const privateBag = new WeakMap();
export class BagKey { }
export class SecureContext { }
export class Removed { }
class TypesKey { }
privateBag.set(TypesKey, []);
/**
 * This class provides functionality for holding references.
*/
export class Bag {
    /**
     * @param { SecureContext } secureContext
     * @returns { Map<String, BagKey> }
    */
    static getKeys(secureContext) {
        if (secureContext === null || secureContext === undefined || !(secureContext instanceof SecureContext)) {
            throw new Error(`The secureContext argument is null, undefined or not a ${SecureContext.name}`);
        }
        if (!privateBag.has(secureContext)) {
            throw new Error(`secureContext does not exist.`);
        }
        return privateBag.get(secureContext);
    }
    /**
     * @param { String } Id universally unique identifier
     * @param { SecureContext } secureContext
     * @returns { BagKey }
    */
    static hasKey(Id, secureContext) {
        if (Id === null || Id === undefined || typeof Id !== 'string' || !General.validateUuid(Id)) {
            throw new Error(`The Id argument is null, undefined, not a ${String.name} or valid universal unique identifier`);
        }
        if (!privateBag.has(secureContext)) {
            return false;
        }
        const bagKeys = Bag.getKeys(secureContext);
        if (!bagKeys.has(Id)) {
            return false;
        }
        const found = bagKeys.get(Id);
        if (found) {
            return found;
        }
        throw new Error(`${Id} not found.`);
    }
    /**
     * @param { String } Id universally unique identifier
     * @param { SecureContext } secureContext
     * @returns { BagKey }
    */
    static getKey(Id, secureContext) {
        if (Id === null || Id === undefined || typeof Id !== 'string' || !General.validateUuid(Id)) {
            throw new Error(`The Id argument is null, undefined, not a ${String.name} or valid universal unique identifier`);
        }
        if (!privateBag.has(secureContext)) {
            throw new Error('secure context does not exist.');
        }
        const bagKeys = Bag.getKeys(secureContext);
        if (!bagKeys.has(Id)) {
            throw new Error(`${Id} not found.`);
        }
        const found = bagKeys.get(Id);
        if (found) {
            return found;
        }
        throw new Error(`${Id} not found.`);
    }
    /**
     * @template prototype the prototype of a class that extends Schema
     * @param { BagKey } bagKey
     * @param { prototype } schema
     * @returns { prototype }
    */
    static getData(bagKey, schema) {
        if (bagKey === null || bagKey === undefined || !(bagKey instanceof BagKey)) {
            throw new Error(`The bagKey argument is null, undefined or not a ${BagKey.name}.`);
        }
        if (schema === null || schema === undefined) {
            throw new Error(`The schema argument is null or undefined.`);
        }
        if (!Reflection.getPrototypes(schema).some(proto => proto === Schema.prototype)) {
            throw new Error(`The schema argument does not extend ${Schema.name}`);
        }
        const instance = privateBag.get(bagKey);
        const { data } = privateBag.get(instance);
        return data
    }
    /**
     * @param { BagKey } bagKey
     * @param { Object } data
    */
    static setData(bagKey, data) {
        if (bagKey === null || bagKey === undefined || !(bagKey instanceof BagKey)) {
            throw new Error(`The bagKey argument is null, undefined or not a ${BagKey.name}.`);
        }
        if (data === null || data === undefined) {
            throw new Error(`The data argument is null or undefined.`);
        }
        const instance = privateBag.get(bagKey);
        const instanceData = privateBag.get(instance);
        const { dataSchema } = instanceData;
        dataSchema.validate({ data });
        instanceData.data = data;
    }
    /**
     * @param { BagKey } bagKey
     * @returns { Boolean }
    */
    static has(bagKey) {
        if (bagKey === null || bagKey === undefined || !(bagKey instanceof BagKey)) {
            throw new Error(`The bagKey argument is null, undefined or not a ${BagKey.name}.`);
        }
        return privateBag.has(bagKey);
    }
    /**
     * @template prototype the prototype of a class
     * @param { BagKey } bagKey
     * @param { prototype } Class
     * @returns { prototype }
    */
    static get(bagKey, Class) {
        if (this.has(bagKey)) {
            const obj = privateBag.get(bagKey);
            if (obj instanceof Removed) {
                throw new Error('instance was disposed');
            }
            if (!(obj instanceof Class.constructor)) {
                throw new Error(`Obj is not an instance of Class.`);
            }
            return obj;
        } else {
            throw new Error('bagKey not found.');
        }
    }
    /**
     * @param { String } Id universally unique identifier
     * @param { Object } instance
     * @param { Schema } dataSchema
     * @param { TypeInfo } typeInfo
     * @param { SecureContext } secureContext
    */
    static set(Id, instance, dataSchema, typeInfo, secureContext) {
        if (Id === null || Id === undefined || typeof Id !== 'string' || !General.validateUuid(Id)) {
            throw new Error(`The Id argument is null, undefined, not a ${String.name} or valid universal unique identifier`);
        }
        if (instance === undefined || instance === null || typeof instance !== 'object') {
            throw new Error(`The instance argument is null, undefined or not an ${Object.name}.`);
        }
        if (dataSchema === undefined || dataSchema === null || !(dataSchema instanceof Schema)) {
            throw new Error(`The dataSchema argument is null, undefined or not a ${Schema.name}.`);
        }
        if (typeInfo === null || typeInfo === undefined || !(typeInfo instanceof TypeInfo)) {
            throw new Error(`The typeInfo argument is null, undefined or not a ${TypeInfo.name}`);
        }
        if (secureContext === null || secureContext === undefined || !(secureContext instanceof SecureContext)) {
            throw new Error(`The secureContext argument is null, undefined or not a ${SecureContext.name}`);
        }
        if (!privateBag.has(secureContext)) {
            privateBag.set(secureContext, new Map());
        }
        const bagKeys = privateBag.get(secureContext);
        if (bagKeys.has(Id)) {
            throw new Error(`Id already exists.`);
        }
        const bagKey = new BagKey();
        bagKeys.set(Id, bagKey);
        privateBag.set(bagKey, instance);
        privateBag.set(instance, { data: null, dataSchema });
        privateBag.set(dataSchema, typeInfo);
    }
    /**
     * @param { BagKey } bagKey
     * @param { SecureContext } secureContext
    */
    static remove(bagKey, secureContext) {
        if (bagKey === null || bagKey === undefined || !(bagKey instanceof BagKey)) {
            throw new Error(`The bagKey argument is null, undefined or not a ${BagKey.name}`);
        }
        if (secureContext === null || secureContext === undefined || !(secureContext instanceof SecureContext)) {
            throw new Error(`The secureContext argument is null, undefined or not a ${SecureContext.name}`);
        }
        const instance = privateBag.get(bagKey);
        const instanceData = privateBag.get(instance);
        if (instanceData) {
            const { dataSchema } = instanceData;
            privateBag.delete(dataSchema);
        }
        privateBag.delete(instance);
        privateBag.delete(bagKey);
        privateBag.set(bagKey, new Removed());
    }
    /**
     * @param { Function | Array<Function> } type
    */
    static addTypes(type) {
        if (type === null || type === undefined) {
            throw new Error(`The type argument is null or undefined.`);
        }
        let _types = Array.isArray(type) ? type : [type];
        if (_types.find(x => x === undefined) || _types.find(x => x === null) || _types.find(x => typeof x !== 'function')) {
            throw new Error(`The type argument contains null, undefined or non-functions.`);
        }
        const types = privateBag.get(TypesKey);
        privateBag.delete(TypesKey);
        privateBag.set(TypesKey, _types.concat(types));
    }
    /**
     * @returns { Array<Function> }
    */
    static getTypes() {
        return privateBag.get(TypesKey);
    }
}