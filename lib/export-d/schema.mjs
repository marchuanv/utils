import {
    ANY,
    Bag,
    NULL,
    Serialiser,
    TypeInfoSchema,
    TypeMemberInfo,
    UNDEFINED,
    UUID
} from "../../registry.mjs";
const secureContext = Bag.getSecureContext();
export class Schema extends TypeInfoSchema {
    constructor() {
        let targetClass = new.target;
        if (targetClass === Schema) {
            throw new Error(`${Schema.name} is an abstract class.`);
        }
        if (targetClass === null || targetClass === undefined) {
            throw new Error(`${Schema.name} should be constructed using the new keyword.`);
        }
        super(targetClass);
        const schemaId = new UUID(`Id: b51800a9-dd75-4d5b-b460-dc920fc15faa, Name: ${super.type.name}`);
        if (Bag.has(schemaId, secureContext)) {
            return Bag.get(schemaId, secureContext);
        }
        const properties = super.members.filter(x => x.isGetterProperty);
        if (properties.length === 0) {
            throw new Error(`${super.type.name} does not have any properties.`);
        }
        for (const prop of properties) { //make sure that all the properties on the schema returns TypeInfoSchema
            const typeInfo = this[prop.name];
            if (!(typeInfo instanceof TypeInfoSchema)) {
                throw new Error(`${prop.name} getter property did not return TypeInfo`);
            }
        }
        Bag.set(schemaId, secureContext, this);
    }
    /**
     * @param { Object } data
    */
    serialise(data) {
        this.validate({ data });
        return Serialiser.serialise(data);
    }
    /**
     * @param { Object } data
    */
    validate(data) {
        super.validate(data);
        const properties = super.members.filter(x => x.isGetterProperty);
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
    /**
     * @returns { Object }
    */
    get default() {
        const properties = super.members.filter(x => x.isGetterProperty);
        const obj = {};
        for (const { name, typeInfo } of properties) {
            obj[name] = typeInfo.defaultValue;
        }
        Object.seal(obj);
        return obj;
    }
}
/**
 * @param { TypeMemberInfo } schemaProperty
 * @param { Object } propValue
*/
function validate(schemaProperty, propValue) {
    const {
        name: propertyName,
        typeInfo: {
            type: {
                name: typeName,
                func, isArray
            }, isClass
        }
    } = schemaProperty;
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