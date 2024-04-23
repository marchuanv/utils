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
            this.dispose = function () {
                Bag.remove(this, secureContext);
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
        const secureBagKey = new SecureBagKeys(bag, secureContext);
        if (!privateBag.has(secureBagKey.propertiesKey)) {
            return false;
        }
        const properties = privateBag.get(secureBagKey.propertiesKey);
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
        const secureBagKey = new SecureBagKeys(bag, secureContext);
        if (!privateBag.has(secureBagKey.propertiesKey)) {
            throw new Error(`bag does not have any properties.`);
        }
        if (property === null || property === undefined || typeof property !== 'object' || Object.keys(property).length === 0) {
            throw new Error(`The property argument is null, undefined, not an object, or is an empty object.`);
        }
        const properties = privateBag.get(secureBagKey.propertiesKey);
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
        const secureBagKey = new SecureBagKeys(bag, secureContext);
        if (!privateBag.has(secureBagKey.propertiesKey)) {
            throw new Error(`bag does not have any properties.`);
        }
        if (property === null || property === undefined || typeof property !== 'object' || Object.keys(property).length === 0) {
            throw new Error(`The property argument is null, undefined, not an object, or is an empty object.`);
        }
        const properties = privateBag.get(secureBagKey.propertiesKey);
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
        const secureBagKey = new SecureBagKeys(bag, secureContext);
        if (!privateBag.has(secureBagKey.stateKey)) {
            return false;
        }
        const currentState = privateBag.get(secureBagKey.stateKey);
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
        const secureBagKey = new SecureBagKeys(bag, secureContext);
        if (privateBag.has(secureBagKey.stateKey)) {
            return privateBag.get(secureBagKey.stateKey);
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
        const secureBagKey = new SecureBagKeys(bag, secureContext);
        if (!privateBag.has(secureBagKey.stateKey)) {
            throw new Error('bag does not have a state.');
        }
        if (state === null || state === undefined || !(state instanceof BagState)) {
            throw new Error(`The state argument is null, undefined or not an instance of ${BagState.name}`);
        }
        privateBag.set(secureBagKey.stateKey, state);
    }
    /**
     * @param { Bag | UUID | String } bag
     * @param { SecureContext | UUID | String } secureContext
     * @returns { Boolean }
    */
    static has(bag, secureContext) {
        const secureBagKey = new SecureBagKeys(bag, secureContext);
        return privateBag.has(secureBagKey);
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
        const secureBagKey = new SecureBagKeys(bag, secureContext);
        return privateBag.get(secureBagKey);
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
        const secureBagKey = new SecureBagKeys(bag, secureContext);
        privateBag.set(secureBagKey, bag);
        privateBag.set(secureBagKey.stateKey, BagState.CONSTRUCT);
        privateBag.set(secureBagKey.propertiesKey, {});
        privateBag.set(secureBagKey.attributesKey, {});
    }
    /**
     * @param { Bag | UUID | String } bag
     * @param { SecureContext | UUID | String } secureContext
     * @param { BagAttribute | UUID | String } att
    */
    static remove(bag, secureContext, att = null) {
        const secureBagKey = new SecureBagKeys(bag, secureContext);
        privateBag.delete(secureBagKey);
        privateBag.delete(secureBagKey.stateKey);
        privateBag.delete(secureBagKey.propertiesKey);
        privateBag.delete(secureBagKey.attributesKey);
        secureBagKey.dispose();
    }
    /**
     * @returns { SecureContext }
    */
    static getSecureContext() {
        return new SecureContext();
    }
    /**
     * @param { SecureContext | UUID | String } secureContext
    */
    hasAttributes(secureContext, attType) {
        return Bag.hasAttributes(this, secureContext);
    }
    /**
     * @param { Bag | UUID | String } bag
     * @param { SecureContext | UUID | String } secureContext
     * @returns { Boolean }
    */
    static hasAttributes(bag, secureContext) {
        if (!this.has(bag, secureContext)) {
            throw new Error('secure bag does not exist.');
        }
        const secureBagKey = new SecureBagKeys(bag, secureContext);
        if (!privateBag.has(secureBagKey.attributesKey)) {
            return false;
        }
        const attributes = privateBag.get(secureBagKey.attributesKey);
        return Object.keys(attributes).length > 0;
    }
    /**
     * @param { SecureContext | UUID | String } secureContext
     * @param { Function } attType
    */
    hasAttributeType(secureContext, attType) {
        return Bag.hasAttributeType(this, secureContext, attType);
    }
    /**
     * @param { Bag | UUID | String } bag
     * @param { SecureContext | UUID | String } secureContext
     * @param { class } attType
     * @returns { Boolean }
    */
    static hasAttributeType(bag, secureContext, attType) {
        if (!this.has(bag, secureContext)) {
            throw new Error('secure bag does not exist.');
        }
        if (!Reflection.hasExtendedClass(attType, BagAttribute)) {
            throw new Error(`The attType argument does not extend ${BagAttribute.name}.`);
        }
        const secureBagKey = new SecureBagKeys(bag, secureContext);
        if (!privateBag.has(secureBagKey.attributesKey)) {
            return false;
        }
        const attributes = privateBag.get(secureBagKey.attributesKey);
        for (const attId of Object.keys(attributes)) {
            const att = attributes[attId];
            if (att && att.attributeType === attType) {
                return true;
            }
        }
        return false;
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
        if (!Reflection.isTypeOf(att, [UUID, BagAttribute, String])) {
            throw new Error(`The att argument is not an instance of a ${BagAttribute.name}, ${UUID.name} or a string.`);
        }
        const secureBagKey = new SecureBagKeys(bag, secureContext);
        if (!privateBag.has(secureBagKey.attributesKey)) {
            return false;
        }
        const attributes = privateBag.get(secureBagKey.attributesKey);
        return attributes[att.Id] !== undefined
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
        if (!Reflection.isTypeOf(att, [UUID, BagAttribute, String])) {
            throw new Error(`The att argument is not an instance of a ${BagAttribute.name}, ${UUID.name} or a string.`);
        }
        const secureBagKey = new SecureBagKeys(bag, secureContext);
        const attributes = privateBag.get(secureBagKey.attributesKey);
        return attributes[att.Id];
    }
    /**
     * @param { Bag | UUID | String } bag
     * @param { SecureContext | UUID | String } secureContext
     * @param { class } attType
     * @returns { Array<BagAttribute> }
    */
    getAttributes(secureContext, attType) {
        return Bag.getAttributes(this, secureContext, attType);
    }
    /**
     * @param { Bag | UUID | String } bag
     * @param { SecureContext | UUID | String } secureContext
     * @param { class } attType
     * @returns { Array<BagAttribute> }
    */
    static getAttributes(bag, secureContext, attType) {
        if (!this.has(bag, secureContext)) {
            throw new Error(`secure bag does not exist.`);
        }
        if (!Reflection.hasExtendedClass(attType, BagAttribute)) {
            throw new Error(`The attType argument does not extend ${BagAttribute.name}.`);
        }
        const secureBagKey = new SecureBagKeys(bag, secureContext);
        const attributes = privateBag.get(secureBagKey.attributesKey);
        return Object.keys(attributes)
            .map(attId => attributes[attId])
            .filter(({ attributeType }) => attributeType === attType);
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
        if (!Reflection.isTypeOf(att, [ UUID, BagAttribute, String ])) {
            throw new Error(`The att argument is not an instance of a ${BagAttribute.name}, ${UUID.name} or a string.`);
        }
        const secureBagKey = new SecureBagKeys(bag, secureContext);
        const attributes = privateBag.get(secureBagKey.attributesKey);
        attributes[att.Id] = att;
    }
}