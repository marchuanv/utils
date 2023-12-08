import { ContainerItem, Schema } from '../registry.mjs';
const privateBag = new WeakMap();

/**
 * @param { Object } context
 * @returns { Array<ContainerItem> }
 */
function getContainerItems(context) {
    return privateBag.get(context);
}

export class Container extends Schema {
    /**
     * @param { Array<ContainerItem> } containerItems
    */
    constructor(containerItems) {
        const targetClass = new.target;
        if (targetClass === Container.prototype) {
            throw new Error(`${Container.name} class is abstract`);
        }
        let _containerItems = Array.isArray(containerItems) ? containerItems: [containerItems];
        super(_containerItems);
        privateBag.set(this, _containerItems);
        Schema.validate(this, targetClass).catch((error) => {
            console.error(error);
        });
    }
    get ctor() {
        const containerItems = getContainerItems(this);
        return containerItems.reduce((ctor, item) => {
            ctor[item.name] = item.value;
            return ctor;
        },{ });
    }
}