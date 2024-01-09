import {
    GUID,
    Type,
    TypeMapper
} from '../../registry.mjs';
const privateBag = new WeakMap();
export class MemberParameter {
    /**
     * @param { Object } field
    */
    constructor(field) {
        const key = Object.keys(field)[0];
        const value = field[key];
        if (value !== undefined) {
            const typeStr = Array.isArray(value) ? 'array' : typeof value;
            const primitive = TypeMapper.getPrimitiveType(typeStr);
            let reference = TypeMapper.getReferenceType(typeStr);
            if (primitive) {
                privateBag.set(this, {
                    Id: new GUID(),
                    name: key,
                    value,
                    type: primitive
                });
            } else if (reference) {
                privateBag.set(this, {
                    Id: new GUID(),
                    name: key,
                    value,
                    type: reference
                });
            } else {
                throw new Error('could not map type to the field value');
            }
        } else {
            throw new Error('could not map type to the field value');
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