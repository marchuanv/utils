import {
    existsSync,
    readFileSync,
    walkDir
} from '../registry.mjs';
const privateBag = new WeakMap();
export class InterfaceRegistry {
    static load(dirFilePath) {
        if (!existsSync(dirFilePath)) {
            throw new Error(`${dirFilePath} does not exist`);
        }
        const configurations = [];
        walkDir(dirFilePath, (filePath) => {
            if (filePath.endsWith('interface.json')) {
                const configStr = readFileSync(filePath, 'utf8');
                const config = JSON.parse(configStr);
                configurations.push(config);
            }
        });
        const config = configurations.reduce((exported, config) => {
            const key = Object.keys(config)[0];
            const classConfig = config[key];
            exported[key] = classConfig;
            return exported;
        }, {});
        privateBag.set(InterfaceRegistry, config);
    }
    /**
     * @param { class } targetClass
     * @returns { Object }
    */
    static getConfig(targetClass) {
        const className = targetClass.name;
        const config = privateBag.get(InterfaceRegistry);
        return config[className];
    }
}