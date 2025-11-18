#!/usr/bin/env node

/**
 * 收集资讯工具 (简化版)
 * 
 * 使用 AI WebSearch 收集三个类别的资讯
 * 每个类别收集 10 条 (最近 7 天)
 * 
 * 执行: node collect-news.js
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 类别配置
const CATEGORIES = {
  'ai-programming': {
    name: 'AI编程',
    queries: [
      'AI coding assistant 2025 breakthrough',
      'GitHub Copilot new features last week',
      'AI code generation tools November 2025',
      'programming AI tools technical innovation',
      'cursor AI coding latest update'
    ]
  },
  'ai-products': {
    name: 'AI产品',
    queries: [
      'AI product launch November 2025',
      'OpenAI Claude Anthropic new release',
      'AI application commercial success',
      'generative AI product market',
      'ChatGPT GPT-4 new features'
    ]
  },
  'tech-general': {
    name: '科技综合',
    queries: [
      'AI technology breakthrough this week',
      'artificial intelligence research paper',
      'tech industry AI trend November 2025',
      'machine learning advancement',
      'AI regulation policy news'
    ]
  }
};

// 获取今天日期
function getTodayDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// 创建空的收集结果模板
function createEmptyResult() {
  return {
    date: getTodayDate(),
    categories: {
      'ai-programming': {
        name: 'AI编程',
        items: []
      },
      'ai-products': {
        name: 'AI产品',
        items: []
      },
      'tech-general': {
        name: '科技综合',
        items: []
      }
    },
    metadata: {
      collectedAt: new Date().toISOString(),
      targetPerCategory: 10,
      timeRange: '最近7天'
    }
  };
}

// 主函数
async function main() {
  console.log('📰 AI 资讯收集工具 (简化版)\n');
  console.log('目标: 每个类别收集 10 条资讯 (最近 7 天)\n');
  
  const result = createEmptyResult();
  const today = getTodayDate();
  
  console.log('=' .repeat(60));
  console.log('🤖 请在 Cursor Chat 中执行以下操作:\n');
  
  // 为每个类别生成搜索指令
  for (const [categoryId, categoryInfo] of Object.entries(CATEGORIES)) {
    console.log(`\n📋 ${categoryInfo.name} (${categoryId})`);
    console.log('-'.repeat(60));
    console.log(`\n建议搜索查询 (每个查询收集 2-3 条):\n`);
    
    categoryInfo.queries.forEach((query, index) => {
      console.log(`${index + 1}. "${query}"`);
    });
    
    console.log(`\n对每个搜索结果,记录以下信息:`);
    console.log(`- 标题 (title)`);
    console.log(`- 来源URL (url)`);
    console.log(`- 发布日期 (publishDate, 格式: YYYY-MM-DD)`);
    console.log(`- 内容摘要 (summary, 100-200字)`);
    console.log(`- 内容正文 (content, 如果有)`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n💾 收集完成后,将结果保存为 JSON 格式:\n');
  
  const outputPath = path.join(__dirname, '../data', `collected-news-${today}.json`);
  
  console.log('```json');
  console.log(JSON.stringify(result, null, 2));
  console.log('```\n');
  
  console.log(`保存路径: ${outputPath}\n`);
  
  // 创建模板文件
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
  
  console.log(`✅ 已创建模板文件: ${outputPath}`);
  console.log(`\n请 AI 使用 web_search 填充每个类别的 items 数组`);
  console.log(`每个 item 的格式:`);
  console.log(`{`);
  console.log(`  "title": "标题",`);
  console.log(`  "url": "https://...",`);
  console.log(`  "publishDate": "YYYY-MM-DD",`);
  console.log(`  "summary": "摘要 (100-200字)",`);
  console.log(`  "content": "完整内容 (如果有)"`);
  console.log(`}\n`);
  
  console.log('📊 进度追踪:');
  console.log(`- AI编程: 0/10 条`);
  console.log(`- AI产品: 0/10 条`);
  console.log(`- 科技综合: 0/10 条`);
  console.log(`\n目标: 每类 10 条, 总计 30 条资讯`);
}

main().catch(console.error);

