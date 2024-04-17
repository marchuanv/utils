import {
    BagAttribute,
    BagState,
    Reflection,
    SecureBagKeys,
    SecureContext,
    UUID
} from '../../registry.mjs';
const privateBag = new WeakMap();
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
            /**
             * @param { BagState } atState
             * @returns { Boolean }
            */
            this.dispose = function (atState) {
                const currentState = Bag.getState(this, secureContext);
                if (currentState === atState) {
                    Bag.remove(this, secureContext);
                    return true;
                }
                return false;
            };
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
    static hasProperty(bag, secureContext, property) {
        if (!this.has(bag, secureContext)) {
            throw new Error('secure bag does not exist.');
        }
        if (property === null || property === undefined || typeof property !== 'object' || Object.keys(property).length === 0) {
            throw new Error(`The property argument is null, undefined, not an object, or is an empty object.`);
        }
        const secureBagKeys = new SecureBagKeys(bag, secureContext);
        if (!privateBag.has(secureBagKeys.propertiesKey)) {
            return false;
        }
        const properties = privateBag.get(secureBagKeys.propertiesKey);
        const propertyName = Object.keys(property)[0];
        return properties[propertyName] !== undefined;
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
        if (!this.has(bag, secureContext)) {
            throw new Error('secure bag does not exist.');
        }
        const secureBagKeys = new SecureBagKeys(bag, secureContext);
        if (!privateBag.has(secureBagKeys.propertiesKey)) {
            throw new Error(`bag does not have any properties.`);
        }
        if (property === null || property === undefined || typeof property !== 'object' || Object.keys(property).length === 0) {
            throw new Error(`The property argument is null, undefined, not an object, or is an empty object.`);
        }
        const properties = privateBag.get(secureBagKeys.propertiesKey);
        const propertyName = Object.keys(property)[0];
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
        if (!this.has(bag, secureContext)) {
            throw new Error('secure bag does not exist.');
        }
        const secureBagKeys = new SecureBagKeys(bag, secureContext);
        if (!privateBag.has(secureBagKeys.propertiesKey)) {
            throw new Error(`bag does not have any properties.`);
        }
        if (property === null || property === undefined || typeof property !== 'object' || Object.keys(property).length === 0) {
            throw new Error(`The property argument is null, undefined, not an object, or is an empty object.`);
        }
        const properties = privateBag.get(secureBagKeys.propertiesKey);
        const propertyName = Object.keys(property)[0];
        if (properties[propertyName] === undefined) {
            throw new Error(`bag with ${propertyName} property does not exist.`);
        }
        return properties[propertyName];
    }
    /**
     * @param { SecureContext | UUID | String } secureContext
     * @param { BagState } state
     * @returns { Boolean }
    */
    hasState(secureContext, state) {
        return Bag.hasState(this, secureContext, state);
    }
    /**
     * @param { Bag | UUID | String } bag
     * @param { SecureContext | UUID | String } secureContext
     * @param { BagState } state
     * @returns { Boolean }
    */
    static hasState(bag, secureContext, state) {
        if (!this.has(bag, secureContext)) {
            throw new Error('secure bag does not exist.');
        }
        if (state === null || state === undefined || !(state instanceof BagState)) {
            throw new Error(`The state argument is null, undefined or not an instance of ${BagState.name}`);
        }
        const secureBagKeys = new SecureBagKeys(bag, secureContext);
        if (!privateBag.has(secureBagKeys.stateKey)) {
            return false;
        }
        const currentState = privateBag.get(secureBagKeys.stateKey);
        return currentState === state;
    }
    /**
     * @param { SecureContext | UUID | String } secureContext
     * @returns { BagState }
    */
    getState(secureContext) {
        return Bag.getState(this, secureContext);
    }
    /**
     * @param { Bag | UUID | String } bag
     * @param { SecureContext | UUID | String } secureContext
     * @returns { BagState }
    */
    static getState(bag, secureContext) {
        if (!Bag.has(bag, secureContext)) {
            throw new Error('secure bag does not exist.');
        }
        const secureBagKeys = new SecureBagKeys(bag, secureContext);
        if (privateBag.has(secureBagKeys.stateKey)) {
            return privateBag.get(secureBagKeys.stateKey);
        }
        throw new Error('bag does not have a state.');
    }
    /**
     * @param { SecureContext | UUID | String } secureContext
     * @param { BagState } state
    */
    setState(secureContext, state) {
        Bag.setState(this, secureContext, state);
    }
    /**
     * @param { Bag | UUID | String } bag
     * @param { SecureContext | UUID | String } secureContext
     * @param { BagState } state
    */
    static setState(bag, secureContext, state) {
        if (!Bag.has(bag, secureContext)) {
            throw new Error('secure bag does not exist.');
        }
        const secureBagKeys = new SecureBagKeys(bag, secureContext);
        if (!privateBag.has(secureBagKeys.stateKey)) {
            throw new Error('bag does not have a state.');
        }
        if (state === null || state === undefined || !(state instanceof BagState)) {
            throw new Error(`The state argument is null, undefined or not an instance of ${BagState.name}`);
        }
        privateBag.set(secureBagKeys.stateKey, state);
    }
    /**
     * @param { Bag | UUID | String } bag
     * @param { SecureContext | UUID | String } secureContext
     * @returns { Boolean }
    */
    static has(bag, secureContext) {
        const secureBagKeys = new SecureBagKeys(bag, secureContext);
        return privateBag.has(secureBagKeys.Id);
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
            throw new Error('secure bag does not exist.');
        }
        const secureBagKeys = new SecureBagKeys(bag, secureContext);
        return privateBag.get(secureBagKeys.Id);
    }
    /**
     * @param { Bag } bag
     * @param { SecureContext } secureContext
     * @param { Object } instance
    */
    static create(bag, secureContext) {
        if (this.has(bag, secureContext)) {
            throw new Error('secure bag already exists.');
        }
        Object.freeze(bag);
        Object.freeze(secureContext);
        const secureBagKeys = new SecureBagKeys(bag, secureContext);
        privateBag.set(secureBagKeys.Id, bag);
        privateBag.set(secureBagKeys.stateKey, BagState.CONSTRUCT);
        privateBag.set(secureBagKeys.propertiesKey, {});
    }
    /**
     * @param { Bag | UUID | String } bag
     * @param { SecureContext | UUID | String } secureContext
     * @param { BagAttribute | UUID | String } att
    */
    static remove(bag, secureContext, att = null) {
        const secureBagKeys = new SecureBagKeys(bag, secureContext);
        privateBag.delete(secureBagKeys.Id);
        privateBag.delete(secureBagKeys.stateKey);
        privateBag.delete(secureBagKeys.propertiesKey);
        if (att !== null && att !== undefined) {
            privateBag.delete(secureBagKeys.getAttributeKey(att));
        }
    }
    /**
     * @returns { SecureContext }
    */
    static getSecureContext() {
        return new SecureContext();
    }
    /**
     * @param { SecureContext | UUID | String } secureContext
     * @param { BagAttribute | UUID | String } att
    */
    hasAttribute(secureContext, att) {
        return Bag.hasAttribute(this, secureContext, att);
    }
    /**
     * @param { Bag | UUID | String } bag
     * @param { SecureContext | UUID | String } secureContext
     * @param { BagAttribute | UUID | String } att
     * @returns { Boolean }
    */
    static hasAttribute(bag, secureContext, att) {
        if (!this.has(bag, secureContext)) {
            throw new Error('secure bag does not exist.');
        }
        if (att === null || att === undefined || !(att instanceof BagAttribute)) {
            throw new Error(`The att argument is null, undefined or not an instance of ${BagAttribute.name}.`);
        }
        const secureBagKeys = new SecureBagKeys(bag, secureContext);
        return privateBag.has(secureBagKeys.getAttributeKey(att));
    }
    /**
     * @param { SecureContext | UUID | String } secureContext
     * @param { BagAttribute | UUID | String } att
     * @returns { BagAttribute }
    */
    getAttribute(secureContext, att) {
        return Bag.getAttribute(this, secureContext, att);
    }
    /**
     * @param { Bag | UUID | String } bag
     * @param { SecureContext | UUID | String } secureContext
     * @param { BagAttribute | UUID | String } att
     * @returns { BagAttribute }
    */
    static getAttribute(bag, secureContext, att) {
        if (!this.has(bag, secureContext)) {
            throw new Error(`secure bag does not exist.`);
        }
        const secureBagKeys = new SecureBagKeys(bag, secureContext);
        return privateBag.get(secureBagKeys.getAttributeKey(att));
    }
    /**
     * @param { SecureContext | UUID | String } secureContext
     * @param { BagAttribute | UUID | String } att
    */
    setAttribute(secureContext, att) {
        Bag.setAttribute(this, secureContext, att);
    }
    /**
     * @param { Bag | UUID | String } bag
     * @param { SecureContext | UUID | String } secureContext
     * @param { BagAttribute } att
    */
    static setAttribute(bag, secureContext, att) {
        if (!this.has(bag, secureContext)) {
            throw new Error(`secure bag does not exist.`);
        }
        if (att === null || att === undefined || !(att instanceof BagAttribute)) {
            throw new Error(`The att argument is null, undefined or not an instance of ${BagAttribute.name}.`);
        }
        const secureBagKeys = new SecureBagKeys(bag, secureContext);
        privateBag.set(secureBagKeys.getAttributeKey(att), att);
    }
}