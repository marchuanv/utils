import {
    ANY,
    NULL,
    Serialiser,
    TypeInfo,
    UNDEFINED
} from "../registry.mjs";
export class Schema extends Array {
    /**
     * @param { Array<{ name: String, typeInfo: TypeInfo }> } properties
    */
    constructor(properties) {
        const targetClass = new.target;
        if (targetClass === Schema) {
            throw new Error(`${Schema.name} is an abstract class.`);
        }
        if (targetClass === null || targetClass === undefined) {
            throw new Error(`${Schema.name} should be constructed using the new keyword.`);
        }
        const isInvalidArgs =
            properties === null ||
            properties === undefined ||
            !Array.isArray(properties) ||
            !(
                properties.length === 0 || !(
                    properties[0].name === null ||
                    properties[0].name === undefined ||
                    properties[0].typeInfo === null ||
                    properties[0].typeInfo === undefined ||
                    typeof properties[0].name !== 'string' ||
                    !(properties[0].typeInfo instanceof TypeInfo)
                )
            );
        if (isInvalidArgs) {
            throw new Error(`The properties argument is null, undefined, not an array, an empty array or contains invalid elements.`);
        }
        super();
        properties.forEach(x => super.push(x));
    }
    /**
     * @param { Object } data
    */
    serialise(data) {
        this.validate({ data });
        return Serialiser.serialise(data);
    }
    /**
     * @param { { key: String | undefined, data: Object } } verify
     * @return { { isValid: Boolean, message: String } }
    */
    validate(verify) {
        if (verify === null || verify === undefined || typeof verify !== 'object') {
            throw new Error(`The verify argument is null, undefined or not an object.`);
        }
        const { key, data } = verify;
        const properties = getProperties(this);
        const schemaProperty = properties.find(x => x.name === key);
        if (schemaProperty) {
            if (typeof data === 'object') {
                if (data[key] === undefined) {
                    throw new Error(`data does not have the ${key} property.`);
                }
                validate(schemaProperty, data[key]);
            } else {
                validate(schemaProperty, data);
            }
        } else {
            if (data === null || data === undefined || typeof data !== 'object') {
                throw new Error(`data to verify is null, undefined or not an object.`);
            }
            let objKeys = Object.keys(data);
            const prototype = Object.getPrototypeOf(data);
            if (prototype) {
                objKeys = objKeys.concat(Reflect.ownKeys(prototype));
            }
            if (objKeys.length === 0) {
                throw new Error(`data to verify does not have any properties.`);
            }
            for (const schemaProperty of properties) {
                const keyMatch = objKeys.find(k => k === schemaProperty.name);
                if (keyMatch === undefined || keyMatch === null) {
                    throw new Error(`data does not have the ${schemaProperty.name} property.`);
                }
                validate(schemaProperty, data[keyMatch]);
            }
        }
    }
    /**
     * @returns { Object }
    */
    get default() {
        const obj = {};
        for (const { name, typeInfo } of this) {
            obj[name] = typeInfo.defaultValue;
        }
        Object.seal(obj);
        return obj;
    }
}
/**
 * @param { { name: String, typeInfo: TypeInfo } } schemaProperty
 * @param { Object } propValue
*/
function validate(schemaProperty, propValue) {
    const { name: propertyName, typeInfo: { type: { name: typeName, func, isArray }, isClass } } = schemaProperty;
    if ((propValue === null && func !== NULL) || (propValue === undefined && func !== UNDEFINED)) {
        throw new Error(`${propertyName} value is null or undefined.`);
    }
    if (isClass) {
        if (isArray) {
            if (Array.isArray(propValue)) {
                for (const val of propValue) {
                    if (val !== func && !(val instanceof func)) {
                        throw new Error(`${propertyName} array element in is not of type ${typeName}`);
                    }    
                }
            } else {
                throw new Error(`${propertyName} value is not an array.`);
            }
        } else {
            if (!(propValue instanceof func) && propValue !== func) {
                throw new Error(`${propertyName} value is not of type ${typeName}`);
            }
        }
    } else {
        if (isArray) {
            if (Array.isArray(propValue)) {
                for (const val of propValue) {
                    if (val !== func && !(val instanceof func) && func !== ANY) {
                        throw new Error(`${propertyName} array element in is not of type ${typeName}`);
                    }    
                }
            } else {
                throw new Error(`${propertyName} value is not an array.`);
            }
        } else {
            if (typeof propValue !== typeName.toLowerCase()) {
                if (!(propValue instanceof func)) {
                    throw new Error(`${propertyName} value is not of type ${typeName}`);
                }
            }
        }
    }
}
/**
 * @return { Array<{ name: String, typeInfo: TypeInfo }> }
*/
function getProperties(context) {
    return context;
}