# Astra 博客

该项目由 [0xdres/astro-devosfera](https://github.com/0xdres/astro-devosfera)（MIT 许可证）分支而来，并经过修改以适配本地化，同时加入了我感兴趣的其他一些功能和改进。

---

## 本项目新增内容（相对原始 astro-devosfera）

- 新增页面：`/time` 片刻（短内容流、分页、标签筛选、九宫格图片、B 站嵌入）
- 重新设计页面：`/about`（保留 aurora hero，加入 Minecraft、音乐、剧集模块）
- 新增`EntryEmbed`组件，支持在博客页面插入其它博客文章或者片刻内容并跳转
---

## 目录

1. [功能](#features)
2. [项目结构](#project-structure)
3. [安装与本地开发](#installation-local)
4. [常用命令](#commands)
5. [内容创建](#creating-content)
   - [文章](#posts)
   - [片刻](#moments)
   - [图片画廊](#galleries)
6. [GalleryEmbed 组件](#gallery-embed)
7. [EntryEmbed 组件](#entry-embed)
8. [关键组件](#key-components)
10. [许可证](#license)

---


<a id="project-structure"></a>
## 项目结构

```
/
|-- public/
|   |-- audio/              # 音频文件（intro 等）
|   |-- images/             # 公共图片资源
|   `-- pagefind/           # 搜索索引（构建产物）
|-- src/
|   |-- assets/             # 本地字体、SVG 图标与 Logo
|   |-- components/         # 可复用 Astro 组件
|   |-- data/
|   |   |-- blog/            # 文章 .md / .mdx
|   |   |-- time/            # 片刻 .md
|   |   `-- galleries/       # 画廊（每个相册一个文件夹）
|   |-- layouts/            # 根布局、PostDetails 等
|   |-- pages/              # Astro 路由
|   |-- styles/             # global.css, typography.css
|   `-- utils/              # 过滤、Satori OG、Shiki 变换器
`-- astro.config.ts
```

---

<a id="installation-local"></a>
## 安装与本地开发

**要求：** Node.js 20+ 与 pnpm。

```bash
# 1. 安装依赖
pnpm install

# 2. 启动开发服务器
pnpm run dev
# -> http://localhost:4321
```

Pagefind 搜索索引 **仅在生产构建中生成**。本地测试方式：

```bash
pnpm run build && pnpm run preview
```

### Docker

```bash
docker build -t devosfera-blog .
docker run -p 4321:80 devosfera-blog
```

---

<a id="commands"></a>
## 常用命令

| 命令               | 说明                                                |
| :----------------- | :-------------------------------------------------- |
| `pnpm install`     | 安装依赖                                            |
| `pnpm run dev`     | 本地开发服务器（`localhost:4321`）                  |
| `pnpm run build`   | 生产构建（`astro check` + build + Pagefind）        |
| `pnpm run preview` | 预览生产构建                                        |
| `pnpm run format`  | 使用 Prettier 格式化                                |
| `pnpm run lint`    | 使用 ESLint 检查                                    |

> `pnpm run build` 内部会执行 `pagefind --site dist && cp -r dist/pagefind public/`，搜索索引生成到 `public/pagefind/`。

---

<a id="creating-content"></a>
## 内容创建

<a id="posts"></a>
### 文章（`src/data/blog/`）

创建 `.md` 或 `.mdx` 文件并设置如下 frontmatter：

```yaml
---
title: "Post title"
pubDatetime: 2026-01-15T10:00:00Z   # 必填 - ISO 8601（含时区）
description: "Short description for SEO and cards"
tags: ["astro", "dev"]
featured: false       # 首页精选
draft: false          # 生产环境隐藏
timezone: "America/Guatemala"  # 覆盖 SITE.timezone
hideEditPost: false
---
```

**MDX：** 可直接使用 JSX 组件。`<GalleryEmbed>` 无需导入即可使用（见下节）。

**目录：** 在正文中加入 `## Table of contents` 可自动生成 TOC（`remark-toc` + `remark-collapse`）。

**注释式代码块**（Shiki 变换器）：

```
// [!code highlight]      -> 高亮行
// [!code ++]             -> 新增行（diff）
// [!code --]             -> 删除行（diff）
// fileName: file.ts      -> 在代码块上方显示文件名
```

---

<a id="moments"></a>
### 片刻（`src/data/time/`）

在 `src/data/time/` 下新增 `.md` 文件：

```yaml
---
title: "标题（可选）"
pubDatetime: 2025-03-02T18:30:00+08:00
tags:
  - 随想
  - 记录
location: "成都"
---
```

- 正文中的图片链接（`![]()`）会自动汇总为九宫格（最多 9 张）
- 支持 B 站视频嵌入：`{video:bilibili}(BV1jt4y1u7Hq)`
- 页面支持分页与标签筛选

---

<a id="galleries"></a>
### 图片画廊（`src/data/galleries/`）

创建一个 **文件夹** 作为画廊，内部包含 `index.md` 与图片文件：

```
src/data/galleries/
`-- my-trip-to-tokyo/
    |-- index.md
    |-- 01-shibuya.jpg
    |-- 02-asakusa.jpg
    `-- 03-fuji.png
```

文件夹名对应 URL：`/galleries/my-trip-to-tokyo`。

图片将 **按字母排序** 显示，可用数字前缀（`01-`, `02-`）控制顺序。

#### 画廊 frontmatter

```yaml
---
title: "My Trip to Tokyo"           # 必填
description: "Travel photos..."     # 必填
pubDatetime: 2026-01-20T00:00:00Z   # 必填
draft: false
coverImage: ./01-shibuya.jpg        # 可选 - 显式封面
tags:
  - japan
  - travel
---
```

> 画廊没有正文内容；展示内容来自该文件夹内的图片。

#### 封面图

- **有 `coverImage`**：Astro 解析并优化相对路径；若该图片已在文件夹内，则详情页不会重复展示。
- **无 `coverImage`**：列表卡片默认取字母排序第一张图。

#### 自动 alt 文本

alt 文本由文件名推导：

```
01-sunset-kyoto.jpg     -> "Sunset Kyoto"
002_fuji_mountain.png   -> "Fuji Mountain"
IMG_4532.JPG            -> 画廊标题（兜底）
```

---

<a id="gallery-embed"></a>
## GalleryEmbed 组件

在任意 `.mdx` 中嵌入画廊，**无需导入**：

```mdx
{/* 前 6 张，3 列（默认） */}
<GalleryEmbed slug="my-trip-to-tokyo" />

{/* 仅 4 张，2 列，不显示底部链接 */}
<GalleryEmbed slug="my-trip-to-tokyo" limit={4} cols={2} showLink={false} />

{/* 全部图片 */}
<GalleryEmbed slug="my-trip-to-tokyo" limit={0} />
```

| 属性       | 类型         | 默认值 | 说明                                   |
| :--------- | :----------- | :----- | :------------------------------------- |
| `slug`     | `string`     | -      | **必填**，`src/data/galleries/` 文件夹 |
| `limit`    | `number`     | `6`    | 最大图片数量，`0` 表示全部             |
| `showLink` | `boolean`    | `true` | 是否显示跳转到画廊页的链接             |
| `cols`     | `2 \| 3 \| 4` | `3`    | 网格列数                               |

每个 `<GalleryEmbed>` 都会创建独立的 lightbox `<dialog id="ge-lb-{slug}">`，支持 **同一篇文章多次嵌入**，互不冲突。无效 slug 会渲染警告块，不影响构建。

---

<a id="entry-embed"></a>
## EntryEmbed 组件

在任意 `.mdx` 中引用博客或片刻内容的小卡片，点击 **新开页** 跳转到对应文章或片刻位置。

```mdx
{/* 引用博客（默认 type=blog） */}
<EntryEmbed slug="ai-code-think" />

{/* 引用片刻 */}
<EntryEmbed type="time" slug="like" />

{/* 支持子目录与自定义标签显示 */}
<EntryEmbed type="blog" slug="notes/my-post" showTags={false} />
```

| 属性       | 类型               | 默认值  | 说明 |
| :--------- | :----------------- | :------ | :--- |
| `type`     | `blog \| time`     | `blog`  | 选择引用博客或片刻 |
| `slug`     | `string`           | -       | **必填**，文件名或相对路径，支持 `.md/.mdx` 省略 |
| `showTags` | `boolean`          | `true`  | 是否显示标签 chips |

说明：
- `slug` 需对应 `src/data/blog/` 或 `src/data/time/` 下的文件（支持子目录）
- 片刻会跳转到 `/time` 对应分页并定位到锚点
- 若片刻为草稿或未出现在时间流中，会渲染提示块

---

<a id="key-components"></a>
## 关键组件

| 组件                    | 说明                                                                 |
| :---------------------- | :------------------------------------------------------------------- |
| `Header.astro`          | 玻璃拟态导航、动画 Logo、`⌘K` 触发器、全屏移动端菜单                 |
| `SearchModal.astro`     | 全局 Cmd+K 搜索弹窗、极光背景、响应光晕、Pagefind 搜索               |
| `GalleryCard.astro`     | `/galleries` 列表卡片，优化封面图                                    |
| `GalleryEmbed.astro`    | MDX 画廊嵌入，独立 lightbox                                          |
| `Card.astro`            | 文章卡片，响应光晕（`.card-glow-effect`）                            |
| `BackToTopButton.astro` | 固定按钮 + SVG 进度环，统一移动端/桌面样式                           |
| `BackButton.astro`      | 玻璃拟态返回胶囊，内联面包屑与箭头动画                               |
| `ShareLinks.astro`      | 方形玻璃拟态分享按钮，默认新标签打开                                 |
| `Footer.astro`          | 品牌区 + 社交链接 + 版权信息 + 渐变分隔线                            |

---

<a id="license"></a>
## 许可证

基于 [astro-devosfera](https://github.com/0xdres/astro-devosfera)（作者 [0xdres](https://github.com/0xdres)），许可证 MIT。  
自定义部分 © hewenkkkkk。
