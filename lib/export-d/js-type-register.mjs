import { JSTypeConstraint, JSTypeMap } from '../../registry.mjs';
export class JSTypeRegister extends JSTypeMap {
    /**
     * @param { Function } func
     * @param { Function } relatedFunc
     * @param { Object } defaultValue
     * @param { Boolean } isGenericType
     * @param { Boolean } isArray
    */
    constructor(func, relatedFunc = null, defaultValue = null, isGenericType = false, isArray = false) {
        if (func === null || func === undefined || typeof func !== 'function') {
            throw new Error(`The func argument is null, undefined or not a function.`);
        }
        if (relatedFunc === null || relatedFunc === undefined || typeof relatedFunc !== 'function') {
            throw new Error(`The relatedFunc argument is null, undefined or not a function.`);
        }
        if (defaultValue === undefined) {
            throw new Error(`The defaultValue argument is undefined.`);
        }
        if (isGenericType === undefined || isGenericType === null || typeof isGenericType !== 'boolean') {
            throw new Error(`The isGenericType argument is null, undefined or not a boolean.`);
        }
        if (isArray === undefined || isArray === null || typeof isArray !== 'boolean') {
            throw new Error(`The isArray argument is null, undefined or not a boolean.`);
        }
        let constraint = null;
        try {
            constraint = new JSTypeConstraint(func);
        } catch { }
        if (constraint) {
            if (constraint.extended.length === 0) {
                if (relatedFunc !== constraint.func) {
                    throw new Error(`constraint error, the relatedFunc argument is not of type ${constraint.func.name}`);
                }
            } else {
                if (!constraint.extended.some(type => type === relatedFunc)) {
                    if (relatedFunc !== constraint.func) {
                        throw new Error(`constraint error, the relatedFunc argument is not of type ${constraint.func.name}`);
                    }
                }
            }
        }
        super(func, relatedFunc, defaultValue, isGenericType, isArray);
    }
}