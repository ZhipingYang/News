import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { marked } from "marked";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 静态网站生成器
 * 将 markdown 文件转换为 HTML 并生成完整的静态网站
 */
export class StaticSiteGenerator {
  constructor() {
    this.baseDir = path.join(__dirname, "..");
    this.newsMarkdownDir = path.join(this.baseDir, "news_markdown");
    this.docsDir = path.join(this.baseDir, "docs");
    this.templatesDir = path.join(__dirname, "templates");

    this.categoryMap = {
      "ai-programming": { name: "AI编程", icon: "💻", color: "#4F46E5" },
      "ai-products": { name: "AI产品", icon: "🚀", color: "#DC2626" },
      "tech-general": { name: "科技综合", icon: "🌐", color: "#059669" },
    };

    // 配置 marked
    marked.setOptions({
      gfm: true,
      breaks: true,
      headerIds: true,
      mangle: false,
    });
  }

  /**
   * 获取所有日期文件夹
   */
  async getDateFolders() {
    const entries = await fs.readdir(this.newsMarkdownDir, {
      withFileTypes: true,
    });
    const dateFolders = entries
      .filter(
        (entry) => entry.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(entry.name)
      )
      .map((entry) => entry.name)
      .sort()
      .reverse(); // 最新的在前
    return dateFolders;
  }

  /**
   * 读取日期文件夹中的所有资讯文件
   */
  async readDateFolder(dateFolder) {
    const folderPath = path.join(this.newsMarkdownDir, dateFolder);
    const newsItems = [];

    try {
      // 读取所有 news-*.md 文件
      const files = await fs.readdir(folderPath);
      const newsFiles = files.filter(
        (f) => f.startsWith("news-") && f.endsWith(".md")
      );

      for (const filename of newsFiles) {
        const filePath = path.join(folderPath, filename);

        try {
          const content = await fs.readFile(filePath, "utf-8");
          // 解析独立新闻文件
          const items = this.parseMarkdownFile(content, dateFolder, filename);
          newsItems.push(...items);
        } catch (error) {
          console.warn(`⚠️  读取文件失败: ${filename}`, error.message);
        }
      }
    } catch (error) {
      console.warn(`⚠️  读取文件夹失败: ${dateFolder}`, error.message);
    }

    return newsItems;
  }

