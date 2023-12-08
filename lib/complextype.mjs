const privateBag = new WeakMap();
export class ComplexType {
    /**
     * @param { Object } type
    */
    constructor(type) {
        privateBag.set(this, { type, associatedType: null })
    }
    get type() {
        const { type } = privateBag.get(this);
        return type;
    }
    toString() {
        const typeName = this.type.name.toLowerCase();
        if (this.associatedType) {
            const associatedTypeName = this.associatedType.name.toLowerCase();
            if (typeName === associatedTypeName) {
                return typeName;
            }
            return `${typeName}<${associatedTypeName}>`;
        } else {
            return typeName;
        }
    }
    get associatedType() {
        const { associatedType } = privateBag.get(this);
        return associatedType;
    }
    set associatedType(value) {
        return privateBag.get(this).associatedType = value;
    }
    static get Array() {
        return objectArray;
    }
    static get StringArray() {
        return stringArray;
    }
    static get NumberArray() {
        return numberArray;
    }
    static get BooleanArray() {
        return booleanArray;
    }
    static get Object() {
        return object;
    }
}

const stringArray = new ComplexType(Array);
stringArray.associatedType = String;

const numberArray = new ComplexType(Array);
numberArray.associatedType = Number;

const booleanArray = new ComplexType(Array);
numberArray.associatedType = Boolean;

const objectArray = new ComplexType(Array);
objectArray.associatedType = Object;

const object = new ComplexType(Object);
object.associatedType = Object;