import crypto from 'node:crypto';
import { sha1 } from '../registry.mjs';
const UUID_REGEXP = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMPTY_UINT8_ARRAY = new Uint8Array(0);
const HEX_DIGITS = '0123456789abcdef'.split('');
const UUID_LENGTH = 36;
const privateBag = new WeakMap();
const guids = new Map();
/**
 * This class provides functionality for generating and working with GUIDs, ensuring uniqueness and compatibility with RFC-4122 standards.
*/
export class GUID {
    /**
     * Constructs a new GUID instance.
     * @param {Object} metadata Metadata object.
     * @returns {GUID} A new GUID instance.
    */
    constructor(metadata = null) {
        const targetClass = new.target;
        if (targetClass === GUID) {
            throw new Error(`${GUID.name} is an abstract class`);
        }
        const metadataType = typeof metadata;
        if (metadata === undefined || !(metadataType === 'object' || metadataType === 'string') ) {
            throw new Error(`The metadata argument is undefined or not a string or an object.`);
        }
        Object.freeze(this);
        let IdStr = '';
        if (metadataType === 'object' && metadata !== null) {
            const json = serialise(metadata);
            IdStr = createUuid(json);
            if (!validateUuid(IdStr)) {
                throw new Error('guid generated from metadata is not valid.');
            }
        } else if (metadata === null) {
            IdStr = crypto.randomUUID();
        } else if (metadataType === 'string' && validateUuid(metadata)) {
            IdStr = metadata;    
        } else {
            throw new Error('invalid metadata.')
        }
        if (guids.has(IdStr)) {
            return guids.get(IdStr);
        } else {
            guids.set(IdStr, this);
            privateBag.set(this, IdStr);
        }
    }
    /**
     * @returns { GUID }
    */
    get Id() {
        return this;
    }
    /**
     * Converts the GUID to its string representation.
     * @returns { String } - String representation of the GUID.
    */
    toString() {
        return privateBag.get(this);
    }
}
/**
 * Validates UUID
 * @param {string} uuid UUID to validate
 * @return {boolean} Validation result
*/
function validateUuid(uuid) {
    return typeof uuid === 'string' && uuid.length === UUID_LENGTH && UUID_REGEXP.test(uuid);
}
/**
 * Concatenates two uint8 buffers
 * @param {Uint8Array} buf1 The first buffer to concatenate
 * @param {Uint8Array} buf2 The second buffer to concatenate
 * @returns {Uint8Array} Concatenation result
 */
function concatBuffers(buf1, buf2) {
    const out = new Uint8Array(buf1.length + buf2.length);
    out.set(new Uint8Array(buf1), 0);
    out.set(new Uint8Array(buf2), buf1.byteLength);
    return out;
}
/**
 * Converts unsigned byte to hex representation
 * @param { Number} ubyte The unsigned byte to convert
 * @returns { String } The hex representation
*/
function uint8ToHex(ubyte) {
    const first = ubyte >> 4;
    const second = ubyte - (first << 4);
    return HEX_DIGITS[first] + HEX_DIGITS[second];
}
/**
 * Converts unsigned byte buffer to hex string
 * @param {Uint8Array} buf The unsigned bytes buffer
 * @returns {string} The hex string representation
*/
function uint8ArrayToHex(buf) {
    let out = '';
    for (let i = 0; i < buf.length; i++) {
        out += uint8ToHex(buf[i]);
    }
    return out;
}
/**
 * Creates uuid from hash buffer
 * @param { Uint8Array } hashBuffer Hash buffer
 * @returns { String } The uuid
*/
function hashToUuid(hashBuffer) {
    const version = 5;
    return (
        // The low field of the timestamp
        uint8ArrayToHex(hashBuffer.slice(0, 4)) +
        '-' +
        // The middle field of the timestamp
        uint8ArrayToHex(hashBuffer.slice(4, 6)) +
        '-' +
        // The high field of the timestamp multiplexed with the version number
        uint8ToHex((hashBuffer[6] & 0x0f) | parseInt(version * 10, 16)) +
        uint8ToHex(hashBuffer[7]) +
        '-' +
        // The high field of the clock sequence multiplexed with the variant
        uint8ToHex((hashBuffer[8] & 0x3f) | 0x80) +
        // The low field of the clock sequence
        uint8ToHex(hashBuffer[9]) +
        '-' +
        //  The spatially unique node identifier
        uint8ArrayToHex(hashBuffer.slice(10, 16))
    );
}
/**
 * Generates SHA-1 hash from buffer
 * @param { Uint8Array } charBuffer Buffer of char codes
 * @returns { Uint8Array } SHA-1 hash buffer
*/
function sha1Hash(charBuffer) {
    return new Uint8Array(sha1.arrayBuffer(charBuffer));
}
/**
 * Converts string to buffer of char codes
 * @param {string} str The string to parse
 * @returns {Uint8Array} Buffer of char codes
*/
function stringToCharBuffer(str) {
    const escapedStr = encodeURIComponent(str);
    return Buffer.from(escapedStr);
}
/**
 * Generates the Name-Based UUID hashes v5 according to RFC-4122, v5 uses SHA-1
 * @param { String } target target to be hashed
 * @returns { String } UUID
*/
function createUuid(target) {
    if (typeof target !== 'string') {
        throw TypeError('target argument must be string');
    }
    // Parsing target chars
    const targetCharBuffer = stringToCharBuffer(target);
    const namespaceCharBuffer = EMPTY_UINT8_ARRAY;
    // Concatenation two buffers of strings to one
    const buffer = concatBuffers(namespaceCharBuffer, targetCharBuffer);
    // Getting hash
    const hash = sha1Hash(buffer);
    return hashToUuid(hash);
}
/**
 * Serializes an object into a JSON string.
 * @param {Object} obj - The object to serialize.
 * @returns {string} - The serialized JSON string.
*/
function serialise(obj) {
    const seen = new WeakSet();
    function serializeInternal(value) {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return; // Skip circular references
            }
            seen.add(value);
            if (value instanceof RegExp) {
                return '__REGEXP ' + value.toString();
            } else if (value instanceof Date) {
                return '__DATE ' + value.toISOString();
            } else if (value instanceof Set) {
                return { __SET: Array.from(value).map(serializeInternal) };
            } else if (Array.isArray(value)) {
                return value.map(serializeInternal);
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
                    if (typeof val === 'string') {
                        return val;
                    }
                }
                for (const key of keys) {
                    serializedObj[key] = serializeInternal(value[key]);
                }
                return serializedObj;
            }
        } else if (typeof value === 'function') {
            //Handle functions
            return '__FUNCTION ' + value.toString();
        } else if (value === undefined) {
            // Handle undefined values
            return '__UNDEFINED';
        } else {
            return value;
        }
    }
    return JSON.stringify(serializeInternal(obj));
}