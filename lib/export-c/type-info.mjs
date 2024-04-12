import {
    Bag,
    Interface,
    JavaScriptType,
    Property,
    Reflection,
    SecureContext,
    State,
    Type,
    TypeMemberInfo
} from "../../registry.mjs";
export class TypeInfo extends Type {
    /**
     * @param { Function | String } targetType
     * @param { Boolean } isSingleton
     * @param { SecureContext } secureContext
    */
    constructor(targetType, isSingleton, secureContext) {
        const targetClass = new.target;
        if (targetClass === Interface) {
            throw new Error(`directly targeting ${Interface.name} is not allowed.`);
        }
        if (isSingleton === null || isSingleton === undefined || typeof isSingleton !== 'boolean') {
            throw new Error('The isSingleton argument is null, undefined or not a boolean.');
        }
        super(targetType, targetType, secureContext);
        if (this.isAtState(State.CONSTRUCT)) {
            if (!(this instanceof Interface)) {
                throw new Error(`${TypeInfo.name} is not an instance of ${Interface.name}.`);
            }
            if (super.jsType instanceof JavaScriptType.Unknown) {
                throw new Error('type is unknown.');
            }
            const typeMembersInfo = Array();
            Bag.setProperty(this, secureContext, new Property('members', typeMembersInfo));
            let isClassProperty = new Property('isClass', false);
            if (super.jsType instanceof JavaScriptType.Class || super.jsType instanceof JavaScriptType.Object) {
                isClassProperty = new Property('isClass', true);
                const typeMemberDescriptors = Reflection.getMemberDescriptors(super.func.prototype);
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
                if (isSingleton) {
                    const instance = new super.func();
                    if (super.isArray) {
                        defaultValue = [instance];
                    } else {
                        defaultValue = instance;
                    }
                } else {
                    defaultValue = {};
                    for (const { name, typeInfo } of membersProperty.value) {
                        if (name !== 'constructor') {
                            defaultValue[name] = typeInfo.defaultValue;
                        }
                    }
                }

            }
            const defaultValue = super.jsType.defaultValue;
            Bag.setProperty(this, secureContext, isClassProperty);
            Bag.setProperty(this, secureContext, new Property('defaultValue', defaultValue));
            Bag.setState(this, secureContext, State.HYDRATE);
        }
    }
    /**
     * @returns { Boolean }
    */
    get isClass() {
        return this.getPropertyValue({ isClass: null });
    }
    /**
     * @returns { Array<TypeMemberInfo> }
    */
    get members() {
        return this.getPropertyValue({ members: null });
    }
    /**
     * @returns { Object, NULL }
    */
    get defaultValue() {
        return this.getPropertyValue({ defaultValue: null });
    }
}