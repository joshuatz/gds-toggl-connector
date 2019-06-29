const concat = require('concat');

const compiledJsPath = './build/main.js';
const promiseAutoPolyfillPath = './node_modules/es6-promise/dist/es6-promise.auto.min.js';
const polyfills = [promiseAutoPolyfillPath];
concat(polyfills.concat([compiledJsPath]),compiledJsPath).then((res)=>{
    console.log('Polyfills added to top of file');
});