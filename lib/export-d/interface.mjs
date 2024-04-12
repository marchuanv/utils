import {
    Bag,
    BagState,
    JSTypeMapping,
    Reflection,
    State,
    TypeMemberInfo
} from "../../registry.mjs";
const secureContext = Bag.getSecureContext();
export class Interface extends BagState {
    constructor() {
        const targetClass = new.target;
        if (targetClass === Interface) {
            throw new Error(`targeting an ${Interface.name} is not allowed.`);
        }
        try {
            JSTypeMapping.get({ funcA: targetClass });
        } catch (error) {
            throw new Error(`${targetClass.name} is not mapped.`);
        }
        const { jsTypeA, jsTypeB } = JSTypeMapping.get({ funcA: targetClass });
        if (jsTypeA.func !== targetClass && jsTypeB.func !== targetClass) {
            throw new Error(`${targetClass.name} is not mapped to a type.`);
        }
        super(`Id: 68805cc4-abb3-4c61-96c2-d86468408539, Interface: ${targetClass.name}`, secureContext);
        if (this.isAtState(State.CONSTRUCT)) {
            let interfaceMembers = new Array();
            const extended = Reflection.getExtendedClasses(this);
            const interfaceClassIndex = extended.findIndex(x => x === Interface);
            extended.splice(0, interfaceClassIndex + 1);
            for (const Class of extended) {
                interfaceMembers = interfaceMembers.concat(getTypeMembers.call(this, secureContext, Class.prototype));
            }
            const constructorMember = interfaceMembers.find(x => x.isConstructor);
            if (constructorMember) {
                throw new Error('constructor on interface is not allowed.');
            }
            this.setPropertyValue({ interfaceMembers });
            this.setState(State.HYDRATE);
        }
    }
    /**
     * @returns { Array<TypeMemberInfo> }
    */
    get members() {
        return this.getPropertyValue({ interfaceMembers: null });
    }
}
/**
 * @param { Object } prototype
 * @returns { Array<TypeMemberInfo> }
*/
function getTypeMembers(prototype) {
    const interfaceMembers = new Array();
    const targetClassMembers = Reflection.getMemberDescriptors(prototype);
    for (const { memberKey, isMethod, isProperty, isGetterProperty, isSetterProperty, isConstructor, method } of targetClassMembers) {
        let memberTypeInfo = null;
        if (isConstructor) {
            memberTypeInfo = this;
        } else {
            memberTypeInfo = method();
        }
        if (!(memberTypeInfo instanceof Interface)) {
            throw new Error(`${prototype.constructor.name}.${memberKey} member did not return an instance of an ${Interface.name}.`);
        }
        const typeMemberInfo = new TypeMemberInfo(
            memberKey,
            memberTypeInfo,
            isConstructor,
            isMethod,
            isProperty,
            isGetterProperty,
            isSetterProperty,
            secureContext
        )
        interfaceMembers.push(typeMemberInfo);
    }
    return interfaceMembers;
}