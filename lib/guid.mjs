import { randomUUID, sha1 } from '../registry.mjs';
const UUID_REGEXP = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMPTY_UINT8_ARRAY = new Uint8Array(0);
const HEX_DIGITS = '0123456789abcdef'.split('');
const UUID_LENGTH = 36;
const privateBag = new WeakMap();
export class GUID {
    /**
     * @param { Object } metadata
    */
    constructor(metadata) {
        if (typeof metadata !== 'object') {
            throw new Error(`The metadata argument is not an object`);
        }
        const json = JSON.stringify(metadata);
        let Id = getUuid(json);
        if (!validateUuid(Id)) {
            throw new Error('guid generated from metadata is not valid.');
        }
        if (isKnown.call(this, Id)) {
            return getKnown.call(this, Id);
        } else {
            makeKnown.call(this, Id);
        }
        privateBag.set(this, Id);
    }
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
 * @param {number} ubyte The unsigned byte to convert
 * @returns {string} The hex representation
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
 * @param {Uint8Array} hashBuffer Hash buffer
 * @param {5} version Version of uuid
 * @returns {string} The uuid
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
 * @param {Uint8Array} charBuffer Buffer of char codes
 * @returns {Uint8Array} SHA-1 hash buffer
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
function getUuid(target) {
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
 * @returns { Map }
*/
function IdMap() {
    let _IdMap = null;
    if (privateBag.has(GUID)) {
        _IdMap = privateBag.get(GUID);
    } else {
        _IdMap = new Map();
        privateBag.set(GUID, _IdMap);
    }
    return _IdMap;
}
/**
 * @param { String } Id uuid
 * @returns { Boolean }
*/
function isKnown(Id) {
    return IdMap().has(Id);
}
/**
 * @param { String } Id uuid
*/
function makeKnown(Id) {
    return IdMap().set(Id, this);
}
/**
 * @param { String } Id uuid
 * @returns { GUID }
*/
function getKnown(Id) {
    return IdMap().get(Id);
}