import { GUID, TypeInfo } from "../registry.mjs";
const privateBag = new WeakMap();
export class TypeMemberInfo extends GUID {
    /**
     * @param { String } name
     * @param { TypeInfo } typeInfo
     * @param { TypeInfo } parentTypeInfo
    */
    constructor(name, typeInfo, parentTypeInfo) {
        super({ name, typeInfo, parentTypeInfo });
        if (!privateBag.has(this)) {
            const memberFound = parentTypeInfo.members.find(x => x.name === name);
            if (!memberFound) {
                throw new Error(`${name} member not found on ${parentTypeInfo.name} type.`);
            }
            privateBag.set(this, { name, memberId: memberFound.propertyId, type: typeInfo, parentType: parentTypeInfo });
        }
    }
    /**
     * @returns { GUID }
    */
    get Id() {
        const { memberId } = privateBag.get(this);
        return memberId;
    }
    /**
     * @returns { String }
    */
    get name() {
        const { name } = privateBag.get(this);
        return name;
    }
    /**
     * @returns { TypeInfo }
    */
    get type() {
        const { type } = privateBag.get(this);
        return type;
    }
    /**
     * @returns { TypeInfo }
    */
    get parentType() {
        const { parentType } = privateBag.get(this);
        return parentType;
    }
}