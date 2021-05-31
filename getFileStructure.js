const fs = require('fs');

function getDir(path) {
    let dir = {};
    let dirFiles = fs.readdirSync(path);
    for (let file of dirFiles) {
        if (file.includes('.')) {
            dir[file.slice(0, file.indexOf('.'))] = file.slice(file.indexOf('.')+1);
        } else {
            dir[file] = getDir(`${path}/${file}`);
        }
    }
    return dir;
}

fs.writeFileSync('src/public.json', JSON.stringify(getDir('public'), null, 4));