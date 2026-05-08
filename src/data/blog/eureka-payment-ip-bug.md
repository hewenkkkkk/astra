---
title: "服务注册错误IP导致支付链路异常排查实录"
description: "从 Http-Service 返回 resBody 为空，到最终定位双IP注册问题的完整排查过程，包括日志分析、网络验证、服务发现机制及最终解决方案。"
pubDatetime: 2026-05-08T10:19:31Z
tags:
  - 问题排查
  - 支付
draft: false
---


# 背景

医院部署的一个老版支付系统，使用的Eureka实现服务注册和发现，在某天下午突然无法支付，后了解中午医院重启了服务器。

# 排查

## 调用链路

综合支付服务在整个调用服务的最低端，调用路径依次是:

His系统-->Http-Service-->Api-Authority-->Pay-Center

然后pay-center再回调His系统支付信息。

## 初始现象

最先看到的报错就是 Http-Service 日志提示 resBody 为空导致后续逻辑失败，随后排查Api-Authority 发现调到了此服务且有明显的权限校验日志输出，但是当排查 Pay-Center 服务的时候却发现没有接口的调用日志。

加上前一天支付好好的今天突然出了问题就一定不是系统代码的问题再加上问了医院的人因为 DNS 解析重启了此服务器，初步怀疑是服务器重启后导致的网络问题。

然后又各种 Ping 或者 Test-NetConnection 也没发现问题，把所有服务的日志整天看了个遍也没发现什么问题，一度陷入僵局~~

## 具体排查

实在没法了，看了下Eureka，诶！就这么眼睛一嫖看见了一个问题，Http-Service调用的ip是172.168.10.245，为什么Eureka上面所有服务注册的全是192.168.10.250呢？

同时查看了同服务器使用nacos的服务注册的ip地址确是正常的245地址。

于是使用Apifox分别调用了这2个ip到Api-Authority和Pay-Center发现调用250的没有任何返回，这下初步有个底和ip有关了。

# 解决

系统中同时存在 `172.168.10.245` 与 `192.168.10.250` 两个 IPv4 地址，分别对应不同的网络适配器。而Eureka在注册的时候默认选择了250的ip地址导致无法调用，如何在网上查询如何指定ip地址，首先使用了eureka.instance.ip-address配置了245，结果启动后发现还是注册到了250上面，然后又使用spring.cloud.inetutils.preferred-networks=172.168.10配置才可以。经过测试此问题解决！！

从接手到解决耗时2个半小时。

# 技术

## 解决“多网卡选择”问题

Spring Cloud 启动时会自动获取本机 IP。默认选择第一个“非回环”（non-loopback）地址。`preferred-networks` 的作用就是手动指定一个前缀，强制程序只选择匹配该前缀的 IP 地址。

下面的方法将本机的每一个 IP 地址与配置的 `preferred-networks` 进行正则或前缀匹配。如果匹配成功，那么这个 IP 就会被选为服务的注册地址。

```java
boolean isPreferredAddress(InetAddress address) {
        if (this.properties.isUseOnlySiteLocalInterfaces()) {
            boolean siteLocalAddress = address.isSiteLocalAddress();
            if (!siteLocalAddress) {
                this.log.trace("Ignoring address: " + address.getHostAddress());
            }

            return siteLocalAddress;
        } else {
            List<String> preferredNetworks = this.properties.getPreferredNetworks();
            if (preferredNetworks.isEmpty()) {
                return true;
            } else {
                for(String regex : preferredNetworks) {
                    String hostAddress = address.getHostAddress();
                    if (hostAddress.matches(regex) || hostAddress.startsWith(regex)) {
                        return true;
                    }
                }

                this.log.trace("Ignoring address: " + address.getHostAddress());
                return false;
            }
        }
    }
```

## 疑问

此前我配置了eureka.instance.ip-address和eureka.instance.prefer-ip-address却没有生效，由于时间紧急暂时先使用`preferred-networks` ，但是一直没有发现原因！
