import {
    Reflection,
    SecureContext,
    TypeInfo,
    TypeMemberInfo
} from "../../registry.mjs";
export class Interface extends TypeInfo {
    /**
     * @param { SecureContext } secureContext
     * @returns { Array<TypeMemberInfo> }
    */
    getInterfaceMembers(secureContext) {
        let interfaceMembers = new Array();
        const extended = Reflection.getExtendedClasses(this);
        const interfaceClassIndex = extended.findIndex(x => x === Interface);
        extended.splice(0, interfaceClassIndex + 1);
        for (const Class of extended) {
            interfaceMembers = interfaceMembers.concat(getTypeMembers.call(this, secureContext, Class.prototype));
        }
        return interfaceMembers;
    }
}
/**
 * @param { SecureContext } secureContext
 * @param { Object } prototype
 * @returns { Array<TypeMemberInfo> }
*/
function getTypeMembers(secureContext, prototype) {
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