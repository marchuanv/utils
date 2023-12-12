import { Member } from "./member.mjs";
import { Type } from "./type.mjs";
export class MethodMember extends Member {
    /**
     * @param { String } name
     * @param { Boolean } isStatic
     * @param { Boolean } isCtor
     * @param { Array<MemberParameter> } parameters
     * @param { Type } returnType
    */
    constructor(name, isStatic, isCtor, parameters, returnType) {
        super();
        super.update(name, false, false, true, isStatic, isCtor, false, false, returnType, parameters);
    }
}