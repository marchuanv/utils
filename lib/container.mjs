import {
    ClassInterface,
    GUID,
    MemberParameter,
    Schema
} from '../registry.mjs';
const privateBag = new WeakMap();
export class Container extends Schema {
    /**
     * @param { Array<MemberParameter> } memberParameters
     * @param { GUID } referenceId
    */
    constructor(memberParameters, referenceId = null) {

        let _targetClass = new.target;
        if (_targetClass === Container.prototype) {
            throw new Error(`${Container.name} class is abstract`);
        }

        super();

        let _refId = referenceId;
        if (!_refId) {
            _refId = new GUID();
        }
        if (!privateBag.has(_refId)) {
            privateBag.set(_refId, {
                members: memberParameters,
                classInterface: new ClassInterface(_targetClass)
            });
        }
        privateBag.set(this, _refId);
        super.create();
        Object.freeze(this);
    }
    /**
     * @returns { GUID }
    */
    get Id() {
        const refId = privateBag.get(this);
        return refId;
    }
    /**
     * @returns { ClassInterface }
    */
    get interface() {
        const { classInterface } = privateBag.get(this.Id);
        return classInterface;
    }
    /**
     * @returns { Array<MemberParameter> }
    */
    get parameters() {
        const { members } = privateBag.get(this.Id);
        return members;
    }
}