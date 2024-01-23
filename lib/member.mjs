import { GUID, MemberParameter, TypeDefinition } from "../registry.mjs";
export class Member {
    /**
     * @param { String } name
     * @param { Boolean } isClass
     * @param { Boolean } isProperty
     * @param { Boolean } isMethod
     * @param { Boolean } isStatic
     * @param { Boolean } isCtor
     * @param { Boolean } isGetter
     * @param { Boolean } isSetter
     * @param { TypeDefinition } typeDefinition
     * @param { Array<MemberParameter> } parameters
     * @returns { Member }
    */
    update(name, isClass, isProperty, isMethod, isStatic, isCtor, isGetter, isSetter, typeDefinition, parameters) {
        this._Id = new GUID();
        this._name = name;
        this._children = [];
        this._index = -1;
        this._isClass = isClass;
        this._isProperty = isProperty;
        this._isMethod = isMethod;
        this._isStatic = isStatic;
        this._parameters = parameters;
        this._isCtor = isCtor;
        this._isGetter = isGetter;
        this._isSetter = isSetter;
        this._typeDefinition = typeDefinition;
    }
    /**
     * @returns { String }
     */
    get name() {
        return this._name;
    }
    /**
     * @returns { Boolean }
    */
    get next() {
        if (this._children.length > 0) {
            this._index = this._index + 1;
            const _child = this._children[this._index];
            if (_child) {
                return true
            }
        }
        return false;
    }
    /**
     * @param { String } name
     * @param { Boolean } isClass
     * @param { Boolean } isProperty
     * @param { Boolean } isMethod
     * @param { Boolean } isCtor
     * @param { Boolean } isStatic
     * @returns { Member }
    */
    find(name, isClass, isProperty, isMethod, isCtor, isStatic) {
        this.reset();
        while (this.next) {
            if (this.child.name === name) {
                if (isStatic) {
                    if (this.child.isStatic) {
                        if (this.child.isClass && isClass) {
                            return this.child;
                        }
                        if (this.child.isProperty && isProperty) {
                            return this.child;
                        }
                        if (this.child.isCtor && isCtor) {
                            if (this.child.isMethod) {
                                return this.child;
                            }
                        }
                        if (this.child.isMethod && isMethod) {
                            if (!this.child.isCtor) {
                                return this.child;
                            }
                        }
                    }
                } else {
                    if (!this.child.isStatic) {
                        if (this.child.isClass && isClass) {
                            return this.child;
                        }
                        if (this.child.isProperty && isProperty) {
                            return this.child;
                        }
                        if (this.child.isCtor && isCtor) {
                            if (this.child.isMethod) {
                                return this.child;
                            }
                        }
                        if (this.child.isMethod && isMethod) {
                            if (!this.child.isCtor) {
                                return this.child;
                            }
                        }
                    }
                }
            }
        }
        this.reset();
    }
    /**
     * @param { { name: String, isClass: Boolean, isProperty: Boolean, isMethod: Boolean, isCtor: Boolean, isStatic: Boolean, isGetter: Boolean, isSetter: Boolean } } criteria
     * @returns { Array<Member> }
    */
    findAll(criteria = {
        name: '',
        isClass: false,
        isProperty: false,
        isMethod: false,
        isCtor: false,
        isStatic: false,
        isGetter: false,
        isSetter: false
    }) {
        const found = [];
        let { name, isClass, isProperty, isMethod, isCtor, isStatic, isGetter, isSetter } = criteria;

        if (isGetter || isSetter) {
            isProperty = true;
        }

        if (isCtor) {
            isMethod = true;
        }

        const memberNames = [];
        if (name) {
            memberNames.push(name);
        } else {
            this.reset();
            while (this.next) {
                memberNames.push(this.child.name);
            }
        }
        this.reset();
        while (this.next) {
            if (memberNames.find(mName => mName === this.child.name) && !found.find(f => f.Id === this.child.Id)) {
                if (isStatic) {
                    if (this.child.isStatic) {
                        if (this.child.isClass && isClass) {
                            found.push(this.child);
                        } else if (this.child.isProperty && isProperty) {
                            if (this.child.isGetter && isGetter) {
                                found.push(this.child);
                            }
                            if (this.child.isSetter && isSetter) {
                                found.push(this.child);
                            }
                        } else if (this.child.isCtor) {
                            if (this.child.isMethod && isCtor) {
                                found.push(this.child);
                            }
                        } else if (this.child.isMethod) {
                            if (!this.child.isCtor && isMethod) {
                                found.push(this.child);
                            }
                        }
                    }
                } else {
                    if (!this.child.isStatic) {
                        if (this.child.isClass && isClass) {
                            found.push(this.child);
                        } else if (this.child.isProperty && isProperty) {
                            if (this.child.isGetter && isGetter) {
                                found.push(this.child);
                            }
                            if (this.child.isSetter && isSetter) {
                                found.push(this.child);
                            }
                        } else if (this.child.isCtor && isCtor) {
                            if (this.child.isMethod) {
                                found.push(this.child);
                            }
                        } else if (this.child.isMethod && isMethod) {
                            if (!this.child.isCtor && !isCtor) {
                                found.push(this.child);
                            }
                        }
                    }
                }
            }
        }
        this.reset();
        return found;
    }
    reset() {
        this._index = -1;
    }
    /**
     * @returns { Member }
    */
    get child() {
        return this._children[this._index];
    }
    /**
     * @param { Member } value
    */
    set child(value) {
        this._children.push(value);
    }
    /**
     * @returns { TypeDefinition }
    */
    get typeDefinition() {
        return this._typeDefinition;
    }
    /**
     * @returns { Boolean }
    */
    get isClass() {
        return this._isClass;
    }
    /**
     * @returns { Boolean }
    */
    get isProperty() {
        return this._isProperty;
    }
    /**
     * @returns { Boolean }
    */
    get isMethod() {
        return this._isMethod;
    }
    /**
     * @returns { Boolean }
    */
    get isStatic() {
        return this._isStatic;
    }
    /**
     * @returns { Boolean }
    */
    get isCtor() {
        return this._isCtor;
    }
    /**
     * @returns { GUID }
    */
    get Id() {
        return this._Id;
    }
    /**
     * @returns { Array<MemberParameter> }
    */
    get parameters() {
        return this._parameters;
    }
    /**
     * @returns { Boolean }
    */
    get isGetter() {
        return this._isGetter;
    }
    /**
     * @returns { Boolean }
    */
    get isSetter() {
        return this._isSetter;
    }
}