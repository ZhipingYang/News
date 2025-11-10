import Parser from "rss-parser";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "AI-News-Collector/1.0",
  },
});

/**
 * 测试单个RSS源的可用性
 * @param {Object} source RSS源配置
 * @returns {Promise<Object>} 测试结果 {success, message, source}
 */
async function testSingleSource(source) {
  try {
    console.log(`📡 测试: ${source.name} (${source.url})`);

    const startTime = Date.now();
    const feed = await parser.parseURL(source.url);
    const duration = Date.now() - startTime;

    if (!feed.items || feed.items.length === 0) {
      console.log(`  ⚠️  警告: ${source.name} - RSS源为空`);
      return {
        success: false,
        message: "RSS源为空，无内容",
        duration,
        source,
      };
    }

    console.log(
      `  ✓ 成功: ${source.name} - ${feed.items.length}条资讯 (${duration}ms)`
    );
    return {
      success: true,
      message: `成功获取${feed.items.length}条资讯`,
      duration,
      itemCount: feed.items.length,
      source,
    };
  } catch (error) {
    console.error(`  ✗ 失败: ${source.name} - ${error.message}`);
    return {
      success: false,
      message: error.message,
      source,
    };
  }
}

/**
 * 测试所有RSS源
 * @returns {Promise<Object>} 测试报告
 */
async function testAllSources() {
  console.log("🚀 开始测试所有RSS源...\n");

  // 加载配置
  const configPath = path.join(__dirname, "../config/rss-sources.json");
  const config = JSON.parse(await fs.readFile(configPath, "utf-8"));

  const report = {
    timestamp: new Date().toISOString(),
    totalSources: 0,
    successCount: 0,
    failCount: 0,
    categories: {},
  };

  // 测试每个类目的源
  for (const [category, sources] of Object.entries(config)) {
    if (category === "settings") continue;

    console.log(`\n📂 测试类目: ${category}`);
    console.log("=".repeat(60));

    const categoryReport = {
      totalSources: sources.length,
      successCount: 0,
      failCount: 0,
      sources: [],
    };

    for (const source of sources) {
      const result = await testSingleSource(source);
      categoryReport.sources.push(result);

      if (result.success) {
        categoryReport.successCount++;
      } else {
        categoryReport.failCount++;
      }

      report.totalSources++;

      // 避免过快请求
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    report.categories[category] = categoryReport;
    report.successCount += categoryReport.successCount;
    report.failCount += categoryReport.failCount;
  }

  return report;
}

/**
 * 生成测试报告
 * @param {Object} report 测试结果
 */
function printReport(report) {
  console.log("\n" + "=".repeat(60));
  console.log("📊 RSS源测试报告");
  console.log("=".repeat(60));
  console.log(
    `测试时间: ${new Date(report.timestamp).toLocaleString("zh-CN")}`
  );
  console.log(`总源数: ${report.totalSources}`);
  console.log(
    `✓ 成功: ${report.successCount} (${(
      (report.successCount / report.totalSources) *
      100
    ).toFixed(1)}%)`
  );
  console.log(
    `✗ 失败: ${report.failCount} (${(
      (report.failCount / report.totalSources) *
      100
    ).toFixed(1)}%)`
  );

  console.log("\n📋 各类目详情:");
  for (const [category, data] of Object.entries(report.categories)) {
    console.log(`\n  ${category}:`);
    console.log(
      `    总计: ${data.totalSources} | 成功: ${data.successCount} | 失败: ${data.failCount}`
    );

    // 列出失败的源
    const failedSources = data.sources.filter((s) => !s.success);
    if (failedSources.length > 0) {
      console.log(`    失败的源:`);
      failedSources.forEach((s) => {
        console.log(`      - ${s.source.name}: ${s.message}`);
      });
    }
  }

  // 汇总所有失败的源
  console.log("\n🔴 所有失败的RSS源:");
  let hasFailures = false;
  for (const [category, data] of Object.entries(report.categories)) {
    const failedSources = data.sources.filter((s) => !s.success);
    if (failedSources.length > 0) {
      hasFailures = true;
      failedSources.forEach((s) => {
        console.log(`  [${category}] ${s.source.name}`);
        console.log(`    URL: ${s.source.url}`);
        console.log(`    原因: ${s.message}\n`);
      });
    }
  }

  if (!hasFailures) {
    console.log("  ✨ 所有RSS源都正常工作！");
  }

  console.log("\n" + "=".repeat(60));
}

/**
 * 移除失败的RSS源并更新配置文件
 * @param {Object} report 测试报告
 * @param {boolean} autoRemove 是否自动移除失败的源
 */
async function updateConfig(report, autoRemove = false) {
  if (!autoRemove) {
    console.log("\n💡 提示: 使用 --remove 参数可以自动移除失败的源");
    return;
  }

  console.log("\n🔧 正在移除失败的RSS源...");

  const configPath = path.join(__dirname, "../config/rss-sources.json");
  const config = JSON.parse(await fs.readFile(configPath, "utf-8"));

  let removedCount = 0;

  for (const [category, data] of Object.entries(report.categories)) {
    const successSources = data.sources
      .filter((s) => s.success)
      .map((s) => s.source);

    const originalCount = config[category].length;
    config[category] = successSources;
    const newCount = config[category].length;

    if (originalCount > newCount) {
      const removed = originalCount - newCount;
      console.log(`  ${category}: 移除 ${removed} 个失败的源`);
      removedCount += removed;
    }
  }

  if (removedCount > 0) {
    // 备份原配置
    const backupPath = path.join(
      __dirname,
      "../config/rss-sources.backup.json"
    );
    await fs.writeFile(
      backupPath,
      JSON.stringify(
        JSON.parse(await fs.readFile(configPath, "utf-8")),
        null,
        2
      )
    );
    console.log(`\n  💾 原配置已备份到: rss-sources.backup.json`);

    // 更新配置
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    console.log(`  ✓ 配置文件已更新，共移除 ${removedCount} 个失败的源`);
  } else {
    console.log("  ✨ 没有需要移除的源");
  }
}

/**
 * 保存测试报告
 * @param {Object} report 测试报告
 */
async function saveReport(report) {
  const reportPath = path.join(__dirname, "../data/rss-test-report.json");
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 详细报告已保存到: data/rss-test-report.json`);
}

// 主程序
async function main() {
  const args = process.argv.slice(2);
  const autoRemove = args.includes("--remove");

  try {
    const report = await testAllSources();
    printReport(report);
    await saveReport(report);
    await updateConfig(report, autoRemove);

    console.log("\n✅ RSS源测试完成！");

    // 如果有失败的源，退出码为1
    if (report.failCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ 测试过程出错:", error.message);
    process.exit(1);
  }
}

main();
