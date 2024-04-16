import {
    Bag,
    InterfaceMember,
    JSTypeMap,
    Reflection,
    State
} from "../../registry.mjs";
const secureContext = Bag.getSecureContext();
export class Interface extends Bag {
    constructor() {
        const targetInterface = new.target;
        if (targetInterface === Interface) {
            throw new Error(`targeting the ${Interface.name} class is not allowed.`);
        }
        super(`Id: 68805cc4-abb3-4c61-96c2-d86468408539, Interface: ${targetInterface.name}`, secureContext);
        if (this.hasState(secureContext, State.CONSTRUCT)) {
            const { func: targetClass } = JSTypeMap.get(targetInterface);
            let interfaceMembers = new Array();
            const extendedClasses = Reflection.getExtendedClasses(this);
            const interfaceClassIndex = extendedClasses.findIndex(x => x === Interface);
            extendedClasses.splice(0, interfaceClassIndex + 1);
            for (const Class of extendedClasses) {
                interfaceMembers = interfaceMembers.concat(getInterfaceMembers.call(this, Class.prototype));
            }
            this.setProperty(secureContext, { interfaceMembers });
            this.setProperty(secureContext, { targetInterface });
            this.setProperty(secureContext, { targetClass });
            this.setState(secureContext, State.HYDRATE);
        } else {
            this.setState(secureContext, State.REHYDRATE);
        }
    }
    /**
     * @returns { Function }
    */
    get targetInterface() {
        return this.getProperty(secureContext, { targetInterface: null });
    }
    /**
     * @returns { Array<Function> }
    */
    get targetClass() {
        return this.getProperty(secureContext, { targetClass: null });
    }
    /**
     * @returns { Array<InterfaceMember> }
    */
    get members() {
        return this.getProperty(secureContext, { interfaceMembers: null });
    }
}
/**
 * @param { Object } prototype
 * @returns { Array<InterfaceMember> }
*/
function getInterfaceMembers(prototype) {
    const interfaceMembers = new Array();
    const targetClassMembers = Reflection.getMemberDescriptors(prototype);
    for (const { memberKey, isConstructor, method, isMethod, isProperty, isGetterProperty, isSetterProperty } of targetClassMembers) {
        let $interface = null;
        if (isConstructor) {
            $interface = this;
        } else {
            $interface = method();
        }
        if (!($interface instanceof Interface)) {
            throw new Error(`${prototype.constructor.name}.${memberKey} member did not return an instance of an ${Interface.name}.`);
        }
        const isArray = false;
        interfaceMembers.push(new InterfaceMember(
            memberKey,
            $interface,
            isConstructor,
            isMethod,
            isProperty,
            isGetterProperty,
            isSetterProperty,
            isArray
        ));
    }
    return interfaceMembers;
}