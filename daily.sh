#!/bin/bash

# AI 资讯收集每日自动化脚本
# 使用方法：./daily.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# 获取今日日期
TODAY=$(date +%Y-%m-%d)

echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   AI 资讯收集 - 每日工作流自动化     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
info "📅 日期：$TODAY"
echo ""

# Step 1: 创建今日文件夹
info "Step 1: 检查/创建今日文件夹"
if [ -d "$TODAY" ]; then
    warning "文件夹已存在：$TODAY"
else
    mkdir -p "$TODAY"
    success "创建文件夹：$TODAY"
fi

# 创建所有分类的空文件（如果不存在）
categories=("ai-programming" "ai-products" "tech-general")
category_names=("AI编程" "AI产品" "科技综合")

for i in "${!categories[@]}"; do
    category="${categories[$i]}"
    name="${category_names[$i]}"
    file="$TODAY/${category}.md"
    
    if [ ! -f "$file" ]; then
        echo "# ${name}资讯汇总" > "$file"
        echo "" >> "$file"
        info "创建文件：$file"
    fi
done

echo ""

# Step 2: 提示用户收集资讯
echo -e "${YELLOW}╔════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║       📰 请完成资讯收集和分析         ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}"
echo ""
echo "在 Cursor 中执行以下步骤："
echo ""
echo -e "${GREEN}1. 收集资讯（从以下来源）：${NC}"
echo "   • 机器之心、量子位、36氪"
echo "   • TechCrunch、The Verge"
echo "   • OpenAI Blog、GitHub Blog"
echo ""
echo -e "${GREEN}2. 在 Cursor Chat 中分析资讯：${NC}"
echo "   ${BLUE}@AI-ANALYSIS-GUIDE.md${NC}"
echo "   请分析以下资讯："
echo "   [粘贴资讯内容]"
echo ""
echo -e "${GREEN}3. 保存分析结果到对应文件：${NC}"
echo "   • AI编程 → $TODAY/ai-programming.md"
echo "   • AI产品 → $TODAY/ai-products.md"
echo "   • 科技综合 → $TODAY/tech-general.md"
echo ""
echo -e "${YELLOW}💡 提示：AI编程相关资讯是重点！${NC}"
echo ""
read -p "完成资讯收集后，按 Enter 继续..." dummy

# Step 3: 检查是否有实际内容
echo ""
info "Step 3: 检查资讯内容"
has_content=false

for i in "${!categories[@]}"; do
    category="${categories[$i]}"
    name="${category_names[$i]}"
    file="$TODAY/${category}.md"
    
    # 检查文件是否存在且大于100字节（排除仅有标题的文件）
    if [ -f "$file" ]; then
        size=$(wc -c < "$file" | tr -d ' ')
        if [ "$size" -gt 200 ]; then
            success "✓ ${name}：有内容 (${size} 字节)"
            has_content=true
        else
            warning "✗ ${name}：内容太少或为空"
        fi
    fi
done

echo ""

if [ "$has_content" = false ]; then
    error "没有检测到任何资讯内容！"
    echo ""
    read -p "是否继续？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        warning "已取消"
        exit 0
    fi
fi

# Step 4: 生成静态网站
echo ""
info "Step 4: 生成静态网站"
if npm run build; then
    success "网站生成成功！"
else
    error "网站生成失败！"
    exit 1
fi

echo ""

# Step 5: 本地预览（可选）
read -p "是否本地预览网站？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    info "启动本地服务器..."
    echo ""
    echo -e "${GREEN}🌐 在浏览器中打开：${NC} http://localhost:8080"
    echo -e "${YELLOW}按 Ctrl+C 停止服务器${NC}"
    echo ""
    
    # 使用 Python 启动简单的 HTTP 服务器
    cd docs
    python3 -m http.server 8080 || python -m SimpleHTTPServer 8080
    cd ..
fi

# Step 6: Git 提交和推送
echo ""
read -p "是否提交并推送到 GitHub？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    info "Step 6: Git 提交和推送"
    
    # 检查 Git 状态
    if ! git diff --quiet || ! git diff --cached --quiet; then
        git add .
        git commit -m "Add AI news for $TODAY"
        
        if git push origin master; then
            success "推送成功！"
            echo ""
            echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
            echo -e "${GREEN}║         🎉 发布成功！                  ║${NC}"
            echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
            echo ""
            echo "📡 GitHub Actions 正在自动部署..."
            echo "🌐 约 2-3 分钟后访问："
            echo -e "   ${BLUE}https://your-username.github.io/News/${NC}"
            echo ""
            echo "💡 可以在 GitHub Actions 页面查看部署状态"
        else
            error "推送失败！请检查网络或权限"
            exit 1
        fi
    else
        warning "没有变更需要提交"
    fi
else
    warning "已跳过 Git 推送"
    echo ""
    echo "稍后可以手动推送："
    echo -e "${BLUE}git add . && git commit -m \"Add news for $TODAY\" && git push${NC}"
fi

echo ""
success "今日工作流程完成！"
echo ""
echo -e "${BLUE}📊 统计信息：${NC}"
echo "   • 日期：$TODAY"
echo "   • 文件夹：$TODAY/"

# 统计各分类的资讯数量
for i in "${!categories[@]}"; do
    category="${categories[$i]}"
    name="${category_names[$i]}"
    file="$TODAY/${category}.md"
    
    if [ -f "$file" ]; then
        # 统计分隔符数量（即资讯条数）
        count=$(grep -c "^---$" "$file" || echo "0")
        if [ "$count" -gt 0 ]; then
            echo "   • ${name}：${count} 条"
        fi
    fi
done

echo ""
echo -e "${GREEN}🚀 明天见！${NC}"
echo ""

