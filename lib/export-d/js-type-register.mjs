import { JSTypeConstraint, JSTypeMap, Reflection } from '../../registry.mjs';
export class JSTypeRegister extends JSTypeMap {
    /**
     * @param { Function } func
     * @param { Function } relatedFunc
     * @param { Object } defaultValue
     * @param { Boolean } isGenericType
     * @param { Boolean } isArray
    */
    constructor(func, relatedFunc = null, defaultValue = null, isGenericType = false, isArray = false) {
        if (!Reflection.isTypeOf(func, Function)) {
            throw new Error(`The func argument is not a function.`);
        }
        if (!Reflection.isTypeOf(relatedFunc, Function)) {
            throw new Error(`The relatedFunc argument is not a function.`);
        }
        if (defaultValue === undefined) {
            throw new Error(`The defaultValue argument is undefined.`);
        }
        if (!Reflection.isTypeOf(isGenericType, Boolean)) {
            throw new Error(`The isGenericType argument is not a boolean.`);
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