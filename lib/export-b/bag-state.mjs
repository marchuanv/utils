import { Bag, Reflection, SecureContext, State, UUID } from "../../registry.mjs";
export class BagState extends UUID {
    /**
     * @param { String } Id
     * @param { SecureContext } secureContext
    */
    constructor(Id, secureContext) {
        if (Id === null || Id === undefined || typeof Id !== 'string' || Reflection.isEmptyString(Id)) {
            throw new Error(`The Id argument is null, undefined, not a string or is an empty string.`);
        }
        if (secureContext === null || secureContext === undefined || !(secureContext instanceof SecureContext)) {
            throw new Error(`The secureContext argument is null, undefined, or not an instance of ${SecureContext.name}.`);
        }
        super(Id);
        if (Bag.has(super.toString(), secureContext)) {
            return Bag.get(super.toString(), secureContext);
        } else {
            /**
             * @param { State } value
             * @return { Boolean }
            */
            this.isAtState = (value) => {
                if (!(value instanceof State)) {
                    throw new Error('value is not an instance of a state');
                }
                return Bag.getState(this, secureContext) === value;
            };
            /**
             * @param { Object } property
             * @return { Object } Property Value
            */
            this.getPropertyValue = (property) => {
                if (typeof property !== 'object' && Object.keys(property).length === 0) {
                    throw new Error('invalid property');
                }
                return Bag.getProperty(this, secureContext, property);
            };
            Bag.set(this, secureContext);
        }
    }
}