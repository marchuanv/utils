import { GUID, General, TypeInfo } from '../registry.mjs';
const privateBag = new WeakMap();
const Ids = new Map();
/**
 * This class provides functionality for holding references.
*/
export class Bag {
    /**
     * @template prototype
     * @param { prototype } type
     * @returns { Array<String>> }
    */
    static getIds(type) {
        const typeInfo = new TypeInfo({ type: type.constructor });
        return privateBag.get(typeInfo);
    }
    /**
     * @param { GUID } Id universally unique identifier
     * @returns { Object }
    */
    static getData(Id) {   
        return privateBag.get(Id);
    }
    /**
     * @template prototype
     * @param { String } Id universally unique identifier
     * @param { prototype } type
     * @returns { prototype }
    */
    static has(Id, type) {
        if (Id !== null && Id !== undefined && typeof Id === 'string') {
            if (!General.validateUuid(Id)) {
                throw new Error(`The Id argument is not a universally unique identifier`);
            }
            return this.getIds(type).some(IdStr => IdStr === Id);
        } else {
            throw new Error('The Id argument is not a string.');
        }
    }
    /**
     * @template prototype
     * @param { String } Id universally unique identifier
     * @param { prototype } type
     * @returns { prototype }
    */
    static get(Id, type) {   
        if (this.has(Id, type)) {
            const IdStrArray = this.getIds(type);
            const IdStr = IdStrArray.find(IdStr => IdStr === Id);
            return Ids.get(IdStr);
        } else {
            throw new Error('Id not found.');
        }
    }
    /**
     * @param { GUID } Id universally unique identifier
     * @param { prototype } type
     * @param { Object } data
    */
    static set(Id, type, data) {
        if (Id === null || Id === undefined || !(Id instanceof GUID)) {
            throw new Error(`The Id argument is null, undefined or not a ${GUID.name}`);
        }
        const IdStr = Id.toString();
        if (this.has(IdStr, type)) {
            throw new Error(`${IdStr} already exists.`);
        } else {
            if (data === undefined) {
                throw new Error('The data argument is undefined.');
            }
            Ids.set(IdStr, Id);
            privateBag.set(Id, data);
        }
    }
}