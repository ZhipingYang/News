import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { ProcessNewsTool } from "./process-news.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log("使用方法: node process-fetch-for-date.js <rss-fetch-file> <YYYY-MM-DD>");
    process.exit(1);
  }

  const rssFile = args[0];
  const targetDate = args[1];

  try {
    console.log(`📖 读取抓取结果: ${rssFile}`);
    const raw = JSON.parse(await fs.readFile(rssFile, "utf-8"));

    const processed = {};
    let total = 0;

    // 过滤出目标日期的条目并按类目归类
    for (const [category, items] of Object.entries(raw)) {
      if (category === "metadata" || !Array.isArray(items)) {
        processed[category] = items;
        continue;
      }

      const filtered = items.filter((it) => {
        if (!it.pubDate) return false;
        const d = new Date(it.pubDate).toISOString().split("T")[0];
        return d === targetDate;
      });

      processed[category] = filtered;
      total += filtered.length;
    }

    // 保存处理后的 JSON 到 data 目录
    const outDir = path.join(__dirname, "../data");
    await fs.mkdir(outDir, { recursive: true });
    const outPath = path.join(outDir, `processed-rss-${targetDate}.json`);
    await fs.writeFile(outPath, JSON.stringify(processed, null, 2), "utf-8");
    console.log(`💾 已保存处理结果到：${outPath} （共 ${total} 条，按类目分组）`);

    if (total === 0) {
      console.log("⚠️ 在抓取结果中未找到目标日期的任何资讯，结束。");
      process.exit(0);
    }

    // 逐条调用 ProcessNewsTool 生成 markdown
    const processor = new ProcessNewsTool();
    let generatedCount = 0;
    for (const [category, items] of Object.entries(processed)) {
      if (!Array.isArray(items)) continue;
      for (const item of items) {
        const content = item.description || item.content || "";
        const source = item.link || item.sourceUrl || item.source || "";
        const title = item.title || "无标题";

        console.log(`\n🔧 处理：${title}`);
        const res = await processor.execute({
          content,
          source,
          publishDate: targetDate,
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

    console.log(`\n✨ 处理完成：共 ${total} 条中，生成 ${generatedCount} 个 Markdown 条目`);
  } catch (error) {
    console.error("❌ 处理过程出错：", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}


