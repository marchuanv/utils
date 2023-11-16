import { Bag, RaiseEvent, randomUUID } from './registry.mjs';
const privateBag = new WeakMap();
export class Context {
    constructor() {
        this._Id = randomUUID();
        Object.seal(this);
    }
    get Id() {
        return this._Id;
    }
}
export class Properties {
    /**
     * @param { Object } context
    */
    constructor(context = new Context()) {
        if (privateBag.has(context)) {
            privateBag.set(this, context);
            const { bag, event } = privateBag.get(context);
            const sharedBag = new Bag(context);
            const sharedRaiseEvent = new RaiseEvent(context);
            privateBag.set(bag, sharedBag);
            privateBag.set(event, sharedRaiseEvent);
        } else {
            const bag = new Bag(this);
            const event = new RaiseEvent(this);
            privateBag.set(this, context);
            privateBag.set(context, { bag, event });
        }
        Object.seal(context);
        Object.seal(this);
    }
    /**
     * @param { Function } callback
    */
    onSet(propertyName, callback) {
        const { event } = getBagAndEvent.call(this);
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
        const { event } = getBagAndEvent.call(this);
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
        const { bag, event } = getBagAndEvent.call(this);
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
        const { bag } = getBagAndEvent.call(this);
        return bag.get(propertyName);
    }
    serialise() {
        const { bag } = getBagAndEvent.call(this);
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

function getBagAndEvent() {
    const context = privateBag.get(this);
    const { bag, event } = privateBag.get(context);
    if (!bag.isOwner(this) || !event.isOwner(this)) {
        const sharedBag = privateBag.get(bag);
        const sharedEvent = privateBag.get(event);
        return {
            bag: sharedBag,
            event: sharedEvent
        };
    }
    return { bag, event };
}