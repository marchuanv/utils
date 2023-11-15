import { EventEmitter, randomUUID } from './registry.mjs';
const eventEmitter = new EventEmitter();
const privateBag = new WeakMap();
export class Properties {
    constructor() {
        const _Id = randomUUID();

        const _keyVal = new Map();
        _keyVal.set('Id', _Id);
        _keyVal.set('text', null);

        for (const key of _keyVal.keys()) {
            eventEmitter.on(key, ({ keyVal, value }) => {
                keyVal.set(key, value);
            });
        }

        privateBag.set(this, _keyVal);
        Object.seal();
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
     * @returns { String }
    */
    get Id() {
        const keyVal = privateBag.get(this);
        return keyVal.get('Id');
    }
    /**
     * @param { String } value
    */
    set Id(value) {
        const keyVal = privateBag.get(this);
        eventEmitter.emit('Id', { keyVal, value });
    }

    /**
     * @returns { String }
    */
    get text() {
        const keyVal = privateBag.get(this);
        return keyVal.get('text');
    }
    /**
     * @param { String } value
    */
    set text(value) {
        const keyVal = privateBag.get(this);
        eventEmitter.emit('text', { keyVal, value });
    }

}