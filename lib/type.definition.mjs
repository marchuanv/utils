import { GUID, Schema, existsSync, fileURLToPath, join, readFileSync } from "../registry.mjs";
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
        const { name, typeName, isReferenceType, type, isArray, scriptFilePath, classConfig } = found;
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
                    isArray: true,
                    scriptFilePath,
                    classConfig
                });
            }
        } else {
            privateBag.set(this, {
                name,
                typeName,
                Id,
                type,
                isReferenceType,
                isArray,
                scriptFilePath,
                classConfig
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
    get scriptFilePath() {
        const { scriptFilePath } = privateBag.get(this);
        return scriptFilePath;
    }
    /**
     * @returns { Object }
    */
    get classConfig() {
        const { classConfig } = privateBag.get(this);
        return classConfig;
    }
    /**
     * @returns { String }
    */
    toString() {
        const { name } = privateBag.get(this);
        return name;
    }
    /**
     * @param { Array<{ scriptFilePath: String, targetClass: class }> } config
     * @returns { Object }
    */
    static async register(config) {
        for (const { scriptFilePath, targetClass } of config) {
            const typeName = targetClass.name;
            const classInterfaceFilePath = scriptFilePath.replace('.mjs', '.interface.json');
            if (!existsSync(classInterfaceFilePath)) {
                throw new Error(`${classInterfaceFilePath} does not exist`);
            }
            const configStr = readFileSync(classInterfaceFilePath, 'utf8');
            const classConfig = JSON.parse(configStr);

            const { extend } = classConfig;
            if (extend && Object.keys(extend).length > 0) {
                const { type } = extend;
                const { $refId } = type;
                const _classConfig = classConfig;
                {
                    const { classConfig } = TypeDefinition.find({ Id: $refId });
                    _classConfig.extend = classConfig;
                }
            }
            const schema = Schema.findSchema({ $Id: 'https://540885dc317a40e5b7b0e4549b37dff6/class' });
            await schema.validate(classConfig);

            const { Id } = classConfig;
            typeDefintions.push({
                name: typeName.toLowerCase(),
                typeName,
                Id,
                type: targetClass,
                isReferenceType: true,
                isArray: false,
                scriptFilePath,
                classConfig
            });
            new TypeDefinition(Id, false);
        }
    }
    /**
     * @param { { name: String, typeName: String, Id: String, isReferenceType: Boolean, type: class } } criteria
     * @returns { TypeDefinition }
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
     * @param { { name: String, typeName: String, Id: String, isReferenceType: Boolean, type: class } } criteria
     * @returns { Number }
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
