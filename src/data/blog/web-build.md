---
title: "网站搭建"
description: "服务器篇 选购 根据需求来选择服务器的配置，如果不知道如何选择可以先从最低配置开始。如果你是学生的话，那就再好不过了，阿里、腾讯，华为全部白嫖。自己账号用完了还可以借用同学的注册，保你大学无忧。 图1-1 目前我用的是阿里云飞天高校计划免费"
pubDatetime: 2023-02-04T05:23:21Z
tags:
  - 折腾
draft: false
---

# 服务器篇

## 选购

根据需求来选择服务器的配置，如果不知道如何选择可以先从最低配置开始。如果你是学生的话，那就再好不过了，阿里、腾讯，华为全部白嫖。自己账号用完了还可以借用同学的注册，保你大学无忧。


目前我用的是[阿里云飞天高校计划](https://developer.aliyun.com/plan/student?taskCode=vmfeitian2023&recordId=5239947&userCode=cit6zian&undefined&share_source=copy_link)
免费的服务器，图1-1是详细配置，完成认证还可以免费续6个月（认证超级简单的）。

创建服务器时系统镜像可以选择CentOS 7.9版本

## 建站

目前就介绍使用宝塔和WordPress傻瓜式的建站，另外一个推荐方式为使用Docker来创建单独的环境(
目前我使用的，有点麻烦，以后再补充吧)。

补充：

- 对于nginx配置折磨很久之后深感自己的愚蠢，所以这里推荐一个自动生成配置的网站 https://www.digitalocean.com/community/tools/nginx，但也要有一点基础。
- 现在很多平台都在提供免费ssl证书，目前套路云和凉心云每年有 20 个申请名额，可以使用1年，不过不能支持自动续期

### 端口开放

一般服务器创建后会提前开放22、443等端口，但比如数据库这些端口便不会默认开放，需要手动打开。

登陆阿里云-->控制台-->云服务器ECS-->点击实例名称-->安全组-->配置规则

可以选择手动添加和快速添加，下图为我开放的端口，可以参考：

![](https://pic.lamper.top/wp/2023/02/Snipaste_2023-02-04_18-29-11.webp)

### SSH工具

使用SSH工具连接服务器，这里推荐使用[FinalShell](http://www.hostbuf.com/t/988.html)，安装完成后按照图1-2依次点击连接阿里云的服务器。

![](https://pic.lamper.top/wp/2023/02/Snipaste_2023-02-03_21-55-32.webp)图1-2

![](https://pic.lamper.top/wp/2023/02/Snipaste_2023-02-03_22-01-11.webp)图1-3

获取服务器公网ip和密码：登陆阿里云-->控制台-->云服务器ECS-->点击实例名称即可进入图1-4

用户名和密码再创建实例时就会提前设置，如果忘记也可以再图1-4重置

![](https://pic.lamper.top/wp/2023/02/Snipaste_2023-02-03_21-59-17.webp)图1-4

### 安装宝塔

在FinalShell输入信息后点击确定即可进入界面，初次使用可以输入yum update更新一下服务器的yum。

![](https://pic.lamper.top/wp/2023/02/Snipaste_2023-02-03_22-15-44-1024x377.jpg)图1-5

输入[宝塔](https://www.bt.cn/new/download.html)的安装脚本即可喝茶休息一会（推荐茉莉花茶哦~），等待安装完成：

Centos安装脚本yum install -y wget && wget -O install.sh https://download.bt.cn/install/install_6.0.sh && sh install.sh
ed8484becUbuntu/

Deepin安装脚本wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash
install.sh ed8484bec

Debian安装脚本wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh && bash
install.sh ed8484bec

万能安装脚本if [ -f /usr/bin/curl ];then curl -sSO https://download.bt.cn/install/install_panel.sh;else wget -O install_panel.sh https://download.bt.cn/install/install_panel.sh;fi;bash install_panel.sh ed8484bec

安装完成后出现图1-6即可，最好记下访问地址、用户名和密码（后期可改）。下图中8888端口号，如果没有提前打开，也可以参考上面开放端口的步骤打开即可。到了这一步，FinallShell的使命也就完成了。浏览器访问即可。

![](https://pic.lamper.top/wp/2023/02/Snipaste_2023-02-03_22-24-33.webp)图1-6

### 安装WordPress

首先安装WordPress需要的运行环境，在初次进入宝塔面板时就会提示安装，选择好版本后直接按照即可。推荐php选择8.1版本，如果时间充足的话选择编译安装（又可以喝茶了）

![](https://pic.lamper.top/wp/2023/02/Snipaste_2023-02-03_22-30-55.webp)

依次点击网站-->选中PHP项目-->添加站点

![](https://pic.lamper.top/wp/2023/02/Snipaste_2023-02-04_18-39-02.webp)

创建完成后选择网站的设置,点击网站目录，取消防跨站攻击(open_basedir)前面的√。点击伪静态,选中wordpress点击保持。

- 进入下载 | WordPress.org China 简体中文官网下载最新版的wordpress
- 下载好后进入宝塔点击文件，进入网站根目录，选择上传上传下载的wordpress压缩包。
- 上传成功后，右键上传的WordPress程序，点击解压。
- 随后点击WordPress进入文件夹，全选文件及文件夹，点击剪切进入网站根目录后粘贴即可（总而言之就是要把解压后的wordpress程序放入网站的根目录）。
- 完成后浏览器输入域名或ip即可访问，按照提示填写信息即可。

# 性能篇

## 图片

一般来说，wordpress会将上传的图片保存至服务器中，随着时间的积累，页面的响应时间将会延长，也会在一定程度上消耗服务器的性能。通常会把图片等静态资源专门存储，以减少服务器的压力。常见的方案如下：

- 又拍云云存储
- 七牛云对象存储
- 阿里云对象存储OSS

推荐使用又拍云的云存储方案，它的优惠力度和活动挺大的，但是我选择阿里云😎，以下教程也是根据阿里云OSS。

进入购买界面，依次选中标准（LRS）存储包、中国大陆通用、40GB、1年（9元）。

购买完成后打开OSS控制台，依次选择Bucket列表-->创建Bucket，读写权限改为公共读，其它默认即可。

![](https://pic.lamper.top/wp/2023/02/Snipaste_2023-02-04_19-12-16.webp)

创建阿里云的AccessKey，记录值。获取EndPoint 地域节点和Bucket 域名（如果觉得它的域名太长，也可以使用自定义的子域名来使用，就比如我的图片域名为pic.lamper.top）。

![](https://pic.lamper.top/wp/2023/02/Snipaste_2023-02-04_19-25-43.webp)

进入wordpress后台，安装插件WPOSS(阿里云对象存储)
（作者为老蒋和他的小伙伴[WPOSS – 阿里云对象存储OSS插件 WordPress图片附件分离 - 乐在云 \(lezaiyun.com\)](https://www.lezaiyun.com/wposs.html?utm_source=wposs-setting&utm_media=link&utm_campaign=header)
），安装完成后进入设置依次填入信息即可。完成后可以上传一张图片试试查看图片的地址是否为阿里云的域名地址。

ps:为了避免OSS资源被其他人盗用。可以开启防盗链的功能。在数据安全-->
防盗链中开启并将自己的域名加入白名单中。[防盗链 \(aliyun.com\)](https://help.aliyun.com/document_detail/31869.html)

## CDN

CDN是构建在现有网络基础之上的智能虚拟网络，依靠部署在各地的边缘服务器，通过中心平台的负载均衡、内容分发、调度等功能模块，使用户就近获取所需内容，降低网络拥塞，提高用户访问响应速度和命中率。

网站开启CDN后可以隐藏自己的真实ip地址（电脑cmd输入ping+域名），一定程度上也可以保证网站的安全。

![](https://pic.lamper.top/wp/2023/02/Snipaste_2023-02-04_19-44-40.webp)

网站CDN的选择也有很多，阿里云的全站加速（目前使用）、又拍云等等。以下就以又拍云为例吧，加入又拍云联盟后还可以领取代金卷，小站基本不怎么花钱。

#### 第一步：创建服务

登陆 [CDN 控制台](https://console.upyun.com/login/)，进入 「CDN 服务」，点击 「创建服务」。

![](https://upyun-assets.b0.upaiyun.com/docs/cdn/service/upyun_cdn_create_service.png)

#### 第二步：基本配置

该步骤包括服务名称、加速域名、应用场景等选项的配置，为必选项，详细配置参见如下截图所示：

![](https://upyun-assets.b0.upaiyun.com/docs/cdn/service/upyun_cdn_basic_info.png)

1. 服务名称：唯一标识服务，例如：image-upyun-com，一个服务下面可以绑定多个自有域名，命名要求如下：

注意事项

服务名称仅限 5～20 位； 必须以小写英文字符开头，仅支持小写英文字符、数字、中划线组合。

2. 加速域名：填写此次需要配置的加速域名。具体要求如下：

注意事项

加速域名已在工信部备案； 待加速域名尚未在又拍云 CDN 平台配置。

加速域名需要进行[域名所有权验证](https://help.upyun.com/knowledge-base/domain-verify/)（暂未上线），验证通过后方能添加成功。

3. 应用场景：可选项包括网页图片、文件下载、音视频点播、动态内容、全站加速，阐述如下：

- 网页图片：适用于电商类、网站类、游戏图片类静态小文件等业务。
- 文件下载：适用于游戏安装包、音视频原文件下载、手机固件分发等业务。
- 音视频点播：适合音、视频文件较多的在线点播业务。
- 动态内容：适合 PHP、JSP、ASP 等动态类资源较多的业务。
- 全站加速：适合动、静态内容未做明确区分的业务，又拍云自动实现动静分离。

#### 第三步：回源配置

需要进行回源协议、回源线路的配置，可以选择协议跟随

#### 第四步：状态确认

服务创建成功后，操作界面会提示 CDN 加速服务创建成功，并会自动跳转到该服务的【功能配置】界面，如图所示：

![](https://upyun-assets.b0.upaiyun.com/docs/cdn/service/upyun-cdn-function-config.png)

在功能配置界面，有域名管理、回源管理、缓存配置、性能优化、HTTPS、访问控制、图片处理等功能配置模块，在【域名管理】模块下，您可以针对该服务绑定多个自有域名，请耐心等待域名配置（约
10 分钟），查看域名对应的状态是否为［正常］

#### 第五步：CNAME 配置

在上一个步骤中，可查看 CDN 平台为您分配的 CNAME 地址，此时需要去域名 DNS 解析商处，为该域名添加一条 CNAME 记录，待 CNAME
配置生效之后，方可享受 CDN 服务。

# 总结

当你看到了这，相信你对搭建网站产生了一些兴趣，由于时间匆忙，这篇文章对于一些细节的处理还不太完善，就比如CNAME
配置、https证书等，遇到这些问题可以参考百度。

对于我来说，经过这一系列的折腾，也让我对从浏览器输入一段网址到呈现出页面的过程有了更加深入的了解，希望这篇文章对你有所帮助。
