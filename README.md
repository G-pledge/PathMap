[README.md](https://github.com/user-attachments/files/22041166/README.md)
# PathMap

PathMap 是一个 Chrome 扩展插件，用于提取页面中所有 URL 路径并进行标准化处理。

## 功能特点

- 提取页面中的所有 URL 路径
- 对提取的 URL 进行标准化处理
- 支持多种 URL 类型（静态资源、API 端点、导航链接等）
- 安全地构建 URL 参数，避免空值、null 或 undefined 参数

## 安装

1. 克隆或下载此仓库
2. 在 Chrome 浏览器中打开 `chrome://extensions/`
3. 启用 "开发者模式"
4. 点击 "加载已解压的扩展程序"
5. 选择项目中的 `dist` 目录

## 使用方法

1. 安装扩展后，点击浏览器工具栏中的 PathMap 图标
2. 扩展会自动提取当前页面的所有 URL 路径
3. 在弹出窗口中查看提取结果

## 构建发行版

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 混淆代码
npm run obfuscate

# 打包为 ZIP 文件
npm run package

# 一键构建发行版
npm run release
```

## 许可证

本项目采用 MIT 许可证。
