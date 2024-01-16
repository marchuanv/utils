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

        let _refId = referenceId;
        let _memberParameters = memberParameters;

        if (!_refId) {
            _refId = new GUID();
        }

        if (privateBag.has(_refId)) {
            _memberParameters = privateBag.get(_targetClass);
        } else {
            privateBag.set(_refId, _memberParameters);
        }

        super(_memberParameters);

        let classInterface = new ClassInterface(_targetClass);
        privateBag.set(this, classInterface);

        super.create();
        Object.freeze(this);
    }
    /**
     * @returns { ClassInterface }
    */
    get interface() {
        return privateBag.get(this);
    }
}