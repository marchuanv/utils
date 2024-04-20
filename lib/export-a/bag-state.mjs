import {
    UUID,
    UUIDMap
} from '../../registry.mjs';
export class BagState extends UUID {
    /**
     * @param { String } stateName
    */
    constructor(stateName) {
        super(stateName);
        if (UUIDMap.hasKey([this.Id])) {
            return UUIDMap.getKey([this.Id]);
        } else {
            const key = UUIDMap.createKey([this.Id]);
            Object.setPrototypeOf(key, this);
            Object.freeze(key);
            return key;
        }
    }
    /**
     * @returns { BagState }
    */
    static get HYDRATE() {
        return new BagState('HYDRATE');
    }
    /**
     * @returns { BagState }
    */
    static get REHYDRATE() {
        return new BagState('REHYDRATE');
    }
    /**
     * @returns { BagState }
    */
    static get CONSTRUCT() {
        return new BagState('CONSTRUCT');
    }
    /**
     * @returns { BagState }
    */
    static get REMOVED() {
        return new BagState('REMOVED');
    }
}