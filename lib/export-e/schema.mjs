import {
    Interface,
    Serialiser
} from "../../registry.mjs";
export class Schema extends Interface {
    /**
     * @param { Object } data
    */
    validate(data) {
        let objKeys = Object.keys(data);
        const prototype = Object.getPrototypeOf(data);
        if (prototype) {
            objKeys = objKeys.concat(Reflect.ownKeys(prototype));
        }
        if (objKeys.length === 0) {
            throw new Error(`data to verify does not have any properties.`);
        }
        for (const { isClass, isArray, func, name } of super.members.filter(x => x.isGetterProperty)) {
            const keyMatch = objKeys.find(k => k === name);
            if (keyMatch === undefined || keyMatch === null) {
                throw new Error(`data does not have the ${name} property.`);
            }
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
    }
    /**
     * @param { Object } data
    */
    serialise(data) {
        this.validate(data);
        return Serialiser.serialise(data);
    }
}