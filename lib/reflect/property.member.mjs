import { Member } from "./member.mjs";
import { MemberParameter } from "./member.parameter.mjs";
import { TypeMapper } from "./type.mapper.mjs";
export class PropertyMember extends Member {
    /**
     * @param { String } name
     * @param { Boolean } isStatic
     * @param { Boolean } isGetter
     * @param { Boolean } isSetter
     * @param { Array<MemberParameter> } parameters
     * @param { TypeMapper } returnType
    */
    constructor(name, isStatic, isGetter, isSetter, parameters, returnType) {
        super();
        super.update(name, false, true, false, isStatic, false, isGetter, isSetter, returnType, parameters);
    }
}