// scripts/generate-css-vars.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PATH = path.join(__dirname, '../src/foundation/styles/color/colors.json');
const OUTPUT_PATH = path.join(__dirname, '../src/foundation/styles/color/generated-colors.css');

const FILE_HEADER = `/* This file is generated. DO NOT EDIT.
 * Edit "colors.json" instead.
 */`;

const generateColorVariables = (colors) =>
    Object.entries(colors)
        .map(([key, value]) => `  --color-${key}: ${value};`)
        .join('\n');

const generateCSS = (config) => {
    return `${FILE_HEADER}

:root {
${generateColorVariables(config.light || {})}
}

.dark {
${generateColorVariables(config.dark || {})}
}
`;
};

try {
    const file = await fs.readFile(INPUT_PATH, 'utf-8');
    const colorsConfig = JSON.parse(file);
    const cssContent = generateCSS(colorsConfig);

    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await fs.writeFile(OUTPUT_PATH, cssContent);

    console.log(`✅ Successfully generated "${OUTPUT_PATH}"`);
} catch (error) {
    console.error(`❌ Failed to generate "${OUTPUT_PATH}":`, error);
}
