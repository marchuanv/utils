import { EventEmitter } from './registry.mjs';
const eventEmitter = new EventEmitter();
const privateBag = new WeakMap();
export class Properties {
    constructor() {
        const _keyVal = new Map();
        for (const key of Object.getOwnPropertyNames(this.constructor.prototype)) {
            _keyVal.set(key, null);
            eventEmitter.on(key, ({ keyVal, value }) => {
                keyVal.set(key, value);
            });
        }
        privateBag.set(this, _keyVal);
        Object.seal(this);
    }
    /**
     * @param { Function } callback
    */
    onChange(propertyName, callback) {
        eventEmitter.on(propertyName, ({ keyVal, value }) => {
            const newValue = callback(value);
            if (newValue !== undefined) {
                keyVal.set(propertyName, newValue);
            }
        });
    }
    /**
     * @param { String } propertyName
     * @param { Object } propertyValue
    */
    set(propertyName, propertyValue) {
        const keyVal = privateBag.get(this);
        eventEmitter.emit(propertyName, { keyVal, value: propertyValue });
    }
    /**
     * @param { String } propertyName
    */
    get(propertyName) {
        const keyVal = privateBag.get(this);
        return keyVal.get(propertyName);
    }
}