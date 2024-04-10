import {
    DataSchema,
    General,
    Property,
    SecureContext,
    UUID
} from '../../registry.mjs';
const privateBag = new WeakMap();
const secureContexts = new WeakSet();
const UUIDMap = new Map();
export class Removed { }
/**
 * This class provides functionality for holding references.
*/
export class Bag {
    /**
     * @param { String | UUID } Id
     * @param { String | SecureContext } secureContext
     * @returns { Boolean }
    */
    static hasUUID(Id, secureContext) {
        const _Id = getId(Id, secureContext);
        return UUIDMap.has(_Id);
    }
    /**
     * @param { String | UUID } Id
     * @param { String | SecureContext } secureContext
     * @returns { UUID }
    */
    static getUUID(Id, secureContext) {
        if (!Bag.hasUUID(Id, secureContext)) {
            throw new Error(`${Id} not found for secure context.`);
        }
        const _Id = getId(Id, secureContext);
        return UUIDMap.get(_Id);
    }
    /**
     * @param { String | UUID } Id
     * @param { String | SecureContext } secureContext
    */
    static createUUID(Id, secureContext) {
        if (Bag.hasUUID(Id, secureContext)) {
            throw new Error(`${Id} already exists.`);
        }
        const _Id = getId(Id, secureContext);
        const uuid = new UUID(_Id);
        Object.freeze(uuid);
        UUIDMap.set(_Id, uuid);
        return uuid;
    }
    /**
     * @template prototype the prototype of a class
     * @param { UUID } Id
     * @param { SecureContext } secureContext
     * @param { prototype } Class
     * @returns { prototype }
    */
    static get(Id, secureContext, Class = Object) {
        if (!Bag.hasUUID(Id, secureContext)) {
            throw new Error(`${Id} not found for secure context.`);
        }
        const uuid = Bag.getUUID(Id, secureContext);
        const obj = privateBag.get(uuid);
        if (obj instanceof Removed) {
            throw new Error('instance was disposed');
        }
        return obj;
    }
    /**
     * @param { UUID } Id universally unique identifier
     * @param { SecureContext } secureContext
     * @param { Object } instance
    */
    static set(Id, secureContext, instance) {
        if (instance === undefined || instance === null || !(instance instanceof DataSchema)) {
            throw new Error(`The instance argument is null, undefined or not an instance of ${DataSchema.name}.`);
        }
        if (Bag.hasUUID(Id, secureContext)) {
            throw new Error(`${Id} for secure context already exists.`);
        }
        Object.freeze(secureContext);
        Object.freeze(Id);
        const uuid = Bag.createUUID(Id, secureContext);
        privateBag.set(uuid, instance);
        secureContexts.add(secureContext);
    }
    /**
     * @param { UUID } Id universally unique identifier
     * @param { SecureContext } secureContext
     * @param { Property } property
    */
    static setProperty(Id, secureContext, property) {
        if (property === undefined || property === null || !(property instanceof Property)) {
            throw new Error(`The property argument is null, undefined or not an instance of ${Property.name}.`);
        }
        if (!Bag.hasUUID(Id, secureContext)) {
            throw new Error(`${Id} for secure context does not exist.`);
        }
        Object.freeze(property);
        const instance = Bag.get(Id, secureContext);
        if (privateBag.has(instance)) {
            privateBag.get(instance).push(property);
        } else {
            privateBag.set(instance, [property]);
        }
    }
    /**
     * @param { UUID } Id universally unique identifier
     * @param { SecureContext } secureContext
     * @param { Object } property i.e. { firstName: null }
     * @returns { Object }
    */
    static getProperty(Id, secureContext, property) {
        if (!Bag.hasProperty(Id, secureContext, property)) {
            throw new Error('property does not exist.');
        }
        const propertyName = Object.keys(property)[0];
        if (!Bag.hasUUID(Id, secureContext)) {
            throw new Error(`${Id} for secure context does not exist.`);
        }
        const instance = Bag.get(Id, secureContext);
        if (!privateBag.has(instance)) {
            privateBag.set(instance, []);
        }
        return privateBag.get(instance).find(p => p.name === propertyName);
    }
    /**
     * @param { UUID } Id universally unique identifier
     * @param { SecureContext } secureContext
     * @param { Object } property i.e. { firstName: null }
     * @returns { Boolean }
    */
    static hasProperty(Id, secureContext, property) {
        if (property === undefined || property === null || typeof property !== 'object' || Object.keys(property).length === 0) {
            throw new Error(`The property argument is null, undefined, not an object or an empty object.`);
        }
        const propertyName = Object.keys(property)[0];
        if (!Bag.hasUUID(Id, secureContext)) {
            return false;
        }
        const instance = Bag.get(Id, secureContext);
        if (!privateBag.has(instance)) {
            return false;
        }
        return privateBag.get(instance).some(p => p.name === propertyName);
    }
    /**
     * @param { UUID } Id universally unique identifier
     * @param { SecureContext } secureContext
    */
    static remove(Id, secureContext) {
        if (!Bag.hasUUID(Id, secureContext)) {
            throw new Error(`${Id} for secure context does not exist.`);
        }
        const uuid = Bag.getUUID(Id, secureContext);
        const instance = privateBag.get(uuid);
        privateBag.delete(instance);
        privateBag.delete(uuid);
        privateBag.set(uuid, new Removed());
    }
    /**
     * @returns { SecureContext }
    */
    static getSecureContext() {
        return new SecureContext();
    }
    /**
     * @param { SecureContext } source
     * @param { SecureContext } inheritor
    */
    static inherit(source, inheritor) {
        if (secureContexts.has(source) || secureContexts.has(inheritor)) {
            throw new Error(`inheriting from a secure context source is not allowed, if the secure context inheritor already exist.`);
        }
        inheritor.Id = source.Id;
    }
}
/**
 * @param { String | UUID } Id
 * @param { String | SecureContext } secureContext
 * @returns { String }
*/
function getId(Id, secureContext) {
    if (Id === null || Id === undefined || !(typeof Id === 'string' || Id instanceof UUID) && !General.validateUuid(Id)) {
        throw new Error(`The Id argument is null, undefined, not a string or an invalid universal unique identifier`);
    }
    if (secureContext === null || secureContext === undefined || !(typeof secureContext === 'string' || secureContext instanceof UUID) && !General.validateUuid(secureContext)) {
        throw new Error(`The secureContext argument is null, undefined, not a string or an invalid universal unique identifier`);
    }
    const newId = new UUID(`${Id}${secureContext}`);
    return newId.toString();
}