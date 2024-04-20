import { JSType, JSTypeAtt, Reflection } from '../../registry.mjs';
class JSTypeMapAtt extends JSTypeAtt { }
export class JSTypeMap extends JSType {
    /**
     * @param { Function | String } func
     * @param { Function | null | undefined } relatedFunc
     * @param { Object } defaultValue
     * @param { Boolean } isGenericType
     * @param { Boolean } isArray
    */
    constructor(func, relatedFunc = null, defaultValue = null, isGenericType = false, isArray = false) {
        if (!Reflection.isFunction(func)) {
            throw new Error(`The func argument is not a function.`);
        }
        super(func, defaultValue, isGenericType, isArray);
        if (!Reflection.isFunction(relatedFunc)) {
            throw new Error(`The relatedFunc argument is not a function.`);
        }
        if (relatedFunc) {
            if (!this.hasAtt(JSTypeMapAtt, relatedFunc)) {
                this.setAtt(JSTypeMapAtt, relatedFunc);
            }
        }
        const functionName = typeof func === 'function' ? func.name : func;
        if (this.hasAtt(JSTypeMapAtt)) {
            let attributes = this.getAtt(JSTypeMapAtt);
            attributes = Array.from(attributes);
            if (attributes.length > 0) {
                if (attributes.length > 1) {
                    throw new Error(`more than one mapping found for ${functionName}.`);
                }
                const att = attributes[0];
                return new JSType(att.func);
            } else {
                throw new Error(`no mapping found for ${functionName}.`);
            }
        } else {
            throw new Error(`no mapping found for ${functionName}.`);
        }
    }
}