const fs = require('fs');

const dir = fs.readdirSync('./');
console.log(dir);

fs.writeFileSync('./r.txt', JSON.stringify(dir, null, 2));
