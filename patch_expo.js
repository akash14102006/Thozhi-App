const fs = require('fs');
const path = require('path');

const pkgPath = path.resolve('node_modules/expo-modules-core/package.json');
if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    // Remove exports that point to .ts
    if (pkg.exports && pkg.exports['.']) {
        pkg.exports['.'] = {
            "types": "./build/index.d.ts",
            "default": "./index.js"
        };
    }

    // Change main to index.js
    pkg.main = "index.js";

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    console.log('Patched package.json');
} else {
    console.log('Package.json not found');
}

const indexPath = path.resolve('node_modules/expo-modules-core/index.js');
fs.writeFileSync(indexPath, 'module.exports = {};');
console.log('Created dummy index.js');
