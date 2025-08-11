import { readdir, readFile, writeFile, cp } from "fs/promises";

const version = process.argv[2];

let workspaceVersion = version;
const getNewVersion = (current: string) => {
    if (!workspaceVersion) workspaceVersion = current;

    const [major, minor, patch] = workspaceVersion.split('.').map((item) => parseInt(item));

    return [major, minor, patch + 1].join('.');

}

const run = async () => {

    const content = await readdir('./', { withFileTypes: true });
    const directories = content.filter((item) => item.isDirectory()).map((item) => item.name);

    for (const directory of directories) {

        await cp(`./${directory}/package.json`, `./${directory}/backup/${Date.now()}-package.json`, { recursive: true });
        await cp(`./${directory}/package.json`, `./${directory}/backup/latest-package.json`, { recursive: true, force: true });
        const buffer = await readFile(`./${directory}/package.json`, 'utf-8');
        const originalPackageJson = JSON.parse(buffer);
        const newVersion = getNewVersion(originalPackageJson.version);
        const packageJson = { ...originalPackageJson, ...originalPackageJson.publishConfig, version: newVersion };
        delete packageJson.publishConfig;

        packageJson.version = newVersion;

        for (const dependency in packageJson.dependencies) {
            if (dependency.startsWith('@echobridge')) {
                packageJson.dependencies[dependency] = newVersion;
            }
        }
        for (const dependency in packageJson.devDependencies) {
            if (dependency.startsWith('@echobridge')) {
                packageJson.devDependencies[dependency] = newVersion;
            }
        }
        for (const dependency in packageJson.peerDependencies) {
            if (dependency.startsWith('@echobridge')) {
                packageJson.peerDependencies[dependency] = newVersion;
            }
        }

        await writeFile(`./${directory}/package.json`, JSON.stringify(packageJson, null, 2));


    }


}

run();

