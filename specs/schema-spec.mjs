import { Interface, JSTypeConstraint, JSTypeRegister, Schema } from '../registry.mjs';
class Cat extends Schema {
    meow() {
        return true;
    }
    get colour() {
        return 'grey'
    }
    get name() {
        return 'pepper';
    }
};
class StringInterface extends Interface { }
class BooleanInterface extends Interface { }
class CatInterface extends Interface {
    meow() {
        return new BooleanInterface();
    }
    get colour() {
        return new StringInterface();
    }
    get name() {
        return new StringInterface();
    }
};
class CatInterfaceB extends Interface {
    meow() {
        return new BooleanInterface();
    }
    get colour() {
        return new StringInterface();
    }
    get name() {
        return new StringInterface();
    }
};
describe(`when creating a ${Cat.name} given a schema`, () => {
    it(`should validate the instance`, () => {
        try {
            new JSTypeConstraint(Cat, CatInterface);
            new JSTypeRegister(StringInterface, String, '', false)
            new JSTypeRegister(BooleanInterface, Boolean, false, false);
            new JSTypeRegister(CatInterface, Cat, null, false);
            new JSTypeRegister(Cat, CatInterface, null, false);
            const cat = new Cat();
            cat.validate();
        } catch (error) {
            console.log(error);
            fail('did not expect any errors.');
        }
    });
    it(`should raise error when a type constraint is created`, () => {
        try {
            new JSTypeConstraint(Cat, CatInterface);
            new JSTypeRegister(Cat, CatInterfaceB);
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(`constraint error, the relatedFunc argument is not of type CatInterface`);
        }
    });
});