import {
    Bag,
    ClassMember,
    JSType,
    JSTypeMap,
    Reflection,
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
            const { members, targetClass } = new InterfaceClass();
            const schemaMembers = Array();
            const typeMemberDescriptors = Reflection.getMemberDescriptors(targetClass.prototype);
            for (const { name, isProperty, isConstructor, isGetterProperty, isSetterProperty, isMethod, type } of members) {
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
                const jsType = JSTypeMap.get(type.func);
                schemaMembers.push(new ClassMember(
                    name,
                    jsType,
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
    validate() {
        const schemaProperties = this.getProperty(secureContext, { schemaMembers: null }).filter(x => x.isGetterProperty);
        for (const { type, name } of schemaProperties) {
            const { isClass, isArray, func } = type;
            const propVal = this[name];
            if ((propVal === null && type !== JSType.NULL) || (propVal === undefined && type !== JSType.UNDEFINED)) {
                throw new Error(`${name} property value is null or undefined.`);
            }
            if (isClass) {
                if (isArray) {
                    if (Array.isArray(propVal)) {
                        for (const val of propVal) {
                            if (val !== func && !(val instanceof func)) {
                                throw new Error(`${property.name} array element in is not of type ${name}`);
                            }
                        }
                    } else {
                        throw new Error(`${property.name} value is not an array.`);
                    }
                } else {
                    if (!(propVal instanceof func) && propVal !== func) {
                        throw new Error(`${name} value is not of type ${type.name}`);
                    }
                }
            } else {
                if (isArray) {
                    if (Array.isArray(propVal)) {
                        for (const val of propVal) {
                            if (val !== func && !(val instanceof func) && func !== ANY) {
                                throw new Error(`${name} array element in is not of type ${type.name}`);
                            }
                        }
                    } else {
                        throw new Error(`${property.name} value is not an array.`);
                    }
                } else {
                    if (typeof propVal !== type.name.toLowerCase()) {
                        if (!(propVal instanceof func)) {
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