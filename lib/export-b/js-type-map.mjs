import { Bag, JSType, State } from '../../registry.mjs';
const secureContext = Bag.getSecureContext();
export class JSTypeMap extends JSType {
    /**
     * @param { Function | String } func
     * @param { Function | null | undefined } relatedFunc
    */
    constructor(func, relatedFunc = null) {
        const targetClass = new.target;
        if (func === null || func === undefined || !(typeof func === 'function' || typeof func === 'string')) {
            throw new Error(`The func argument is null, undefined, not a function or a string.`);
        }
        if (relatedFunc !== null && relatedFunc !== undefined && typeof relatedFunc !== 'function') {
            throw new Error(`The relatedFunc argument is not a function .`);
        }
        super(JSTypeMap);
        if (this.hasState(secureContext, State.CONSTRUCT)) {
            this.setProperty(secureContext, { mappings: [] });
            if (targetClass === JSTypeMap) {
                this.setState(secureContext, State.HYDRATE);
            }
        } else {
            this.setState(secureContext, State.REHYDRATE);
        }
        const functionName = typeof func === 'function' ? func.name : func;
        const mappings = this.getProperty(secureContext, { mappings: null });
        if (relatedFunc) {
            mappings.push({ name: functionName, func: relatedFunc });
        }
        const mapping = mappings.find(mapping => mapping.name === functionName);
        if (mapping) {
            return new JSType(mapping.func);
        } else {
            throw new Error(`no mapping found for ${functionName}.`);
        }
    }
}