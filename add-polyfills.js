const concat = require('concat');

const compiledJsPath = './build/main.js';
const promiseAutoPolyfillPath = './node_modules/es6-promise/dist/es6-promise.auto.min.js';
const objectAssignPollyfillPath = './node_modules/es6-object-assign/dist/object-assign-auto.min.js';
const polyfills = [objectAssignPollyfillPath];
if (polyfills.length > 0) {
    concat(polyfills.concat([compiledJsPath]), compiledJsPath).then((res) => {
        console.log('Polyfills added to top of file');
    });
} else {
    console.log('No polyfills added.');
}
