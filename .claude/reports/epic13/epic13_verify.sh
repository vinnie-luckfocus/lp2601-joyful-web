#!/bin/bash
# Epic 13 功能验证脚本
# 使用方法: ./epic13_verify.sh

PORT="/dev/cu.usbmodem101"
LOG_FILE="epic13_test_$(date +%Y%m%d_%H%M%S).log"

echo "=========================================="
echo "Epic 13 功能验证测试"
echo "=========================================="
echo ""
echo "固件已刷入: $PORT"
echo "日志保存: $LOG_FILE"
echo ""

# 检查依赖
check_dependency() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ 未找到 $1，请先安装"
        return 1
    fi
    echo "✅ $1 已安装"
    return 0
}

echo "检查依赖..."
check_dependency python3 || exit 1

# 检查串口
if [ ! -e "$PORT" ]; then
    echo "❌ 串口 $PORT 不存在"
    echo "可用串口:"
    ls /dev/cu.* 2>/dev/null | head -5
    exit 1
fi
echo "✅ 串口 $PORT 存在"

echo ""
echo "=========================================="
echo "测试 1: 基础启动验证"
echo "=========================================="
echo "请按回车开始监控串口（持续 15 秒）..."
read

# 使用 screen 或 minicom 进行监控
echo "启动串口监控，请观察："
echo "  - 设备是否正常启动（无 panic）"
echo "  - 提示音是否正常播放"
echo "  - LED 是否正常显示"
echo ""

# 尝试使用 minicom 或 screen
if command -v minicom &> /dev/null; then
    echo "使用 minicom 监控，按 Ctrl+A 然后 X 退出"
    minicom -D $PORT -b 115200 -C $LOG_FILE
elif command -v screen &> /dev/null; then
    echo "使用 screen 监控，按 Ctrl+A 然后 K 退出"
    screen -L -Logfile $LOG_FILE $PORT 115200
else
    echo "请手动运行以下命令监控串口："
    echo "  screen $PORT 115200"
    echo "  或"
    echo "  minicom -D $PORT -b 115200"
fi

echo ""
echo "=========================================="
echo "测试 2: 三击按键触发 BluFi"
echo "=========================================="
echo ""
echo "操作步骤："
echo "1. 等待设备完全启动"
echo "2. 快速连续短按按键 3 次（在 2 秒内）"
echo "3. 观察："
echo "   - LED 是否变为蓝色呼吸灯"
echo "   - 是否听到'正在配网'提示音"
echo "   - 串口日志是否显示 NET_EVT_START_BLUFI"
echo ""
echo "按回车继续..."
read

echo ""
echo "=========================================="
echo "测试 3: WiFi 密码日志脱敏"
echo "=========================================="
echo ""
echo "操作步骤："
echo "1. 在 BluFi 模式下，使用小程序配网"
echo "2. 观察串口日志"
echo "3. 确认日志中**没有** WiFi 密码明文"
echo ""
echo "验证命令（配网后在日志中搜索）："
echo "  grep -i 'password\\|passwd\\|pwd' $LOG_FILE"
echo "  预期: 无匹配或仅显示长度信息"
echo ""
echo "按回车继续..."
read

echo ""
echo "=========================================="
echo "测试 4: 30秒超时验证"
echo "=========================================="
echo ""
echo "操作步骤："
echo "1. 进入 BluFi 配网模式"
echo "2. 使用小程序配置**错误密码**的 WiFi"
echo "3. 观察串口日志，确认："
echo "   - 30 秒后显示 timeout 日志"
echo "   - 自动重试 3 次"
echo "   - 最终失败并播放'配网失败'提示音"
echo ""
echo "预期时间：约 90 秒（3 × 30s）"
echo ""
echo "按回车继续..."
read

echo ""
echo "=========================================="
echo "测试 5: BLE 互斥切换"
echo "=========================================="
echo ""
echo "操作步骤："
echo "1. 正常状态下，确认 BLE Central 在运行（日志中有扫描信息）"
echo "2. 三击进入 BluFi 模式"
echo "3. 观察日志中是否显示："
echo "   - ble_client_stop_complete"
echo "   - BT controller deinitialized"
echo "4. 配网完成后，观察是否自动恢复："
echo "   - ble_client_start_complete"
echo "   - BLE Central restarted"
echo ""
echo "按回车继续..."
read

echo ""
echo "=========================================="
echo "测试 6: 配网成功流程"
echo "=========================================="
echo ""
echo "操作步骤："
echo "1. 进入 BluFi 配网模式"
echo "2. 使用小程序配置**正确密码**的 WiFi"
echo "3. 观察："
echo "   - 小程序显示'配网成功'"
echo "   - 设备播放'配网成功'提示音"
echo "   - WiFi 连接成功，LED 变为联网状态"
echo "   - BLE Central 自动恢复"
echo ""
echo "按回车继续..."
read

echo ""
echo "=========================================="
echo "日志分析"
echo "=========================================="
echo ""
if [ -f "$LOG_FILE" ]; then
    echo "日志文件: $LOG_FILE"
    echo ""
    echo "关键日志统计："
    echo "  - 三击触发: $(grep -c 'triple-click\|3-click' $LOG_FILE 2>/dev/null || echo 0) 次"
    echo "  - BluFi 启动: $(grep -c 'BluFi.*start\|prov.*start' $LOG_FILE 2>/dev/null || echo 0) 次"
    echo "  - BluFi 停止: $(grep -c 'BluFi.*stop\|prov.*stop' $LOG_FILE 2>/dev/null || echo 0) 次"
    echo "  - 超时事件: $(grep -c 'timeout' $LOG_FILE 2>/dev/null || echo 0) 次"
    echo "  - WiFi 连接: $(grep -c 'WiFi connected\|connected to' $LOG_FILE 2>/dev/null || echo 0) 次"
    echo "  - BLE 停止: $(grep -c 'ble_client_stop_complete\|BLE.*stop' $LOG_FILE 2>/dev/null || echo 0) 次"
    echo "  - BLE 启动: $(grep -c 'ble_client_start_complete\|BLE.*start' $LOG_FILE 2>/dev/null || echo 0) 次"
    echo ""
    echo "密码安全检查："
    PASSWORD_COUNT=$(grep -ic 'password.*=\|passwd.*=\|pwd.*=' $LOG_FILE 2>/dev/null || echo 0)
    if [ "$PASSWORD_COUNT" -eq 0 ]; then
        echo "  ✅ 未发现密码明文日志"
    else
        echo "  ⚠️ 发现 $PASSWORD_COUNT 处可能的密码日志，请检查："
        grep -in 'password.*=\|passwd.*=\|pwd.*=' $LOG_FILE | head -5
    fi
else
    echo "未找到日志文件"
fi

echo ""
echo "=========================================="
echo "验证完成！"
echo "=========================================="
echo ""
echo "请根据实际测试结果填写 test_report.md"
echo ""
