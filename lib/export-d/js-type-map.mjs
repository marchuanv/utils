import { JSType, JSTypeAtt } from '../../registry.mjs';
export class JSTypeMapAtt extends JSTypeAtt { }
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
        if (relatedFunc) {
            if (!this.hasAtt(relatedFunc)) {
                this.setAtt(relatedFunc);
            }
        }
        if (this.hasAtt(JSTypeMapAtt)) {
            const att = this.getAtt(JSTypeMapAtt);
            return new JSType(att.func);
        } else {
            const functionName = typeof func === 'function' ? func.name : func;
            throw new Error(`no mapping found for ${functionName}.`);
        }
    }
}