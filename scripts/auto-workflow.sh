#!/bin/bash

# AI 资讯全自动化工作流
# 包含：RSS抓取 -> 处理过滤 -> 智能补充 -> 高影响力扩展 -> 静态网站生成 -> 推送发布
# 使用方法：./scripts/auto-workflow.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取脚本所在目录的父目录（项目根目录）
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

cd "$PROJECT_ROOT"

# 获取当前日期
DATE=$(date +%Y-%m-%d)

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🤖 AI 资讯全自动化工作流${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}📅 目标日期: ${DATE}${NC}"
echo ""

# ============================================================
# 步骤 1: 抓取 RSS 资讯
# ============================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}[1/7] 📡 抓取 RSS 资讯${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd mcp-server
if node tools/fetch-rss.js all; then
    echo -e "${GREEN}✓ RSS 抓取成功${NC}"
else
    echo -e "${RED}✗ RSS 抓取失败${NC}"
    exit 1
fi
cd ..

echo ""

# ============================================================
# 步骤 2: 处理和过滤资讯
# ============================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}[2/7] 🔍 处理和过滤资讯（去重 + 可信度评估）${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd mcp-server
RSS_FILE="data/rss-fetch-${DATE}.json"

if [ ! -f "$RSS_FILE" ]; then
    echo -e "${RED}✗ 未找到 RSS 抓取结果文件: ${RSS_FILE}${NC}"
    exit 1
fi

if node tools/process-rss-data.js "$RSS_FILE"; then
    echo -e "${GREEN}✓ 资讯处理成功${NC}"
else
    echo -e "${RED}✗ 资讯处理失败${NC}"
    exit 1
fi
cd ..

echo ""

# ============================================================
# 步骤 3: 智能补充分析
# ============================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}[3/7] 🧠 智能补充分析${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd mcp-server
PROCESSED_FILE="data/processed-rss-${DATE}.json"

if [ ! -f "$PROCESSED_FILE" ]; then
    echo -e "${YELLOW}⚠ 未找到处理后的文件，跳过智能补充${NC}"
else
    # 运行智能补充分析，捕获退出码
    node tools/intelligent-supplement.js "$PROCESSED_FILE" || SUPPLEMENT_EXIT=$?
    
    if [ "${SUPPLEMENT_EXIT:-0}" -eq 2 ]; then
        echo -e "${YELLOW}📝 检测到需要补充的类目，建议在 Cursor Chat 中执行 web_search${NC}"
        echo -e "${YELLOW}   查看文件: mcp-server/data/supplement-suggestions-${DATE}.json${NC}"
    elif [ "${SUPPLEMENT_EXIT:-0}" -eq 0 ]; then
        echo -e "${GREEN}✓ 所有类目资讯充足，无需补充${NC}"
    else
        echo -e "${RED}✗ 智能补充分析失败${NC}"
        exit 1
    fi
fi
cd ..

echo ""

# ============================================================
# 步骤 4: 高影响力资讯扩展分析
# ============================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}[4/7] 🌟 高影响力资讯扩展分析${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd mcp-server
if [ ! -f "$PROCESSED_FILE" ]; then
    echo -e "${YELLOW}⚠ 未找到处理后的文件，跳过扩展分析${NC}"
else
    # 运行扩展分析，捕获退出码
    node tools/expand-important-news.js "$PROCESSED_FILE" || EXPANSION_EXIT=$?
    
    if [ "${EXPANSION_EXIT:-0}" -eq 2 ]; then
        echo -e "${YELLOW}📝 检测到高影响力资讯，建议在 Cursor Chat 中执行深度分析${NC}"
        echo -e "${YELLOW}   查看文件: mcp-server/data/expansion-suggestions-${DATE}.json${NC}"
    elif [ "${EXPANSION_EXIT:-0}" -eq 0 ]; then
        echo -e "${GREEN}✓ 无需扩展或资讯已充足${NC}"
    else
        echo -e "${RED}✗ 扩展分析失败${NC}"
        exit 1
    fi
