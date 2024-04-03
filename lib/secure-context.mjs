import { General } from "../registry.mjs";
/**\
 * @callback HasIdCallback
 * @param { String } Id
 * @callback SetIdCallback
 * @param { String } Id
 */
export class SecureContext {
    /**
     * @param { { hasId: HasIdCallback, setId: SetIdCallback } } callbacks
    */
    constructor(callbacks) {
        if (callbacks === null || callbacks === undefined || typeof callbacks !== 'object') {
            throw new Error('The callbacks argument is null, undefined, or not an object');
        }
        const properties = {};
        callbacks.hasId = (Id) => {
            if (Id === null || Id === undefined || typeof Id !== 'string' || !General.validateUuid(Id)) {
                throw new Error(`The Id argument is null, undefined, not a string or valid universal unique identifier`);
            }
            return properties[Id] === true;
        }
        callbacks.setId = (Id) => {
            if (callbacks.hasId(Id)) {
                throw new Error(`${Id} already belongs to the secure context`);
            }
            properties[Id] = true;
        }
        Object.freeze(this);
    }
}