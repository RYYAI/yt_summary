# YouTube 视频要点总结

一个edge浏览器扩展，可以自动获取 YouTube 视频字幕并使用 AI 生成视频内容要点总结。

## 功能特点

- 自动获取 YouTube 视频字幕
- 使用 AI 模型分析视频内容
- 生成简洁的中文要点总结
- 支持自定义 LLM API 配置
- 实时跟随视频切换更新总结

## 安装方法

1. 下载本项目代码
2. 打开浏览器的扩展管理页面
   - Edge: `edge://extensions/`
   - Chrome: `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载解压缩的扩展"
5. 选择项目文件夹

## 配置说明

首次使用需要配置 LLM API 信息：

1. 右键点击扩展图标，选择"扩展选项"
2. 填写以下信息：
   - API 地址
   - API Key
   - 模型名称
   - 温度值（可选，默认0.3）
3. 点击保存

## 使用方法

1. 打开任意 YouTube 视频页面
2. 插件会自动获取视频字幕并生成总结
3. 页面右侧会显示视频要点总结
4. 切换视频时会自动更新总结内容

## 注意事项

- 仅支持带有字幕的 YouTube 视频
- 需要配置有效的 LLM API 信息才能使用
- 总结生成可能需要一定时间，请耐心等待
- 建议使用支持中文的 LLM 模型以获得更好的效果

## 技术栈

- JavaScript
- Chrome Extension API
- YouTube API
- LLM API

## 许可证

MIT License

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 联系方式

如有问题或建议，欢迎提交 Issue。