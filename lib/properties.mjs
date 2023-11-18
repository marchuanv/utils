import { Bag } from './registry.mjs';
const privateBag = new WeakMap();

class PropertiesMap {
    constructor() {
        this._bag = null;
    }
    /**
     * @returns { Bag }
    */
    get bag() {
        return this._bag;
    }
    /**
     * @param { Bag }
    */
    set bag(value) {
        this._bag = value;
    }
}

export class Properties {
    /**
     * @param { Object } context
    */
    constructor(context = null) {
        if (context) {
            let parentBag = null;
            ({ bag: parentBag } = getPropertiesMap(context));
            let relatedMap = privateBag.get(parentBag);
            if (!relatedMap) {
                const childBag = new Bag(this);
                parentBag.child = childBag;
                relatedMap = new PropertiesMap();
                relatedMap.bag = parentBag.first;
                privateBag.set(parentBag, relatedMap);
            }
            privateBag.set(this, relatedMap);
        } else {
            const thisMap = new PropertiesMap();
            thisMap.bag = new Bag(this);
            privateBag.set(this, thisMap);
        }
        Object.seal(this);
    }
    /**
     * @param { Function } callback
    */
    onSet(propertyName, callback) {
        const { bag } = getPropertiesMap(this);
        bag.on(propertyName, false, callback);
    }
    /**
     * @param { Function } callback
    */
    onceSet(propertyName, callback) {
        const { bag } = getPropertiesMap(this);
        bag.on(propertyName, true, callback);
    }
    /**
     * @param { String } propertyName
     * @param { Object } propertyValue
    */
    set(propertyName, propertyValue) {
        const { bag } = getPropertiesMap(this);
        bag.set(propertyName, propertyValue);
    }
    /**
     * @template T
     * @param { String } propertyName
     * @param { T } type
     * @returns { T }
    */
    get(propertyName, type) {
        const { bag } = getPropertiesMap(this);
        return bag.get(propertyName);
    }
    serialise() {
        const { bag } = getPropertiesMap(this);
        if (!bag.isOwner(this)) {
            throw new Error(`not the owner of ${Bag.name}`);
        }
        const keys = bag.keys();
        const serialised = {};
        for (const key of keys) {
            const value = bag.get(key);
            const type = typeof value;
            if (type === 'string' || type === 'number' || type === 'boolean') {
                serialised[key] = value;
            } else {
                if (value instanceof Properties) {
                    const serialisedStr = value.serialise();
                    serialised[key] = JSON.parse(serialisedStr);
                } else {
                    const serialisedStr = JSON.stringify(value);
                    serialised[key] = JSON.parse(serialisedStr);
                }
            }
        }
        return JSON.stringify(serialised);
    }
}
/**
 * @returns { PropertiesMap }
*/
function getPropertiesMap(context) {
    const obj = privateBag.get(context);
    if (obj instanceof PropertiesMap) {
        return obj;
    }
}