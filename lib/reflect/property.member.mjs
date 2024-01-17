import { Member, MemberParameter, TypeDefinition } from "../../registry.mjs";
export class PropertyMember extends Member {
    /**
     * @param { String } name
     * @param { Boolean } isStatic
     * @param { Boolean } isGetter
     * @param { Boolean } isSetter
     * @param { Array<MemberParameter> } parameters
     * @param { TypeDefinition } returnType
    */
    constructor(name, isStatic, isGetter, isSetter, parameters, returnType) {
        super();
        super.update(name, false, true, false, isStatic, false, isGetter, isSetter, returnType, parameters);
    }
}