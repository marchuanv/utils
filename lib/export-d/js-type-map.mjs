import { JSType, JSTypeAttribute } from '../../registry.mjs';
export class JSTypeMap extends JSType {
    /**
     * @param { Function | String } func
     * @param { Function | null | undefined } relatedFunc
     * @param { Object } defaultValue
     * @param { Boolean } isGenericType
     * @param { Boolean } isArray
    */
    constructor(func, relatedFunc = null, defaultValue = null, isGenericType = false, isArray = false) {
        if (func === null || func === undefined || !(typeof func === 'function' || typeof func === 'string')) {
            throw new Error(`The func argument is null, undefined, not a function or a string.`);
        }
        if (relatedFunc !== null && relatedFunc !== undefined && typeof relatedFunc !== 'function') {
            throw new Error(`The relatedFunc argument is not a function .`);
        }
        super(func, defaultValue, isGenericType, isArray);
        const functionName = typeof func === 'function' ? func.name : func;
        if (relatedFunc) {
            const relatedJSType = new JSType(relatedFunc, defaultValue, isGenericType, isArray);
            this.attributes.push(new JSTypeAttribute(functionName, relatedJSType.name));
        }
        const found = this.attributes.find(x => x.name === functionName);
        if (found) {
            return new JSType(found.description);
        } else {
            throw new Error(`no mapping found for ${functionName}.`);
        }
    }
}