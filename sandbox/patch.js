const {readFile, writeFile} = require('fs/promises');

const version = process.argv[2];

if (!version) {
    console.log('Pass in a version. Use `npm info @echobridge/core` to get the latest version');
    return;
}

const run = async () => {


    const backendBuffer = await readFile(`./packages/backend/package.json`, 'utf-8');
    const backendPackageJson = JSON.parse(backendBuffer);

    const frontendBuffer = await readFile(`./packages/app/package.json`, 'utf-8');
    const frontendPackageJson = JSON.parse(frontendBuffer);


    console.log();
    for (const packageJson of [backendPackageJson, frontendPackageJson]) {

        for (const dependency in packageJson.dependencies) {
            if (dependency.startsWith('@echobridge')) {
                console.log(`${dependency}`.padEnd(22, ' ') + `@${packageJson.dependencies[dependency]}`.padEnd(10, '-') + '>' + `@${version}`);
                packageJson.dependencies[dependency] = version;
            }
        }

    }
    console.log();


    await writeFile(`./packages/backend/package.json`, JSON.stringify(backendPackageJson, null, 2));
    await writeFile(`./packages/app/package.json`, JSON.stringify(frontendPackageJson, null, 2));

}

run();

