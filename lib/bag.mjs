import {
    Reflection,
    Schema,
    UUID,
    SecureContext,
    General
} from '../registry.mjs';
const privateBag = new WeakMap();
const UUIDMap = new Map();
export class Removed { }
/**
 * This class provides functionality for holding references.
*/
export class Bag {
    /**
     * @template prototype the prototype of a class that extends Schema
     * @param { UUID } Id
     * @param { SecureContext } secureContext
     * @param { prototype } schema
     * @returns { prototype }
    */
    static getData(Id, secureContext, schema) {
        if (schema === null || schema === undefined) {
            throw new Error(`The schema argument is null or undefined.`);
        }
        if (!Reflection.getPrototypes(schema).some(proto => proto === Schema.prototype)) {
            throw new Error(`The schema argument does not extend ${Schema.name}`);
        }
        const instance = Bag.get(Id, secureContext, Object.prototype);
        const { data } = privateBag.get(instance);
        return data
    }
    /**
     * @param { UUID } Id
     * @param { SecureContext } secureContext
     * @param { Object } data
    */
    static setData(Id, secureContext, data) {
        if (data === null || data === undefined) {
            throw new Error(`The data argument is null or undefined.`);
        }
        const instance = Bag.get(Id, secureContext, Object.prototype);
        const instanceData = privateBag.get(instance);
        const { dataSchema } = instanceData;
        dataSchema.validate({ data });
        instanceData.data = data;
    }
    /**
     * @param { String } Id
     * @param { SecureContext } secureContext
     * @returns { UUID }
    */
    static hasUUID(Id, secureContext) {
        if (Id === null || Id === undefined || typeof Id !== 'string' || !General.validateUuid(Id)) {
            throw new Error(`The Id argument is null, undefined, not a string or valid universal unique identifier`);
        }
        if (!privateBag.has(secureContext)) {
            return false;
        }
        const callbacks = privateBag.get(secureContext);
        if (callbacks.hasId(Id)) {
            return true;
        }
        return UUIDMap.has(Id);
    }
    /**
     * @param { String } Id
     * @param { SecureContext } secureContext
     * @returns { UUID }
    */
    static getUUID(Id, secureContext) {
        if (!Bag.hasUUID(Id, secureContext)) {
            throw new Error(`${Id} not found for secure context.`);
        }
        return UUIDMap.get(Id);
    }
    /**
     * @param { UUID } Id
     * @param { SecureContext } secureContext
    */
    static setUUID(Id, secureContext) {
        if (Bag.hasUUID(Id.toString(), secureContext)) {
            throw new Error(`${Id} already exists.`);
        }
        const callbacks = privateBag.get(secureContext);
        callbacks.setId(Id.toString());
        UUIDMap.set(Id.toString(), Id);
    }
    /**
     * @param { UUID } Id
     * @param { SecureContext } secureContext
     * @returns { Boolean }
    */
    static has(Id, secureContext) {
        if (Id === null || Id === undefined || !(Id instanceof UUID)) {
            throw new Error(`The Id argument is null, undefined or not an instance of ${UUID.name}`);
        }
        if (!Bag.hasUUID(Id.toString(), secureContext)) {
            return false;
        }
        return privateBag.has(Id);
    }
    /**
     * @template prototype the prototype of a class
     * @param { UUID } Id
     * @param { SecureContext } secureContext
     * @param { prototype } Class
     * @returns { prototype }
    */
    static get(Id, secureContext, Class) {
        if (Bag.has(Id, secureContext)) {
            const obj = privateBag.get(Id);
            if (obj instanceof Removed) {
                throw new Error('instance was disposed');
            }
            if (!(obj instanceof Class.constructor)) {
                throw new Error(`obj is not an instance of Class.`);
            }
            return obj;
        } else {
            throw new Error(`${Id} not found for secure context.`);
        }
    }
    /**
     * @param { UUID } Id universally unique identifier
     * @param { SecureContext } secureContext
     * @param { Object } instance
     * @param { Schema } dataSchema
    */
    static set(Id, secureContext, instance, dataSchema) {
        if (Bag.has(Id, secureContext)) {
            throw new Error(`${Id} for secure context already exists.`);
        }
        if (instance === undefined || instance === null || typeof instance !== 'object') {
            throw new Error(`The instance argument is null, undefined or not an ${Object.name}.`);
        }
        if (dataSchema === undefined || dataSchema === null || !(dataSchema instanceof Schema)) {
            throw new Error(`The dataSchema argument is null, undefined or not a ${Schema.name}.`);
        }
        if (!privateBag.has(secureContext)) {
            throw new Error(`The secure context was not constructed using the ${Bag.name}}`);
        }
        const callbacks = privateBag.get(secureContext);
        if (!callbacks.hasId(Id.toString())) {
            callbacks.setId(Id.toString());
        }
        privateBag.set(Id, instance);
        privateBag.set(instance, { data: null, dataSchema });
        const schemaPrototype = Object.getPrototypeOf(dataSchema);
        privateBag.set(dataSchema, schemaPrototype);
    }
    /**
     * @param { UUID } Id universally unique identifier
     * @param { SecureContext } secureContext
    */
    static remove(Id, secureContext) {
        if (!Bag.has(Id, secureContext)) {
            throw new Error(`${Id} for secure context does not exist.`);
        }
        const instance = privateBag.get(Id);
        const instanceData = privateBag.get(instance);
        if (instanceData) {
            const { dataSchema } = instanceData;
            privateBag.delete(dataSchema);
        }
        privateBag.delete(instance);
        privateBag.delete(Id);
        privateBag.set(Id, new Removed());
    }
    /**
     * @returns { SecureContext }
    */
    static getSecureContext() {
        const callbacks = {};
        const secureContext = new SecureContext(callbacks);
        Object.freeze(callbacks);
        privateBag.set(secureContext, callbacks);
        return secureContext;
    }
}