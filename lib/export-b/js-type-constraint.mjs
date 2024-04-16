import { Bag, JSType, State } from '../../registry.mjs';
const secureContext = Bag.getSecureContext();
export class JSTypeConstraint extends JSType {
    /**
     * @param { Function } func
     * @param { Function } constraint
    */
    constructor(func, constraint = null) {
        const targetClass = new.target;
        if (func === null || func === undefined || typeof func !== 'function') {
            throw new Error(`The func argument is null, undefined or not a function.`);
        }
        super(func);
        if (this.hasState(secureContext, State.CONSTRUCT)) {
            if (constraint === null || constraint === undefined || typeof constraint !== 'function') {
                throw new Error(`The constraint argument is null, undefined or not a function.`);
            }
            this.setProperty(secureContext, { constraint });
            if (targetClass === JSTypeConstraint) {
                this.setState(secureContext, State.HYDRATE);
            }
        }
        constraint = this.getProperty(secureContext, { constraint: null });
        return new JSType(constraint);
    }
}