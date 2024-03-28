import { TypeInfo, TypeMemberInfo } from '../registry.mjs';
describe('when creating type member info given parent type info', () => {
    it('should construct type memeber info without erro', () => {
        try {
            class Dog {
                get type() { }
            }
            const classInfo = new TypeInfo({ type: Dog });
            new TypeMemberInfo('type', new TypeInfo({ type: String }), classInfo);
        } catch (error) {
            fail('did not expect any errors');
            console.log(error);
        }
    });
    it('should raise an error if member is not found', () => {
        try {
            class Cat {
                get type() { }
            }
            const classInfo = new TypeInfo({ type: Cat });
            new TypeMemberInfo('type2', new TypeInfo({ type: String }), classInfo);
            fail('expected an error');
        } catch (error) {
            expect(error.message).toBe('type2 member not found on Cat type.');
        }
    });
});