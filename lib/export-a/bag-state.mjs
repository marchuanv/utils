import {
    UUID
} from '../../registry.mjs';
export class BagState extends UUID {
    /**
     * @param { String } stateName
    */
    constructor(stateName) {
        super(stateName);
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