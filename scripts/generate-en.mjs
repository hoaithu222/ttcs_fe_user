import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const viDir = path.resolve('src/i18n/locales/vi');
const enDir = path.resolve('src/i18n/locales/en');

async function translateText(text) {
    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: 'Translate the following Vietnamese text to English.' },
            { role: 'user', content: text },
        ],
    });

    return completion.choices[0].message.content.trim();
}

async function translateJsonFile(viFilePath, enFilePath) {
    const content = await fs.readFile(viFilePath, 'utf-8');
    const viJson = JSON.parse(content);

    const translatedJson = {};

    for (const [key, value] of Object.entries(viJson)) {
        const translated = await translateText(value);
        translatedJson[key] = translated;
        console.log(`🔁 ${key}: ${value} → ${translated}`);
    }

    await fs.mkdir(path.dirname(enFilePath), { recursive: true });
    await fs.writeFile(enFilePath, JSON.stringify(translatedJson, null, 2), 'utf-8');
    console.log(`✅ Translated file written: ${enFilePath}`);
}

async function run() {
    try {
        const files = await fs.readdir(viDir);
        for (const file of files) {
            if (file.endsWith('.json')) {
                const viFilePath = path.join(viDir, file);
                const enFilePath = path.join(enDir, file);
                await translateJsonFile(viFilePath, enFilePath);
            }
        }
        console.log('🎉 All files translated!');
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

run();
