import { PrimitiveType, ReferenceType } from "../../registry.mjs";
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
            const isRefType = constructorName === typeName && typeName !== 'Array' && typeName !== 'Object' ;
            if (isRefType) {
                registry.push({ Id, refType, isArray });
            } else {
                throw new Error(`refType is not a class`);
            }
        }
    }
    /**
     * @param { Object | class | String } ref
    */
    static getReferenceType(ref) {
        if (TypeMapper.isRegistered(ref)) {
            const registry = privateBag.get(TypeMapper);
            const { refType, isArray } = registry.find(t => t.refType === ref || t.Id === ref);
            return new ReferenceType(refType.name, refType, isArray);
        } else {
            throw new Error(`${ refType.name || refType } is not registered.`);
        }
    }
    /**
     * @param {  Object | String } ref
    */
    static getPrimitiveType(ref) {
        const typeString = typeof ref === 'string' ? ref.toLowerCase() : ref.toString();
        switch(typeString) {
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
            default: {
                throw new Error('unable to determine primitive type');
            }
        }
    }
    /**
     * @param { Object | String } ref
    */
    static isRegistered(ref) {
        const registry = privateBag.get(TypeMapper);
        return registry.find(t => t.refType === ref || t.Id === ref);
    }
}
privateBag.set(TypeMapper, []);