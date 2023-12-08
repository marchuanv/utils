import { PrimitiveType, ComplexType } from '../registry.mjs';
export class ContainerItem {
    /**
     * @param { Object } field
     * @param { PrimitiveType | ComplexType } type
    */
    constructor(field, type) {
        this.name = Object.keys(field)[0];
        this.value = field[this.name];
        if (type === ComplexType.NumberArray || type === ComplexType.StringArray || type === ComplexType.BooleanArray ) {
            this.type = Array;
            this.itemType = type.associatedType;
        } else if (type === ComplexType.Object) {
            this.type = type.associatedType;
        } else {
            this.type = type.type
        }
    }
}