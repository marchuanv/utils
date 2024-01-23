import {
    GUID,
    PrimitiveType,
    ReferenceType,
    TypeDefinition
} from '../registry.mjs';
const privateBag = new WeakMap();
export class MemberParameter {
    /**
     * @param { Object } field
     * @param { Object } typeRef
    */
    constructor(field, typeRef) {
        const key = Object.keys(field)[0];
        const value = field[key];
        let typeDef = TypeDefinition.find({
            typeName: typeRef,
            Class: typeRef,
            type: typeRef,
            Id: typeRef
        });
        if (!typeDef) {
            throw new Error(`could not find type: ${typeRef}`);
        }
        const typeRefId = typeDef.Id || new GUID();
        const { isReferenceType } = typeDef;
        if (isReferenceType) {
            let reference = new ReferenceType(typeRefId);
            if (reference) {
                privateBag.set(this, {
                    Id: new GUID(),
                    name: key,
                    value,
                    typeDefinition: reference
                });
            } else {
                throw new Error('could not map type');
            }
        } else {
            const primitive = new PrimitiveType(typeRefId);
            if (primitive) {
                privateBag.set(this, {
                    Id: new GUID(),
                    name: key,
                    value,
                    typeDefinition: primitive
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
     * @returns { TypeDefinition }
    */
    get typeDefinition() {
        const { typeDefinition } = privateBag.get(this);
        return typeDefinition;
    }
}