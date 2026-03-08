---
title: "代码贡献-PR"
description: "前言 新手如和向Github上面的开源项目提交pr呢，在逛掘金的时候看到一个开源的项目，借此写一篇PR的博客。面向新手 项目地址 Fork代码 打开选择的开源项目并在右上角点击“Fork”将代码复制到自己的仓库。 Clone仓库 将自己的仓"
pubDatetime: 2023-06-23T16:26:50Z
tags: 
  - 技术
draft: false
---

# 前言

新手如和向Github上面的开源项目提交pr呢，在逛掘金的时候看到一个开源的项目，借此写一篇PR的博客。面向新手 [项目地址](https://github.com/nagq/touch-fish)

# Fork代码

打开选择的开源项目并在右上角点击“Fork”将代码复制到自己的仓库。

![](https://pic.lamper.top/wp/2023/06/Snipaste_2023-06-23_23-53-02.webp)

# Clone仓库

将自己的仓库克隆到本地电脑，在自己的仓库界面中，点击“Code”按钮，复制自己仓库的URL。

本地创建一个文件夹，打开终端输入git clone <URL>。

# 创建新分支

在本地的仓库中创建新的分支，修改代码等就在这个分支进行修改。

在终端中输入git checkout -b <branch-name>即可创建并切换到新的分支。

# 进行修改

不用多说，用你灵动的双手敲击键盘来创造新的code吧！

# 提交

使用git add .命令将更改添加到暂存区，然后使用git commit -m "<message>"命令提交更改。

# 推送

使用git push origin <branch-name>命令将新分支推送到自己的仓库

# 创建Pull Request

在自己的仓库页面，点击“Compare & pull request”按钮，创建pull request。填写标题和描述，然后点击“Create pull request”按钮。

到此为止，我们的工作就算完成了，之后等待项目维护者的审核并合并即可。

![](https://pic.lamper.top/wp/2023/06/Snipaste_2023-06-24_00-09-06.webp)

![](https://pic.lamper.top/wp/2023/06/Snipaste_2023-06-24_00-09-56.webp)

# 更新仓库

如果我们的pull被接受了并且合并到了主分支中，在本地仓库使用git fetch upstream命令更新主分支，然后使用git checkout
main切换到主分支，使用git merge upstream/main命令将更改合并到本地的主分支。

Finally，使用git push origin main命令将更改推送到自己的仓库。

ps.以上步骤为最简单的，可能在实际还会遇到冲突等问题，为避免文章过于复杂，便不再添加。
