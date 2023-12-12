import { PrimitiveType, ReferenceType, randomUUID } from "../../registry.mjs";
const privateBag = new WeakMap();
export class TypeMapper {
    constructor() {
        throw new Error(`${TypeMapper.name} is a static class`);
    }
    /**
     * @param { String } Id
     * @param { Object } refType
     * @param { Boolean } isArray
    */
    static register(Id, refType, isArray = false) {
        const registry = privateBag.get(TypeMapper);
        if (TypeMapper.isRegistered(refType)) {
            throw new Error(`${refType} is already registered.`);
        } else {
            const constructorName = refType.prototype.constructor.name;
            const typeName = refType.name;
            const isRefType = constructorName === typeName;
            if (isRefType) {
                registry.push({ Id, refType, isArray });
            } else {
                throw new Error(`refType is not a class`);
            }
        }
    }
    /**
     * @param { Object | class | String } ref
     * @returns { ReferenceType }
    */
    static getReferenceType(ref) {
        if (TypeMapper.isRegistered(ref)) {
            const registry = privateBag.get(TypeMapper);
            let { refType, isArray, Id } = {};
            if ( ( ref && typeof ref === 'string' && (ref === 'array' || ref.indexOf('array<') > -1))) {
                ({ refType, isArray, Id } = registry.find(t => t.Id === arrayId));
            } else if (ref === 'object') {
                ({ refType, isArray, Id } = registry.find(t => t.Id === objectId));
            } else {
                ({ refType, isArray, Id } = registry.find(t => t.refType === ref || t.Id === ref || t.refType.name === ref));
            }
            return new ReferenceType(refType.name, Id, refType, isArray);
        }
        return null;
    }
    /**
     * @param {  Object | String } ref
     * @returns { PrimitiveType }
    */
    static getPrimitiveType(ref) {
        switch(ref) {
            case 'string': {
                return PrimitiveType.String;
            }
            case 'number': {
                return PrimitiveType.Number;
            }
            case 'boolean': {
                return PrimitiveType.Boolean;
            }
            case 'bigint': {
                return PrimitiveType.BigInt;
            }
            case 'String': {
                return PrimitiveType.String;
            }
            case 'Number': {
                return PrimitiveType.Number;
            }
            case 'Boolean': {
                return PrimitiveType.Boolean;
            }
            case 'BigInt': {
                return PrimitiveType.BigInt;
            }
            case PrimitiveType.String.Id: {
                return PrimitiveType.String;
            }
            case PrimitiveType.Number.Id: {
                return PrimitiveType.Number;
            }
            case PrimitiveType.Boolean.Id: {
                return PrimitiveType.Boolean;
            }
            case PrimitiveType.BigInt.Id: {
                return PrimitiveType.BigInt;
            }
            default: {
                return null;
            }
        }
    }
    /**
     * @param { Object | String } ref
    */
    static isRegistered(ref) {
        const registry = privateBag.get(TypeMapper);
        if ( (ref && typeof ref === 'string' && (ref === 'array' || ref.indexOf('array<') > -1)) || ref === 'object') {
            return registry.find(t => t.Id === objectId || t.Id === arrayId);
        }
        return registry.find(t => t.refType === ref || t.Id === ref || t.refType.name === ref);
    }
}
privateBag.set(TypeMapper, []);

const objectId = randomUUID();
TypeMapper.register(objectId, Object, false);

const arrayId = randomUUID();
TypeMapper.register(arrayId, Array, true);