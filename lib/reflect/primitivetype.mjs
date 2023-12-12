import { Type } from "../../registry.mjs";
export class PrimitiveType extends Type {
    /**
     * @param { String } name
     * @param { Object } nativeType
     * @param { Boolean } isArray
    */
    constructor(name, nativeType, isArray) {
        if (nativeType === String || nativeType === Number || nativeType === Boolean || nativeType === BigInt) {
            super(name, nativeType, isArray);
        } else {
            throw new Error('nativeType is not a primitive data type');
        }
    }
    /**
     * @returns { PrimitiveType }
    */
    static get String() {
        return string;
    }
    /**
     * @returns { PrimitiveType }
    */
    static get Number() {
        return number;
    }
    /**
     * @returns { PrimitiveType }
    */
    static get Boolean() {
        return boolean;
    }
    /**
     * @returns { PrimitiveType }
    */
    static get BigInt() {
        return bigInt;
    }
}
const string = new PrimitiveType('string', String);
const number = new PrimitiveType('number', Number);
const boolean = new PrimitiveType('boolean', Boolean);
const bigInt = new PrimitiveType('number', BigInt);