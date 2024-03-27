import { NULL, TypeInfo, UNDEFINED } from "../registry.mjs";
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
        if (
            properties === null ||
            properties === undefined ||
            !Array.isArray(properties) ||
            properties.length === 0 ||
            (properties[0].name === null || properties[0].name === undefined) ||
            (properties[0].typeInfo === null || properties[0].typeInfo === undefined) ||
            typeof properties[0].name !== 'string' ||
            !(properties[0].typeInfo instanceof TypeInfo)
        ) {
            throw new Error(`The properties argument is null, undefined, not an array, an empty array or contains invalid elements.`);
        }
        super();
        properties.forEach(x => super.push(x));
    }
    /**
     * @param { { key: String | undefined, obj: Object } } verify
     * @return { { isValid: Boolean, message: String } }
    */
    validate(verify) {
        if (verify === null || verify === undefined || typeof verify !== 'object') {
            throw new Error(`The verify argument is null, undefined or not an object.`);
        }
        const { key, obj } = verify;
        const properties = getProperties(this);
        const schemaProperty = properties.find(x => x.name === key);
        if (schemaProperty) {
            if (obj[key] === undefined) {
                throw new Error(`obj does not have the ${key} property.`);
            }
            validate(schemaProperty, obj[key]);
        } else {
            if (obj === null || obj === undefined || typeof obj !== 'object') {
                throw new Error(`obj to verify is null, undefined or not an object.`);
            }
            let objKeys = Object.keys(obj);
            if (objKeys.length === 0) {
                objKeys = Reflect.ownKeys(obj);
            }
            if (objKeys.length === 0) {
                throw new Error(`obj to verify does not have any properties.`);
            }
            for (const schemaProperty of properties) {
                const keyMatch = objKeys.find(k => k === schemaProperty.name);
                if (keyMatch === undefined || keyMatch === null) {
                    throw new Error(`obj does not have the ${schemaProperty.name} property.`);
                }
                validate(schemaProperty, obj[keyMatch]);
            }
        }
    }
    /**
     * @returns { Object }
    */
    get empty() {
        const emptyData = {};
        for (const { key, type } of this) {
            emptyData[key] = type;
        }
        Object.seal(emptyData);
        return emptyData;
    }
}
/**
 * @param { { name: String, typeInfo: TypeInfo } } schemaProperty
 * @param { Object } propValue
*/
function validate(schemaProperty, propValue) {
    const { name: propertyName, typeInfo: { name: typeName, type, isPrimitive, members, isClass } } = schemaProperty;
    if ((propValue === null && type !== NULL) || (propValue === undefined && type !== UNDEFINED)) {
        throw new Error(`${propertyName} value is null or undefined.`);
    }
    if (isPrimitive) {
        if (Array.isArray(propValue)) {
            if (type !== Array) {
                throw new Error(`${propertyName} value is not of type ${typeName}`);
            }
        } else {
            if (typeof propValue !== typeName.toLowerCase()) {
                throw new Error(`${propertyName} value is not of type ${typeName}`);
            }
        }
    }
    if (isClass && !(propValue instanceof type)) {
        throw new Error(`${propertyName} value is not of type ${typeName}`);
    }
    const propertyMembers = members ? members.filter(x => x.isProperty) : undefined;
    if (propertyMembers && propertyMembers.length > 0) {
        if (Array.isArray(propValue)) {
            if (type !== Array) {
                throw new Error(`${propertyName} value is not an array`);
            }
        } else {
            let objKeys = Object.keys(propValue);
            if (objKeys.length === 0) {
                objKeys = Reflect.ownKeys(propValue);
            }
            const keyMatch = objKeys.find(k => k === propertyName);
            if (keyMatch === undefined || keyMatch === null) {
                throw new Error(`obj does not have the ${propertyName} property.`);
            }
            const value = obj[keyMatch];
            if ((value === null && type !== NULL) || (value === undefined && type !== UNDEFINED)) {
                throw new Error(`obj ${propertyName} property is null or undefined.`);
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