  /**
   * 解析 markdown 文件，每个文件作为一篇独立新闻
   */
  parseMarkdownFile(content, date, filename) {
    const items = [];

    // 检查内容是否为空或太短
    if (content.trim().length < 100) return items;

    // 提取分类标签（支持中英文冒号）
    const categoryMatch = content.match(
      /\*\*分类[：:]?\*\*\s+(AI编程|AI产品|科技综合)/
    );
    let category = null;
    let categoryInfo = null;

    if (categoryMatch) {
      const categoryName = categoryMatch[1];
      // 根据名称找到对应的category key
      for (const [key, info] of Object.entries(this.categoryMap)) {
        if (info.name === categoryName) {
          category = key;
          categoryInfo = info;
          break;
        }
      }
    }

    // 如果没有找到分类，尝试从文件名推断（兼容旧格式）
    if (!category) {
      if (
        filename.includes("ai-programming") ||
        filename.includes("programming")
      ) {
        category = "ai-programming";
        categoryInfo = this.categoryMap["ai-programming"];
      } else if (
        filename.includes("ai-products") ||
        filename.includes("products")
      ) {
        category = "ai-products";
        categoryInfo = this.categoryMap["ai-products"];
      } else if (
        filename.includes("tech-general") ||
        filename.includes("general")
      ) {
        category = "tech-general";
        categoryInfo = this.categoryMap["tech-general"];
      } else {
        // 默认分类
        category = "tech-general";
        categoryInfo = this.categoryMap["tech-general"];
      }
    }

    // 提取标题（支持任何emoji，提取emoji之后的文本）
    // 使用 ## 而不是 # 来匹配实际的新闻标题
    const titleMatch = content.match(/^##\s+\S+\s+(.+?)$/m);
    const title = titleMatch
      ? titleMatch[1].trim()
      : categoryInfo?.name || "未命名资讯";

    // 提取发布日期（支持中英文冒号）
    const dateMatch = content.match(
      /\*\*发布日期[：:]?\*\*\s+(\d{4}-\d{2}-\d{2})/
    );
    const publishDate = dateMatch ? dateMatch[1] : date;

    // 提取来源（支持中英文冒号）
    const sourceMatch = content.match(
      /\*\*来源[：:]?\*\*\s+\[(.*?)\]\((.*?)\)/
    );
    const source = sourceMatch
      ? { name: sourceMatch[1], url: sourceMatch[2] }
      : { name: "综合多源", url: null };

    // 提取可信度评分（支持中英文冒号）
    const scoreMatch = content.match(/\*\*可信度评分[：:]?\*\*\s+(⭐+)/);
    const stars = scoreMatch ? scoreMatch[1].length : 5;

    // 提取标签（如果有的话，支持中英文冒号）
    const tagsMatch = content.match(/\*\*标签[：:]?\*\*\s+(.*?)$/m);
    const tags = tagsMatch
      ? tagsMatch[1].split(/\s+/).filter((t) => t.startsWith("#"))
      : [];

    // 生成摘要：优先提取"执行摘要"中的"战略问题"，否则提取"新闻背景"
    const contentLines = content.split("\n");
    let summary = "";

    // 方案1：尝试提取"执行摘要"中的"战略问题"
    let foundExecutiveSummary = false;
    let foundStrategicQuestion = false;
    for (let i = 0; i < contentLines.length; i++) {
      const line = contentLines[i];

      if (line.includes("## 执行摘要")) {
        foundExecutiveSummary = true;
        continue;
      }

      if (foundExecutiveSummary && line.includes("**战略问题**")) {
        foundStrategicQuestion = true;

        // 情况1：冒号后直接有内容 (如：**战略问题**：在AI大模型...)
        const colonIndex = line.indexOf("：");
        if (colonIndex !== -1 && line.substring(colonIndex + 1).trim()) {
          summary = line.substring(colonIndex + 1).trim() + " ";
        }
        continue;
      }

      // 情况2：战略问题后分多行
      if (foundStrategicQuestion) {
        // 跳过空行
        if (line.trim() === "") {
          continue;
        }
        // 遇到下一个标记（如 **关键数据指标**）时停止
        if (line.startsWith("**") && !line.includes("战略问题")) {
          break;
        }
        // 遇到新的标题时停止
        if (line.startsWith("#")) {
          break;
        }
        // 提取内容
        summary += line.trim() + " ";
        if (summary.length > 200) break;
      }
    }

    // 截断并添加省略号
    summary = summary.trim();
    if (summary.length > 200) {
      summary = summary.substring(0, 200) + "...";
    }

    // 如果仍然没有找到摘要，使用分类名称作为默认
    if (!summary) {
      summary = `${this.categoryMap[category]?.name}相关深度分析`;
    }

    items.push({
      title,
      category,
      categoryInfo: categoryInfo,
      publishDate,
      collectionDate: date,
      source,
      stars,
      tags,
      summary,
      content: content,
      slug: this.generateSlug(title, date),
    });

    return items;
  }

  /**
   * 生成 URL slug（支持中文标题）
   */
  generateSlug(title, date) {
    // 使用标题的哈希值作为唯一标识，避免中文URL和slug冲突问题
    const hash = crypto
      .createHash("md5")
      .update(title)
      .digest("hex")
      .substring(0, 8);

    // 尝试提取英文和数字作为可读部分
    const readablePart = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // 只保留英文、数字、空格和连字符
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") // 合并多个连字符
      .trim()
      .substring(0, 30);

    // 如果有可读部分，使用它；否则只用哈希
    const slug = readablePart ? `${readablePart}-${hash}` : hash;
    return `${date}-${slug}`;
  }

  /**
   * 加载 HTML 模板
   */
  async loadTemplate(templateName) {
    const templatePath = path.join(this.templatesDir, templateName);
    return await fs.readFile(templatePath, "utf-8");
  }

  /**
   * 生成首页
   */
  async generateIndex(dateFolders) {
    const template = await this.loadTemplate("index.html");

    // 生成日期列表
    let dateListHtml = "";
    for (const date of dateFolders) {
      const newsItems = await this.readDateFolder(date);
      const count = newsItems.length;

      dateListHtml += `
        <div class="date-card">
          <a href="${date}.html">
            <div class="date-header">
              <h3>📅 ${date}</h3>
              <span class="news-count">${count} 条资讯</span>
            </div>
            <div class="category-summary">
              ${this.generateCategorySummary(newsItems)}
            </div>
          </a>
        </div>
      `;
    }

    const html = template
      .replace("{{DATE_LIST}}", dateListHtml)
      .replace("{{UPDATE_TIME}}", new Date().toLocaleString("zh-CN"));

    await fs.writeFile(path.join(this.docsDir, "index.html"), html, "utf-8");
    console.log("✅ 生成首页：index.html");
  }

  /**
   * 生成分类汇总
   */
  generateCategorySummary(newsItems) {
    const categoryCounts = {};
    for (const item of newsItems) {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    }

    let html = "";
    for (const [category, count] of Object.entries(categoryCounts)) {
      const info = this.categoryMap[category];
      html += `<span class="category-badge" style="background-color: ${info.color}20; color: ${info.color}">${info.icon} ${info.name}: ${count}</span>`;
    }
    return html;
  }

  /**
   * 生成每日汇总页面
   */
  async generateDailyPage(date, newsItems) {
    const template = await this.loadTemplate("daily.html");

    // 按类别分组
    const itemsByCategory = {};
    for (const item of newsItems) {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item);
    }

    // 生成资讯列表
    let newsListHtml = "";
    for (const [category, items] of Object.entries(itemsByCategory)) {
      const info = this.categoryMap[category];

      newsListHtml += `
        <div class="category-section">
          <h2 style="color: ${info.color}">${info.icon} ${info.name}</h2>
          <div class="news-grid">
      `;

      for (const item of items) {
        const detailPath = `news/${date}/${item.slug}.html`;
        newsListHtml += `
          <div class="news-card">
            <div class="news-header">
              <h3><a href="${detailPath}">${item.title}</a></h3>
              <div class="news-meta">
                <span class="stars">${"⭐".repeat(item.stars)}</span>
                <span class="date">${item.publishDate}</span>
              </div>
            </div>
            <p class="news-summary">${item.summary}</p>
            <div class="news-footer">
              ${
                item.source
                  ? `<span class="source">📄 ${item.source.name}</span>`
                  : ""
              }
              <div class="tags">${item.tags.slice(0, 3).join(" ")}</div>
            </div>
          </div>
        `;
      }

      newsListHtml += `
          </div>
        </div>
      `;
    }

    const html = template
      .replace(/\{\{DATE\}\}/g, date)
      .replace("{{NEWS_COUNT}}", newsItems.length)
      .replace("{{NEWS_LIST}}", newsListHtml);

    await fs.writeFile(path.join(this.docsDir, `${date}.html`), html, "utf-8");
    console.log(`✅ 生成每日页面：${date}.html`);
  }

