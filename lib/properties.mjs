import { EventEmitter } from './registry.mjs';
const privateBag = new WeakMap();
export class Properties {
    /**
     * @param { Object } context
    */
    constructor(context = {}) {
        const bag = new Map();
        const event = new EventEmitter();
        privateBag.set(this, context);
        privateBag.set(context, { bag, event });
        Object.seal(context);
        Object.seal(this);
    }
    /**
     * @param { Function } callback
    */
    onSet(propertyName, callback) {
        const context = privateBag.get(this);
        const { event } = privateBag.get(context);
        event.on(propertyName, ({ bag, value }) => {
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
        const context = privateBag.get(this);
        const { event } = privateBag.get(context);
        event.once(propertyName, ({ bag, value }) => {
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
        const context = privateBag.get(this);
        const { bag, event } = privateBag.get(context);
        bag.set(propertyName, propertyValue);
        event.emit(propertyName, { bag, value: propertyValue });
    }
    /**
     * @template T
     * @param { String } propertyName
     * @param { T } type
     * @returns { T }
    */
    get(propertyName, type) {
        const context = privateBag.get(this);
        const { bag } = privateBag.get(context);
        return bag.get(propertyName);
    }
    serialise() {
        const context = privateBag.get(this);
        const { bag } = privateBag.get(context);
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