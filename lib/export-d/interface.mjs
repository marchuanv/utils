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
        const targetClass = new.target;
        if (targetClass === Interface) {
            throw new Error(`targeting the ${Interface.name} class is not allowed.`);
        }
        super(`Id: 68805cc4-abb3-4c61-96c2-d86468408539, Interface: ${targetClass.name}`, secureContext);
        if (this.hasState(secureContext, State.CONSTRUCT)) {
            if (!JSTypeMap.has(targetClass)) {
                throw new Error(`${JSTypeMap.name} does not have any mappings for ${targetClass.name}.`);
            }
            const mappings = Array.from(JSTypeMap.get(targetClass));
            const targetClasses = mappings.filter(jsTypeMap => jsTypeMap.isClass).map(jsTypeMap => jsTypeMap.func);
            if (targetClasses.length === 0) {
                throw new Error(`${targetClass.name} does not have any mappings to classes.`);
            }
            let interfaceMembers = new Array();
            const extendedClasses = Reflection.getExtendedClasses(this);
            const interfaceClassIndex = extendedClasses.findIndex(x => x === Interface);
            extendedClasses.splice(0, interfaceClassIndex + 1);
            for (const Class of extendedClasses) {
                interfaceMembers = interfaceMembers.concat(getInterfaceMembers.call(this, Class.prototype));
            }
            this.setProperty(secureContext, { interfaceMembers });
            this.setProperty(secureContext, { targetInterface: targetClass });
            this.setProperty(secureContext, { targetClasses });
            this.setState(secureContext, State.HYDRATE);
        }
        return new InterfaceMember('constructor', targetClass, true, true, false, false, false);
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
    get targetClasses() {
        return this.getProperty(secureContext, { targetClasses: null });
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
    for (const { memberKey, isConstructor, method } of targetClassMembers) {
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