# RSS源配置与管理

## RSS源配置文件

配置文件：`mcp-server/config/rss-sources.json`

---

## RSS源列表（按主题分类）

### AI编程（11个源）

| 源名称 | 可信度 | 类别 | 描述 |
|--------|--------|------|------|
| GitHub Blog | 0.95 | company_official | GitHub官方博客，AI编程工具第一手资讯 |
| OpenAI Blog | 0.95 | company_official | OpenAI官方博客，Codex等AI编程技术 |
| JetBrains Blog | 0.90 | company_blog | JetBrains官方博客，IDE和AI辅助编程 |
| Microsoft Developer Blog | 0.90 | company_blog | Microsoft开发者博客，GitHub Copilot等 |
| Stack Overflow Blog | 0.85 | tech_news | Stack Overflow博客，开发者社区观点 |
| Dev.to AI | 0.80 | developer | Dev.to AI标签，开发者社区AI文章 |
| Google Developers Blog | 0.90 | company_blog | Google开发者博客，AI开发工具 |
| Hugging Face Blog | 0.90 | company_blog | Hugging Face博客，AI模型和工具 |
| AWS Machine Learning Blog | 0.90 | company_blog | AWS机器学习博客，AI开发工具和服务 |
| Google AI Research | 0.95 | company_official | Google AI研究博客，前沿AI技术 |

### 生成式AI（13个源）

| 源名称 | 可信度 | 类别 | 描述 |
|--------|--------|------|------|
| OpenAI Blog | 0.95 | company_official | OpenAI官方博客，GPT系列第一手资讯 |
| Anthropic News | 0.95 | company_official | Anthropic官方新闻，Claude系列资讯 |
| Google AI Blog | 0.95 | company_official | Google AI官方博客，Gemini等模型资讯 |
| Microsoft AI Blog | 0.90 | company_blog | Microsoft AI博客，Azure AI等 |
| Hugging Face Blog | 0.90 | company_blog | Hugging Face博客，开源AI模型 |
| Papers with Code - NLP | 0.90 | academic | Papers with Code NLP最新论文 |
| ArXiv AI | 0.95 | academic | ArXiv AI论文预印本 |
| Meta AI Research | 0.90 | company_blog | Meta AI研究博客，Llama等模型 |
| Stability AI Blog | 0.85 | company_blog | Stability AI博客，Stable Diffusion等 |
| Cohere Blog | 0.85 | company_blog | Cohere博客，企业级AI模型 |
| Mistral AI Blog | 0.90 | company_blog | Mistral AI博客，开源大模型 |
| Inflection AI | 0.85 | company_blog | Inflection AI博客，AI助手技术 |

### AI芯片（13个源）

| 源名称 | 可信度 | 类别 | 描述 |
|--------|--------|------|------|
| NVIDIA Blog | 0.95 | company_official | NVIDIA官方博客，GPU和AI芯片资讯 |
| AMD Blog | 0.90 | company_blog | AMD社区博客，AI芯片资讯 |
| Intel Newsroom | 0.90 | company_official | Intel新闻室，AI芯片和数据中心 |
| AnandTech | 0.90 | tech_news | AnandTech，深度硬件评测和分析 |
| Tom's Hardware | 0.85 | tech_news | Tom's Hardware，硬件新闻和评测 |
| SemiWiki | 0.85 | tech_news | SemiWiki，半导体行业资讯 |
| Semiconductor Engineering | 0.85 | tech_news | 半导体工程新闻 |
| Google Cloud Blog - AI | 0.90 | company_blog | Google Cloud AI博客，TPU等 |
| Qualcomm News | 0.85 | company_official | Qualcomm新闻，AI移动芯片 |
| ARM Blog | 0.85 | company_blog | ARM社区博客，AI处理器架构 |
| Graphcore Blog | 0.85 | company_blog | Graphcore博客，AI加速器芯片 |
| Cerebras Blog | 0.85 | company_blog | Cerebras博客，大模型训练芯片 |

### 量子计算（12个源）

| 源名称 | 可信度 | 类别 | 描述 |
|--------|--------|------|------|
| IBM Research Blog | 0.95 | company_official | IBM研究博客，量子计算第一手资讯 |
| Google Quantum AI | 0.95 | company_official | Google量子AI博客 |
| Microsoft Quantum Blog | 0.90 | company_blog | Microsoft量子计算博客 |
| Nature Quantum Information | 0.95 | academic | Nature量子信息期刊 |
| Physics World - Quantum | 0.90 | academic | Physics World量子物理 |
| IonQ News | 0.85 | company_official | IonQ量子计算公司新闻 |
| Rigetti Computing Blog | 0.85 | company_blog | Rigetti量子计算博客 |
| ArXiv Quantum Physics | 0.95 | academic | ArXiv量子物理论文 |
| MIT News - Quantum | 0.95 | academic | MIT量子计算新闻 |
| Quantinuum | 0.85 | company_official | Quantinuum量子计算公司新闻 |
| Atom Computing | 0.85 | company_blog | Atom Computing量子计算博客 |

### 机器人（10个源）

