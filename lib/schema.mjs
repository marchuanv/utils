import {
    ANY,
    Bag,
    NULL,
    SecureContext,
    Serialiser,
    TypeInfo,
    UNDEFINED,
    UUID
} from "../registry.mjs";
const secureContext = new SecureContext();
export class Schema {
    constructor() {
        let targetClass = new.target;
        if (targetClass === Schema) {
            throw new Error(`${Schema.name} is an abstract class.`);
        }
        if (targetClass === null || targetClass === undefined) {
            throw new Error(`${Schema.name} should be constructed using the new keyword.`);
        }
        this._Id = new UUID(targetClass.name);
        Bag.set(this._Id, secureContext, this, targetClass, targetClass);
        const schemaTypeInfo = new TypeInfo(targetClass);
        console.log();
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
    */
    validate(verify) {
        if (verify === null || verify === undefined || typeof verify !== 'object') {
            throw new Error(`The verify argument is null, undefined or not an object.`);
        }
        const { key, data } = verify;
        if (data === null || data === undefined || typeof data !== 'object') {
            throw new Error(`data to verify is null, undefined or not an object.`);
        }
        const properties = getProperties(this);
        if (key !== null && key !== undefined) {
            if (typeof key !== 'string') {
                throw new Error('key is not a string');
            }
            const schemaProperty = properties.find(x => x.name === key);
            if (!schemaProperty) {
                throw new Error(`schema ${key} property not found.`);
            }
            if (typeof data === 'object') {
                if (data[key] === undefined) {
                    throw new Error(`data does not have the ${key} property.`);
                }
                validate(schemaProperty, data[key]);
            } else {
                validate(schemaProperty, data);
            }
        } else {
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