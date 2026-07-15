const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}
const files = walk('./src');
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (line.includes('toast.error') || line.includes('toast.success') || line.includes('toast(') || line.includes('z.string()') || line.includes('z.object({')) {
      if (line.match(/["'][^"']*?[a-zA-Z]{3,}[^"']*?["']/)) {
        if (!line.includes('export') && !line.includes('import') && !line.includes('className') && !line.match(/toast\.error\(.*message.*\)/) && !line.match(/z\.string\(\).*(url|email|regex)/)) {
           console.log(file + ':' + (i+1) + ' ' + line.trim());
        }
      }
    }
  });
});
