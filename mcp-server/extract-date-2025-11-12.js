import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const data = JSON.parse(await fs.readFile('data/processed-rss-2025-11-12.json', 'utf-8'));
  const date20251112 = data.byDate['2025-11-12'] || [];
  const result = {};
  
  date20251112.forEach(item => {
    const category = item.category || 'ai-programming';
    if (!result[category]) {
      result[category] = [];
    }
    result[category].push(item);
  });
  
  await fs.writeFile('data/processed-rss-2025-11-12-extracted.json', JSON.stringify(result, null, 2));
  console.log('提取完成，共', date20251112.length, '条');
  Object.keys(result).forEach(cat => console.log('  ', cat + ':', result[cat].length, '条'));
}

main().catch(console.error);

