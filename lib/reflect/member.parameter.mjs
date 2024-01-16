import {
    GUID,
    Type,
    TypeMapper
} from '../../registry.mjs';
const privateBag = new WeakMap();
export class MemberParameter {
    /**
     * @param { Object } field
     * @param { String } typeName
     * @param { Boolean } isReferenceType
    */
    constructor(field, typeName, isReferenceType) {
        const key = Object.keys(field)[0];
        const value = field[key];
        if (isReferenceType) {
            let reference = TypeMapper.getReferenceType(typeName);
            if (reference) {
                privateBag.set(this, {
                    Id: new GUID(),
                    name: key,
                    value,
                    type: reference
                });
            } else {
                throw new Error('could not map type');
            }
        } else {
            const primitive = TypeMapper.getPrimitiveType(typeName);
            if (primitive) {
                privateBag.set(this, {
                    Id: new GUID(),
                    name: key,
                    value,
                    type: primitive
                });
            } else {
                throw new Error('could not map type');
            }
        }
    }
    /**
     * @returns { GUID }
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
     * @param { Object } value
    */
    set value(value) {
        privateBag.get(this).value = value;
    }
    /**
     * @returns { Type }
    */
    get type() {
        const { type } = privateBag.get(this);
        return type;
    }
}