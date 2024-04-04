import {
    General,
    Reflection,
    Schema,
    SecureContext,
    UUID
} from '../registry.mjs';
const privateBag = new WeakMap();
const UUIDMap = new Map();
export class Removed { }
/**
 * This class provides functionality for holding references.
*/
export class Bag {
    /**
     * @param { UUID } Id
     * @param { SecureContext } secureContext
     * @param { class } Class
    */
    static getData(Id, secureContext, Class) {
        if (!Bag.has(Id, secureContext)) {
            throw new Error(`${Id} for secure context does not exists.`);
        }
        const instance = Bag.get(Id, secureContext, Class.prototype);
        const schemaInstance = privateBag.get(instance);
        if (schemaInstance === null || schemaInstance === undefined) {
            throw new Error(`instance of ${Class.name} not found for ${Id}.`);
        }
        return privateBag.get(schemaInstance);
    }
    /**
     * @param { UUID } Id
     * @param { SecureContext } secureContext
     * @param { Object } data
     * @param { class } Class
    */
    static setData(Id, secureContext, data, Class) {
        if (!Bag.has(Id, secureContext)) {
            throw new Error(`${Id} for secure context does not exists.`);
        }
        const instance = Bag.get(Id, secureContext, Class.prototype);
        const schemaInstance = privateBag.get(instance);
        if (schemaInstance === null || schemaInstance === undefined) {
            throw new Error(`instance of ${schemaClass.name} not found for ${Id}.`);
        }
        schemaInstance.validate({ data });
        privateBag.set(schemaInstance, data);
    }
    /**
     * @param { String } Id
     * @param { SecureContext } secureContext
     * @returns { UUID }
    */
    static hasUUID(Id, secureContext) {
        if (Id === null || Id === undefined || typeof Id !== 'string' || !General.validateUuid(Id)) {
            throw new Error(`The Id argument is null, undefined, not a string or invalid universal unique identifier`);
        }
        if (UUIDMap.has(Id)) {
            const { contextId } = UUIDMap.get(Id);
            return contextId === secureContext.Id;
        }
        return false;
    }
    /**
     * @param { String } Id
     * @param { SecureContext } secureContext
     * @returns { UUID }
    */
    static getUUID(Id, secureContext) {
        if (!Bag.hasUUID(Id, secureContext)) {
            throw new Error(`${Id} not found for secure context.`);
        }
        const mapping = UUIDMap.get(Id);
        return mapping.Id;
    }
    /**
     * @param { UUID } Id
     * @param { SecureContext } secureContext
    */
    static setUUID(Id, secureContext) {
        const IdStr = Id.toString();
        if (Bag.hasUUID(IdStr, secureContext)) {
            throw new Error(`${IdStr} already exists.`);
        }
        UUIDMap.set(IdStr, { Id, contextId: secureContext.Id });
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
        if (Bag.hasUUID(Id.toString(), secureContext) && privateBag.has(Id)) {
            return true;
        }
        return false;
    }
    /**
     * @template prototype the prototype of a class
     * @param { UUID } Id
     * @param { SecureContext } secureContext
     * @param { prototype } Class
     * @returns { prototype }
    */
    static get(Id, secureContext, Class) {
        if (!Bag.has(Id, secureContext)) {
            throw new Error(`${Id} not found for secure context.`);
        }
        if (Class === null || Class === undefined || !Reflection.isClass(Class)) {
            throw new Error(`The Class argument is null, undefined or not a Class.`);
        }
        const obj = privateBag.get(Id);
        if (obj instanceof Removed) {
            throw new Error('instance was disposed');
        }
        if (!(obj instanceof Class.constructor)) {
            throw new Error(`obj is not an instance of Class.`);
        }
        return obj;
    }
    /**
     * @param { UUID } Id universally unique identifier
     * @param { SecureContext } secureContext
     * @param { Object } instance
     * @param { class } Class
     * @param { class } schemaClass
    */
    static set(Id, secureContext, instance, Class, schemaClass) {
        if (Bag.has(Id, secureContext)) {
            throw new Error(`${Id} for secure context already exists.`);
        }
        if (Class === null || Class === undefined || !Reflection.isClass(Class)) {
            throw new Error(`The Class argument is null, undefined or not a class.`);
        }
        if (schemaClass === null || schemaClass === undefined || !Reflection.isClass(schemaClass)) {
            throw new Error(`The schemaClass argument is null, undefined or not a class.`);
        }
        const extendsSchema = Reflection.getPrototypes(schemaClass).some(proto => proto === Schema);
        if (!extendsSchema) {
            throw new Error(`The schemaClass argument does not extend ${Schema.name}`);
        }
        if (instance === undefined || instance === null || !(instance instanceof Class)) {
            throw new Error(`The instance argument is null, undefined or not an instance of ${Class.name}.`);
        }
        if (!Bag.hasUUID(Id.toString(), secureContext)) {
            Bag.setUUID(Id, secureContext);
        }
        privateBag.set(Id, instance);
        let schemaInstance = null;
        if (instance instanceof schemaClass) {
            privateBag.set(schemaClass, instance);
            schemaInstance = instance;
        } else {
            schemaInstance = privateBag.get(schemaClass);
        }
        privateBag.set(instance, schemaInstance);
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
        const schemaInstance = privateBag.get(instance);
        privateBag.delete(schemaInstance);
        privateBag.delete(instance);
        privateBag.delete(Id);
        privateBag.set(Id, new Removed());
    }
    /**
     * @param { class } schemaClass
     * @returns { Boolean }
    */
    static hasSchema(schemaClass) {
        if (schemaClass === null || schemaClass === undefined || !Reflection.isClass(schemaClass)) {
            throw new Error(`The schemaClass argument is null, undefined or not a class.`);
        }
        const extendsSchema = Reflection.getPrototypes(schemaClass).some(proto => proto === Schema);
        if (!extendsSchema) {
            throw new Error(`The schema argument does not extend ${Schema.name}`);
        }
        return privateBag.has(schemaClass);
    }
    /**
     * @returns { SecureContext }
    */
    static getSecureContext() {
        const secureContext = new SecureContext();
        return secureContext;
    }
}