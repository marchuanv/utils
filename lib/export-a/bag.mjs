import {
    SecureContext,
    UUID,
    UUIDMap
} from '../../registry.mjs';

const privateBag = new WeakMap();
const secureContexts = new WeakMap();
const uuidMap = new UUIDMap();
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
export class Bag extends UUID {
    /**
     * @param { String } Id
     * @param { SecureContext } secureContext
    */
    constructor(Id, secureContext) {
        if (Id === null || Id === undefined || typeof Id !== 'string' || Reflection.isEmptyString(Id)) {
            throw new Error(`The Id argument is null, undefined, not a string or is an empty string.`);
        }
        if (secureContext === null || secureContext === undefined || !(secureContext instanceof SecureContext)) {
            throw new Error(`The secureContext argument is null, undefined, or not an instance of ${SecureContext.name}.`);
        }
        super(Id);
        if (Bag.has(super.toString(), secureContext)) {
            return Bag.get(super.toString(), secureContext);
        } else {
            Bag.set(this, secureContext);
        }
    }
    
    /**
     * @param { Bag | UUID | String } bag universally unique identifier
     * @param { SecureContext | UUID | String } secureContext
     * @param { Object } property i.e. { firstName: null }
     * @returns { Boolean }
    */
    static hasProperty(bag, secureContext, property = undefined) {
        if (!this.has(bag, secureContext)) {
            throw new Error('secure bag does not exist.');
        }
        const { propertiesUUID } = getPrivateBagKeys(bag, secureBagUUID);
        if (uuidMap.has(propertiesUUID)) {
            if (property !== null && property !== undefined) {
                const properties = privateBag.get(uuidMap.get(propertiesUUID));
                const propertyName = Object.keys(property)[0];
                return properties[propertyName] !== undefined;
            }
            return true;
        }
        return false;
    }
    /**
     * @param { UUID } Id universally unique identifier
     * @param { SecureContext } secureContext
     * @param { Object } property i.e. { firstName: 'Joe Blog' }
    */
    static setProperty(Id, secureContext, property) {
        if (Bag.hasProperty(Id, secureContext, property)) {
            throw new Error('property already exist.');
        }
        Object.freeze(property);
        const instance = Bag.get(Id, secureContext);
        const propertyName = Object.keys(property)[0];
        const properties = privateBag.get(instance);
        properties[propertyName] = property[propertyName];
    }
    /**
     * @param { UUID } Id universally unique identifier
     * @param { SecureContext } secureContext
     * @param { Object } property i.e. { firstName: null }
     * @returns { Object }
    */
    static getProperty(Id, secureContext, property) {
        if (!Bag.hasProperty(Id, secureContext, property)) {
            const propertyName = Object.keys(property)[0];
            throw new Error(`${propertyName} property does not exist.`);
        }
        const propertyName = Object.keys(property)[0];
        const instance = Bag.get(Id, secureContext);
        const properties = privateBag.get(instance);
        return properties[propertyName];
    }
    /**
     * @param { Bag | UUID | String } bag
     * @param { SecureContext | UUID | String } secureContext
     * @param { State } state
     * @returns { Boolean }
    */
    static hasState(bag, secureContext, state = null) {
        if (!this.has(bag, secureContext)) {
            throw new Error('secure bag does not exist.');
        }
        const secureBagUUID = UUID.merge([bag, secureContext]);
        const stateUUID = UUID.merge([secureBagUUID, globalStateId]);
        if (uuidMap.has(stateUUID)) {
            if (state !== null && state !== undefined) {
                const currentState = privateBag.get(uuidMap.get(stateUUID));
                return state === currentState;
            }
            return true;
        }
        return false;
    }
    /**
     * @param { Bag } bag
     * @param { SecureContext } secureContext
     * @returns { State }
    */
    static getState(bag, secureContext) {
        if (!Bag.hasState(bag, secureContext)) {
            throw new Error(`bag does not have a state.`);
        }
        const secureBagUUID = UUID.merge([bag, secureContext]);
        const { Id } = UUID.merge([globalStateId, secureBagUUID]);
        const stateUUID = uuidMap.get(Id);
        return privateBag.has(stateUUID);
    }
    /**
     * @param { Bag } bag
     * @param { SecureContext } secureContext
     * @param { State } state
    */
    static setState(bag, secureContext, state) {
        if (!Bag.has(bag, secureContext)) {
            throw new Error(`bag does not exist.`);
        }
        const secureBagUUID = UUID.merge([bag, secureContext]);
        const { Id } = UUID.merge([globalStateId, secureBagUUID]);
        const stateUUID = uuidMap.get(Id);
        privateBag.set(stateUUID, state);
    }
    /**
     * @param { UUID | String } Id
     * @param { SecureContext | String } secureContext
     * @returns { Boolean }
    */
    static has(bag, secureContext) {
        const secureBagUUID = UUID.merge([bag, secureContext]);
        if (uuidMap.has(secureBagUUID)) {
            return privateBag.get(uuidMap.get(secureBagUUID));
        }
        return false;
    }
    /**
     * @template prototype the prototype of a class
     * @param { UUID | String } bag
     * @param { SecureContext | String } secureContext
     * @param { prototype } Class
     * @returns { prototype }
    */
    static get(bag, secureContext, Class = Object) {
        if (!this.has(bag, secureContext)) {
            throw new Error(`secure bag does not exist.`);
        }
        const secureBagUUID = UUID.merge([bag, secureContext]);
        return privateBag.get(uuidMap.get(secureBagUUID));
    }
    /**
     * @param { Bag } bag
     * @param { SecureContext } secureContext
     * @param { Object } instance
    */
    static set(bag, secureContext) {
        if (this.has(bag, secureContext)) {
            throw new Error(`secure bag already exists.`);
        }

        const isValidBag = bag !== null && bag !== undefined && bag instanceof Bag;
        const isValidSecureContext = secureContext !== null && secureContext !== undefined && secureContext instanceof SecureContext;
        if (!isValidBag || !isValidSecureContext) {
            throw new Error('bag and/or secure context is invalid.');
        }

        Object.freeze(bag);
        Object.freeze(secureContext);

        const secureBagUUID = UUID.merge([bag, secureContext]);
        const stateUUID = UUID.merge([secureBagUUID, globalStateId, secureContext]);
        const propertiesUUID = UUID.merge([secureBagUUID, globalPropertiesId, secureContext]);
        
        uuidMap.set(secureBagUUID);
        uuidMap.set(stateUUID);
        uuidMap.set(propertiesUUID);
        
        privateBag.set(secureBagUUID, bag);
        privateBag.set(stateUUID, State.CONSTRUCT);
        privateBag.set(propertiesUUID, {});
    }
    /**
     * @param { Bag | UUID | String } Id universally unique identifier
     * @param { SecureContext | UUID | String } secureContext
    */
    static remove(bag, secureContext) {
        if (!Bag.has(Id, secureContext)) {
            throw new Error('secure bag does not exist.');
        }
        const secureBagUUID = uuidMap.get(UUID.merge([bag, secureContext]));
        const stateUUID = uuidMap.get(UUID.merge([secureBagUUID, globalStateId]));
        const propertiesUUID = uuidMap.get(UUID.merge([secureBagUUID, globalPropertiesId]));

        privateBag.delete(secureBagUUID);
        privateBag.delete(stateUUID);
        privateBag.delete(propertiesUUID);

        uuidMap.delete(secureBagUUID);
        uuidMap.delete(stateUUID);
        uuidMap.delete(propertiesUUID);
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
 * @param { Bag | UUID | String } bag
 * @param { SecureContext | UUID | String } secureContext
 * @returns { Array<UUID> }
*/
function getPrivateBagKeys(bag, secureContext) {
    const globalStateId = new UUID('ccaca85f-2173-43fa-83cd-0f3969bc734c');
    const globalPropertiesId = new UUID('3461b1a0-6172-4f7d-af53-cdba9e05637a');
    
    let secureBagUUID = UUID.merge([bag, secureContext]);
    let stateUUID = UUID.merge([secureBagUUID, globalStateId ]);
    let propertiesUUID = UUID.merge([secureBagUUID, globalPropertiesId]);

    secureBagUUID = uuidMap.get(secureBagUUID);
    stateUUID = uuidMap.get(stateUUID);
    propertiesUUID = uuidMap.get(propertiesUUID);

    if (uuidMap.has(propertiesUUID)) {

    return {
        secureBagUUID,
        stateUUID,
        propertiesUUID
    };
}