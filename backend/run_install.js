const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'npm_install_log.txt');

function log(msg) {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
    console.log(msg);
}

log('Starting npm install in frontend...');

const child = exec('npm install --legacy-peer-deps', {
    cwd: path.join(__dirname, '..', 'frontend')
});

child.stdout.on('data', (data) => {
    log(`STDOUT: ${data}`);
});

child.stderr.on('data', (data) => {
    log(`STDERR: ${data}`);
});

child.on('close', (code) => {
    log(`Process exited with code ${code}`);
});
