import { JSType, JSTypeAtt} from '../../registry.mjs';
class JSTypeConstraintAtt extends JSTypeAtt { }
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
            if (!this.hasAtt(JSTypeConstraintAtt, constraint)) {
                this.setAtt(JSTypeConstraintAtt, constraint);
            }
        }
        const functionName = typeof func === 'function' ? func.name : func;
        if (this.hasAtt(JSTypeConstraintAtt)) {
            let attributes = this.getAtt(JSTypeConstraintAtt);
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
            throw new Error(`no constraint found for ${functionName}.`);
        }
    }
}