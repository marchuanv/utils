import { Bag, JSTypeMap, State } from '../../registry.mjs';
const secureContext = Bag.getSecureContext();
export class JSTypeRegister extends JSTypeMap {
    /**
    * @param { Function } func
    * @param { Function } relatedFunc
   */
    constructor(func, relatedFunc) {
        if (func === null || func === undefined || typeof func !== 'function') {
            throw new Error(`The func argument is null, undefined or not a function.`);
        }
        if (relatedFunc === null || relatedFunc === undefined || typeof relatedFunc !== 'function') {
            throw new Error(`The relatedFunc argument is null, undefined or not a function.`);
        }
        super(func, relatedFunc);
        if (this.hasState(secureContext, State.CONSTRUCT)) {
            this.setState(secureContext, State.HYDRATE);
        } else {
            this.setState(secureContext, State.REHYDRATE);
        }
    }
}