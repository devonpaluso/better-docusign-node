import { readdir, readFile, writeFile, cp } from "fs/promises";
import * as shell from 'shelljs';

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

        const latestBuffer = await readFile(`./${directory}/backup/latest-package.json`, 'utf-8');
        const packageJson = JSON.parse(latestBuffer);

        const buffer = await readFile(`./${directory}/package.json`, 'utf-8');
        const patchedPackageJson = JSON.parse(buffer);

        packageJson.version = patchedPackageJson.version;
        packageJson.dependencies = patchedPackageJson.dependencies;
        packageJson.devDependencies = patchedPackageJson.devDependencies;
        packageJson.peerDependencies = patchedPackageJson.peerDependencies;

        await writeFile(`./${directory}/package.json`, JSON.stringify(packageJson, null, 2));

        //shell.exec(`yarn build`, { cwd: `./${directory}` });
        //shell.exec(`pnpm publish`, { cwd: `./${directory}` });

    }


}

run();

