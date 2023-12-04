import { Member } from "./member.mjs";
export class MethodMember extends Member {
    /**
     * @param { String } name
     * @param { Boolean } isStatic
     * @param { Array<MemberParameter> } parameters
     * @param { Object } returnType
    */
    constructor(name, isStatic, parameters, returnType) {
        super();
        super.update(name, false, false, true, isStatic, returnType, parameters);
    }
}