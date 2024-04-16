import { Interface, JSTypeRegister, Schema } from '../registry.mjs';
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
fdescribe(`when creating a ${Cat.name} given a schema`, () => {
    it(`should `, () => {
        try {
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
});