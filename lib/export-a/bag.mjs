import {
    General,
    Property,
    SecureContext,
    UUID
} from '../../registry.mjs';
const privateBag = new WeakMap();
const secureContexts = new WeakSet();
const UUIDMap = new Map();
export class State extends UUID {
    constructor() { super(); }
    /**
     * @returns { State }
    */
    static get HYDRATE() {
        const { HYDRATE } = privateBag.get(State);
        return HYDRATE;
    }
    /**
     * @returns { State }
    */
    static get CONSTRUCT() {
        const { CONSTRUCT } = privateBag.get(State);
        return CONSTRUCT;
    }
    /**
     * @returns { State }
    */
    static get REMOVED() {
        const { REMOVED } = privateBag.get(State);
        return REMOVED;
    }
}
privateBag.set(State, {
    HYDRATE: new State(),
    CONSTRUCT: new State(),
    REMOVED: new State()
});
/**
 * This class provides functionality for holding references.
*/
export class Bag {
    /**
     * @param { UUID } Id
     * @param { SecureContext } secureContext
     * @returns { State }
    */
    static getState(Id, secureContext) {
        if (!hasUUID(Id, secureContext)) {
            throw new Error(`${Id} not found for secure context.`);
        }
        const uuid = getUUID(Id, secureContext);
        if (!hasUUID(uuid, secureContext)) {
            throw new Error(`stateId not found for secure context.`);
        }
        const stateId = getUUID(uuid, secureContext);
        return privateBag.get(stateId);
    }
    /**
     * @param { UUID } Id
     * @param { SecureContext } secureContext
     * @param { State } state
    */
    static setState(Id, secureContext, state) {
        if (state === null || state === undefined || !(state instanceof State)) {
            throw new Error(`The state argument is null, undefined, or not an instance of ${State.name}.`);
        }
        if (!hasUUID(Id, secureContext)) {
            throw new Error(`${Id} not found for secure context.`);
        }
        const uuid = getUUID(Id, secureContext);
        if (!hasUUID(uuid, secureContext)) {
            throw new Error(`stateId not found for secure context.`);
        }
        const stateId = getUUID(uuid, secureContext);
        privateBag.set(stateId, state);
    }
    /**
     * @param { UUID | String } Id
     * @param { SecureContext } secureContext
     * @returns { Boolean }
    */
    static has(Id, secureContext) {
        return hasUUID(Id, secureContext);
    }
    /**
     * @template prototype the prototype of a class
     * @param { UUID | String } Id
     * @param { SecureContext } secureContext
     * @param { prototype } Class
     * @returns { prototype }
    */
    static get(Id, secureContext, Class = Object) {
        if (!hasUUID(Id, secureContext)) {
            throw new Error(`${Id} not found for secure context.`);
        }
        const currentState = Bag.getState(Id, secureContext);
        if (currentState === State.REMOVED) {
            throw new Error('instance was removed.');
        }
        const uuid = getUUID(Id, secureContext);
        return privateBag.get(uuid);
    }
    /**
     * @param { UUID } instance
     * @param { SecureContext } secureContext
     * @param { Object } instance
    */
    static set(instance, secureContext) {
        if (instance === undefined || instance === null || !(instance instanceof UUID)) {
            throw new Error(`The instance argument is null, undefined, or not an instance of ${UUID.name}.`);
        }
        if (hasUUID(instance, secureContext)) {
            throw new Error(`${instance} for secure context already exists.`);
        }
        Object.freeze(secureContext);
        Object.freeze(instance);
        const uuid = createUUID(instance, secureContext);
        privateBag.set(uuid, instance);
        const stateId = createUUID(uuid, secureContext);
        privateBag.set(stateId, State.CONSTRUCT);
        secureContexts.add(secureContext);
    }
    /**
     * @param { UUID } Id universally unique identifier
     * @param { SecureContext } secureContext
     * @param { Property } property
    */
    static setProperty(Id, secureContext, property) {
        if (Bag.hasProperty(Id, secureContext, property)) {
            throw new Error('property already exist.');
        }
        if (property === undefined || property === null || !(property instanceof Property)) {
            throw new Error(`The property argument is null, undefined or not an instance of ${Property.name}.`);
        }
        if (!hasUUID(Id, secureContext)) {
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
        const instance = Bag.get(Id, secureContext);
        const properties = privateBag.get(instance);
        const prop = properties.find(p => p.name === propertyName);
        return prop.value;
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
        if (!hasUUID(Id, secureContext)) {
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
        if (!hasUUID(Id, secureContext)) {
            throw new Error(`${Id} for secure context does not exist.`);
        }
        const uuid = getUUID(Id, secureContext);
        const instance = privateBag.get(uuid);
        privateBag.delete(instance);
        privateBag.delete(uuid);
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
        if (secureContexts.has(inheritor)) {
            throw new Error(`inheriting from a secure context source is not allowed if the secure context inheritor already exist.`);
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
/**
 * @param { String | UUID } Id
 * @param { String | SecureContext } secureContext
 * @returns { Boolean }
*/
function hasUUID(Id, secureContext) {
    const _Id = getId(Id, secureContext);
    return UUIDMap.has(_Id);
}
/**
 * @param { String | UUID } Id
 * @param { String | SecureContext } secureContext
 * @returns { UUID }
*/
function getUUID(Id, secureContext) {
    if (!hasUUID(Id, secureContext)) {
        throw new Error(`${Id} not found for secure context.`);
    }
    const _Id = getId(Id, secureContext);
    return UUIDMap.get(_Id);
}
/**
 * @param { String | UUID } Id
 * @param { String | SecureContext } secureContext
*/
function createUUID(Id, secureContext) {
    if (hasUUID(Id, secureContext)) {
        throw new Error(`${Id} already exists.`);
    }
    const _Id = getId(Id, secureContext);
    const uuid = new UUID(_Id);
    Object.freeze(uuid);
    UUIDMap.set(_Id, uuid);
    return uuid;
}