import {
    Bag,
    JSTypeMap,
    Reflection,
    State,
    InterfaceMember
} from "../../registry.mjs";
const secureContext = Bag.getSecureContext();
export class Interface extends Bag {
    constructor() {
        const targetClass = new.target;
        if (targetClass === Interface) {
            throw new Error(`targeting the ${Interface.name} class is not allowed.`);
        }
        try {
            JSTypeMap.get({ funcA: targetClass });
        } catch (error) {
            throw new Error(`${targetClass.name} is not mapped.`);
        }
        const [ jsTypeA, jsTypeB ] = JSTypeMap.get(targetClass);
        if (jsTypeA.func !== targetClass && jsTypeB.func !== targetClass) {
            throw new Error(`${targetClass.name} is not mapped to a type.`);
        }
        super(`Id: 68805cc4-abb3-4c61-96c2-d86468408539, Interface: ${targetClass.name}`, secureContext);
        if (this.isAtState(State.CONSTRUCT)) {
            let interfaceMembers = new Array();
            const extendedClasses = Reflection.getExtendedClasses(this);
            const interfaceClassIndex = extendedClasses.findIndex(x => x === Interface);
            extendedClasses.splice(0, interfaceClassIndex + 1);
            for (const Class of extendedClasses) {
                interfaceMembers = interfaceMembers.concat(getInterfaceMembers.call(this, Class.prototype));
            }
            this.setPropertyValue(secureContext, { interfaceMembers });
            this.setState(secureContext, State.HYDRATE);
        }
        return new InterfaceMember('constructor', targetClass, true, true, false, false, false);
    }
    /**
     * @returns { Array<InterfaceMember> }
    */
    get members() {
        return this.getPropertyValue(secureContext, { interfaceMembers: null });
    }
}
/**
 * @param { Object } prototype
 * @returns { Array<InterfaceMember> }
*/
function getInterfaceMembers(prototype) {
    const interfaceMembers = new Array();
    const targetClassMembers = Reflection.getMemberDescriptors(prototype);
    for (const { memberKey, isMethod, isProperty, isGetterProperty, isSetterProperty, isConstructor, method } of targetClassMembers) {
        let interfaceMember = null;
        if (isConstructor) {
            interfaceMember = this;
        } else {
            interfaceMember = method();
        }
        if (!(interfaceMember instanceof InterfaceMember)) {
            throw new Error(`${prototype.constructor.name}.${memberKey} member did not return an instance of an ${InterfaceMember.name}.`);
        }
        interfaceMembers.push(interfaceMember);
    }
    return interfaceMembers;
}