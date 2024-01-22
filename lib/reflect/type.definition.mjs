import { GUID, fileURLToPath, join, readFileSync } from "../../registry.mjs";
const privateBag = new WeakMap();
let typeDefintions = [];
export class TypeDefinition {
    /**
     * @param { GUID } Id
     * @param { Boolean } convertToArray
    */
    constructor(Id, convertToArray) {
        const found = TypeDefinition.find({ Id: Id.toString() });
        if (!found) {
            throw new Error(`${typeDefinitionFilePath} does not have a type with Id: ${Id}`);
        }
        const { name, typeName, isReferenceType, type, isArray } = found;
        if (convertToArray) {
            {
                const _name = name;
                const _typeName = typeName;
                const _type = type;
                const { Id } = TypeDefinition.find({ name: 'array' });
                const arrayDefintion = new TypeDefinition(new GUID(Id), false);
                privateBag.set(this, {
                    name: `array<${_name}>`,
                    typeName: `Array<${_typeName}>`,
                    Id: arrayDefintion.Id,
                    type: [_type, arrayDefintion.type],
                    isReferenceType: true,
                    isArray: true
                });
            }
        } else {
            privateBag.set(this, {
                name,
                typeName,
                Id,
                type,
                isReferenceType,
                isArray
            });
        }
        const index = TypeDefinition.findIndex({ Id: Id.toString() });
        typeDefintions[index] = this;
    }
    /**
     * @returns { GUID }
    */
    get Id() {
        const { Id } = privateBag.get(this);
        return Id;
    }
    /**
     * @returns { String }
    */
    get name() {
        const { name } = privateBag.get(this);
        return name;
    }
    /**
     * @returns { String }
    */
    get typeName() {
        const { typeName } = privateBag.get(this);
        return typeName;
    }
    /**
     * @returns { Object }
    */
    get type() {
        const { type } = privateBag.get(this);
        return type;
    }
    /**
     * @returns { Boolean }
    */
    get isArray() {
        const { isArray } = privateBag.get(this);
        return isArray;
    }
    /**
     * @returns { Boolean }
    */
    get isReferenceType() {
        const { isReferenceType } = privateBag.get(this);
        return isReferenceType;
    }
    /**
     * @returns { Boolean }
    */
    get isObject() {
        return this.type === Object;
    }
    /**
     * @returns { String }
    */
    toString() {
        const { name } = privateBag.get(this);
        return name;
    }
    /**
     * @param { GUID } Id
     * @param { class } targetClass
     * @returns { Object }
    */
    static registerClass(Id, targetClass) {
        const typeName = targetClass.name;
        typeDefintions.push({
            name: typeName.toLowerCase(),
            typeName,
            Id,
            type: targetClass,
            isReferenceType: true,
            isArray: false
        });
        new TypeDefinition(Id, false);
    }
    /**
     * @param { { name: String, typeName: String, Id: String, isReferenceType: Boolean, Class: class } } criteria
     * @returns { Object | Array<Object> }
    */
    static find(criteria) {
        const { name, typeName, Id, isReferenceType, type } = criteria;
        const results = typeDefintions.filter(def =>
            (name && def.name === name) ||
            (typeName && def.typeName === typeName) ||
            (Id && (def.Id === Id || def.Id.toString() === Id || def.Id === Id.toString() || def.Id.toString() === Id.toString())) ||
            (isReferenceType !== undefined && def.isReferenceType === isReferenceType) ||
            (type && def.type === type)
        );
        if (results.length > 0) {
            if (results.length === 1) {
                return results[0];
            }
            return results;
        } else {
            return null;
        }
    }
    /**
     * @param { { name: String, typeName: String, Id: String, isReferenceType: Boolean, Class: class } } criteria
     * @returns { Object | Array<Object> }
    */
    static findIndex(criteria) {
        const { name, typeName, Id, isReferenceType, type } = criteria;
        return typeDefintions.findIndex(def =>
            (name && def.name === name) ||
            (typeName && def.typeName === typeName) ||
            (Id && (def.Id === Id || def.Id.toString() === Id || def.Id === Id.toString() || def.Id.toString() === Id.toString())) ||
            (isReferenceType !== undefined && def.isReferenceType === isReferenceType) ||
            (type && def.type === type)
        );
    }
}
const currentDir = fileURLToPath(new URL('./', import.meta.url));
const typeDefinitionFilePath = join(currentDir, 'type.defintion.json');
let _typeDefintions = JSON.parse(readFileSync(typeDefinitionFilePath, 'utf8'));
typeDefintions = Object.keys(_typeDefintions).map(defKey => {
    const { Id, isReferenceType } = _typeDefintions[defKey];
    const name = defKey.toLowerCase();
    const typeName = defKey;
    const type = mapType(defKey.toLowerCase());
    let isArray = false;
    if (type === Array) {
        isArray = true;
    }
    return { name, typeName, Id, type, isReferenceType, isArray };
});

function mapType(name) {
    switch (name) {
        case 'string': {
            return String;
        }
        case 'number': {
            return Number;
        }
        case 'boolean': {
            return Boolean;
        }
        case 'bigint': {
            return BigInt;
        }
        case 'object': {
            return Object;
        }
        case 'symbol': {
            return Symbol;
        }
        case 'null': {
            return null;
        }
        case 'undefined': {
            return undefined;
        }
        case 'array': {
            return Array;
        }
        case 'guid': {
            return GUID;
        }
        default: {
            throw new Error('could not map type');
        }
    }
}
