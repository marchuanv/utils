import {
    ANY,
    Bag,
    NULL,
    Property,
    Reflection,
    State,
    Type,
    TypeInfoSchema,
    TypeMemberInfoSchema,
    UNDEFINED,
    UNKNOWN
} from "../../registry.mjs";
const secureContext = Bag.getSecureContext();
export class TypeInfo extends Type {
    /**
     * @param { Function } targetType
     * @param { Boolean } isStatic
    */
    constructor(targetType, isStatic = false) {
        const targetClass = new.target;
        if (targetClass === TypeInfoSchema || targetClass === TypeInfo) {
            throw new Error(`targeting ${TypeInfoSchema.name} or ${TypeInfo.name} not allowed.`);
        }
        super(targetType, targetType, secureContext);
        if (this.isAtState(State.CONSTRUCT)) {
            if (super.func == UNKNOWN) {
                throw new Error('type is unknown.');
            }
            if (!(this instanceof TypeInfoSchema)) {
                throw new Error(`${TypeInfo.name} does not have a schema.`);
            }
            let schemaMemberDescriptors = getMemberDescriptors(targetClass.prototype);
            let typeMemberDescriptors = getMemberDescriptors(super.func.prototype);
            for (const schemaMemberDescriptor of schemaMemberDescriptors) {
                const typeMemberDescriptor = typeMemberDescriptors.find(x =>
                    x.memberKey === schemaMemberDescriptor.memberKey &&
                    x.isProperty === schemaMemberDescriptor.isProperty &&
                    x.isConstructor === schemaMemberDescriptor.isConstructor &&
                    x.isGetterProperty === schemaMemberDescriptor.isGetterProperty &&
                    x.isSetterProperty === schemaMemberDescriptor.isSetterProperty &&
                    x.isMethod === schemaMemberDescriptor.isMethod
                );
                if (!typeMemberDescriptor) {
                    throw new Error('schema and type member mismatch.');
                }
                if (schemaMemberDescriptor.isGetterProperty || (schemaMemberDescriptor.isMethod && !schemaMemberDescriptor.isConstructor)) {
                    const isMemberTypeInfo = schemaMemberDescriptor.method.toString().indexOf(`${TypeInfoSchema.name}`) > -1;
                    if (!isMemberTypeInfo) {
                        throw new Error(`${targetClass.name} ${schemaMemberDescriptor.memberKey} member does not return ${TypeInfoSchema.name}.`);
                    }
                }
            }
            const membersProperty = new Property('members', []);
            for (const { memberKey, isMethod, isProperty, isGetterProperty, isSetterProperty, isConstructor } of schemaMemberDescriptors) {
                let memberTypeInfo = null;
                if (isMethod) {
                    if (isConstructor) {
                        memberTypeInfo = this;
                    } else {
                        memberTypeInfo = this[memberKey]();
                    }
                } else if (isProperty) {
                    memberTypeInfo = this[memberKey];
                } else {
                    throw new Error('critical error.');
                }
                if (!(memberTypeInfo instanceof TypeInfoSchema)) {
                    throw new Error(`${key} member has an invalid member type.`);
                }
                membersProperty.value.push(new TypeMemberInfoSchema(
                    memberKey,
                    memberTypeInfo,
                    isMethod,
                    isGetterProperty,
                    isSetterProperty
                ));
            }
            Bag.setProperty(this, secureContext, membersProperty);
            const isClass = Reflection.isClass(super.func);
            let defaultValue = UNKNOWN;
            Bag.setProperty(this, secureContext, new Property('isClass', isClass));
            if (isClass) {
                if (isStatic) {
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
            } else {
                switch (super.func) {
                    case String: {
                        defaultValue = '';
                        break;
                    }
                    case Boolean: {
                        defaultValue = false;
                        break;
                    }
                    case BigInt: {
                        defaultValue = 0;
                        break;
                    }
                    case Number: {
                        defaultValue = 0;
                        break;
                    }
                    case NULL: {
                        defaultValue = null;
                        break;
                    }
                    case UNDEFINED: {
                        defaultValue = undefined;
                        break;
                    }
                    case Array: {
                        defaultValue = [];
                        break;
                    }
                    case Date: {
                        defaultValue = new Date();
                        break;
                    }
                    case ANY || Object: {
                        defaultValue = {};
                        for (const { memberKey } of membersProperty.value) {
                            defaultValue[memberKey] = memberTypeInfo.defaultValue;
                        }
                        break;
                    }
                    default: {
                        throw new Error(`unable to determine default value for ${super.name}`);
                    }
                }
            }
            if (super.isArray) {
                defaultValue = [defaultValue];
            }
            Bag.setProperty(this, secureContext, new Property('defaultValue', defaultValue));
            Bag.setState(this, secureContext, State.HYDRATE);
        }
    }
    /**
     * @returns { Boolean }
    */
    get isClass() {
        return Bag.getProperty(this, secureContext, { isClass: null });
    }
    /**
     * @returns { Array<TypeMemberInfoSchema> }
    */
    get members() {
        return Bag.getProperty(this, secureContext, { members: null });
    }
    /**
     * @returns { Object, NULL }
    */
    get defaultValue() {
        return Bag.getProperty(this, secureContext, { defaultValue: null });
    }
}
/**
 * @param { Object } prototype
 * @returns { Array<{  memberKey: String, isProperty: Boolean, isGetterProperty: Boolean, isSetterProperty: Boolean, isMethod: Boolean, method: Function, isConstructor: Boolean }> }
*/
function getMemberDescriptors(prototype) {
    const descriptors = [];
    let memberKeys = Reflect.ownKeys(prototype);
    memberKeys = memberKeys.concat(Object.keys(prototype));
    for (const memberKey of memberKeys) {
        const descriptor = Reflect.getOwnPropertyDescriptor(prototype, memberKey);
        if (descriptor) {
            const isGetterProperty = descriptor.get ? true : false;
            const isSetterProperty = descriptor.set ? true : false;
            const isProperty = isGetterProperty || isSetterProperty;
            let isMethod = true;
            let isConstructor = false;
            if (isGetterProperty || isSetterProperty) {
                isMethod = false;
            } else {
                isMethod = true;
                if (memberKey === 'constructor') {
                    isConstructor = true;
                }
            }
            let method = null;
            if (isMethod) {
                method = descriptor.value;
            } else if (isProperty) {
                if (isGetterProperty) {
                    method = descriptor.get;
                } else if (isSetterProperty) {
                    method = descriptor.set;
                }
            }
            descriptors.push({
                memberKey,
                isProperty,
                isGetterProperty,
                isSetterProperty,
                isMethod,
                method,
                isConstructor
            });
        }
    }
    return descriptors;
}