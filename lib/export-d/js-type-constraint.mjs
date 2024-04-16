import { JSType, JSTypeConstraintAtt } from '../../registry.mjs';
export class JSTypeConstraint extends JSType {
    /**
     * @param { Function } func
     * @param { Function } constraint
    */
    constructor(func, constraint = null) {
        if (func === null || func === undefined || !(typeof func === 'function' || typeof func === 'string')) {
            throw new Error(`The func argument is null, undefined, not a function or a string.`);
        }
        if (constraint !== null && constraint !== undefined && typeof constraint !== 'function') {
            throw new Error(`The constraint argument is not a function .`);
        }
        super(func);
        if (constraint) {
            if (!this.hasAtt(JSTypeConstraintAtt)) {
                this.setAtt(new JSTypeConstraintAtt(constraint));
            }
        }
        if (this.hasAtt(JSTypeConstraintAtt)) {
            const att = this.getAtt(JSTypeConstraintAtt);
            return new JSType(att.func);
        } else {
            const functionName = typeof func === 'function' ? func.name : func;
            throw new Error(`no constraint found for ${functionName}.`);
        }
    }
}