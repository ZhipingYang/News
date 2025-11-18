# News Tools (工具目录)

简化版资讯收集和分析工具。

## 📂 目录结构

```
mcp-server/
├── tools/                    # 核心工具
│   ├── collect-news.js       # 收集资讯
│   ├── filter-news.js        # 筛选资讯
│   └── generate-outline.js   # 生成大纲
├── data/                     # 数据文件目录
│   ├── collected-news-YYYY-MM-DD.json
│   ├── filtered-news-YYYY-MM-DD.json
│   └── outlines-YYYY-MM-DD.json
└── package.json              # 工具依赖配置
```

## 🔧 工具说明

### collect-news.js
收集资讯的交互式工具，引导 AI 使用 WebSearch 收集三个类别的资讯。

**使用**:
```bash
node tools/collect-news.js
# 或
npm run collect
```

### filter-news.js
筛选资讯工具，自动评估影响力分数和可信度，推荐需要深度分析的资讯。

**使用**:
```bash
node tools/filter-news.js data/collected-news-YYYY-MM-DD.json
# 或
npm run filter
```

### generate-outline.js
生成资讯大纲，提供结构化分析框架和数据收集清单。

**使用**:
```bash
node tools/generate-outline.js data/filtered-news-YYYY-MM-DD.json
# 或
npm run outline
```

## 📊 数据流

```
WebSearch 收集
    ↓
collected-news-YYYY-MM-DD.json
    ↓
filter-news.js 筛选
    ↓
filtered-news-YYYY-MM-DD.json
    ↓
generate-outline.js 生成大纲
    ↓
outlines-YYYY-MM-DD.json
    ↓
AI 深度分析
    ↓
news_markdown/YYYY-MM-DD/*.md
```

## 💡 快速开始

参见项目根目录的 [AI-DAILY-WORKFLOW.md](../AI-DAILY-WORKFLOW.md) 文档。

