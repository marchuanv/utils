import { Member } from "./member.mjs";
import { MemberParameter } from "./member.parameter.mjs";
export class PropertyMember extends Member {
    /**
     * @param { String } name
     * @param { Boolean } isStatic
     * @param { Array<MemberParameter> } parameters
     * @param { Object } returnType
    */
    constructor(name, isStatic, parameters, returnType) {
        super();
        super.update(name, false, true, false, isStatic, false, returnType, parameters);
    }
}