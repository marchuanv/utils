import {
    BagState,
    Interface,
    JSTypeMapping,
    Reflection,
    SecureContext,
    State,
    TypeMemberInfo
} from "../../registry.mjs";
export class TypeInfo extends BagState {
    /**
     * @param { Function | String } targetType
     * @param { Boolean } isSingleton
     * @param { SecureContext } secureContext
    */
    constructor(targetType, isSingleton, secureContext) {
        const { jsTypeA, jsTypeB } = JSTypeMapping.get({ funcA: targetType, funcB: targetType });
        if (jsTypeB.func === Interface) {
            throw new Error(`${targetType.name} is mapped directly to an ${Interface.name}.`);
        }
        if (!jsTypeB.isClass) {
            throw new Error(`${targetType.name} is not mapped to a class.`);
        }
        if (!Reflection.getExtendedClasses(jsTypeB.func).find(x => x === Interface)) {
            throw new Error(`${targetType.name} is not mapped to a class that extends ${Interface.name}.`);
        }
        super(`Id: 36d1d496-6b4a-4616-ab97-33d367385fa2, JSTypeA: ${jsTypeA}, JSTypeB: ${jsTypeB}`, secureContext);
        if (this.isAtState(State.CONSTRUCT)) {
            if (!(this instanceof Interface)) {
                throw new Error(`${TypeInfo.name} is not an instance of ${Interface.name}.`);
            }
            if (isSingleton === null || isSingleton === undefined || typeof isSingleton !== 'boolean') {
                throw new Error('The isSingleton argument is null, undefined or not a boolean.');
            }
            const typeMembersInfo = Array();
            const jsType = jsTypeA.isClass ? jsTypeA : jsTypeB.isClass ? jsTypeB : null;
            if (jsTypeB) {
                const typeMemberDescriptors = Reflection.getMemberDescriptors(jsType.func.prototype);
                const interfaceTypeMembersInfo = this.getInterfaceMembers(secureContext);
                for (const { memberKey, isProperty, isConstructor, isGetterProperty, isSetterProperty, isMethod } of typeMemberDescriptors) {
                    const interfaceMember = interfaceTypeMembersInfo.find(x =>
                        x.name === memberKey &&
                        x.isProperty === isProperty &&
                        x.isConstructor === isConstructor &&
                        x.isGetterProperty === isGetterProperty &&
                        x.isSetterProperty === isSetterProperty &&
                        x.isMethod === isMethod
                    );
                    if (!interfaceMember) {
                        throw new Error(`${targetClass.name} interface does not have the ${memberKey} member or the member is incorrect.`);
                    }
                    const { typeInfo } = interfaceMember;
                    const typeMemberInfo = new TypeMemberInfo(
                        memberKey,
                        typeInfo,
                        isConstructor,
                        isMethod,
                        isProperty,
                        isGetterProperty,
                        isSetterProperty,
                        secureContext
                    );
                    typeMembersInfo.push(typeMemberInfo);
                }
                for (const { name, typeInfo } of typeMembersInfo) {
                    if (name !== 'constructor') {
                        jsType.defaultValue[name] = typeInfo.defaultValue;
                    }
                }
            }
            this.setPropertyValue({ isClass: jsType.isClass });
            this.setPropertyValue({ defaultValue: jsType.defaultValue });
            this.setPropertyValue({ typeMembersInfo });
            this.setPropertyValue({ type: jsTypeA });
            this.setPropertyValue({ interface: jsTypeB });
            this.setState(State.HYDRATE);
        }
    }
    /**
     * @returns { Function }
    */
    get interface() {
        return this.getPropertyValue({ interface: null });
    }
    /**
     * @returns { Function }
    */
    get type() {
        return this.getPropertyValue({ type: null });
    }
    /**
     * @returns { Array<TypeMemberInfo> }
    */
    get members() {
        return this.getPropertyValue({ typeMembersInfo: null });
    }
    /**
     * @returns { Object, NULL }
    */
    get defaultValue() {
        return this.getPropertyValue({ defaultValue: null });
    }
}