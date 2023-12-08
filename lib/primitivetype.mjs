const privateBag = new WeakMap();
export class PrimitiveType {
    /**
     * @param { Object } type
     */
    constructor(type) {
        privateBag.set(this, type)
    }
    toString() {
        const type = privateBag.get(this);
        return type.name.toLowerCase();
    }
    get type() {
        return privateBag.get(this);
    }
    static get String() {
        return string;
    }
    static get Number() {
        return number;
    }
    static get Boolean() {
        return boolean;
    }
}

const string = new PrimitiveType(String);
const number = new PrimitiveType(Number);
const boolean = new PrimitiveType(Boolean);