| 源名称 | 可信度 | 类别 | 描述 |
|--------|--------|------|------|
| IEEE Spectrum Robotics | 0.90 | tech_news | IEEE Spectrum机器人频道 |
| The Robot Report | 0.85 | tech_news | 机器人行业新闻报告 |
| Boston Dynamics Blog | 0.90 | company_blog | Boston Dynamics官方博客 |
| MIT CSAIL News | 0.95 | academic | MIT计算机科学与AI实验室 |
| CMU Robotics Institute | 0.95 | academic | 卡内基梅隆大学机器人研究所 |
| Tesla AI Blog | 0.90 | company_blog | Tesla博客，Optimus人形机器人 |
| Agility Robotics Blog | 0.85 | company_blog | Agility Robotics博客，Digit机器人 |
| RoboticsBusinessReview | 0.80 | tech_news | 机器人商业评论 |
| Stanford AI Lab Blog | 0.95 | academic | Stanford AI实验室博客 |
| DeepMind Blog | 0.95 | company_blog | DeepMind博客，AI与机器人 |

### 科技综合（10个源，新增）

| 源名称 | 可信度 | 类别 | 描述 |
|--------|--------|------|------|
| MIT Technology Review | 0.95 | tech_news | MIT Technology Review，权威科技媒体 |
| IEEE Spectrum | 0.95 | tech_news | IEEE Spectrum，IEEE旗舰科技媒体 |
| Nature News | 0.95 | academic | Nature新闻，顶级科学期刊 |
| Science News | 0.95 | academic | Science新闻，顶级科学期刊 |
| TechCrunch | 0.90 | tech_news | TechCrunch，知名科技媒体 |
| Wired | 0.90 | tech_news | Wired，科技文化媒体 |
| The Verge | 0.90 | tech_news | The Verge，科技新闻媒体 |
| Ars Technica | 0.90 | tech_news | Ars Technica，深度科技分析 |
| New Scientist | 0.90 | tech_news | New Scientist，科学新闻 |
| Scientific American | 0.90 | tech_news | Scientific American，科学美国人 |

**说明：** 科技综合类目包含权威科技媒体和科学期刊，涵盖前沿科技突破和综合科技资讯。

---

## 如何添加新RSS源

### 步骤1：查找RSS源
1. 访问目标网站
2. 查找RSS图标或"/feed"、"/rss"链接
3. 验证RSS URL是否有效（在浏览器中访问）

### 步骤2：评估可信度
- **官方网站**（0.95）：公司官方blog、press release
- **公司博客**（0.85-0.9）：技术博客、开发者博客
- **学术期刊**（0.95）：Nature、Science、ArXiv
- **技术媒体**（0.85-0.9）：TechCrunch、The Verge、Wired、MIT Technology Review
- **社区内容**（0.8-0.85）：Dev.to、Medium、Reddit

**注意：** 当前筛选标准已放宽至可信度≥0.8，以获取更多有效资讯

### 步骤3：添加到配置文件
编辑 `mcp-server/config/rss-sources.json`：

```json
{
  "ai_programming": [
    ...existing sources,
    {
      "name": "New Source Name",
      "url": "https://example.com/feed/",
      "credibility": 0.9,
      "category": "company_blog",
      "description": "简要描述这个源"
    }
  ]
}
```

### 步骤4：测试
```bash
cd mcp-server
node tools/fetch-rss.js ai_programming
```

检查输出确认新源正常工作。

---

## RSS源质量评估标准

### 优秀源（可信度≥0.9）
- ✅ 官方来源（公司、机构）
- ✅ 及时更新（每周至少1次）
- ✅ 内容深度（技术细节、数据支撑）
- ✅ 原创内容（非转载）
- ✅ 稳定可靠（少有宕机）

### 良好源（可信度0.85-0.9）
- ✅ 知名技术媒体
- ✅ 定期更新（每月至少2次）
- ✅ 内容质量（有分析和见解）
- ⚠️ 可能包含广告内容

### 合格源（可信度0.8-0.85）
- ✅ 社区内容（经过筛选）
- ⚠️ 更新频率不稳定
- ⚠️ 内容质量参差不齐
- ⚠️ 需要额外质量过滤

### 不推荐（可信度<0.8）
- ❌ 个人博客（除非特别知名）
- ❌ 营销内容为主
- ❌ 更新不及时
- ❌ 内容浅显或转载为主

---

## RSS源维护

### 每周检查
- [ ] 所有源是否可访问
- [ ] 是否有新资讯
- [ ] 抓取是否有错误

### 每月审查
- [ ] 评估源的质量（资讯质量、更新频率）
- [ ] 调整可信度评分
- [ ] 添加新源、移除低质量源

### 每季度优化
- [ ] 分析各源的资讯采用率
- [ ] 优化源的优先级
- [ ] 探索新的资讯源

---

## 故障排查

**RSS源无法访问：**
- 检查URL是否变更
- 检查网络连接
- 尝试在浏览器中访问
- 联系源管理员

**RSS格式错误：**
- 验证RSS格式（使用RSS验证工具）
- 检查编码问题
- 尝试其他RSS解析器

**抓取超时：**
- 增加timeout设置（`rss-sources.json` → `settings.fetch_timeout`）
- 检查源服务器状态
- 考虑使用代理

**内容质量下降：**
- 重新评估可信度评分
- 考虑移除该源
- 寻找替代源

---

## RSS源推荐标准

推荐新RSS源时，请确保：

1. **可信度≥0.85**
2. **更新频率：每月至少2次**
3. **内容质量：包含技术细节和数据**
4. **稳定性：99%可用性**
5. **原创性：至少50%原创内容**

---

## 联系方式

如有RSS源推荐或问题，请在GitHub Issues中提出。

