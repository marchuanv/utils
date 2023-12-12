import {
    randomUUID,
    TypeMapper
} from '../../registry.mjs';
const privateBag = new WeakMap();
export class MemberParameter {
    /**
     * @param { Object } field
     * @param { TypeMapper } typeMap
    */
    constructor(field, typeMap) {
        const key = Object.keys(field)[0];
        const value = field[key];
        privateBag.set(this, {
            Id: randomUUID(),
            name: key,
            value,
            type: typeMap
        });
    }
    /**
     * @returns { String }
    */
    get Id() {
        const { Id } = privateBag.get(this);
        return Id;
    }
    /**
     * @returns { String }
    */
    get name() {
        const { name } = privateBag.get(this);
        return name;
    }
    /**
     * @returns { Object }
    */
    get value() {
        const { value } = privateBag.get(this);
        return value;
    }
    /**
     * @returns { TypeMapper }
    */
    get type() {
        const { type } = privateBag.get(this);
        return type;
    }
}