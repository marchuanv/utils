
import { basename, existsSync, readFileSync, resolve, walkDir } from '../registry.mjs';
const _rootDirPath = process.cwd();
export class Import {
    async imp(filePath, options = { assert: { type: 'default' } }) {
        const { assert: { type } } = options;
        const resolvedPath = await resolveFilePath(filePath);
        if (type.toLowerCase() === 'json' && filePath.endsWith('.json')) {
            const jsonStr = readFileSync(resolvedPath, 'utf8');
            return JSON.parse(jsonStr);
        } else {
            const test = pathToFileURL(resolvedPath);
            return await import(test);
        }
    }
    async resolveFilePath(filePath) {
        let resolvedPath = resolve(filePath);
        if (existsSync(resolvedPath)) {
            return resolvedPath;
        } else {
            let fileName = basename(resolvedPath);
            const foundFilePaths = [];
            await walkDir(_rootDirPath, (filePath) => {
                if (filePath.endsWith(fileName)) {
                    foundFilePaths.push(filePath);
                }
            });
            if (foundFilePaths.length === 1) {
                return foundFilePaths[0]
            } else {
                throw new Error(`${filePath} not found`);
            }
        }
    }
}
