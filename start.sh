#!/bin/bash
# 小学数学题库 - Linux/Mac 启动脚本

set -e

echo ""
echo "============================================"
echo "  小学数学题库系统 - 1~2年级"
echo "============================================"
echo ""

# 检查 Python
if ! command -v python3 >/dev/null 2>&1; then
    echo "[X] 未检测到 python3，请先安装 Python 3.8+"
    echo "    Mac: brew install python3"
    echo "    Linux: sudo apt install python3 python3-pip python3-venv"
    exit 1
fi
echo "[✓] Python 已安装: $(python3 --version)"

cd "$(dirname "$0")/backend"

# 虚拟环境
if [ ! -d "venv" ]; then
    echo "[*] 创建虚拟环境..."
    python3 -m venv venv
fi

# 激活
source venv/bin/activate

# 依赖
echo "[*] 检查/安装依赖..."
pip install -q -r requirements.txt

echo ""
echo "============================================"
echo "  启动服务中..."
echo "  浏览器打开: http://127.0.0.1:5000"
echo "  按 Ctrl+C 停止"
echo "============================================"
echo ""

python app.py
