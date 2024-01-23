import {
    GUID,
    TypeDefinition
} from "../registry.mjs";
export class ReferenceType extends TypeDefinition {
    /**
     * @param { GUID } Id
     * @param { Boolean } isArray
    */
    constructor(Id, isArray = false) {
        if (new.target !== ReferenceType) {
            throw new Error(`${ReferenceType.name} class is not abstract`);
        }
        super(Id, isArray);
    }
}