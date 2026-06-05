import fs from 'fs';
import path from 'path';

const cssDir = 'c:/Users/msi/Desktop/Waste Management/client/dist/assets';
const files = fs.readdirSync(cssDir);
const cssFile = files.find(f => f.endsWith('.css'));

if (cssFile) {
  const content = fs.readFileSync(path.join(cssDir, cssFile), 'utf-8');
  console.log('Includes --spacing definition:', content.includes('--spacing:'));
  // Find where --spacing might be defined
  const index = content.indexOf('--spacing');
  if (index !== -1) {
    console.log('Snippet near first --spacing:', content.substring(index - 50, index + 100));
  }
}
