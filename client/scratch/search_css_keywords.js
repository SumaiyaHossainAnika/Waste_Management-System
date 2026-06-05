import fs from 'fs';

const filePath = 'c:/Users/msi/Desktop/Waste Management/client/src/index.css';
const content = fs.readFileSync(filePath, 'utf-8');

// Find any blocks with button selector
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('button') || line.includes('padding') || line.includes('Tahoma') || line.includes('close-button')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
