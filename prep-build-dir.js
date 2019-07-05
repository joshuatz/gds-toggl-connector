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

// Copy the appsscript json file from root to build, over-writing if necessary
const metaFileName = 'appsscript.json';
fsExtra.copyFileSync(metaFileName,buildDir + '/' + metaFileName);