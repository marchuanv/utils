import { ContainerReference, Schema } from '../registry.mjs';
const privateBag = new WeakMap();
export class Container extends Schema {
    /**
     * @param { Array<ContainerReference> } ctorArgs
    */
    constructor(references) {
        let _references = Array.isArray(references) ? references: [references];
        const targetClass = new.target;
        if (targetClass === Container.prototype) {
            throw new Error(`must extend the ${Container.name} class`);
        }
        super(targetClass.name, targetClass, _references);
        privateBag.set(this, _references);

        Schema.validate(this, targetClass).catch((error) => {
            console.error(error);
        });
    }
    get ctor() {
        const references = privateBag.get(this);
        return references.reduce((ctor, ref) => {
            ctor[ref.name] = ref.value;
            return ctor;
        },{ });
    }
}