---
title: "微信支付｜服务商模式V3付款码支付"
description: "前言 不多说，官方文档写的乱七八糟，v3还用的v2的付款码，导致代码十分混乱，骂的话已经不想多说了。 结合微信v3的SDK和github上面的描述，对于官方sdk未实现的接口可以自己根据OkHttpClientAdapter 的实现类发送"
pubDatetime: 2025-10-29T14:18:21Z
tags:
  - Java实战
draft: false
---

## 前言

不多说，官方文档写的乱七八糟，v3还用的v2的付款码，导致代码十分混乱，骂的话已经不想多说了。

结合微信v3的SDK和github上面的描述，对于官方sdk未实现的接口可以自己根据OkHttpClientAdapter 的实现类发送 HTTP
请求，会自动生成签名和验证签名。下面给出我自己实现的可用的代码和v3中支付必要的参数和坑点。

关于商户模式的付款码支付可用通过[微信开放社区](https://developers.weixin.qq.com/community/develop/article/doc/00022492720948895861b905a61c13)
这个链接来查看，实现的话其实都是大差不差。

## 实现

官方出了新的v3付款码支付的[v3服务商模式付款码支付链接](https://pay.weixin.qq.com/docs/partner/apis/partner-code-payment-v3/partner/partner-code-pay.html)
，参考链接和SDK中其它的支付方式可知需要如下几步。

### 一、接口与流程概览

- 接口地址：POST https://api.mch.weixin.qq.com/v3/pay/partner/transactions/codepay
- 核心步骤： 组装请求参数（服务商/子商户信息、订单信息、金额、付款码等） 设置 HttpHeaders（Accept / Content-Type 均为
  application/json） 构建 Config（商户证书、私钥、序列号）并初始化 DefaultHttpClientBuilder() httpClient.execute()
  发送请求 → 解析响应 JSON → 映射为业务对象 → 返回结果

 ```xml

<dependency>
    <groupId>com.github.wechatpay-apiv3</groupId>
    <artifactId>wechatpay-java</artifactId>
    <version>version>0.2.17</version>
</dependency>
```

### 二、核心代码（可直接落地）

下面方法实现了“服务商模式的v3付款码支付”。只需将 getAppId()、getPlatformMchId()、getSubMchId()、getVxOutId()、getPrivateKeyPath()、getMerchantSerialNumber() 等替换为自己的实际实现即可。

```java
public PayResponse<PaymentResponse> payOrder(PaymentOrderDto paymentOrderDto) {
    try {
        final String url = "https://api.mch.weixin.qq.com/v3/pay/partner/transactions/codepay";

        //组装请求体
        Map<String, Object> req = new HashMap<>();
        req.put("sp_appid", this.getAppId());
        req.put("sp_mchid", this.getPlatformMchId());
        req.put("sub_mchid", this.getSubMchId());
        req.put("description", paymentOrderDto.getPaySubject());
        req.put("out_trade_no", paymentOrderDto.getOrderNo());

        Map<String, Object> amount = new HashMap<>();
        amount.put("total", Long.valueOf(this.multiply100(paymentOrderDto.getRealAmount())));
        req.put("amount", amount);

        Map<String, Object> payer = new HashMap<>();
        payer.put("auth_code", paymentOrderDto.getAuthCode());
        req.put("payer", payer);

        Map<String, Object> storeInfo = new HashMap<>();
        storeInfo.put("id", this.getVxOutId());
        Map<String, Object> sceneInfo = new HashMap<>();
        sceneInfo.put("store_info", storeInfo);
        req.put("scene_info", sceneInfo);

        //设置请求头
        com.wechat.pay.java.core.http.HttpHeaders headers = new com.wechat.pay.java.core.http.HttpHeaders();
        headers.addHeader("Accept", com.wechat.pay.java.core.http.MediaType.APPLICATION_JSON.getValue());
        headers.addHeader("Content-Type", com.wechat.pay.java.core.http.MediaType.APPLICATION_JSON.getValue());

        //构建 HTTP 请求
        com.wechat.pay.java.core.http.HttpRequest httpRequest =
            new com.wechat.pay.java.core.http.HttpRequest.Builder()
                .httpMethod(com.wechat.pay.java.core.http.HttpMethod.POST)
                .url(url)
                .headers(headers)
                .body(new com.wechat.pay.java.core.http.JsonRequestBody.Builder()
                        .body(com.wechat.pay.java.core.util.GsonUtil.toJson(req))
                        .build())
                .build();

        // 初始化 HttpClient（签名/验签由 Config 负责）
        com.wechat.pay.java.core.Config cfg =
            getConfig(this.getPlatformMchId(), getPrivateKeyPath(), getMerchantSerialNumber());
        com.wechat.pay.java.core.http.HttpClient httpClient =
            new com.wechat.pay.java.core.http.DefaultHttpClientBuilder()
                .config(cfg)
                .build();

        // 5) 发送请求 & 解析响应
        com.wechat.pay.java.core.http.HttpResponse<com.wechat.pay.java.core.http.JsonResponseBody> resp =
            httpClient.execute(httpRequest, com.wechat.pay.java.core.http.JsonResponseBody.class);

        String resultJson = extractVxServicePayResBodyJson(resp.getBody());

        WxV3TransactionLite tx = com.alibaba.fastjson.JSON.parseObject(resultJson, WxV3TransactionLite.class);

        return this.handleResult(tx, this.buildPaymentResp(tx, paymentOrderDto));
    } catch (Exception e) {
        log.error("微信特约商户付款码支付异常：{}", e.getMessage(), e);
        return PayResponse.fail(e.getMessage(), null);
    }
}
```

小提示

- 如果你的工程不想引入 GsonUtil，用 FastJSON（JSON.parseObject）或 Jackson（ObjectMapper.readValue）皆可。
- DefaultHttpClientBuilder 所需 Config 里应配置：商户私钥、证书序列号、商户号，以及公钥等

### 三、轻量响应对象 WxV3TransactionLite

微信应答字段较多，实际以官方文档为准。此处给出常用字段的简版 POJO，方便快速落地：

```java
@Data
public class WxV3TransactionLite {
    private String sp_mchid;         // 服务商商户号
    private String sub_mchid;        // 子商户号
    private String out_trade_no;     // 商户订单号
    private String transaction_id;   // 微信支付订单号
    private String trade_state;      // 交易状态 (e.g. SUCCESS, USERPAYING, NOTPAY)
    private String trade_state_desc; // 状态描述
    private String bank_type;        // 付款银行
    private String success_time;     // 支付完成时间（RFC3339 格式）

    private Amount amount;           // 金额信息
    private Payer payer;             // 付款人信息（如返回）

    @Data
    public static class Amount {
        private Integer total;           // 订单总金额（分）
        private Integer payer_total;     // 用户支付金额（分）
        private String currency;         // 币种，CNY
        private String payer_currency;   // 用户支付币种（如返回）
    }

    @Data
    public static class Payer {
        private String openid;       // 用户标识（如返回）
    }
}
```

### 四、Config 的关键点和参数说明

Config 决定了自动签名与回包验签是否可靠：

目前微信支持多种Config类型，这里选用了RSAPublicKeyConfig来作为本次的Config，需要的配置如下：

| 字段 / 名称 | 含义与说明 | 依据 |
|---|---|---|
| 商户号 `mchid` | 在微信支付商户平台的商户号。服务商模式下，该值是服务商的 `mchid`，子商户 `sub_mchid` 在具体接口请求中传递，不在全局 SDK 配置中。 | — |
| 服务商 API 证书 `apiclient_key.pem` | 申请“商户 API 证书”时生成并保存在本地的私钥文件，SDK 使用该私钥对请求进行签名，常见文件名为 `apiclient_key.pem`。 | — |
| 商户 API 证书序列号 `serial_no` | 与当前使用的“商户 API 证书”对应的证书序列号，可在商户平台查看或从证书文件读取。SDK 会将其放在请求头 `Wechatpay-Serial` 中配合签名使用。 | — |
| `sp_appid` | 服务商在微信开放平台（移动应用）或公众平台（公众号/小程序）申请的唯一标识，需要与服务商商户号 `sp_mchid` 绑定，支付能力会校验该绑定关系。 | — |
| `sub_mchid` | 子商户（特约商户）在服务商体系中的唯一标识，发起服务商模式支付时必须传入。 | — |
| APIv3 密钥 | 用于 v3 接口的加解密（如回调通知、平台证书下载等）。如果走 v2 兼容支付流程也可能需要该参数；纯 v3 流程中通常用于回调验签或解密通知内容。 | — |
| 微信支付公钥 | 用于验签（结合平台证书体系）。若 SDK 自动拉取微信支付平台证书，通常无需手动配置公钥文件。 | — |
| 门店编号 | `scene_info.store_info.id`，用于标识门店或收银点，便于账务核对和风险控制。v3 付款码支付接口需要该参数。 | 客服文档：https://kf.qq.com/faq/230817neeaem2308177ZFfqM.html |

详细获取可以看[开发必要参数说明_通用规则|微信支付合作伙伴文档中心](https://pay.weixin.qq.com/doc/v3/partner/4013080340)来获取配置。
