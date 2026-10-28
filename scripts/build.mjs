import {build} from 'esbuild';
await build({entryPoints:['src/app.js'],bundle:true,format:'esm',target:['chrome100'],outfile:'dist/app.js',minify:true});
console.log('Aplicativo compilado em dist/');
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const hash=createHash('sha256').update(fs.readFileSync('dist/app.js')).update(fs.readFileSync('dist/style.css')).update(fs.readFileSync('dist/index.html')).digest('hex').slice(0,12);
const sw=fs.readFileSync('dist/sw.js','utf8').replace(/const CACHE='hnl-instrumentais-shell-[^']+'/,`const CACHE='hnl-instrumentais-shell-${hash}'`);
fs.writeFileSync('dist/sw.js',sw);
