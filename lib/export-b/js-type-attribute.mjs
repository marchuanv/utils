import { Bag, State } from '../../registry.mjs';
const secureContext = Bag.getSecureContext();
export class JSTypeAttribute extends Bag {
    /**
     * @param { String } name
     * @param { String } description
    */
    constructor(name, description) {
        const targetClass = new.target;
        if (targetClass !== JSTypeAttribute) {
            throw new Error(`${JSTypeAttribute.name} is a sealed class.`);
        }
        if (name === null || name === undefined || typeof name !== 'string') {
            throw new Error(`The name argument is null, undefined or not a string.`);
        }
        if (description === null || description === undefined || typeof description !== 'string') {
            throw new Error(`The description argument is null, undefined or not a string.`);
        }
        super(`Attribute Id: b257cd6b-98ba-40d5-9526-562e503a1e14, Name: ${name}`, secureContext);
        if (this.hasState(secureContext, State.CONSTRUCT)) {
            this.setProperty(secureContext, { name });
            this.setProperty(secureContext, { description });
            this.setState(secureContext, State.HYDRATE);
        } else {
            this.setState(secureContext, State.REHYDRATE);
        }
    }
    /**
     * @returns { String }
    */
    get name() {
        return this.getProperty(secureContext, { name: null });
    }
    /**
     * @returns { String }
    */
    get description() {
        return this.getProperty(secureContext, { description: null });
    }
}