fi
cd ..

echo ""

# ============================================================
# 步骤 5: 检查AI深度分析需求
# ============================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}[5/7] 🎯 检查AI深度分析需求${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 检查是否有建议文件
HAS_SUGGESTIONS=false
SUGGESTION_FILES=""
cd mcp-server
if [ -f "data/supplement-suggestions-${DATE}.json" ]; then
    HAS_SUGGESTIONS=true
    SUGGESTION_FILES="${SUGGESTION_FILES}mcp-server/data/supplement-suggestions-${DATE}.json "
fi
if [ -f "data/expansion-suggestions-${DATE}.json" ]; then
    HAS_SUGGESTIONS=true
    SUGGESTION_FILES="${SUGGESTION_FILES}mcp-server/data/expansion-suggestions-${DATE}.json "
fi
cd ..

if [ "$HAS_SUGGESTIONS" = true ]; then
    echo -e "${YELLOW}📋 检测到需要AI处理的建议文件${NC}"
    echo -e "${YELLOW}   文件: ${SUGGESTION_FILES}${NC}"
    echo ""
    echo -e "${GREEN}✓ 工作流脚本执行完成${NC}"
    echo -e "${YELLOW}📝 后续步骤：请AI Agent继续处理（自动触发）${NC}"
else
    echo -e "${GREEN}✓ 无需AI深度分析，可直接生成网站${NC}"
fi

echo ""

# ============================================================
# 步骤 6: 生成静态网站
# ============================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}[6/7] 🌐 生成静态网站${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if npm run build; then
    echo -e "${GREEN}✓ 静态网站生成成功${NC}"
else
    echo -e "${RED}✗ 静态网站生成失败${NC}"
    exit 1
fi

echo ""

# ============================================================
# 步骤 7: 推送到 GitHub
# ============================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}[7/7] 🚀 推送到 GitHub${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if ./scripts/auto-push.sh; then
    echo -e "${GREEN}✓ 推送成功${NC}"
else
    echo -e "${RED}✗ 推送失败${NC}"
    exit 1
fi

echo ""

# ============================================================
# 完成
# ============================================================
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ 全自动化工作流完成！${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}📊 工作流总结：${NC}"
echo -e "  ✓ RSS 资讯抓取"
echo -e "  ✓ 去重和可信度评估"
echo -e "  ✓ 智能补充分析"
echo -e "  ✓ 高影响力资讯扩展分析"
if [ "$HAS_SUGGESTIONS" = true ]; then
    echo -e "  ${YELLOW}⊳ 建议文件已生成，等待AI Agent处理${NC}"
else
    echo -e "  ✓ 无需AI处理"
fi
echo -e "  ✓ 静态网站生成"
echo -e "  ✓ GitHub 推送"
echo ""
echo -e "${GREEN}🌐 网站地址: https://zhipingyang.github.io/News/${NC}"
echo -e "${GREEN}📅 本次更新日期: ${DATE}${NC}"
echo ""

# 输出AI Agent提示信息
if [ "$HAS_SUGGESTIONS" = true ]; then
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}🤖 AI Agent 后续任务${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}检测到建议文件，AI Agent请继续执行：${NC}"
    echo ""
    echo -e "1. 读取建议文件："
    echo -e "   ${SUGGESTION_FILES}"
    echo ""
    echo -e "2. 对每个搜索查询执行 @web_search"
    echo ""
    echo -e "3. 对搜索结果使用 MCP 工具："
    echo -e "   • evaluate_content - 评估内容质量"
    echo -e "   • process_news - 添加到对应类目"
    echo ""
    echo -e "4. 完成后重新生成网站："
    echo -e "   npm run build && ./scripts/auto-push.sh"
    echo ""
    echo -e "${GREEN}提示: AI Agent会自动处理这些步骤${NC}"
    echo ""
fi

