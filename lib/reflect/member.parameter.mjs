import { PrimitiveType, ComplexType, randomUUID } from '../../registry.mjs';
export class MemberParameter {
    /**
     * @param { Object } field
     * @param { PrimitiveType | ComplexType } type
    */
    constructor(field, type) {
        this.Id = randomUUID();
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