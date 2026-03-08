---
title: "Session_Token_JWT"
description: "在Web应用中，保持用户状态是一个常见且关键的需求。由于HTTP协议本身是无状态的，服务器无法自动知道两个请求是否来自同一个用户。这里就需要session发挥作用。本文将通过具体的Spring框架代码示例，来深入理解session的使用和重"
pubDatetime: 2024-02-13T03:22:33Z
tags:
  - java
draft: false
---

在Web应用中，保持用户状态是一个常见且关键的需求。由于HTTP协议本身是无状态的，服务器无法自动知道两个请求是否来自同一个用户。这里就需要session发挥作用。本文将通过具体的Spring框架代码示例，来深入理解session的使用和重要性以及和token、jwt的比较。

# session

## 什么是Session？

session是在服务器端保持用户状态的一种方式。每当用户访问Web应用时，服务器都会生成一个唯一的session
ID，并且为这个session存储相关数据。这样，即使HTTP请求是无状态的，通过session也可以识别并维护用户状态。

## Spring框架中Session的使用

在Spring框林中，处理session的一个常见方法是使用HttpSession对象。以下是两个基本用例的示例代码：

### 保存Session信息

```java
@RequestMapping("saveSessionInfo")
    public String saveSessionInfo(HttpSession session,String msg){
        if(isEmpty(msg)){
            return "msg不能为空";
        }
        session.setAttribute(SESSION_KEY,msg);
        return "保存session信息成功，sessionId:"+session.getId();
    }
```

在这个方法中，我们首先检查传入的msg参数是否为空。如果不为空，我们使用session.setAttribute()
方法将信息保存在session中。这里的SESSION_KEY是一个常量，用作session中数据的键。最后，方法返回包含session ID的消息，表明信息已成功保存。

### 获取Session信息

```java
@RequestMapping("getSessionInfo")
    public String getSessionInfo(HttpSession session){
        return "获取的session信息为:"+session.getAttribute(SESSION_KEY);
    }
```

在获取session信息的方法中，我们使用session.getAttribute()方法来检索之前保存的信息。如果该session中存在与SESSION_KEY对应的数据，它将被返回。

session是基于用户会话的。这意味着，当用户关闭浏览器或者从原始设备移动时，会话可能会丢失。由于session
ID通常存储在浏览器的cookie中，因此一旦用户离开浏览器或更换设备，之前存储的session信息将无法访问。

于是就可以想到一个办法，既然session ID通常存储在浏览器，那么如果可以将ID单独存在数据库中，就可以实现分布式session，可以跨设备使用，如下图：

