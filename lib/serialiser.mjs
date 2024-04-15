import { Reflection } from "../registry.mjs";
/**
 * This class provides functionality for serialising and deserialising objects
*/
export class Serialiser {
    static deserialise() {

    }
    /**
     * Serializes an object into a JSON string.
     * @param {Object} obj - The object to serialize.
     * @returns {string} - The serialized JSON string.
    */
    static serialise(obj) {
        const seen = new WeakSet();
        function serializeInternal(value) {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return; // Skip circular references
                }
                seen.add(value);
                if (value instanceof RegExp) {
                    return {
                        key: RegExp.name,
                        value: value.toString()
                    };
                } else if (value instanceof Date) {
                    return {
                        key: Date.name,
                        value: value.toISOString()
                    };
                } else if (value instanceof Set) {
                    return { __SET: Array.from(value).map(serializeInternal) };
                } else if (Array.isArray(value)) {
                    let _array = [];
                    for (const item of value) {
                        const value = serializeInternal(item);
                        _array.push(value);
                    }
                    return _array;
                } else if (value instanceof Object) {
                    const serializedObj = {};
                    let keys = Object.keys(value);
                    if (keys.length === 0) {
                        keys = Reflect.ownKeys(Object.getPrototypeOf(value));
                    }
                    keys = keys.map(key => {
                        const desc = Reflect.getOwnPropertyDescriptor(value, key);
                        if (desc) {
                            return key;
                        }
                        return null;
                    }).filter(key => key);
                    if (keys.length === 0) { //there are no properties, try calling toString() to get a value
                        const val = value.toString();
                        if (typeof val === 'string' && val !== '[object Object]') {
                            return val;
                        } else {
                            throw new Error('obj does not have any properties.');
                        }
                    }
                    for (const key of keys) {
                        serializedObj[key] = serializeInternal(value[key]);
                    }
                    return serializedObj;
                }
            } else if (Reflection.isClass(value)) {
                //Handle classes
                return {
                    key: value.name,
                    script: value.toString()
                };
            } else if (typeof value === 'function') {
                //Handle functions
                return {
                    key: value.name,
                    script: value.toString()
                };
            } else if (value === undefined) {
                //Handle undefined
                return {
                    key: 'undefined',
                    value: undefined
                };
            } else {
                return value;
            }
        }
        return JSON.stringify(serializeInternal(obj));
    }
}