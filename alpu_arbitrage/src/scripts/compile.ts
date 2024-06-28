import path from 'path';
const fs = require('fs-extra');
const solc = require('solc');

const sourceFolderPath = path.resolve(path.resolve(__dirname, "../../"), 'contracts');
const buildFolderPath = path.resolve(sourceFolderPath, 'abi');

const getContractSource = (contractFileName: string) => {
    const contractPath = path.resolve(path.resolve(__dirname, "../../"), 'contracts', contractFileName);
    return fs.readFileSync(contractPath, 'utf8');
};

let sources = {};

console.clear()
var walk = function (directory: string) {
    var results: string[] = [];
    var list = fs.readdirSync(directory);
    list.forEach(function (file: string) {
        file = directory + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.substr(file.length - 4, file.length) === ".sol") {
                sources = {
                    ...sources,
                    [file]: {
                        content: getContractSource(file)
                    }
                };
            }
            results.push(file);
        }
    });
    return results;
};
walk(sourceFolderPath);

const input = {
    language: 'Solidity',
    sources,
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
}

console.log('Compiling contracts...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));
console.log('Done\n');

let shouldBuild = true;

if (output.errors) {
    console.error(output.errors);
    // throw '\nError in compilation please check the contract\n';
    for (const error of output.errors) {
        if (error.severity === 'error') {
            shouldBuild = false;
            throw 'Error found';
        }
    }
}

if (shouldBuild) {
    console.log('Building please wait...');

    fs.removeSync(buildFolderPath);
    fs.ensureDirSync(buildFolderPath);

    for (let contractFile in output.contracts) {
        for (let key in output.contracts[contractFile]) {
            fs.outputJsonSync(
                path.resolve(buildFolderPath, `${key}.json`),
                {
                    abi: output.contracts[contractFile][key]["abi"],
                    bytecode: output.contracts[contractFile][key]["evm"]["bytecode"]["object"]
                },
                {
                    spaces: 2,
                    EOL: "\n"
                }
            );
        }
    }
    console.log('Build finished successfully!\n');
} else {
    console.log('Build failed');
}