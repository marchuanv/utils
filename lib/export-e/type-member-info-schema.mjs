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
        const { isClass, isArray, func, name } = super.typeInfo;
        if ((property.value === null && func !== NULL) || (property.value === undefined && func !== UNDEFINED)) {
            throw new Error(`${property.name} value is null or undefined.`);
        }
        if (isClass) {
            if (isArray) {
                if (Array.isArray(property.value)) {
                    for (const val of property.value) {
                        if (val !== func && !(val instanceof func)) {
                            throw new Error(`${property.name} array element in is not of type ${name}`);
                        }
                    }
                } else {
                    throw new Error(`${property.name} value is not an array.`);
                }
            } else {
                if (!(property.value instanceof func) && property.value !== func) {
                    throw new Error(`${property.name} value is not of type ${name}`);
                }
            }
        } else {
            if (isArray) {
                if (Array.isArray(property.value)) {
                    for (const val of property.value) {
                        if (val !== func && !(val instanceof func) && func !== ANY) {
                            throw new Error(`${property.name} array element in is not of type ${type.name}`);
                        }
                    }
                } else {
                    throw new Error(`${property.name} value is not an array.`);
                }
            } else {
                if (typeof property.value !== name.toLowerCase()) {
                    if (!(property.value instanceof func)) {
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