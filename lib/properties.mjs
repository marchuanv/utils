import { Bag, randomUUID } from './registry.mjs';
const privateBag = new WeakMap();
export class Context {
    constructor() {
        this._Id = randomUUID();
        this._name = null;
        Object.seal(this);
    }
    get Id() {
        return this._Id;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
}
export class Properties {
    /**
     * @param { Object } context
    */
    constructor(context = new Context()) {
        if (privateBag.has(context)) {
            privateBag.set(this, context);
        } else {
            const bag = new Bag(this);
            bag.child = new Bag(context);
            context.name = this.constructor.name;
            privateBag.set(this, context);
            privateBag.set(context, bag);
        }
        Object.seal(context);
        Object.seal(this);
    }
    /**
     * @param { Function } callback
    */
    onSet(propertyName, callback) {
        const bag = getValidatedBag.call(this);
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
        const bag = getValidatedBag.call(this);
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
        const bag = getValidatedBag.call(this);
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
        const bag = getValidatedBag.call(this);
        return bag.get(propertyName);
    }
    serialise() {
        const bag = getValidatedBag.call(this);
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
 * @returns { Bag }
*/
function getValidatedBag() {
    const owner = this;
    let { bag } = getBag(owner);
    if (bag.isOwner(owner)) {
        return bag;
    } else {
        bag.reset();
        if (bag.next) {
            return bag.current;
        } else {
            throw new Error('owner does not have access.');
        }
    }
}
/**
 * @returns { Bag }
*/
function getBag(context) {
    const results = privateBag.get(context);
    if (results instanceof Bag) {
        return { bag: results, ctx: context };
    } else {
        return getBag(results);
    }
}