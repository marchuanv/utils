import { ComplexType } from "../complextype.mjs";
import { PrimitiveType } from "../primitivetype.mjs";
const privateBag = new WeakMap();
export class TypeMapper {
    /**
     * @param { String | ComplexType | PrimitiveType } type
    */
    constructor(type) {
        const typeString = typeof type === 'string' ? type.toLowerCase() : type.toString();
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
                const types = privateBag.get(TypeMapper);
                let _complexType = types.find(t => t.name.toLowerCase() === typeString);
                if (_complexType) {
                    const complexType = new ComplexType(Object);
                    complexType.associatedType = _complexType;
                    privateBag.set(this, complexType);
                } else {
                    throw new Error('unable to determine type');
                }
            }
        }
    }
    /**
     * @returns { ComplexType | PrimitiveType }
    */
    get info() {
        return privateBag.get(this);
    }
    /**
     * @param { class } targetClass
    */
    static register(targetClass) {
        const types = privateBag.get(TypeMapper);
        types.push(targetClass);
    }
}
privateBag.set(TypeMapper, []);