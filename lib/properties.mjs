import { Bag } from './registry.mjs';
const privateBag = new WeakMap();
export class Properties {
    /**
     * @param { Object } context
    */
    constructor(context = null) {
        if (context) {
            if (privateBag.has(context)) {
                const bag = privateBag.get(context);
                let childBag = bag.firstChild;
                if (childBag) {
                    privateBag.set(this, childBag);
                } else {
                    childBag = new Bag(this);
                    bag.child = childBag;
                    privateBag.set(this, childBag);
                }
            } else {
                throw new Error('context does not exist.');
            }
        } else {
            const bag = new Bag(this);
            privateBag.set(this, bag);
        }
        Object.seal(context);
        Object.seal(this);
    }
    /**
     * @param { Function } callback
    */
    onSet(propertyName, callback) {
        const bag = privateBag.get(this);
        bag.event.on(propertyName, ({ bag, value }) => {
            const newValue = callback(value);
            if (newValue !== undefined) {
                bag.set(propertyName, newValue);
            }
        });
    }
    /**
     * @param { Function } callback
    */
    onceSet(propertyName, callback) {
        const bag = privateBag.get(this);
        bag.event.once(propertyName, ({ bag, value }) => {
            const newValue = callback(value);
            if (newValue !== undefined) {
                bag.set(propertyName, newValue);
            }
        });
    }
    /**
     * @param { String } propertyName
     * @param { Object } propertyValue
    */
    set(propertyName, propertyValue) {
        const bag = privateBag.get(this);
        bag.set(propertyName, propertyValue);
        bag.event.emit(propertyName, { bag, value: propertyValue });
    }
    /**
     * @template T
     * @param { String } propertyName
     * @param { T } type
     * @returns { T }
    */
    get(propertyName, type) {
        const bag = privateBag.get(this);
        return bag.get(propertyName);
    }
    serialise() {
        const bag = privateBag.get(this);
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