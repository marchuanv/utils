import { Bag, Reflection, SecureContext, State, UUID } from "../../registry.mjs";
export class BagState extends UUID {
    /**
     * @param { String } Id
     * @param { SecureContext } context
    */
    constructor(Id, context) {
        if (Id === null || Id === undefined || typeof Id !== 'string' || Reflection.isEmptyString(Id)) {
            throw new Error(`The Id argument is null, undefined, not a string or is an empty string.`);
        }
        if (context === null || context === undefined || !(context instanceof SecureContext)) {
            throw new Error(`The context argument is null, undefined, or not an instance of ${SecureContext.name}.`);
        }
        super(Id);
        if (Bag.has(super.toString(), context)) {
            return Bag.get(super.toString(), context);
        } else {
            /**
             * @param { State } value
             * @return { Boolean }
            */
            this.isAtState = (value) => {
                if (!(value instanceof State)) {
                    throw new Error('value is not an instance of a state');
                }
                return Bag.getState(this, context) === value;
            };
            Bag.set(this, context);
        }
    }
}