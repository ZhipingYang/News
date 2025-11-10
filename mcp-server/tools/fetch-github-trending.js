import fetch from 'node-fetch';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * GitHub Trending 抓取和评估工具
 * 获取AI相关的GitHub Trending项目，并评估其价值
 */

// 评估标准
const EVALUATION_CRITERIA = {
  // 颠覆性关键词（高权重）
  disruptive_keywords: [
    'revolutionary', 'breakthrough', 'novel', 'first-of-its-kind',
    '颠覆', '突破', '革命性', '首创', 'game-changing',
    'paradigm shift', 'unprecedented'
  ],
  
  // 创造性关键词（中等权重）
  creative_keywords: [
    'creative', 'innovative', 'unique', 'original', 'inventive',
    '创新', '独特', '原创', 'novel approach', 'creative solution',
    'unconventional', 'ingenious'
  ],
  
  // 趣味性关键词（中等权重）
  fun_keywords: [
    'fun', 'interesting', 'cool', 'awesome', 'amazing', 'impressive',
    '有趣', '好玩', '酷', '令人惊叹', 'entertaining', 'engaging',
    'playful', 'delightful'
  ],
  
  // AI核心技术关键词
  ai_tech_keywords: [
    'llm', 'gpt', 'transformer', 'neural', 'deep learning', 'machine learning',
    'ai agent', 'autonomous', 'generative', 'diffusion', 'reasoning',
    'multimodal', 'vision-language', 'fine-tuning', 'rag', 'embedding'
  ],
  
  // 应用场景关键词
  application_keywords: [
    'coding', 'programming', 'developer', 'automation', 'assistant',
    'tool', 'framework', 'library', 'api', 'sdk', 'cli'
  ]
};

// Star数阈值
const STAR_THRESHOLDS = {
  viral: 5000,      // 病毒式传播
  trending: 1000,   // 热门趋势
  rising: 100,      // 快速上升
  notable: 50       // 值得关注
};

/**
 * 从GitHub Trending RSS获取项目
 */
async function fetchGitHubTrendingRSS() {
  try {
    // 使用非官方的GitHub Trending RSS服务
    const rssUrl = 'https://mshibanami.github.io/GitHubTrendingRSS/daily/python.xml';
    
    console.log('📡 正在从GitHub Trending RSS获取数据...');
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-News-Bot/1.0)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const xmlText = await response.text();
    
    // 简单的XML解析（提取项目信息）
    const items = [];
    const itemMatches = xmlText.matchAll(/<item>([\s\S]*?)<\/item>/g);
    
    for (const match of itemMatches) {
      const itemXml = match[1];
      
      const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || '';
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || '';
      const description = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] || '';
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
      
      // 提取仓库名称
      const repoMatch = link.match(/github\.com\/([^\/]+\/[^\/]+)/);
      const repo = repoMatch ? repoMatch[1] : '';
      
      // 提取star数（从description中）
      const starsMatch = description.match(/(\d+)\s*stars?\s*today/i) || description.match(/(\d+)\s*⭐/);
      const starsToday = starsMatch ? parseInt(starsMatch[1]) : 0;
      
      const totalStarsMatch = description.match(/total:?\s*(\d+)/i);
      const totalStars = totalStarsMatch ? parseInt(totalStarsMatch[1]) : 0;
      
      items.push({
        title,
        repo,
        link,
        description,
        pubDate,
        starsToday,
        totalStars
      });
    }
    
    console.log(`✓ 成功获取 ${items.length} 个项目`);
    return items;
  } catch (error) {
    console.error('❌ 获取GitHub Trending RSS失败:', error.message);
    return [];
  }
}

/**
 * 通过GitHub API获取项目详细信息
 */
async function fetchRepoDetails(repo) {
  try {
    const apiUrl = `https://api.github.com/repos/${repo}`;
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-News-Bot/1.0)',
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      name: data.name,
      full_name: data.full_name,
      description: data.description || '',
      stars: data.stargazers_count,
      forks: data.forks_count,
      language: data.language,
      topics: data.topics || [],
      created_at: data.created_at,
      updated_at: data.updated_at,
      homepage: data.homepage,
      has_discussions: data.has_discussions,
      open_issues: data.open_issues_count
    };
  } catch (error) {
    console.error(`  ❌ 获取仓库详情失败 (${repo}):`, error.message);
    return null;
  }
}

/**
 * 评估项目的价值分数
 */
