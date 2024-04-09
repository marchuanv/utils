import {
    DataSchema,
    General,
    SecureContext,
    UUID
} from '../../registry.mjs';
const privateBag = new WeakMap();
const UUIDMap = new Map();
export class Removed { }
/**
 * This class provides functionality for holding references.
*/
export class Bag {
    /**
     * @param { String } Id
     * @param { SecureContext } secureContext
     * @returns { UUID }
    */
    static hasUUID(Id, secureContext) {
        if (Id === null || Id === undefined || typeof Id !== 'string' || !General.validateUuid(Id)) {
            throw new Error(`The Id argument is null, undefined, not a string or invalid universal unique identifier`);
        }
        if (UUIDMap.has(Id)) {
            const { contextId } = UUIDMap.get(Id);
            return contextId === secureContext.Id;
        }
        return false;
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
        const mapping = UUIDMap.get(Id);
        return mapping.Id;
    }
    /**
     * @param { UUID } Id
     * @param { SecureContext } secureContext
    */
    static setUUID(Id, secureContext) {
        const IdStr = Id.toString();
        if (Bag.hasUUID(IdStr, secureContext)) {
            throw new Error(`${IdStr} already exists.`);
        }
        UUIDMap.set(IdStr, { Id, contextId: secureContext.Id });
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
        if (Bag.hasUUID(Id.toString(), secureContext) && privateBag.has(Id)) {
            return true;
        }
        return false;
    }
    /**
     * @template prototype the prototype of a class
     * @param { UUID } Id
     * @param { SecureContext } secureContext
     * @param { prototype } Class
     * @returns { prototype }
    */
    static get(Id, secureContext, Class = Object) {
        if (!Bag.has(Id, secureContext)) {
            throw new Error(`${Id} not found for secure context.`);
        }
        const obj = privateBag.get(Id);
        if (obj instanceof Removed) {
            throw new Error('instance was disposed');
        }
        return obj;
    }
    /**
     * @param { UUID } Id universally unique identifier
     * @param { SecureContext } secureContext
     * @param { Object } instance
     * @param { Object } data
    */
    static set(Id, secureContext, instance, data = null) {
        if (instance === undefined || instance === null || !(instance instanceof DataSchema)) {
            throw new Error(`The instance argument is null, undefined or not an instance of ${DataSchema.name}.`);
        }
        if (Bag.has(Id, secureContext)) {
            throw new Error(`${Id} for secure context already exists.`);
        }
        if (!Bag.hasUUID(Id.toString(), secureContext)) {
            Bag.setUUID(Id, secureContext);
        }
        privateBag.set(Id, instance);
        if (data !== undefined && data !== null) {
            if (typeof data !== 'object') {
                throw new Error(`The data argument is not an object.`);
            }
            instance.validate(data);
        }
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
        privateBag.delete(instance);
        privateBag.delete(Id);
        privateBag.set(Id, new Removed());
    }
    /**
     * @returns { SecureContext }
    */
    static getSecureContext() {
        return new SecureContext();
    }
}