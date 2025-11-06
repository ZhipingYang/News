import fs from "fs/promises";
import path from "path";
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
    this.docsDir = path.join(this.baseDir, "docs");
    this.templatesDir = path.join(__dirname, "templates");

    this.categoryMap = {
      "ai-programming": { name: "AI编程", icon: "💻", color: "#4F46E5" },
      "ai-chips": { name: "AI芯片", icon: "🔧", color: "#DC2626" },
      "quantum-computing": { name: "量子计算", icon: "⚛️", color: "#7C3AED" },
      robotics: { name: "机器人", icon: "🤖", color: "#059669" },
      "generative-ai": { name: "生成式AI", icon: "🎨", color: "#EA580C" },
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
    const entries = await fs.readdir(this.baseDir, { withFileTypes: true });
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
    const folderPath = path.join(this.baseDir, dateFolder);
    const newsItems = [];

    for (const [category, info] of Object.entries(this.categoryMap)) {
      const filename = `${category}.md`;
      const filePath = path.join(folderPath, filename);

      try {
        const content = await fs.readFile(filePath, "utf-8");

        // 解析 markdown 文件，按分隔符拆分为多条资讯
        const items = this.parseMarkdownFile(content, category, dateFolder);
        newsItems.push(...items);
      } catch (error) {
        // 文件不存在，跳过
      }
    }

    return newsItems;
  }

  /**
   * 解析 markdown 文件，拆分为多条资讯
   */
  parseMarkdownFile(content, category, date) {
    // 移除文件头部的汇总标题
    content = content.replace(/^#\s+.*资讯汇总\s*\n+/, "");

    // 按分隔符拆分
    const sections = content.split(/\n---\n\s*\n/);
    const items = [];

    for (const section of sections) {
      if (section.trim().length < 50) continue; // 跳过太短的内容

      // 提取标题
      const titleMatch = section.match(/^#\s+🔥\s+(.*?)$/m);
      const title = titleMatch ? titleMatch[1].trim() : "未命名资讯";

      // 提取发布日期
      const dateMatch = section.match(
        /\*\*发布日期：\*\*\s+(\d{4}-\d{2}-\d{2})/
      );
      const publishDate = dateMatch ? dateMatch[1] : date;

      // 提取来源
      const sourceMatch = section.match(/\*\*来源：\*\*\s+\[(.*?)\]\((.*?)\)/);
      const source = sourceMatch
        ? { name: sourceMatch[1], url: sourceMatch[2] }
        : null;

      // 提取可信度评分
      const scoreMatch = section.match(/\*\*可信度评分：\*\*\s+(⭐+)/);
      const stars = scoreMatch ? scoreMatch[1].length : 3;

      // 提取标签
      const tagsMatch = section.match(/\*\*标签：\*\*\s+(.*?)$/m);
      const tags = tagsMatch
        ? tagsMatch[1].split(/\s+/).filter((t) => t.startsWith("#"))
        : [];

      // 生成摘要（取第一段非元数据的内容）
      const contentLines = section.split("\n");
      let summary = "";
      let inContent = false;
      for (const line of contentLines) {
        if (line.startsWith("---")) break;
        if (
          inContent &&
          line.trim() &&
          !line.startsWith("**") &&
          !line.startsWith("#")
        ) {
          summary = line.trim();
          break;
        }
        if (line.includes("---")) inContent = true;
      }
      summary = summary.substring(0, 150) + (summary.length > 150 ? "..." : "");

      items.push({
        title,
        category,
        categoryInfo: this.categoryMap[category],
        publishDate,
        collectionDate: date,
        source,
        stars,
        tags,
        summary,
        content: section,
        slug: this.generateSlug(title, date),
      });
    }

    return items;
  }

  /**
   * 生成 URL slug
   */
  generateSlug(title, date) {
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 50);
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
      .replace("{{CATEGORY}}", item.categoryInfo.name)
      .replace("{{CATEGORY_ICON}}", item.categoryInfo.icon)
      .replace("{{CATEGORY_COLOR}}", item.categoryInfo.color)
      .replace("{{DATE}}", item.publishDate)
      .replace("{{STARS}}", "⭐".repeat(item.stars))
      .replace("{{SOURCE_NAME}}", item.source?.name || "未知来源")
      .replace("{{SOURCE_URL}}", item.source?.url || "#")
      .replace("{{TAGS}}", item.tags.join(" "))
      .replace("{{CONTENT}}", contentHtml)
      .replace("{{BACK_LINK}}", `../../${date}.html`);

    // 确保目录存在
    const newsDir = path.join(this.docsDir, "news", date);
    await fs.mkdir(newsDir, { recursive: true });

    const filePath = path.join(newsDir, `${item.slug}.html`);
    await fs.writeFile(filePath, html, "utf-8");
  }

  /**
   * 生成所有页面
   */
  async generate() {
    console.log("🚀 开始生成静态网站...\n");

    // 确保 docs 目录存在
    await fs.mkdir(this.docsDir, { recursive: true });

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