function evaluateProject(project) {
  let score = 0;
  const reasons = [];
  
  const fullText = `${project.title} ${project.description} ${project.topics?.join(' ') || ''}`.toLowerCase();
  
  // 1. Star数评估（30分）
  if (project.totalStars >= STAR_THRESHOLDS.viral) {
    score += 30;
    reasons.push(`🔥 病毒式传播 (${project.totalStars} stars)`);
  } else if (project.totalStars >= STAR_THRESHOLDS.trending) {
    score += 25;
    reasons.push(`📈 热门趋势 (${project.totalStars} stars)`);
  } else if (project.totalStars >= STAR_THRESHOLDS.rising) {
    score += 20;
    reasons.push(`⬆️ 快速上升 (${project.totalStars} stars)`);
  } else if (project.totalStars >= STAR_THRESHOLDS.notable) {
    score += 10;
    reasons.push(`👀 值得关注 (${project.totalStars} stars)`);
  }
  
  // 2. 今日增长评估（20分）
  if (project.starsToday >= 500) {
    score += 20;
    reasons.push(`🚀 今日爆发 (+${project.starsToday} stars)`);
  } else if (project.starsToday >= 100) {
    score += 15;
    reasons.push(`📊 今日热门 (+${project.starsToday} stars)`);
  } else if (project.starsToday >= 50) {
    score += 10;
    reasons.push(`⭐ 今日增长 (+${project.starsToday} stars)`);
  }
  
  // 3. 颠覆性评估（20分）
  let disruptiveCount = 0;
  for (const keyword of EVALUATION_CRITERIA.disruptive_keywords) {
    if (fullText.includes(keyword.toLowerCase())) {
      disruptiveCount++;
    }
  }
  if (disruptiveCount >= 2) {
    score += 20;
    reasons.push('💥 高度颠覆性');
  } else if (disruptiveCount >= 1) {
    score += 10;
    reasons.push('🎯 具有颠覆性');
  }
  
  // 4. 创造性评估（15分）
  let creativeCount = 0;
  for (const keyword of EVALUATION_CRITERIA.creative_keywords) {
    if (fullText.includes(keyword.toLowerCase())) {
      creativeCount++;
    }
  }
  if (creativeCount >= 2) {
    score += 15;
    reasons.push('🎨 高度创新');
  } else if (creativeCount >= 1) {
    score += 8;
    reasons.push('💡 具有创新性');
  }
  
  // 5. 趣味性评估（10分）
  let funCount = 0;
  for (const keyword of EVALUATION_CRITERIA.fun_keywords) {
    if (fullText.includes(keyword.toLowerCase())) {
      funCount++;
    }
  }
  if (funCount >= 2) {
    score += 10;
    reasons.push('🎮 趣味性强');
  } else if (funCount >= 1) {
    score += 5;
    reasons.push('😊 有趣');
  }
  
  // 6. AI技术相关性（5分）
  let aiTechCount = 0;
  for (const keyword of EVALUATION_CRITERIA.ai_tech_keywords) {
    if (fullText.includes(keyword.toLowerCase())) {
      aiTechCount++;
    }
  }
  if (aiTechCount >= 3) {
    score += 5;
    reasons.push('🤖 AI核心技术');
  } else if (aiTechCount >= 1) {
    score += 3;
    reasons.push('🔧 AI相关');
  }
  
  return {
    score,
    reasons,
    category: score >= 70 ? 'must-include' : score >= 50 ? 'recommended' : 'optional'
  };
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 GitHub Trending AI项目评估工具');
  console.log('============================================================\n');
  
  // 1. 获取Trending项目
  const trendingProjects = await fetchGitHubTrendingRSS();
  
  if (trendingProjects.length === 0) {
    console.log('⚠️  未获取到任何项目，尝试使用API方式...\n');
    // 可以在这里添加备用的API获取方式
    return;
  }
  
  // 2. 获取详细信息并评估
  const evaluatedProjects = [];
  
  console.log('\n📊 正在评估项目...\n');
  
  for (const project of trendingProjects.slice(0, 20)) { // 只处理前20个
    if (!project.repo) continue;
    
    console.log(`🔍 评估: ${project.repo}`);
    
    // 获取详细信息
    const details = await fetchRepoDetails(project.repo);
    if (!details) continue;
    
    // 合并信息
    const fullProject = {
      ...project,
      ...details
    };
    
    // 评估
    const evaluation = evaluateProject(fullProject);
    
    console.log(`  评分: ${evaluation.score}/100 (${evaluation.category})`);
    console.log(`  原因: ${evaluation.reasons.join(', ')}`);
    
    evaluatedProjects.push({
      ...fullProject,
      evaluation
    });
    
    // 避免API限流
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 3. 排序并筛选
  evaluatedProjects.sort((a, b) => b.evaluation.score - a.evaluation.score);
  
  const mustInclude = evaluatedProjects.filter(p => p.evaluation.category === 'must-include');
  const recommended = evaluatedProjects.filter(p => p.evaluation.category === 'recommended');
  
  console.log('\n============================================================');
  console.log('📈 评估结果汇总');
  console.log('============================================================\n');
  
  console.log(`✨ 必须添加 (评分≥70): ${mustInclude.length} 个`);
  console.log(`💡 推荐添加 (评分≥50): ${recommended.length} 个`);
  console.log(`📋 可选添加 (评分<50): ${evaluatedProjects.length - mustInclude.length - recommended.length} 个\n`);
  
  if (mustInclude.length > 0) {
    console.log('🔥 必须添加的项目:\n');
    mustInclude.forEach((p, i) => {
      console.log(`${i + 1}. **${p.full_name}** (${p.evaluation.score}分)`);
      console.log(`   ${p.description}`);
      console.log(`   ⭐ Stars: ${p.stars.toLocaleString()} | 📈 今日: +${p.starsToday}`);
      console.log(`   🏷️  ${p.evaluation.reasons.join(' | ')}`);
      console.log(`   🔗 ${p.link}\n`);
    });
  }
  
  if (recommended.length > 0) {
    console.log('\n💡 推荐添加的项目:\n');
    recommended.forEach((p, i) => {
      console.log(`${i + 1}. **${p.full_name}** (${p.evaluation.score}分)`);
      console.log(`   ${p.description}`);
      console.log(`   ⭐ Stars: ${p.stars.toLocaleString()} | 📈 今日: +${p.starsToday}`);
      console.log(`   🏷️  ${p.evaluation.reasons.join(' | ')}`);
      console.log(`   🔗 ${p.link}\n`);
    });
  }
  
  // 4. 保存结果
  const outputPath = join(__dirname, '../data/github-trending-' + new Date().toISOString().split('T')[0] + '.json');
  writeFileSync(outputPath, JSON.stringify({
    date: new Date().toISOString(),
    total: evaluatedProjects.length,
    mustInclude,
    recommended,
    all: evaluatedProjects
  }, null, 2));
  
  console.log(`\n💾 评估结果已保存到: ${outputPath}`);
  console.log('\n✅ GitHub Trending评估完成！');
}

// 运行
main().catch(console.error);

