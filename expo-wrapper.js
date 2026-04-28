const { spawn } = require('child_process');
const path = require('path');

require('ts-node/register');

const expoCli = path.resolve(__dirname, 'node_modules/expo/bin/cli');

// Use double quotes around the path to handle spaces in Windows
spawn('node', [`"${expoCli}"`, ...process.argv.slice(2)], {
    stdio: 'inherit',
    shell: true
});


