const exe = require('@angablue/exe');

const build = exe({
    entry: './index.js',
    out: './build/BONELAB BodyMall Fix.exe',
    pkg: ['-C', 'GZip'],
    productVersion: '1.0.0',
    fileVersion: '1.0.0',
    target: 'latest-win-x64',
    icon: './assets/icon.ico',
    properties: {
        FileDescription: 'BONELAB BodyMall Fix',
        ProductName: 'BONELAB BodyMall Fix',
        LegclalCopyright: 'Grafaffel',
        OriginalFilename: 'BONELAB BodyMall Fix.exe'
    }
});

build.then(() => console.log('Build completed!'));