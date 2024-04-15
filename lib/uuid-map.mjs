import { General, UUID } from '../registry.mjs';
const uuIdMap = new Map();
export class UUIDMap {
    /**
     * @param { Array<UUID | String> |  UUID | String } uuids
     * @returns { Boolean }
    */
    static hasKey(uuids) {
        const compositeKey = getCompositeKey(uuids);
        return uuIdMap.has(compositeKey);
    }
    /**
     * @param { Array<UUID | String> |  UUID | String } uuids
     * @returns { UUID }
    */
    static getKey(uuids) {
        if (!this.hasKey(uuids)) {
            throw new Error('composite key created from uuids does not exist.');
        }
        const compositeKey = getCompositeKey(uuids);
        return uuIdMap.get(compositeKey);
    }
    /**
     * @param { Array<UUID | String> |  UUID | String } uuids
     * @returns { UUID }
    */
    static createKey(uuids) {
        if (this.hasKey(uuids)) {
            throw new Error('composite key created from uuids already exists.');
        }
        const compositeKey = getCompositeKey(uuids);
        uuIdMap.set(compositeKey.toString(), compositeKey);
        return compositeKey;
    }
    /**
     * @param { Array<UUID | String> |  UUID | String } uuids
    */
    static delete(uuids) {
        if (!this.hasKey(uuids)) {
            throw new Error('composite key created from uuids does not exist.');
        }
        const compositeKey = getCompositeKey(uuids);
        uuIdMap.delete(compositeKey);
    }
}
/**
 * @param { Array<UUID | String> } guids
 * @returns { UUID }
*/
function getCompositeKey(uuids) {
    if (uuids === null || uuids === undefined) {
        throw new Error('The uuids argument is null or undefined.');
    }
    const _uuids = Array.isArray(uuids) ? uuids : [uuids];
    const Ids = _uuids.map(uuid => key(uuid).toString()).join('-');
    return new UUID(Ids);
}
/**
 * @param { UUID | String } uuid
 * @returns { UUID }
*/
function key(uuid) {
    let isValid = uuid !== null && uuid !== undefined;
    let isUUID = false;
    let isUUIDString = false;
    if (isValid) {
        if (typeof uuid === 'object') {
            isUUID = uuid instanceof UUID;
        } else if (typeof uuid === 'string') {
            isUUIDString = General.validateUuid(uuid);
        }
    }
    isValid = isUUID || isUUIDString;
    if (!isValid) {
        throw new Error(`The guid argument is null, undefined, not an instance of ${UUID.name}, not a string, or an invalid universal unique identifier`);
    }
    if (isUUID) {
        return uuid.toString();
    } else if (isUUIDString) {
        return uuid;
    }
}
