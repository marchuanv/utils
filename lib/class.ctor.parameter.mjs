const privateBag = new WeakMap();
export class ClassCtorParameter {
    constructor(name, type) {
        privateBag.set(this, { name, type });
    }
    get name() {
        const { name } = privateBag.get(this);
        return name;
    }
    get type() {
        const { type } = privateBag.get(this);
        return type;
    }
}