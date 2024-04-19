import {
    UUID,
    UUIDMap
} from '../../registry.mjs';
export class SecureBagKeys extends UUID {
    /**
     * @param { UUID | String } bag
     * @param { UUID | String } secureContext
    */
    constructor(bag, secureContext) {
        if (UUIDMap.hasKey([bag, secureContext])) {
            const key = UUIDMap.getKey([bag, secureContext]);
            super(key.Id);
            Reflect.setPrototypeOf(key, SecureBagKeys.prototype);
            return key;
        } else {
            const key = UUIDMap.createKey([bag, secureContext]);
            super(key.Id);
            Reflect.setPrototypeOf(key, SecureBagKeys.prototype);
            key._stateId = new UUID();
            key._propertiesId = new UUID();
            key._attributeId = new UUID();
            Object.freeze(key._Id);
            Object.freeze(key._stateId);
            Object.freeze(key._propertiesId);
            Object.freeze(key._attributeId);
            Object.freeze(key);
            return key;
        }
    }
    /**
     * @returns { UUID }
    */
    get stateKey() {
        if (UUIDMap.hasKey([this.Id, this._stateId])) {
            return UUIDMap.getKey([this.Id, this._stateId]);
        } else {
            return UUIDMap.createKey([this.Id, this._stateId]);
        }
    }
    /**
     * @returns { UUID }
    */
    get propertiesKey() {
        if (UUIDMap.hasKey([this.Id, this._propertiesId])) {
            return UUIDMap.getKey([this.Id, this._propertiesId]);
        } else {
            return UUIDMap.createKey([this.Id, this._propertiesId]);
        }
    }
    /**
     * @param { UUID | String } value
     * @returns { UUID }
    */
    getAttributeKey(value) {
        if (UUIDMap.hasKey([this.Id, value, this._propertiesId])) {
            return UUIDMap.getKey([this.Id, value, this._propertiesId]);
        } else {
            return UUIDMap.createKey([this.Id, value, this._propertiesId]);
        }
    }
}