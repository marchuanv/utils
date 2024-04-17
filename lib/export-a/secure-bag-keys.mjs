import {
    UUID,
    UUIDMap
} from '../../registry.mjs';
export class SecureBagKeys {
    /**
     * @param { UUID | String } bag
     * @param { UUID | String } secureContext
    */
    constructor(bag, secureContext) {
        if (UUIDMap.hasKey([bag, secureContext])) {
            this._Id = UUIDMap.getKey([bag, secureContext]);
        } else {
            this._Id = UUIDMap.createKey([bag, secureContext]);
        }
        this._stateId = new UUID();
        this._propertiesId = new UUID();
        this._attributeId = new UUID();
        Object.freeze(this._Id);
        Object.freeze(this._stateId);
        Object.freeze(this._propertiesId);
        Object.freeze(this._attributeId);
        Object.freeze(this);
    }
    /**
     * @returns { UUID }
    */
    get Id() {
        return this._Id;
    }
    /**
     * @returns { UUID }
    */
    get stateKey() {
        if (UUIDMap.hasKey([this._Id, this._stateId])) {
            return UUIDMap.getKey([this._Id, this._stateId]);
        } else {
            return UUIDMap.createKey([this._Id, this._stateId]);
        }
    }
    /**
     * @returns { UUID }
    */
    get propertiesKey() {
        if (UUIDMap.hasKey([this._Id, this._propertiesId])) {
            return UUIDMap.getKey([this._Id, this._propertiesId]);
        } else {
            return UUIDMap.createKey([this._Id, this._propertiesId]);
        }
    }
    /**
     * @param { UUID | String } value
     * @returns { UUID }
    */
    getAttributeKey(value) {
        if (UUIDMap.hasKey([this._Id, value, this._propertiesId])) {
            return UUIDMap.getKey([this._Id, value, this._propertiesId]);
        } else {
            return UUIDMap.createKey([this._Id, value, this._propertiesId]);
        }
    }
}