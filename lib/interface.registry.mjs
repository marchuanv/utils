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
        let config = configurations.reduce((exported, config) => {
            const key = Object.keys(config)[0];
            const classConfig = config[key];
            if (classConfig.extend && classConfig.extend.Id) {
                const found = configurations.find(otherConfig => {
                    const otherKey = Object.keys(otherConfig)[0];
                    const otherClassConfig = otherConfig[otherKey];
                    return otherKey !== key && otherClassConfig.Id === classConfig.extend.Id
                });
                const otherKey = Object.keys(found)[0];
                classConfig.extend = found[otherKey];
            }
            exported[key] = classConfig;
            return exported;
        }, {});
        if (privateBag.has(InterfaceRegistry)) {
            const _config = privateBag.get(InterfaceRegistry);
            for (const key of Object.keys(config)) {
                _config[key] = config[key];
            }
        } else {
            privateBag.set(InterfaceRegistry, config);
        }
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