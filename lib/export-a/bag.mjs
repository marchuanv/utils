import {
    Reflection,
    SecureContext,
    UUID,
    UUIDMap
} from '../../registry.mjs';
const privateBag = new WeakMap();
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
            Bag.create(this, secureContext);
        }
    }
    /**
     * @param { SecureContext | UUID | String } secureContext
     * @param { Object } property i.e. { firstName: null }
     * @returns { Boolean }
    */
    hasProperty(secureContext, property) {
        return Bag.hasProperty(this, secureContext, property);
    }
    /**
     * @param { Bag | UUID | String } bag
     * @param { SecureContext | UUID | String } secureContext
     * @param { Object } property i.e. { firstName: null }
     * @returns { Boolean }
    */
    static hasProperty(bag, secureContext, property = undefined) {
        if (!Bag.has(bag, secureContext)) {
            throw new Error('secure bag does not exist.');
        }
        if (!hasPrivateBagKeys(bag, secureContext, { propertiesUUID: null })) {
            return false;
        }
        if (property !== null && property !== undefined) {
            if (typeof property !== 'object' || Object.keys(property).length === 0) {
                throw new Error(`property is not an object, or is an empty object.`);
            }
            const { propertiesUUID } = getPrivateBagKeys(bag, secureContext);
            const properties = privateBag.get(UUIDMap.get(propertiesUUID));
            const propertyName = Object.keys(property)[0];
            return properties[propertyName] !== undefined;
        }
        return true;
    }
    /**
     * @param { SecureContext | UUID | String } secureContext
     * @param { Object } property i.e. { firstName: 'Joe Blog' }
    */
    setProperty(secureContext, property) {
        Bag.setProperty(this, secureContext, property);
    }
    /**
     * @param { Bag | UUID | String } bag
     * @param { SecureContext | UUID | String } secureContext
     * @param { Object } property i.e. { firstName: 'Joe Blog' }
    */
    static setProperty(bag, secureContext, property) {
        if (!Bag.hasProperty(Id, secureContext)) {
            throw new Error(`bag with properties does not exist.`);
        }
        Object.freeze(property);
        const propertyName = Object.keys(property)[0];
        const { propertiesUUID } = getPrivateBagKeys(bag, secureContext);
        const properties = Bag.get(propertiesUUID, secureContext);
        properties[propertyName] = property[propertyName];
    }
    /**
     * @param { SecureContext | UUID | String } secureContext
     * @param { Object } property i.e. { firstName: null }
     * @returns { Object }
    */
    getProperty(secureContext, property) {
        return Bag.getProperty(this, secureContext, property);
    }
    /**
     * @param { Bag | UUID | String } bag
     * @param { SecureContext | UUID | String } secureContext
     * @param { Object } property i.e. { firstName: null }
     * @returns { Object }
    */
    static getProperty(bag, secureContext, property) {
        if (!Bag.hasProperty(Id, secureContext, property)) {
            const propertyName = Object.keys(property)[0];
            throw new Error(`bag with ${propertyName} property does not exist.`);
        }
        const propertyName = Object.keys(property)[0];
        const { propertiesUUID } = getPrivateBagKeys(bag, secureContext);
        const properties = privateBag.get(propertiesUUID);
        return properties[propertyName];
    }
    /**
     * @param { SecureContext | UUID | String } secureContext
     * @param { State } state
     * @returns { Boolean }
    */
    hasState(secureContext, state) {
        return Bag.hasState(this, secureContext, state);
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
        if (!hasPrivateBagKeys(bag, secureContext, { stateUUID: null })) {
            return false;
        }
        if (state !== null && state !== undefined) {
            if (!(state instanceof State)) {
                throw new Error(`state is not an instance of ${State.name}`);
            }
            const { stateUUID } = getPrivateBagKeys(bag, secureContext);
            const currentState = privateBag.get(stateUUID);
            return currentState === state;
        }
        return true;
    }
    /**
     * @param { SecureContext | UUID | String } secureContext
     * @returns { State }
    */
    getState(secureContext) {
        return Bag.getState(this, secureContext);
    }
    /**
     * @param { Bag | UUID | String } bag
     * @param { SecureContext | UUID | String } secureContext
     * @returns { State }
    */
    static getState(bag, secureContext) {
        if (!Bag.hasState(bag, secureContext)) {
            throw new Error(`bag with state does not exist.`);
        }
        const { stateUUID } = getPrivateBagKeys(bag, secureContext);
        return privateBag.get(stateUUID);
    }
    /**
     * @param { SecureContext | UUID | String } secureContext
     * @param { State } state
    */
    setState(secureContext, state) {
        Bag.setState(this, secureContext, state);
    }
    /**
     * @param { Bag | UUID | String } bag
     * @param { SecureContext | UUID | String } secureContext
     * @param { State } state
    */
    static setState(bag, secureContext, state) {
        if (!Bag.hasState(bag, secureContext, state)) {
            throw new Error(`bag with state: ${state.Id} does not exist.`);
        }
        const { stateUUID } = getPrivateBagKeys(bag, secureContext);
        privateBag.set(stateUUID, state);
    }
    /**
     * @param { Bag | UUID | String } bag
     * @param { SecureContext | UUID | String } secureContext
     * @returns { Boolean }
    */
    static has(bag, secureContext) {
        return hasPrivateBagKeys(bag, secureContext);
    }
    /**
     * @template prototype the prototype of a class
     * @param { Bag | UUID | String } bag
     * @param { SecureContext | UUID | String } secureContext
     * @param { prototype } Class
     * @returns { prototype }
    */
    static get(bag, secureContext, Class = Object) {
        if (!this.has(bag, secureContext)) {
            throw new Error(`secure bag does not exist.`);
        }
        const { secureBagUUID } = getPrivateBagKeys(bag, secureContext);
        return privateBag.get(secureBagUUID);
    }
    /**
     * @param { Bag } bag
     * @param { SecureContext } secureContext
     * @param { Object } instance
    */
    static create(bag, secureContext) {
        if (Bag.has(bag, secureContext)) {
            throw new Error(`secure bag already exists.`);
        }
        const { secureBagUUID, stateUUID, propertiesUUID } = createPrivateBagKeys(bag, secureContext);
        Object.freeze(bag);
        Object.freeze(secureContext);
        privateBag.set(secureBagUUID, bag);
        privateBag.set(stateUUID, State.CONSTRUCT);
        privateBag.set(propertiesUUID, {});
    }
    /**
     * @param { Bag | UUID | String } Id universally unique identifier
     * @param { SecureContext | UUID | String } secureContext
    */
    static remove(bag, secureContext) {
        if (!Bag.has(bag, secureContext)) {
            throw new Error('secure bag does not exist.');
        }
        const { secureBagUUID, stateUUID, propertiesUUID } = getPrivateBagKeys(bag, secureContext);
        privateBag.delete(secureBagUUID);
        privateBag.delete(stateUUID);
        privateBag.delete(propertiesUUID);
        deletePrivateBagKeys(bag, secureContext);
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
 * @param { Bag } bag
 * @param { SecureContext } secureContext
 * @returns { { secureBagUUID: UUID, stateUUID: UUID, propertiesUUID: UUID } }
*/
function createPrivateBagKeys(bag, secureContext) {
    if (!(bag instanceof Bag)) {
        throw new Error(`bag is not an instance of ${Bag.name}`);
    }
    if (!(secureContext instanceof SecureContext)) {
        throw new Error(`secureContext is not an instance of ${SecureContext.name}`);
    }

    const globalStateId = new UUID('ccaca85f-2173-43fa-83cd-0f3969bc734c');
    const globalPropertiesId = new UUID('3461b1a0-6172-4f7d-af53-cdba9e05637a');

    let secureBagUUID = UUIDMap.createKey([bag, secureContext]);
    let stateUUID = UUIDMap.createKey([secureBagUUID, globalStateId]);
    let propertiesUUID = UUIDMap.createKey([secureBagUUID, globalPropertiesId]);

    return {
        secureBagUUID,
        stateUUID,
        propertiesUUID
    };
}
/**
 * @param { Bag | UUID | String } bag
 * @param { SecureContext | UUID | String } secureContext
 * @returns { { secureBagUUID: UUID, stateUUID: UUID, propertiesUUID: UUID } }
*/
function getPrivateBagKeys(bag, secureContext) {

    const globalStateId = new UUID('ccaca85f-2173-43fa-83cd-0f3969bc734c');
    const globalPropertiesId = new UUID('3461b1a0-6172-4f7d-af53-cdba9e05637a');

    let secureBagUUID = UUIDMap.getKey([bag, secureContext]);
    let stateUUID = UUIDMap.getKey([secureBagUUID, globalStateId]);
    let propertiesUUID = UUIDMap.getKey([secureBagUUID, globalPropertiesId]);

    return {
        secureBagUUID,
        stateUUID,
        propertiesUUID
    };
}
/**
 * @param { Bag | UUID | String } bag
 * @param { SecureContext | UUID | String } secureContext
 * @param { Object } privateBagKeys i.e. { secureBagUUID: null }
 * @returns { Boolean }
*/
function hasPrivateBagKeys(bag, secureContext, privateBagKeys = {}) {
    if (privateBagKeys === null || privateBagKeys === undefined || typeof privateBagKeys !== 'object') {
        throw new Error(`The privateBagKeys argument is null, undefined or not an object.`);
    }
    let isValid = false;
    if (UUIDMap.hasKey([bag, secureContext])) {
        let secureBagUUID = UUIDMap.getKey([bag, secureContext]);
        isValid = true;
        let { stateUUID, propertiesUUID } = privateBagKeys;
        if (stateUUID !== undefined) {
            const globalStateId = new UUID('ccaca85f-2173-43fa-83cd-0f3969bc734c');
            isValid = UUID.hasKey([secureBagUUID, globalStateId]);
        }
        if (propertiesUUID !== undefined) {
            const globalPropertiesId = new UUID('3461b1a0-6172-4f7d-af53-cdba9e05637a');
            isValid = UUID.hasKey([secureBagUUID, globalPropertiesId]);
        }
    }
    return isValid;
}
/**
 * @param { Bag | UUID | String } bag
 * @param { SecureContext | UUID | String } secureContext
*/
function deletePrivateBagKeys(bag, secureContext) {

    const globalStateId = new UUID('ccaca85f-2173-43fa-83cd-0f3969bc734c');
    const globalPropertiesId = new UUID('3461b1a0-6172-4f7d-af53-cdba9e05637a');

    let secureBagUUID = UUIDMap.getKey([bag, secureContext]);
    let stateUUID = UUID.getKey([secureBagUUID, globalStateId]);
    let propertiesUUID = UUID.getKey([secureBagUUID, globalPropertiesId]);

    return {
        secureBagUUID,
        stateUUID,
        propertiesUUID
    };
}