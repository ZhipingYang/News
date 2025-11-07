# 首次配置指南

## 环境要求

- Node.js ≥ 18.0
- Git
- GitHub账户
- GitHub CLI（推荐）或 GitHub Personal Access Token

---

## 快速配置（3步）

### 1. 克隆仓库

```bash
git clone https://github.com/your-username/News.git
cd News
```

### 2. 安装依赖

```bash
# 安装主项目依赖
npm install

# 安装MCP服务器依赖
cd mcp-server
npm install
cd ..
```

### 3. 配置GitHub CLI（推荐）

```bash
# 安装GitHub CLI（macOS）
brew install gh

# 登录GitHub
gh auth login

# 选择：
# - GitHub.com
# - HTTPS
# - Yes（authenticate Git）
# - Login with a web browser
```

**或者使用Token方式（备选）：**

```bash
# 创建.env文件
cp .env.example .env

# 编辑.env，添加token
nano .env
# 填入：GITHUB_TOKEN=your_github_token_here
```

---

## 完整配置步骤

### 第一步：系统环境

**安装Node.js：**
```bash
# macOS
brew install node

# 验证
node --version  # 应该≥18.0
npm --version
```

**安装Git：**
```bash
# macOS
brew install git

# 验证
git --version
```

### 第二步：项目依赖

```bash
cd /path/to/News

# 主项目
npm install

# MCP服务器
cd mcp-server
npm install
cd ..
```

**依赖清单：**
- `marked`：Markdown解析
- `rss-parser`：RSS源抓取

### 第三步：GitHub认证配置

**方式A：GitHub CLI（推荐）**

```bash
# 安装
brew install gh

# 登录
gh auth login

# 测试
gh repo view
```

**方式B：Personal Access Token**

1. 生成Token：
   - 访问：https://github.com/settings/tokens
   - 点击"Generate new token (classic)"
   - 名称：`News Auto Push`
   - 勾选权限：`repo`（完整仓库访问）
   - 生成并复制token

2. 配置到本地：
```bash
# 创建.env文件（如果不存在）
cat > .env << 'EOF'
GITHUB_TOKEN=your_github_token_here
EOF

# 设置权限（重要！）
chmod 600 .env
```

3. 验证：
```bash
./scripts/auto-push.sh
```

### 第四步：配置GitHub Pages

1. 访问仓库设置：`https://github.com/your-username/News/settings/pages`
2. 配置：
   - **Source**: Deploy from a branch
   - **Branch**: master
   - **Folder**: /docs
3. 保存

**等待2-3分钟，网站将发布至：**
`https://your-username.github.io/News/`

### 第五步：验证配置

```bash
# 测试RSS抓取
cd mcp-server
node tools/fetch-rss.js all

# 测试网站构建
cd ..
npm run build

# 测试本地预览
npm run serve
# 访问：http://localhost:8080

# 测试Git推送
./scripts/auto-push.sh
```

---

## 配置文件说明

### `.env`（本地配置，不提交到Git）
```
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### `.gitignore`（已包含）
```
.env
node_modules/
*.log
```

### `mcp-server/config/rss-sources.json`（RSS源配置）
包含47个高质量RSS源，按5大主题分类。

### `mcp-server/config/evaluation-rules.json`（质量标准）
- 可信度阈值：0.85
- 最小长度：300字
- 必须包含技术细节和数据

---

## 常见问题

**Q1：GitHub CLI登录失败？**
- 确保网络连接正常
- 尝试：`gh auth refresh`
- 或使用Token方式（方式B）

**Q2：npm install失败？**
- 检查Node.js版本：`node --version`（需≥18.0）
- 清理缓存：`npm cache clean --force`
- 重试：`rm -rf node_modules && npm install`

**Q3：Git推送403错误？**
- 检查GitHub CLI登录：`gh auth status`
- 或检查Token权限（需要`repo`权限）
- 或手动推送：`git push origin master`

**Q4：网站无法访问？**
- 等待2-3分钟（GitHub Pages需要构建时间）
- 检查GitHub Pages设置
- 检查`docs/`目录是否有内容

**Q5：RSS抓取失败？**
- 检查网络连接
- 查看错误日志
- 某些RSS源可能暂时不可用（正常）

---

## 下一步

配置完成后，可以：

1. **执行自动化工作流：**
   ```
   在Cursor Chat中输入：
   @README.md 请执行今日AI资讯自动化分析工作流
   ```

2. **手动执行步骤：**
   参见 [WORKFLOW.md](./WORKFLOW.md)

3. **自定义配置：**
   - 添加RSS源：[RSS-SOURCES.md](./RSS-SOURCES.md)
   - 调整质量标准：`mcp-server/config/evaluation-rules.json`
   - 修改分析模板：`templates.md`

---

## 技术支持

遇到问题？

1. 查看 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. 查看 [FAQ.md](./FAQ.md)
3. 提交GitHub Issue

---

**配置完成！开始使用AI资讯自动化系统吧！** 🚀

