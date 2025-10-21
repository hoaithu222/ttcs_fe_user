import fs from 'fs';
import path from 'path';
import process from 'process';

const FONT_PATH = './src/foundation/styles/font/font.json';
const OUT_PATH = './src/foundation/styles/font/generated-font.css';

const fontWeightSuffix = {
    '': 400,
    '-medium': 500,
    '-semibold': 600,
    '-bold': 700
};

const main = () => {
    const raw = fs.readFileSync(FONT_PATH, 'utf-8');
    const fontData = JSON.parse(raw);

    let css = ':root.desktop {\n';

    for (const [key, value] of Object.entries(fontData)) {
        for (const [suffix, weight] of Object.entries(fontWeightSuffix)) {
            const varName = `--text-${key}${suffix}`;
            css += `  ${varName}: ${value.fontSize}/${value.lineHeight} ${weight};\n`;
        }
    }

    css += '}\n\n';

    // Tạo utility classes
    for (const key of Object.keys(fontData)) {
        for (const [suffix] of Object.entries(fontWeightSuffix)) {
            const className = `.text-${key}${suffix}`;
            const varRef = `var(--text-${key}${suffix})`;
            css += `${className} {\n  font: ${varRef};\n}\n\n`;
        }
    }

    fs.writeFileSync(OUT_PATH, css);
    console.log('✅ Font CSS generated at', OUT_PATH);
};

main();
