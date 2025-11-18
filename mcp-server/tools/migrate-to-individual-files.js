#!/usr/bin/env node

/**
 * 数据迁移脚本
 *
 * 将类别文件 (ai-programming.md, ai-products.md, tech-general.md)
 * 重命名为独立新闻文件 (news-001-[slug].md, news-002-[slug].md, ...)
 *
 * 执行: node migrate-to-individual-files.js
 */

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 类别映射
const CATEGORY_MAP = {
  "ai-programming": { name: "AI编程", order: 1 },
  "ai-products": { name: "AI产品", order: 2 },
  "tech-general": { name: "科技综合", order: 3 },
};

/**
 * 生成 slug
 */
function generateSlug(title) {
  // 使用标题的哈希值作为唯一标识
  const hash = crypto
    .createHash("md5")
    .update(title)
    .digest("hex")
    .substring(0, 8);

  // 提取英文和数字作为可读部分
  const readablePart = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 30);

  return readablePart ? `${readablePart}-${hash}` : hash;
}

/**
 * 从 markdown 内容提取标题
 */
function extractTitle(content) {
  // 匹配 ## emoji 标题格式
  const titleMatch = content.match(/^##\s+\S+\s+(.+?)$/m);
  if (titleMatch) {
    // 提取标题，移除可能的副标题部分（冒号后的内容）
    const fullTitle = titleMatch[1].trim();
    // 如果标题太长，取冒号前的部分
    const colonIndex = fullTitle.indexOf("：");
    if (colonIndex > 0 && colonIndex < 50) {
      return fullTitle.substring(0, colonIndex);
    }
    return fullTitle;
  }
  return null;
}

/**
 * 检查文件是否有效（不为空）
 */
async function isValidFile(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const trimmed = content.trim();
    // 检查内容长度和是否包含标题
    return trimmed.length > 100 && trimmed.includes("##");
  } catch (error) {
    return false;
  }
}

/**
 * 迁移单个日期文件夹
 */
async function migrateDateFolder(dateFolder, newsMarkdownDir, dryRun = false) {
  const folderPath = path.join(newsMarkdownDir, dateFolder);

  console.log(`\n📁 处理文件夹: ${dateFolder}`);

  // 收集所有有效的类别文件
  const categoryFiles = [];

  for (const [categoryId, categoryInfo] of Object.entries(CATEGORY_MAP)) {
    const filename = `${categoryId}.md`;
    const filePath = path.join(folderPath, filename);

    if (await isValidFile(filePath)) {
      const content = await fs.readFile(filePath, "utf-8");
      const title = extractTitle(content);

      if (title) {
        categoryFiles.push({
          categoryId,
          categoryName: categoryInfo.name,
          order: categoryInfo.order,
          oldPath: filePath,
          oldFilename: filename,
          content,
          title,
        });
        console.log(
          `   ✓ 找到有效文件: ${filename} - ${title.substring(0, 40)}...`
        );
      } else {
        console.log(`   ⚠️ 跳过无标题文件: ${filename}`);
      }
    } else {
      console.log(`   - 跳过空文件或不存在: ${categoryId}.md`);
    }
  }

  if (categoryFiles.length === 0) {
    console.log(`   ⏭️ 该文件夹无有效文件，跳过`);
    return { migrated: 0, skipped: 0 };
  }

  // 按顺序排序（ai-programming, ai-products, tech-general）
  categoryFiles.sort((a, b) => a.order - b.order);

  // 重命名文件
  let migratedCount = 0;
  for (let i = 0; i < categoryFiles.length; i++) {
    const file = categoryFiles[i];
    const index = String(i + 1).padStart(3, "0");
    const slug = generateSlug(file.title);
    const newFilename = `news-${index}-${slug}.md`;
    const newPath = path.join(folderPath, newFilename);

    if (dryRun) {
      console.log(`   [DRY RUN] ${file.oldFilename} → ${newFilename}`);
    } else {
      // 重命名文件
      await fs.rename(file.oldPath, newPath);
      console.log(`   ✅ ${file.oldFilename} → ${newFilename}`);
      migratedCount++;
    }
  }

  return { migrated: migratedCount, skipped: 3 - categoryFiles.length };
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  console.log("🚀 数据迁移脚本");
  console.log("=".repeat(60));

  if (dryRun) {
    console.log("⚠️ DRY RUN 模式 - 不会实际修改文件\n");
  } else {
    console.log("⚠️ 将修改文件系统，请确认备份\n");
  }

  const newsMarkdownDir = path.join(__dirname, "..", "..", "news_markdown");

  // 读取所有日期文件夹
  const entries = await fs.readdir(newsMarkdownDir, { withFileTypes: true });
  const dateFolders = entries
    .filter(
      (entry) => entry.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(entry.name)
    )
    .map((entry) => entry.name)
    .sort();

  console.log(`📋 找到 ${dateFolders.length} 个日期文件夹\n`);

  let totalMigrated = 0;
  let totalSkipped = 0;

  for (const dateFolder of dateFolders) {
    const { migrated, skipped } = await migrateDateFolder(
      dateFolder,
      newsMarkdownDir,
      dryRun
    );
    totalMigrated += migrated;
    totalSkipped += skipped;
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 迁移总结:");
  console.log(`   - 成功迁移: ${totalMigrated} 个文件`);
  console.log(`   - 跳过: ${totalSkipped} 个文件（空或不存在）`);

  if (dryRun) {
    console.log("\n💡 提示: 移除 --dry-run 参数以实际执行迁移");
  } else {
    console.log("\n✨ 迁移完成！");
    console.log("\n📝 下一步: 重新生成 HTML");
    console.log("   npm run build");
  }
}

main().catch(console.error);
