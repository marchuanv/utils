import {
    DataSchema,
} from '../../registry.mjs';
export class Property {
    /**
     * @param { String } name
     * @param { Object } value
    */
    constructor(name, value) {
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
export class Properties extends DataSchema {
    /**
     * @param { Array<Property> } properties
    */
    constructor(properties) {
        if (properties === null || properties === undefined || !Array.isArray(properties) || properties.length === 0 || !(properties[0] instanceof Property)) {
            throw new Error(`The properties argument is null, undefined, not an array, empty or contains elements that are not of type ${Property.name}`);
        }
        super();
        for (const { name, value } of properties) {
            this[name] = value;
        };
        Object.freeze(this);
    }
    validate() { }
}