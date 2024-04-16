import {
    Bag,
    Interface,
    JSTypeMap,
    Reflection,
    SchemaMember,
    SecureContext,
    State
} from "../../registry.mjs";
const secureContext = new SecureContext();
export class Schema extends Bag {
    constructor() {
        let targetClass = new.target;
        if (targetClass === Schema) {
            throw new Error(`${Schema.name} is an abstract class.`);
        }
        const { func: InterfaceClass, name } = JSTypeMap.get(targetClass);
        super(`Id: 36d1d496-6b4a-4616-ab97-33d367385fa2, Interface: ${name}`, secureContext);
        if (this.hasState(secureContext, State.CONSTRUCT)) {
            const $interface = new InterfaceClass();
            const { targetInterface, members, targetClass } = $interface;
            const schemaMembers = Array();
            const typeMemberDescriptors = Reflection.getMemberDescriptors(targetClass.prototype);
            for (const { name, isProperty, isConstructor, isGetterProperty, isSetterProperty, isMethod, $interface } of members) {
                const schemaMember = typeMemberDescriptors.find(member =>
                    member.memberKey === name &&
                    member.isProperty === isProperty &&
                    member.isConstructor === isConstructor &&
                    member.isGetterProperty === isGetterProperty &&
                    member.isSetterProperty === isSetterProperty &&
                    member.isMethod === isMethod
                );
                if (!schemaMember) {
                    throw new Error(`${targetClass.name} does not have the ${name} member or the member is invalid.`);
                }
                let type = null;
                if ($interface.targetClasses.length > 1) {
                    throw new Error(`could not resolve '${name}' member type. More than one type was returned.`)
                }
                type = $interface.targetClasses[0];
                schemaMembers.push(new SchemaMember(
                    name,
                    type,
                    isConstructor,
                    isMethod,
                    isProperty,
                    isGetterProperty,
                    isSetterProperty
                ));
            }
            this.setProperty(secureContext, { schemaMembers });
            this.setState(secureContext, State.HYDRATE);
        } else {
            this.setState(secureContext, State.REHYDRATE);
        }
    }
    /**
     * @param { Object } data
    */
    validate(data) {
        let objKeys = Object.keys(data);
        const prototype = Object.getPrototypeOf(data);
        if (prototype) {
            objKeys = objKeys.concat(Reflect.ownKeys(prototype));
        }
        if (objKeys.length === 0) {
            throw new Error(`data to verify does not have any properties.`);
        }
        const schemaMembers = this.getProperty(secureContext, { schemaMembers });
        for (const { isClass, isArray, func, name } of schemaMembers.filter(x => x.isGetterProperty)) {
            const keyMatch = objKeys.find(k => k === name);
            if (keyMatch === undefined || keyMatch === null) {
                throw new Error(`data does not have the ${name} property.`);
            }
            if ((property.value === null && func !== NULL) || (property.value === undefined && func !== UNDEFINED)) {
                throw new Error(`${property.name} value is null or undefined.`);
            }
            if (isClass) {
                if (isArray) {
                    if (Array.isArray(property.value)) {
                        for (const val of property.value) {
                            if (val !== func && !(val instanceof func)) {
                                throw new Error(`${property.name} array element in is not of type ${name}`);
                            }
                        }
                    } else {
                        throw new Error(`${property.name} value is not an array.`);
                    }
                } else {
                    if (!(property.value instanceof func) && property.value !== func) {
                        throw new Error(`${property.name} value is not of type ${name}`);
                    }
                }
            } else {
                if (isArray) {
                    if (Array.isArray(property.value)) {
                        for (const val of property.value) {
                            if (val !== func && !(val instanceof func) && func !== ANY) {
                                throw new Error(`${property.name} array element in is not of type ${type.name}`);
                            }
                        }
                    } else {
                        throw new Error(`${property.name} value is not an array.`);
                    }
                } else {
                    if (typeof property.value !== name.toLowerCase()) {
                        if (!(property.value instanceof func)) {
                            throw new Error(`${property.name} value is not of type ${typeName}`);
                        }
                    }
                }
            }
        }
    }
    /**
     * @param { Object } data
    */
    serialise(data) {
        this.validate(data);
        return Serialiser.serialise(data);
    }
}