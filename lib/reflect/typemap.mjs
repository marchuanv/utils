import { ComplexType } from "../complextype.mjs";
import { PrimitiveType } from "../primitivetype.mjs";
const privateBag = new WeakMap();
export class TypeMap {
    /**
     * @param { String } typeString
    */
    constructor(typeString) {
        switch(typeString) {
            case 'string': {
                privateBag.set(this, PrimitiveType.String);
                return;
            }
            case 'number': {
                privateBag.set(this, PrimitiveType.Number);
                return;
            }
            case 'boolean': {
                privateBag.set(this, PrimitiveType.Boolean);
                return;
            }
            case 'object': {
                privateBag.set(this, ComplexType.Object);
                return;
            }
            case 'array<string>': {
                privateBag.set(this, ComplexType.StringArray);
                return;
            }
            case 'array<number>': {
                privateBag.set(this, ComplexType.NumberArray);
                return;
            }
            case 'array<boolean>': {
                privateBag.set(this, ComplexType.BooleanArray);
                return;
            }
            case 'array': {
                privateBag.set(this, ComplexType.Array);
                return;
            }
            default: {
                throw new Error('unable to determine type');
            }
        }
    }
    /**
     * @returns { ComplexType | PrimitiveType }
    */
    get type() {
        return privateBag.get(this);
    }
}