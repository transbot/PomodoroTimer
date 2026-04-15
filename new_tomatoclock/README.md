# 番茄钟应用程序

一个功能丰富的番茄工作法计时器，帮助您提高工作效率。

## 功能特性

- ? 可定制的工作/休息时间
- ? 详细的工作统计和图表
- ? 内置白噪音和背景音乐
- ? 任务管理功能
- ? 成就系统
- ? 数据持久化存储
- ? 响应式界面设计

## 安装指南

1. 克隆本仓库：
   ```bash
   git clone https://github.com/yourusername/tomatoclock.git
   cd tomatoclock
   ```

2. 安装依赖：
   ```bash
   pip install -r requirements.txt
   ```

3. 运行程序：
   ```bash
   python main.py
   ```

## 配置文件

配置文件位于 `config/settings.ini`，您可以修改以下设置：

- 工作时间/休息时间
- 默认音效
- 界面主题
- 数据存储位置

## 项目结构

```
new_tomatoclock/
├── main.py                # 程序入口
├── requirements.txt       # 依赖文件
├── README.md              # 项目说明
├── config/                # 配置文件
├── core/                  # 核心逻辑
├── models/                # 数据模型
├── utils/                 # 工具类
├── views/                 # 界面相关
└── tests/                 # 单元测试
```

## 贡献指南

欢迎提交Issue和Pull Request！

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 许可证

本项目采用 MIT 许可证 - 详情请见 [LICENSE](LICENSE) 文件
