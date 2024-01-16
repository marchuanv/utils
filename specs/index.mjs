import { InterfaceRegistry, Specs, fileURLToPath, join } from '../registry.mjs';
export { ClassA } from './classes/classA.mjs';
export { ClassB } from './classes/classB.mjs';
const baseUrl = import.meta.url;
const currentDir = fileURLToPath(new URL('./', baseUrl));
InterfaceRegistry.load(join(currentDir, 'classes'));
const specs = new Specs(60000, './');
specs.run();