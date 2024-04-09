import {
    ANY,
    Property,
    TypeMemberInfo
} from "../../registry.mjs";
export class TypeMemberInfoSchema extends TypeMemberInfo {
    /**
     * @param { Property } property
    */
    validate(property) {
        super.validate(property);
        if ((property.value === null && super.func !== NULL) || (property.value === undefined && super.func !== UNDEFINED)) {
            throw new Error(`${property.name} value is null or undefined.`);
        }
        if (super.typeInfo.isClass) {
            if (super.typeInfo.type.isArray) {
                if (Array.isArray(property.value)) {
                    for (const val of property.value) {
                        if (val !== super.func && !(val instanceof super.func)) {
                            throw new Error(`${property.name} array element in is not of type ${super.type.name}`);
                        }
                    }
                } else {
                    throw new Error(`${property.name} value is not an array.`);
                }
            } else {
                if (!(property.value instanceof super.func) && property.value !== super.func) {
                    throw new Error(`${property.name} value is not of type ${super.type.name}`);
                }
            }
        } else {
            if (super.typeInfo.type.isArray) {
                if (Array.isArray(property.value)) {
                    for (const val of property.value) {
                        if (val !== super.func && !(val instanceof super.func) && super.func !== ANY) {
                            throw new Error(`${property.name} array element in is not of type ${super.type.name}`);
                        }
                    }
                } else {
                    throw new Error(`${property.name} value is not an array.`);
                }
            } else {
                if (typeof property.value !== super.type.name.toLowerCase()) {
                    if (!(property.value instanceof super.func)) {
                        throw new Error(`${property.name} value is not of type ${typeName}`);
                    }
                }
            }
        }
    }
    /**
     * @param { Object } data
    */
    serialise(data) {
        this.validate(data);
        return Serialiser.serialise(data);
    }
}