import { InterfaceRegistry, Specs } from '../registry.mjs';
InterfaceRegistry.load('./specs/classes');
const specs = new Specs(60000, './');
specs.run();