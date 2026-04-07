# Epic 13 功能验证测试报告

**测试日期**: 2026-03-23
**测试人员**: TDD Agent
**固件版本**: Epic 13 合并版本 (b2f4319)
**硬件**: ZXAIEC43A (WTAIEC43A 开发板)
**串口**: /dev/cu.usbmodem101

---

## 测试环境

```bash
# 串口监控命令
idf.py -p /dev/cu.usbmodem101 monitor

# 或 minicom
minicom -D /dev/cu.usbmodem101 -b 115200
```

---

## 功能测试清单

### 1. ✅ 基础启动测试

**测试步骤**:
1. 接通电源或复位设备
2. 观察串口启动日志

**预期结果**:
- 设备正常启动，无 panic
- LED 状态指示正常（启动时蓝色/白色闪烁）
- 提示音响起（开机音乐）

**验证命令**:
```bash
# 检查启动日志中无错误
grep -i "error\|panic\|failed" monitor.log | head -5
```

---

### 2. ✅ WiFi 密码日志脱敏验证

**测试步骤**:
1. 通过小程序配网（任意 WiFi）
2. 检查串口日志

**预期结果**:
- 日志中**不应**出现 WiFi 密码明文
- 应显示 `(SSID: xxx)` 但不显示密码

**验证方法**:
```bash
# 在串口日志中搜索敏感关键词
grep -i "password\|passwd\|pwd\|密码" monitor.log
# 预期: 无匹配或仅显示长度/占位符
```

**代码验证点**:
- `qmsd_prov_blufi.c:167` - 接收凭证时不打印密码
- `qmsd_prov_blufi.c:177` - 存储凭证时不打印密码

---

### 3. ✅ 三击按键触发 BluFi 配网

**测试步骤**:
1. 等待设备完全启动
2. 快速连续短按按键 3 次（在 2 秒内完成）
3. 观察 LED 和提示音

**预期结果**:
- 听到"正在配网"提示音
- LED 变为 BluFi 配网状态（蓝色呼吸灯）
- 串口日志显示 `NET_EVT_START_BLUFI`

**串口日志预期**:
```
I (xxxxx) main: Triple-click detected
I (xxxxx) main: Starting BluFi provisioning
I (xxxxx) blufi_prov: BLE Central stopped, starting BluFi
```

**测试边界**:
- 双击：不应触发配网
- 四击：应视为有效（≥3 击）
- 间隔 >2s：应重置计数

---

### 4. ✅ BLE Central / BluFi 互斥切换

**测试步骤**:
1. 先确保 BLE Central 正在运行（连接或未连接状态）
2. 三击进入 BluFi 配网模式
3. 完成配网或取消配网
4. 观察 BLE Central 是否恢复

**预期结果**:
- BluFi 启动前：BLE Central 完全停止（调用 `ble_client_stop_complete()`）
- BluFi 停止后：BLE Central 自动重启（调用 `ble_client_start_complete()`）

**串口日志预期**:
```
# 进入 BluFi
I (xxxxx) dev_ble: Stopping BLE Central complete
I (xxxxx) dev_ble: BT controller deinitialized
I (xxxxx) blufi_prov: BluFi provisioning started

# 退出 BluFi
I (xxxxx) blufi_prov: BluFi provisioning stopped
I (xxxxx) dev_ble: BT controller reinitialized
I (xxxxx) dev_ble: BLE Central restarted, scanning...
```

**状态验证**:
```bash
# 检查 BLE 状态转换
grep "ble_client_stop_complete\|ble_client_start_complete\|BluFi.*start\|BluFi.*stop" monitor.log
```

---

### 5. ✅ BLE 暂停状态（不重扫）

**测试步骤**:
1. 进入 BluFi 配网模式
2. 等待 30 秒（观察期间 BLE 不应自动恢复）
3. 检查 dev_ble 状态

**预期结果**:
- BluFi 期间 BLE Central 保持停止状态
- 不会自动恢复扫描
- 状态机显示 `BLE_CLIENT_PAUSED` 或类似暂停状态

---

### 6. ✅ 30 秒 WiFi 连接超时

**测试步骤**:
1. 进入 BluFi 配网模式
2. 使用小程序配置**错误密码**的 WiFi
3. 观察连接过程

**预期结果**:
- 连接尝试 30 秒后超时
- 自动重试（最多 3 次）
- 3 次失败后播放"配网失败"提示音
- 总时间约 90 秒（3 × 30s）

