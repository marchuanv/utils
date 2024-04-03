import {
    Reflection,
    Schema,
    Type,
    TypeInfo,
    UUID,
    SecureContext
} from '../registry.mjs';
const privateBag = new WeakMap();
export class Removed { }
/**
 * This class provides functionality for holding references.
*/
export class Bag {
    /**
     * @template prototype the prototype of a class that extends Schema
     * @param { UUID } Id
     * @param { SecureContext } secureContext
     * @param { prototype } schema
     * @returns { prototype }
    */
    static getData(Id, secureContext, schema) {
        if (schema === null || schema === undefined) {
            throw new Error(`The schema argument is null or undefined.`);
        }
        if (!Reflection.getPrototypes(schema).some(proto => proto === Schema.prototype)) {
            throw new Error(`The schema argument does not extend ${Schema.name}`);
        }
        const instance = Bag.get(Id, secureContext, Object.prototype);
        const { data } = privateBag.get(instance);
        return data
    }
    /**
     * @param { UUID } Id
     * @param { SecureContext } secureContext
     * @param { Object } data
    */
    static setData(Id, secureContext, data) {
        if (data === null || data === undefined) {
            throw new Error(`The data argument is null or undefined.`);
        }
        const instance = Bag.get(Id, secureContext, Object.prototype);
        const instanceData = privateBag.get(instance);
        const { dataSchema } = instanceData;
        dataSchema.validate({ data });
        instanceData.data = data;
    }
    /**
     * @param { UUID } Id
     * @param { SecureContext } secureContext
     * @returns { Boolean }
    */
    static has(Id, secureContext) {
        if (Id === null || Id === undefined || !(Id instanceof UUID)) {
            throw new Error(`The Id argument is null, undefined or not an instance of ${UUID.name}`);
        }
        return getIds(secureContext).has(Id);
    }
    /**
     * @template prototype the prototype of a class
     * @param { UUID } Id
     * @param { SecureContext } secureContext
     * @param { prototype } Class
     * @returns { prototype }
    */
    static get(Id, secureContext, Class) {
        if (this.has(Id, secureContext)) {
            const obj = privateBag.get(Id);
            if (obj instanceof Removed) {
                throw new Error('instance was disposed');
            }
            if (!(obj instanceof Class.constructor)) {
                throw new Error(`Obj is not an instance of Class.`);
            }
            return obj;
        } else {
            throw new Error(`${Id} not found for secure context.`);
        }
    }
    /**
     * @param { UUID } Id universally unique identifier
     * @param { SecureContext } secureContext
     * @param { Object } instance
     * @param { Schema } dataSchema
    */
    static set(Id, secureContext, instance, dataSchema) {
        if (Bag.has(Id, secureContext)) {
            throw new Error(`${Id} for secure context already exists.`);
        }
        if (instance === undefined || instance === null || typeof instance !== 'object') {
            throw new Error(`The instance argument is null, undefined or not an ${Object.name}.`);
        }
        if (dataSchema === undefined || dataSchema === null || !(dataSchema instanceof Schema)) {
            throw new Error(`The dataSchema argument is null, undefined or not a ${Schema.name}.`);
        }
        getIds(secureContext).add(Id);
        privateBag.set(Id, instance);
        privateBag.set(instance, { data: null, dataSchema });
        const schemaPrototype = Object.getPrototypeOf(dataSchema);
        privateBag.set(dataSchema, schemaPrototype);
    }
    /**
     * @param { UUID } Id universally unique identifier
     * @param { SecureContext } secureContext
    */
    static remove(Id, secureContext) {
        if (!Bag.has(Id, secureContext)) {
            throw new Error(`${Id} for secure context does not exist.`);
        }
        const instance = privateBag.get(Id);
        const instanceData = privateBag.get(instance);
        if (instanceData) {
            const { dataSchema } = instanceData;
            privateBag.delete(dataSchema);
        }
        privateBag.delete(instance);
        privateBag.delete(Id);
        privateBag.set(Id, new Removed());
    }
    /**
     * @param { Array<Function | String> } types
    */
    static hasTypes(types) {
        if (types === null || types === undefined) {
            throw new Error(`The types argument is null or undefined.`);
        }
        let _types = Array.isArray(types) ? types : [types];
        if (_types.find(x => x === undefined) || _types.find(x => x === null)) {
            throw new Error(`The types argument contains null and/or undefined elements.`);
        }
        const typeNames = _types.filter(t => typeof t === 'string');
        const typeFuncs = _types.filter(t => typeof t === 'function');
        if (typeNames.length === 0 && typeFuncs.length === 0) {
            throw new Error(`The types argument does not contain functions or function names`);
        }
        const knownTypes = getTypesArray();
        if (knownTypes.some(func => typeNames.some(name => name === func.name))) {
            return true;
        }
        return typeFuncs.some(x => getTypes().has(x));
    }
    /**
     * @param { Array<Function> | Function } types
    */
    static setTypes(types) {
        if (Bag.hasTypes(types)) {
            throw new Error(`one or more types already exists.`);
        }
        let _types = Array.isArray(types) ? types : [types];
        for (const type of _types) {
            getTypes().add(type);
        }
    }
    /**
     * @returns { Array<Function> }
    */
    static getTypes() {
        return getTypesArray();
    }
    /**
     * @param { Function | String } type
    */
    static hasTypeInfo(type) {
        if (type === null || type === undefined || !(typeof type === 'function' || type === 'string')) {
            throw new Error(`The type argument is null, undefined, not a function or a string.`);
        }
        let _type = type;
        if (typeof _type === 'string') {
            _type = Bag.getTypes().find(x => x.name === _type);
        }
        return Array.from(getTypesInfo()).some(info => info.type === _type);
    }
    /**
     * @param { Function | String } type
    */
    static getTypeInfo(type) {
        if (!Bag.hasTypeInfo(type)) {
            throw new Error('type info not found.');
        }
        let _type = type;
        if (typeof _type === 'string') {
            _type = Bag.getTypes().find(x => x.name === _type);
        }
        return Array.from(getTypesInfo()).find(info => info.type === _type);
    }
    /**
     * @param { Type } type
     * @param { TypeInfo } typeInfo
    */
    static addTypeInfo(type, typeInfo) {
        if (Bag.hasTypeInfo(type)) {
            throw new Error('type already exists.');
        }
        if (typeInfo === null || typeInfo === undefined || !(typeInfo instanceof TypeInfo)) {
            throw new Error(`The typeInfo argument is null, undefined or not an instance of ${TypeInfo.name}`);
        }
        getTypesInfo().add(typeInfo);
    }
}
/**
 * @param { SecureContext } context 
 * @returns { WeakSet }
*/
function getIds(secureContext) {
    if (secureContext === null || secureContext === undefined || !(secureContext instanceof SecureContext)) {
        throw new Error(`The secureContext argument is null, undefined or not a ${SecureContext.name}`);
    }
    if (!privateBag.has(secureContext)) {
        privateBag.set(secureContext, new WeakSet());
    }
    return privateBag.get(secureContext);
}
/**
 * @returns { WeakMapMap<Function, TypeInfo> }
*/
function getTypesInfo() {
    const Id = 'b98ceb21-61ae-4098-acc4-66d9ab36814e';
    if (!privateBag.has(Id)) {
        privateBag.set(Id, new WeakMap());
    }
    return privateBag.get(Id);
}
/**
 * @returns { Map<String, Function> }
*/
function getTypes() {
    const Id = 'fda5af21-abc8-440f-af12-b5424243bc86';
    if (!privateBag.has(Id)) {
        privateBag.set(Id, new Map());
    }
    return privateBag.get(Id);
}