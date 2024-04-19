import { JSType, JSTypeAtt } from '../../registry.mjs';
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
        if (func === null || func === undefined || !(typeof func === 'function' || typeof func === 'string')) {
            throw new Error(`The func argument is null, undefined, not a function or a string.`);
        }
        if (relatedFunc !== null && relatedFunc !== undefined && typeof relatedFunc !== 'function') {
            throw new Error(`The relatedFunc argument is not a function .`);
        }
        super(func, defaultValue, isGenericType, isArray);
        if (relatedFunc) {
            if (!this.hasAtt(relatedFunc, JSTypeMapAtt)) {
                this.setAtt(relatedFunc, JSTypeMapAtt);
            }
        }
        const functionName = typeof func === 'function' ? func.name : func;
        if (this.hasAtt()) {
            let attributes = this.getAtt();
            attributes = Array.from(attributes);
            attributes = attributes.filter(att => att.attributeType === JSTypeMapAtt);
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