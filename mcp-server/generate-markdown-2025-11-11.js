import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProcessNewsTool } from './tools/process-news.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const data = JSON.parse(await fs.readFile('data/processed-rss-2025-11-11.json', 'utf-8'));
  const processor = new ProcessNewsTool();
  let generatedCount = 0;
  
  for (const [category, items] of Object.entries(data)) {
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      const content = item.description || item.content || "";
      const source = item.link || item.sourceUrl || item.source || "";
      const title = item.title || "无标题";
      
      console.log(`\n🔧 处理：${title}`);
      const res = await processor.execute({
        content,
        source,
        publishDate: '2025-11-11',
        title,
        forceGenerate: false,
      });
      
      if (res.success) {
        generatedCount++;
        console.log(`  ✅ 已生成：${res.filePath}`);
      } else if (res.skipped) {
        console.log(`  ⏭️ 已跳过（理由：${res.reason || "低评分"}）`);
      } else {
        console.error(`  ❌ 处理失败：${res.error}`);
      }
    }
  }
  
  console.log(`\n✨ 处理完成：共生成 ${generatedCount} 个 Markdown 条目`);
}

main().catch(console.error);

