const fs = require('fs');
const path = require('path');

const directories = ['app', 'components', 'context', 'hooks'];
const root = path.join(__dirname, 'frontend-user');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const regex = /const\s+API_URL\s*=\s*process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*['"][^'"]+['"];?/g;
            
            if (regex.test(content)) {
                content = content.replace(regex, '');
                // add import if not there
                if (!content.includes('import { API_URL }')) {
                    // find last import or put at top
                    if (content.includes('from "')) {
                        content = content.replace(/^(import.*(;|\n))/m, '$1import { API_URL } from "@/lib/api";\n');
                    } else {
                        content = 'import { API_URL } from "@/lib/api";\n' + content;
                    }
                }
                fs.writeFileSync(fullPath, content);
                console.log('Fixed', fullPath);
            }
        }
    }
}

for (const d of directories) {
    processDir(path.join(root, d));
}
