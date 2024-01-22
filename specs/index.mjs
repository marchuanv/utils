import { Container, Specs, fileURLToPath, join } from '../registry.mjs';
import { Animal } from './classes/animal.mjs';
import { Dog } from './classes/dog.mjs';
import { Food } from './classes/food.mjs';
const currentDir = fileURLToPath(new URL('./', import.meta.url));
Container.validate(join(currentDir, 'classes', 'animal.interface.json'), Animal).then(() => {
    Container.register(Animal);
    Container.validate(join(currentDir, 'classes', 'food.interface.json'), Food).then(() => {
        Container.register(Food);
        Container.validate(join(currentDir, 'classes', 'dog.interface.json'), Dog).then(() => {
            Container.register(Dog);
            const specs = new Specs(60000, './');
            specs.run();
        });
    });
});
export { Animal, Dog, Food };

