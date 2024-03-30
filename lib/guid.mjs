import {
    Bag,
    sha1,
    SecureContext,
    Schema,
    TypeInfo,
    randomUUID,
    General
} from '../registry.mjs';
const EMPTY_UINT8_ARRAY = new Uint8Array(0);
const HEX_DIGITS = '0123456789abcdef'.split('');
const secureContext = new SecureContext();
export class GUIDSchema extends Schema {
    constructor() {
        super([{
            name: 'IdStr',
            typeInfo: new TypeInfo({ type: String })
        }]);
    }
}
/**
 * This class provides functionality for generating and working with GUIDs, ensuring uniqueness and compatibility with RFC-4122 standards.
*/
export class GUID {
    /**
     * Constructs a new GUID instance.
     * @param { Object } data
     * @param { Schema } dataSchema
    */
    constructor(data = null, dataSchema = null) {
        const targetClass = new.target;
        const typeInfo = new TypeInfo({ type: targetClass });
        if (dataSchema === undefined || dataSchema === null) {
            this.dataSchema = new GUIDSchema();
        } else {
            if (!(dataSchema instanceof Schema)) {
                throw new Error(`The dataSchema argument is not a ${Schema.name}.`);
            }
            this.dataSchema = dataSchema;
        }
        let _data = data;
        if (_data === undefined || _data === null) {
            _data = {  IdStr: randomUUID() };
        }
        if (typeof _data === 'string') {
            if (General.validateUuid(_data)) {
                this.IdStr = _data;
            } else {
                throw new Error('invalid data');
            }
        } else {
            this.dataSchema.validate({ obj: _data });
            const json = this.dataSchema.serialise(_data);
            this.IdStr = createUuid(json);
        }
        Object.freeze(this);
        if (Bag.hasKey(this.IdStr, secureContext)) {
            const bagKey = Bag.getKey(this.IdStr, secureContext);
            return Bag.get(bagKey, targetClass.prototype);
        } else {
            Bag.set(this.IdStr, this, this.dataSchema, typeInfo, secureContext);
        }
    }
    /**
     * @returns { String } String representation of the GUID.
    */
    toString() {
        return this.IdStr;
    }
    /**
     * Clear the mapping to this GUID
    */
    destroy() {
        const bagKey = Bag.getKey(this.IdStr, secureContext);
        Bag.remove(bagKey, secureContext);
    }
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