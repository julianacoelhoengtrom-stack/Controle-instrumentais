import fs from 'node:fs';
const res='android/app/src/main/res';
for(const dir of fs.readdirSync(res)){if(dir.startsWith('mipmap-')){for(const n of ['ic_launcher.png','ic_launcher_round.png','ic_launcher_foreground.png']){const dst=`${res}/${dir}/${n}`;if(fs.existsSync(dst))fs.copyFileSync('dist/assets/icon-512.png',dst);}}}
const adaptive=`<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/iconBackground"/><foreground android:drawable="@mipmap/ic_launcher_foreground"/></adaptive-icon>`;
for(const n of ['ic_launcher','ic_launcher_round']){const p=`${res}/mipmap-anydpi-v26/${n}.xml`;if(fs.existsSync(p))fs.writeFileSync(p,adaptive);}
fs.mkdirSync(`${res}/values`,{recursive:true});fs.writeFileSync(`${res}/values/icon-background.xml`,'<resources><color name="iconBackground">#e6f5f2</color></resources>');
for(const dir of fs.readdirSync(res)){if(dir.startsWith('drawable')&&fs.existsSync(`${res}/${dir}/splash.png`))fs.copyFileSync('dist/assets/icon-512.png',`${res}/${dir}/splash.png`);}
const manifest='android/app/src/main/AndroidManifest.xml';let s=fs.readFileSync(manifest,'utf8');if(!s.includes('android.permission.CAMERA'))s=s.replace('<application','<uses-permission android:name="android.permission.CAMERA" /><uses-feature android:name="android.hardware.camera" android:required="false" /><application');fs.writeFileSync(manifest,s);
console.log('Ícone e permissões de câmera configurados.');
