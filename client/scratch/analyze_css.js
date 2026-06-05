import fs from 'fs';
import path from 'path';

const cssDir = 'c:/Users/msi/Desktop/Waste Management/client/dist/assets';
const files = fs.readdirSync(cssDir);
const cssFile = files.find(f => f.endsWith('.css'));

if (cssFile) {
  const content = fs.readFileSync(path.join(cssDir, cssFile), 'utf-8');
  console.log('--- Analyzing compiled CSS ---');
  
  // Find w-24, w-28, w-16
  const classes = ['w-24', 'w-28', 'w-16', 'rounded-2xl', 'mx-auto', 'text-center'];
  classes.forEach(cls => {
    const escapedCls = cls.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`[^}]*\\.${escapedCls}[^{]*\\{[^}]*\\}`, 'g');
    const matches = content.match(regex) || [];
    console.log(`Compiled matches for .${cls}:`, matches.slice(0, 5));
  });
} else {
  console.log('No compiled CSS file found.');
}