**串口日志预期**:
```
W (xxxxx) qmsd_network: Wi-Fi connect timeout (30s)
W (xxxxx) qmsd_network: Connect attempt 1 timed out
W (xxxxx) qmsd_network: Connect attempt 2 timed out
W (xxxxx) qmsd_network: Connect attempt 3 timed out
E (xxxxx) qmsd_network: Wi-Fi connect failed after 3 attempts
```

**计时验证**:
```bash
# 从配网完成到失败提示的时间戳差
# 应在 85-95 秒之间
```

---

### 7. ✅ 配网成功流程

**测试步骤**:
1. 进入 BluFi 配网模式
2. 使用小程序配置**正确密码**的 WiFi
3. 观察完整流程

**预期结果**:
- 小程序显示"配网成功"
- 设备播放"配网成功"提示音
- WiFi 连接成功，LED 变为联网状态
- BLE Central 自动恢复

**串口日志预期**:
```
I (xxxxx) qmsd_prov_blufi: Wi-Fi credentials received (SSID: xxx)
I (xxxxx) qmsd_network: Connecting to WiFi...
I (xxxxx) qmsd_network: WiFi connected
I (xxxxx) chat_notify: Playing NOTIFY_NET_SUCCESS
I (xxxxx) dev_ble: BLE Central restarted
```

---

### 8. ✅ 提示音播放验证

**测试步骤**:
监听以下场景提示音：

| 场景 | 预期提示音 | 验证 |
|------|-----------|------|
| 三击进入配网 | net_configuring.mp3 | 听到"正在配网" |
| 配网成功 | net_config_ok.mp3 | 听到"配网成功" |
| 配网失败 | net_config_fail.mp3 | 听到"配网失败" |

**代码验证点**:
- `chat_notify.h` - 包含 `NOTIFY_NET_CONFIG`, `NOTIFY_NET_SUCCESS`, `NOTIFY_NET_FAIL` 枚举
- `chat_notify_list.c` - 映射到正确音频文件

---

### 9. ✅ NVS 加密存储验证（间接）

**测试步骤**:
1. 完成配网
2. 断电重启设备
3. 观察是否自动连接 WiFi（无需再次配网）

**预期结果**:
- 重启后自动连接已保存的 WiFi
- 提示音：播放已连接提示

**说明**: NVS 加密内容无法直接通过串口验证，但可以通过以下方式确认：
- 查看 sdkconfig 中 `CONFIG_NVS_ENCRYPTION=y`
- 查看 partitions.csv 中 `nvs_keys` 分区存在

---

### 10. ✅ 小程序配网成功率

**测试步骤**:
重复配网测试 5-10 次，记录成功率

**预期结果**:
- 成功率 > 95%
- 每次配网时间 < 30 秒（正确密码情况）

**测试记录表**:

| 次数 | 结果 | 耗时 | 备注 |
|------|------|------|------|
| 1 | ⬜ | - | |
| 2 | ⬜ | - | |
| 3 | ⬜ | - | |
| 4 | ⬜ | - | |
| 5 | ⬜ | - | |

---

## 测试执行状态

| 测试项 | 状态 | 执行时间 | 备注 |
|--------|------|----------|------|
| 1. 基础启动 | ⬜ | - | |
| 2. 日志脱敏 | ⬜ | - | |
| 3. 三击触发 | ⬜ | - | |
| 4. BLE 互斥 | ⬜ | - | |
| 5. BLE 暂停 | ⬜ | - | |
| 6. 30秒超时 | ⬜ | - | |
| 7. 配网成功 | ⬜ | - | |
| 8. 提示音 | ⬜ | - | |
| 9. NVS 加密 | ⬜ | - | |
| 10. 成功率 | ⬜ | - | |

---

## 问题记录

| 问题描述 | 严重程度 | 复现步骤 | 日志片段 |
|----------|----------|----------|----------|
| - | - | - | - |

---

## 结论

**总体状态**: ⬜ 通过 / ⬜ 部分通过 / ⬜ 失败

**通过项**: x/10
**失败项**: x/10
**跳过项**: x/10

**建议**:
- ...

---

## 附录：快速测试命令

```bash
# 1. 启动串口监控
idf.py -p /dev/cu.usbmodem101 monitor

# 2. 只过滤关键日志
idf.py -p /dev/cu.usbmodem101 monitor | grep -E "main|blufi|network|dev_ble|chat_notify"

# 3. 保存日志到文件
idf.py -p /dev/cu.usbmodem101 monitor 2>&1 | tee epic13_test.log

# 4. 分析日志
grep -E "triple-click|BluFi|timeout|connected|failed" epic13_test.log
```
