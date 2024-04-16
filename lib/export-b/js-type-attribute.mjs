import { Bag, State } from '../../registry.mjs';
const secureContext = Bag.getSecureContext();
export class JSTypeAttribute extends Bag {
    /**
     * @param { Function } func
    */
    constructor(func) {
        const attributeType = new.target;
        if (attributeType === JSTypeAttribute) {
            throw new Error(`${JSTypeAttribute.name} is an abstract class.`);
        }
        if (func === null || func === undefined || typeof func !== 'function') {
            throw new Error(`The func argument is null, undefined or not a function.`);
        }
        super(`Attribute Id: 5dfc38ff-9856-48e1-b399-d8280376878e, Function: ${func.name}`, secureContext);
        if (this.hasState(secureContext, State.CONSTRUCT)) {
            this.setProperty(secureContext, { func });
            this.setState(secureContext, State.HYDRATE);
        } else {
            this.setState(secureContext, State.REHYDRATE);
        }
    }
    /**
     * @returns { Function }
    */
    get func() {
        return this.getProperty(secureContext, { func: null });
    }
}