![](https://pic.lamper.top/wp/2024/02/session.webp)

# Token

令牌（Token）是一种在计算机系统中标识和传输信息的方法。在Web应用中，Token通常用于身份验证和信息传递。它可以是任意字符串，但为了安全性，通常会使用具有高熵（随机性）的字符串，例如通过UUID.randomUUID()
.toString()生成的字符串。

```java
@RequestMapping("saveByToken")
    public String saveByToken(String msg){
        if(isEmpty(msg)){
            return "msg不能为空";
        }
        String token = UUID.randomUUID().toString();
        redisUtils.set(token,msg);
        return "保存token信息成功，token:"+token;
    }

    @RequestMapping("getByToken")
    public String getByToken(String token){
        if(isEmpty(token)){
            return "token不能为空";
        }
        return "获取的token信息为:"+redisUtils.get(token);
    }
```

在示例代码中，有两个方法saveByToken和getByToken。这两个方法分别用于保存和获取与Token相关联的信息。

- saveByToken方法接收一个消息字符串msg，生成一个唯一的Token，并将这个Token与消息存储在Redis中。Redis是一个常用的键值对存储系统，适用于此类场景。
- getByToken方法则接收一个Token，并从Redis中检索与该Token关联的信息。

这种方法的优点是简单高效，能够快速存取数据。但缺点是用户需要手动管理Token。

```java
@RequestMapping("saveByTokenWithCookie")
    public String saveByTokenWithCookie(HttpServletResponse response,String msg){
        if(isEmpty(msg)){
            return "msg不能为空";
        }
        String token = UUID.randomUUID().toString();
        redisUtils.set(token,msg);
        Cookie cookie = new Cookie("token",token);
        //cookie.setMaxAge(10);
        response.addCookie(cookie);
        return "保存token信息成功，token:"+token;
    }

    @RequestMapping("getByTokenWithCookie")
    public String getByTokenWithCookie(HttpServletRequest request){
      Cookie[] cookies =   request.getCookies();
      if(cookies==null){
          return  "获取的token信息为:null";
      }
      String token = null;
      for (Cookie cookie:cookies){
          if("token".equals(cookie.getName())){
              token = cookie.getValue();
              break;
          }
      }
        if(isEmpty(token)){
            return "token不能为空";
        }
        return  "获取的token信息为:"+redisUtils.get(token);
    }
```

为了提高用户体验，可以结合Cookie自动管理Token。在saveByTokenWithCookie和getByTokenWithCookie方法中，我们使用了Cookie来存储和检索Token。

- saveByTokenWithCookie在保存信息的同时，将生成的Token存储在用户的浏览器Cookie中。这样，用户在后续的请求中无需手动提供Token。
- getByTokenWithCookie方法检查请求中的Cookie，自动提取Token，并从Redis中获取相关信息。

在实际的开发过程中，我们需要配置一个全局拦截器，以便定期更新存储在Redis中的Token的有效期。这样做可以模拟Session的行为，确保Token不会因超时而失效。

# JWT

JWT（JSON Web
Token）是一种用于在双方之间传递安全信息的紧凑且自包含的方式。它的特点是无状态性：一旦某方获取了密钥（key），它就可以进行验证。JWT的访问权限只能通过停止服务器来暂停，这与基于会话（session）的认证方式不同。在基于会话的系统中，如果出现不正常操作，可以通过重启服务器使会话失效，从而提高安全性。

```java
private static final String SECRET = "test123456";

    /**
     * 签名生成
     *
     * @return
     */
    public String createToken(String key, T data, Integer expireSeconds) {
        String token = null;
        try {
            Date expiresAt = new Date(System.currentTimeMillis() + expireSeconds * 1000);
            token = JWT.create()
                    .withClaim(key, JsonUtils.convertObj2Json(data))
                    .withExpiresAt(expiresAt)
                    .sign(Algorithm.HMAC256(SECRET));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return token;
    }

    /**
     * 签名验证
     *
     * @param token
     * @return
     */
    public <T> T getTokenData(String key, String token, Class<T> classz) {
        try {
            if (null == token || "".equals(token)) {
                return null;
            }
            JWTVerifier verifier = JWT.require(Algorithm.HMAC256(SECRET)).build();
            DecodedJWT jwt = verifier.verify(token);
            String jsonData = jwt.getClaim(key).asString();
            return JsonUtils.convertJson2Obj(jsonData, classz);
        } catch (Exception e) {
            return null;
        }
    }
```

上面的代码中会生成一串字符如下：

```text
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqd3Rfa2V5IjoiXCIxMTRcIiIsImV4cCI6MTcwNzgwMzAyOH0.8OJ8bDk_OCSr6cVOK2r_DWyTLItmHSrxFfaizuQpN58
```

其中这一段字符eyJqd3Rfa2V5IjoiXCIxMTRcIiIsImV4cCI6MTcwNzgwMzAyOH0就是存储的主要的信息，在在线的base64解码网站上是可以破解其中的信息的，也是不安全的一种方式。所以在开发的场景中一般很少使用。

![](https://pic.lamper.top/wp/2024/02/ygg.webp)

# 总结

开发中使用最多的是session，在一些移动端的开发中不支持session就会使用token。很少会使用jwt技术。
