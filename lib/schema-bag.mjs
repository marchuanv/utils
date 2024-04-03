import {
    Bag,
    Schema,
    SecureContext,
    GUIDSchema,
    UUID,
} from '../registry.mjs';
/**
 * This class provides functionality to create a bag that is unique to a GUID schema.
*/
export class SchemaBag {
    /**
     * @param { SecureContext } secureContext
     * @param { Schema } schema
    */
    constructor(secureContext, schema = new GUIDSchema()) {
        if (secureContext === undefined || secureContext === null || !(secureContext instanceof SecureContext)) {
            throw new Error(`The secureContext argument is undefined, null, or not a ${SecureContext.name}.`);
        }
        if (schema === undefined || schema === null || !(schema instanceof GUIDSchema)) {
            throw new Error(`The schema argument is undefined, null, or not a ${GUIDSchema.name}.`);
        }
        const json = schema.serialise(schema.default);
        this._Id = new UUID(json);
        Object.freeze(this);
        if (Bag.has(this._Id, secureContext)) {
            const Class = Object.getPrototypeOf(this);
            return Bag.get(this._Id, secureContext, Class);
        } else {
            Bag.set(this._Id, secureContext, this, schema );
        }
    }
}