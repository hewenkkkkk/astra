---
title: "接入QQ登录"
description: "本文介绍了如和在开发网址时接入QQ登陆功能，主要介绍后端的Java代码。并且将介绍如何阅读官方的开发文档来自己开发相关的代码。相关链接如下： 腾讯开放平台 OPEN.QQ.COM 准备 主要步骤： 创建开发者账号：需要在QQ开放平台上注册为"
pubDatetime: 2023-06-15T16:55:31Z
tags:
  - Java实战
draft: false
---

本文介绍了如和在开发网址时接入QQ登陆功能，主要介绍后端的Java代码。并且将介绍如何阅读官方的开发文档来自己开发相关的代码。相关链接如下：

[腾讯开放平台 OPEN.QQ.COM](https://wikinew.open.qq.com/index.html#/iwiki/877911779)

# 准备

主要步骤：

- 创建开发者账号：需要在QQ开放平台上注册为开发者并创建一个开发者账号。这将提供给一组开发者密钥，用于访问QQ登录相关的API和资源。
- 集成QQ登录SDK：下载并集成QQ登录SDK到您的网站项目中。QQ提供了相应的SDK和文档，使您能够轻松地在网站中添加QQ登录功能。通过SDK，您可以获取用户授权，并使用QQ提供的API访问用户的个人信息。
- 注册网站应用：在QQ开放平台上注册您的网站应用，并获取相应的App ID和App Key。这些凭证将用于验证您的网站应用的身份，并与QQ登录服务进行交互。
- 配置登录回调地址：在QQ开放平台的应用配置中，设置登录回调地址。这是用户在QQ登录成功后将被重定向到的URL，您需要在您的网站上创建一个相应的接口来接收并处理回调请求。
-
用户授权和登录流程：在您的网站上提供QQ登录按钮，当用户点击时，将重定向到QQ登录页面。用户将在QQ登录页面上输入其QQ账号和密码，并授权您的网站访问其个人信息。一旦用户完成登录和授权，QQ将重定向回您事先设置的回调地址，并携带授权码或访问令牌。
- 处理回调请求：在您的网站的回调接口中，接收QQ返回的授权码或访问令牌。使用这些凭证，您可以通过调用QQ提供的API来获取用户的基本信息，例如用户ID、昵称和头像等。
- 用户关联和登录：根据从QQ获取的用户信息，您可以将用户与您的网站账号进行关联，或者直接创建一个新的用户账号。将用户标识保存在您的网站会话中，以便用户可以在后续访问中保持登录状态。

## 项目说明

我们首先需要[申请appid和appkey](https://wikinew.open.qq.com/index.html#/iwiki/876832074)
，然后才能通过id和key来获取access_token和openID进而得到用户信息。

yml中的配置信息如下，id、key和redirect需要根据自己的需要填入：

```yml
qq.app.id=
qq.app.key=
qq.url.authorization=https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=%s&redirect_uri=%s&state=%s
qq.url.access.token=https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id=%s&client_secret=%s&code=%s&redirect_uri=%s
qq.url.openid=https://graph.qq.com/oauth2.0/me?access_token=%S
qq.url.user.info=https://graph.qq.com/user/get_user_info?access_token=%s&oauth_consumer_key=%s&openid=%s
qq.url.redirect=
```

## 获取accessToken

参考[开发文档](https://wikinew.open.qq.com/index.html#/iwiki/901251864)可知获取accessToken的步骤如下：

1. 获取Authorization Code
2. 通过Authorization Code获取Access Token

请求https://graph.qq.com/oauth2.0/token地址并带入以下参数：

| 参数            | 是否必须 | 含义                                                                                                                                               |
|---------------|------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| grant_type    | 必须   | 授权类型，此值固定为 `authorization_code`                                                                                                                  |
| client_id     | 必须   | 申请 QQ 登录成功后，分配给网站的 `appid`                                                                                                                       |
| client_secret | 必须   | 申请 QQ 登录成功后，分配给网站的 `appkey`                                                                                                                      |
| code          | 必须   | 上一步返回的 `authorization code`。用户成功登录并授权后，会跳转到指定回调地址，并在 URL 中携带该参数。例如：`http://www.qq.com/my.php?code=520DD95263C1CFEA087******`。该 `code` 在 10 分钟内过期 |
| redirect_uri  | 必须   | 必须与上一步请求中传入的 `redirect_uri` 保持一致                                                                                                                 |

成功后会返回

```text
access_token=FE04CCE2&expires_in=7776000&refresh_token=88E4BE14
```

处理后便可得到access_token。

```java
/**
	 * 通过Authorization Code获取Access Token
	 * @param code
	 * @return
	 */
	private String getQQAccessToken(String code){
		String accessToken = null;
		String url = null;
		try {
			url = String.format(appConfig.getQqUrlAccessToken(), appConfig.getQqAppId(),appConfig.getQqAppKey(),code,
					URLEncoder.encode(appConfig.getQqUrlRedirect(),"utf-8"));

		}catch (UnsupportedEncodingException e){
			logger.error("获取QQ AccessToken失败",e);
		}
		String tokenResult = OKHttpUtils.getRequest(url);
		if (tokenResult == null || tokenResult.indexOf(Constants.VIEW_OBJ_RESULT_KEY) == -1){
			logger.error("获取QQ AccessToken失败,返回结果:{}",tokenResult);
			throw new BusinessException("获取QQ AccessToken失败");
		}
		//access_token=FE04************************CCE2&expires_in=7776000&refresh_token=88E4************************BE14
		String[] tokenResultArr = tokenResult.split("&");
		if (tokenResultArr != null && tokenResultArr.length > 0){
			for (String str : tokenResultArr){
				if (str.indexOf("access_token") != -1){
					accessToken = str.split("=")[1];
					break;
				}
			}
		}
		return accessToken;
	}
```

## 获取Openid

使用前期获取到的access_token来得到OpenID，[开发文档获取OpenID](https://wikinew.open.qq.com/index.html#/iwiki/879500792)

使用GET请求https://graph.qq.com/oauth2.0/me地址并带入以下参数：

| 参数           | 是否必须 | 含义                         |
|--------------|------|----------------------------|
| access_token | 必须   | 在 Step1 中获取到的 access token |

成功后返回的内容格式如下：

```text
callback({"client_id":"YOUR_APPID","openid":"YOUR_OPENID"});
```

```java
private String getQQOpenId(String accessToken){
		String url = String.format(appConfig.getQqUrlOpenid(),accessToken);
		String openIdResult = OKHttpUtils.getRequest(url);
		String tmpJson = getQQRes(openIdResult);
		if (tmpJson == null){
			logger.error("获取QQ OpenId失败,返回结果:{}",tmpJson);
			throw new BusinessException("获取QQ OpenId失败");
		}
		Map jsondata = JsonUtils.convertJson2Obj(tmpJson,Map.class);
		if (jsondata != null){
			logger.error("获取QQ OpenId失败,返回结果:{}",tmpJson);
			throw new BusinessException("获取QQ OpenId失败");
		}
		return String.valueOf(jsondata.get("openid"));
	}
	//callback( {"client_id":"YOUR_APPID","openid":"YOUR_OPENID"} );
	private  String getQQRes(String result){
		if (StringUtils.isNotBlank(result)){
			int pos = result.indexOf("callback");
			if (pos != -1){
				int startIndex = result.indexOf("(");
				int endIndex = result.lastIndexOf(")");
				String json = result.substring(startIndex+1,endIndex-1);
				return json;
			}
		}
		return null;
	}
```

## 处理用户信息

参考[get_user_info —用户信息文档](https://wiki.connect.qq.com/get_user_info)中的返回参数说明

以下代码中使用的UserDto，将需要的信息直接转成了用户对象

```java
private QQInfoDto getQQInfo(String accessToken,String qqOpenId) throws BusinessException{
		String url = String.format(appConfig.getQqUrlUserInfo(),accessToken,appConfig.getQqAppId(),qqOpenId);
		String res = OKHttpUtils.getRequest(url);
		if (StringUtils.isNotBlank(res)){
			QQInfoDto qqInfoDto = JsonUtils.convertJson2Obj(res,QQInfoDto.class);
			if (qqInfoDto.getRet() != 0){
				logger.error("获取QQ用户信息失败,返回结果:{}",res);
				throw new BusinessException("获取QQ用户信息失败");
			}
			return qqInfoDto;
		}
		throw new BusinessException("获取QQ用户信息失败");
	}
```

## 登录

- 根据传入的code（授权码），调用getQQAccessToken方法获取访问令牌（accessToken）。
- 使用访问令牌调用getQQOpenId方法获取QQ的OpenId，OpenId是用户在QQ平台上的唯一标识。
- 使用获取到的OpenId，在数据库中查询该OpenId对应的用户信息。
- 如果查询结果为空，表示该用户是第一次使用QQ登录，需要进行注册。通过调用getQQInfo方法获取QQ用户的详细信息（昵称、头像等）。
- 创建一个新的用户信息对象UserInfo，设置用户的相关属性，如用户ID、OpenId、昵称、头像等，并将用户信息插入到数据库中。
- 重新查询数据库，获取刚刚插入的用户信息。
- 如果查询结果不为空，表示该用户已经注册过，只需要更新用户的最后登录时间。
- 创建一个SessionWebUserDto对象，将用户的昵称、用户ID、头像等信息设置到该对象中。
- 根据用户的电子邮件判断是否为管理员，并将管理员信息设置到SessionWebUserDto对象中。
- 创建一个UserSpaceDto对象，用于存储用户的空间使用情况。
- 使用fileInfoMapper查询用户已使用的空间大小，并将结果设置到UserSpaceDto对象中的useSpace属性中。
- 将用户的总空间大小设置到UserSpaceDto对象中的totalSpace属性中。
- 调用redisComponent的saveUserSpace方法，将用户的空间信息保存到缓存中。
- 返回SessionWebUserDto对象，即包含用户信息的数据传输对象。

```java
@Override
	public SessionWebUserDto qqLogin(String code) {
		String accessToken = getQQAccessToken(code);
		String openId = getQQOpenId(accessToken);
		UserInfo userInfo = this.userInfoMapper.selectByQqOpenId(openId);
		String avatar = null;
		if (userInfo == null){
			//注册
			QQInfoDto qqInfoDto = getQQInfo(accessToken,openId);
			UserInfo bean = new UserInfo();
			String nickName = qqInfoDto.getNickname();
			nickName = nickName.length() > 20 ? nickName.substring(0,20) : nickName;
			avatar = StringTools.isEmpty(qqInfoDto.getFigureurl_qq_2()) ? qqInfoDto.getFigureurl_qq_1() : qqInfoDto.getFigureurl_qq_2();
			Date now = new Date();
			bean.setUserId(StringTools.getRandomString(Constants.COUNT_10));
			bean.setQqOpenId(openId);
			bean.setNickName(nickName);
			bean.setQqAvatar(avatar);
			bean.setJoinTime(new Date());
			bean.setLastLoginTime(now);
			bean.setStatus(UserStatusEnum.ENABLE.getStatus());
			bean.setUseSpace(0L);
			SysSetingsDto sysSetingsDto = redisComponent.getSysSetings();
			bean.setTotalSpace(sysSetingsDto.getUserInitUseSpace()*Constants.MB);
			this.userInfoMapper.insert(bean);
			userInfo = userInfoMapper.selectByQqOpenId(openId);
		}else {
			//更新最后登录时间
			UserInfo updateUser = new UserInfo();
			updateUser.setLastLoginTime(new Date());
			avatar = userInfo.getQqAvatar();
			this.userInfoMapper.updateByUserId(updateUser, userInfo.getUserId());
		}
		SessionWebUserDto sessionWebUserDto = new SessionWebUserDto();
		sessionWebUserDto.setNickName(userInfo.getNickName());
		sessionWebUserDto.setUserId(userInfo.getUserId());
		sessionWebUserDto.setAvatar(avatar);
		if (ArrayUtils.contains(appConfig.getAdmin().split(","),userInfo.getEmail()==null?"":userInfo.getEmail())){
			sessionWebUserDto.setAdmin(true);
		}else sessionWebUserDto.setAdmin(false);
		UserSpaceDto userSpaceDto = new UserSpaceDto();
		//TODO 获取用户已经使用的空间
		Long useSpace = fileInfoMapper.selectUserSpace(userInfo.getUserId());
		userSpaceDto.setUseSpace(useSpace);
		userSpaceDto.setTotalSpace(userInfo.getTotalSpace());
		redisComponent.saveUserSpace(userInfo.getUserId(),userSpaceDto);
		return sessionWebUserDto;
	}
```

ps.本文出现的代码仅为QQ登录时需要的主要代码，仅提供一些主要思路，其余一些次要的代码需要根据自己的需要使用，便不在文内全部展示。
