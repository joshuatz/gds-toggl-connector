const concat = require('concat');
const fsExtra = require('fs-extra');
const replace = require('replace-in-file');
const packageInfo = require('./package.json');

/**
 * Settings
 */
const srcDir = './src';
const intermediateDir = './intermediate';
const intermediateFinalDir = intermediateDir + '-final';
const buildDir = './build';

// Empty intermediate directory, and create it if not exist
fsExtra.emptyDirSync(intermediateDir);
fsExtra.emptyDirSync(intermediateFinalDir);

// Copy all files from src to intermediate
fsExtra.copySync(srcDir, intermediateDir);

// Iterate through all ts files and remove all import statements, etc.
fsExtra.readdir(intermediateDir, (err, files) => {
    console.log('Intermediate files: ' + JSON.stringify(files));
    files.forEach((file, index) => {
        // Remove imports
        try {
            // Remove imports at top of files
            replace.sync({
                files: intermediateDir + '/' + file,
                from: /^import\s{0,2}[^\r\n]+;{0,1}$/gim,
                to: ''
            });
            // Remove export statements - brace blocks
            replace.sync({
                files: intermediateDir + '/' + file,
                from: /^\s*export\s*{[^{]*}/gim,
                to: ''
            });
            // Remove export statements - single line
            replace.sync({
                files: intermediateDir + '/' + file,
                from: /^\s*export\s*/gim,
                to: ''
            });
        } catch (e) {
            console.error('Error in replacer: ', error);
        }
    });
});

// Concat files in the right order, to final_output.ts
const intermediateFileOrder = packageInfo.fileOrder.map((filename) => intermediateDir + '/' + filename);
concat(intermediateFileOrder, intermediateFinalDir + '/final_output.ts').then((res) => {
    // Intermediate can be deleted, since final output should now be in intermediate final dir
    fsExtra.removeSync(intermediateDir);
    console.log('TS prep is done!');
});
