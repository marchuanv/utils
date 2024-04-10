import {
    UUID
} from '../../registry.mjs';
export class Property extends UUID {
    /**
     * @param { String } name
     * @param { Object } value
    */
    constructor(name, value) {
        super();
        this._name = name;
        this._value = value;
    }
    /**
     * @returns { String }
    */
    get name() { return this._name; }
    /**
     * @returns { Object }
    */
    get value() { return this._value; }
}