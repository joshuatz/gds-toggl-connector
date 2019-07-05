const fsExtra = require('fs-extra');

const buildDir = './build';

// delete all .js files in /build
let fileList = fsExtra.readdirSync(buildDir);
for (let x=0; x<fileList.length; x++){
    let filename = fileList[x];
    if (/\.js$/.test(filename)){
        fsExtra.removeSync(buildDir + '/' + filename);
    }
}

// Copy the appsscript json file from root to build, but don't overwrite in case there is already a diff GAS ID there for testing
const metaFileName = 'appsscript.json';
if (!fsExtra.existsSync(buildDir + '/' + metaFileName)){
    fsExtra.copyFileSync(metaFileName,buildDir + '/' + metaFileName,fsExtra.constants.COPYFILE_EXCL);
}
else {
    console.warn('appsscript.json was not copied from root to build. Already exists in build.');
}