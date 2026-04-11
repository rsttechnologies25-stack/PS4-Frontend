const fs = require('fs');
const content = fs.readFileSync('c:/Users/Admin/.gemini/antigravity/scratch/ps4-platform/ps4_mobile/lib/screens/product_details_screen.dart', 'utf8');
const lines = content.split('\n');

let balance = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let char of line) {
        if (char === '{') balance++;
        if (char === '}') balance--;
    }
    if (balance < 0) {
        console.log(`Balance dipped below 0 at line ${i + 1}`);
        balance = 0; 
    }
}
console.log(`Final balance: ${balance}`);
