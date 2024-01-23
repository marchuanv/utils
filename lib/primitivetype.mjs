import { GUID, TypeDefinition } from "../registry.mjs";
export class PrimitiveType extends TypeDefinition {
    /**
     * @param { GUID } Id
     * @param { Boolean } isArray
    */
    constructor(Id, isArray = false) {
        if (new.target !== PrimitiveType) {
            throw new Error(`${PrimitiveType.name} class is not abstract`);
        }
        super(Id, isArray);
    }
}