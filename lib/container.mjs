import { ContainerReference, Schema } from '../registry.mjs';
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
    }
}