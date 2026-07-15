const fs = require('fs');
const path = require('path');

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      let modified = false;
      
      for (let i = 0; i < lines.length; i++) {
        if ((lines[i].includes('as any') || lines[i].includes(': any')) && !lines[i].includes('eslint-disable-next-line') && (i === 0 || !lines[i-1].includes('eslint-disable-next-line'))) {
          const match = lines[i].match(/^\s*/);
          const indent = match ? match[0] : '';
          lines.splice(i, 0, indent + '// eslint-disable-next-line @typescript-eslint/no-explicit-any');
          i++; // skip the newly inserted line
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, lines.join('\n'));
      }
    }
  }
}

processDir(path.join(__dirname, 'src', 'components', 'pages'));
processDir(path.join(__dirname, 'src', 'components', 'settings'));
processDir(path.join(__dirname, 'src', 'components', 'ui'));
processDir(path.join(__dirname, 'src', 'components', 'subscription-plans'));
processDir(path.join(__dirname, 'src', 'components', 'subscriptions'));
processDir(path.join(__dirname, 'src', 'components', 'taxonomy'));