  /**
   * 生成资讯详情页面
   */
  async generateNewsPage(date, item) {
    const template = await this.loadTemplate("news-item.html");

    // 转换 markdown 为 HTML
    const contentHtml = marked(item.content);

    const html = template
      .replace(/\{\{TITLE\}\}/g, item.title)
      .replace(/\{\{CATEGORY\}\}/g, item.categoryInfo.name)
      .replace(/\{\{CATEGORY_ICON\}\}/g, item.categoryInfo.icon)
      .replace(/\{\{CATEGORY_COLOR\}\}/g, item.categoryInfo.color)
      .replace(/\{\{DATE\}\}/g, item.publishDate)
      .replace(/\{\{STARS\}\}/g, "⭐".repeat(item.stars))
      .replace(/\{\{SOURCE_NAME\}\}/g, item.source?.name || "未知来源")
      .replace(/\{\{SOURCE_URL\}\}/g, item.source?.url || "#")
      .replace(/\{\{TAGS\}\}/g, item.tags.join(" "))
      .replace(/\{\{CONTENT\}\}/g, contentHtml)
      .replace(/\{\{BACK_LINK\}\}/g, `../../${date}.html`);

    // 确保目录存在
    const newsDir = path.join(this.docsDir, "news", date);
    await fs.mkdir(newsDir, { recursive: true });

    const filePath = path.join(newsDir, `${item.slug}.html`);
    await fs.writeFile(filePath, html, "utf-8");
  }

  /**
   * 复制静态资源（CSS、图片等）
   */
  async copyStaticAssets() {
    const stylesSourceDir = path.join(__dirname, "styles");
    const stylesTargetDir = path.join(this.docsDir, "styles");

    try {
      // 确保目标目录存在
      await fs.mkdir(stylesTargetDir, { recursive: true });

      // 读取源目录中的所有文件
      const files = await fs.readdir(stylesSourceDir);

      for (const file of files) {
        const sourcePath = path.join(stylesSourceDir, file);
        const targetPath = path.join(stylesTargetDir, file);

        // 复制文件
        await fs.copyFile(sourcePath, targetPath);
      }

      console.log("✅ 复制静态资源：styles/");
    } catch (error) {
      console.warn("⚠️  复制静态资源失败：", error.message);
    }
  }

  /**
   * 生成所有页面
   */
  async generate() {
    console.log("🚀 开始生成静态网站...\n");

    // 确保 docs 目录存在
    await fs.mkdir(this.docsDir, { recursive: true });

    // 复制静态资源
    await this.copyStaticAssets();

    // 获取所有日期文件夹
    const dateFolders = await this.getDateFolders();
    console.log(`📁 找到 ${dateFolders.length} 个日期文件夹\n`);

    if (dateFolders.length === 0) {
      console.log("⚠️  没有找到资讯数据，生成空白首页");
      await this.generateIndex([]);
      return;
    }

    // 生成首页
    await this.generateIndex(dateFolders);

    // 为每个日期生成页面
    for (const date of dateFolders) {
      const newsItems = await this.readDateFolder(date);

      // 过滤掉空内容的资讯
      const validNewsItems = newsItems.filter(
        (item) =>
          item.content &&
          item.content.trim().length > 100 &&
          item.title &&
          item.title !== "未命名资讯"
      );

      if (validNewsItems.length === 0) {
        console.log(`⏭️  跳过空文件夹：${date}`);
        continue;
      }

      // 生成每日汇总页
      await this.generateDailyPage(date, validNewsItems);

      // 生成每条资讯的详情页
      for (const item of validNewsItems) {
        await this.generateNewsPage(date, item);
      }

      console.log(`   ├─ 生成 ${validNewsItems.length} 条资讯详情页\n`);
    }

    console.log("✨ 静态网站生成完成！");
    console.log(`📍 输出目录：${this.docsDir}`);
  }
}

// CLI 支持
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new StaticSiteGenerator();
  generator.generate().catch((error) => {
    console.error("❌ 生成失败：", error);
    process.exit(1);
  });
}

export default StaticSiteGenerator;
