const fs = require('fs');
const path = 'app/dashboard/admin/content/page.tsx';
let content = fs.readFileSync(path, 'utf8');
// Replace the broken "Sans <any char>tablissement" with the correct version
content = content.replace(/Sans .tablissement/g, 'Sans établissement');
fs.writeFileSync(path, content, 'utf8');
console.log('Done – fixed broken établissement encoding');
