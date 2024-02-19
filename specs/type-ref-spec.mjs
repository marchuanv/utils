import { NamespaceReference, TypeReference } from '../registry.mjs';
describe('when create a valid type reference', () => {
    let typeRef = null;
    let nsRef = null;
    beforeAll(() => {
        nsRef = new NamespaceReference('components');
        typeRef = new TypeReference(nsRef, 'ClassA');
    });
    it('should reference the components namespace', () => {
        expect(nsRef).toBeDefined();
        expect(nsRef).not.toBeNull();
        expect(nsRef.metadata).toBeDefined();
        expect(nsRef.metadata).not.toBeNull();
        expect(nsRef.metadata.namespace).toBeDefined();
        expect(nsRef.metadata.namespace).not.toBeNull();
        expect(nsRef.metadata.namespace).toBe('components');
    });
    it('should return a string representation of the type reference', () => {
        expect(typeRef).toBeDefined();
        expect(typeRef).not.toBeNull();
        expect(typeRef.metadata).toBeDefined();
        expect(typeRef.metadata).not.toBeNull();
        expect(typeRef.metadata.typeName).toBeDefined();
        expect(typeRef.metadata.typeName).not.toBeNull();
        expect(typeRef.toString()).toBe('ClassA');
    });
});

//namespace tests
describe('when creating a type reference given the namespace is null', () => {
    let error = null;
    beforeAll(() => {
        try {
            new TypeReference(null, 'ClassA');
        } catch (err) {
            console.log(err);
            error = err;
        }
    });
    it('should raise an error', () => {
        expect(error).toBeDefined();
        expect(error).not.toBeNull();
        expect(error.message).toBeDefined();
        expect(error.message).not.toBeNull();
        expect(error.message).toBe('nsRef argument is null or undefined');
    });
});
describe('when creating a type reference given the namespace is undefined', () => {
    let error = null;
    beforeAll(() => {
        try {
            new TypeReference(undefined, 'ClassA');
        } catch (err) {
            console.log(err);
            error = err;
        }
    });
    it('should raise an error', () => {
        expect(error).toBeDefined();
        expect(error).not.toBeNull();
        expect(error.message).toBeDefined();
        expect(error.message).not.toBeNull();
        expect(error.message).toBe('nsRef argument is null or undefined');
    });
});
describe(`when creating a type reference given the namespace is not of type ${NamespaceReference.name}`, () => {
    let error = null;
    beforeAll(() => {
        try {
            new TypeReference({}, 'ClassA');
        } catch (err) {
            console.log(err);
            error = err;
        }
    });
    it('should raise an error', () => {
        expect(error).toBeDefined();
        expect(error).not.toBeNull();
        expect(error.message).toBeDefined();
        expect(error.message).not.toBeNull();
        expect(error.message).toBe(`nsRef argument is not an instance of ${NamespaceReference.name}`);
    });
});

//typeName tests
describe(`when creating a type reference given the typeName is empty`, () => {
    let error = null;
    beforeAll(() => {
        try {
            new TypeReference(new NamespaceReference('components'), '');
        } catch (err) {
            console.log(err);
            error = err;
        }
    });
    it('should raise an error', () => {
        expect(error).toBeDefined();
        expect(error).not.toBeNull();
        expect(error.message).toBeDefined();
        expect(error.message).not.toBeNull();
        expect(error.message).toBe(`typeName argument is null, undefined or empty.`);
    });
});
describe(`when creating a type reference given the typeName is null`, () => {
    let error = null;
    beforeAll(() => {
        try {
            new TypeReference(new NamespaceReference('components'), null);
        } catch (err) {
            console.log(err);
            error = err;
        }
    });
    it('should raise an error', () => {
        expect(error).toBeDefined();
        expect(error).not.toBeNull();
        expect(error.message).toBeDefined();
        expect(error.message).not.toBeNull();
        expect(error.message).toBe(`typeName argument is null, undefined or empty.`);
    });
});
describe(`when creating a type reference given the typeName is undefined`, () => {
    let error = null;
    beforeAll(() => {
        try {
            new TypeReference(new NamespaceReference('components'), undefined);
        } catch (err) {
            console.log(err);
            error = err;
        }
    });
    it('should raise an error', () => {
        expect(error).toBeDefined();
        expect(error).not.toBeNull();
        expect(error.message).toBeDefined();
        expect(error.message).not.toBeNull();
        expect(error.message).toBe(`typeName argument is null, undefined or empty.`);
    });
});
describe(`when creating a type reference given the typeName is not a ${String.name}`, () => {
    let error = null;
    beforeAll(() => {
        try {
            new TypeReference(new NamespaceReference('components'), {});
        } catch (err) {
            console.log(err);
            error = err;
        }
    });
    it('should raise an error', () => {
        expect(error).toBeDefined();
        expect(error).not.toBeNull();
        expect(error.message).toBeDefined();
        expect(error.message).not.toBeNull();
        expect(error.message).toBe(`typeName argument is not a ${String.name}`);
    });
});


// if (!(nsRef instanceof NamespaceReference)) {
//     throw new Error();
// }
// if (!typeName) {
//     throw new Error('typeName argument is null or undefined')
// }
// if (typeof typeName !== 'string') {
//     throw new Error('typeName argument is not a string')
// }
// if (Reference.find({ typeName })) {
//     throw new Error(`type: ${typeName} already exist in the metadata`)
// }