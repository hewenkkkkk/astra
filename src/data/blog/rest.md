---
title: "REST风格和入门案例"
description: "一、REST是什么？ REST即表述性状态传递（英文：Representational State Transfer，简称REST）是Roy Fielding博士在2000年他的博士论文中提出来的一种软件架构风格。它是一种针对网络应用的设计"
pubDatetime: 2022-11-15T14:51:51Z
tags:
  - java
draft: false
---

# 一、REST是什么？

REST即表述性状态传递（英文：Representational State Transfer，简称REST）是Roy
Fielding博士在2000年他的博士论文中提出来的一种软件架构风格。它是一种针对网络应用的设计和开发方式，可以降低开发的复杂性，提高系统的可伸缩性。

根据REST风格对资源进行访问称为RESTful

话不多说，先看以下内容

传统风格资源描述形式 localhost/user/saveUser localhost/user/getById?id=1

REST风格描述形式 localhost/user/user localhost/user/user/1

对于传统风格的资源描述形式，它的描述性非常的强，我们可以看到它是保存一个user。 但是也可以看到它的书写是非常的麻烦。相对于传统的形式，rest有以下优点。

- 隐藏资源的访问行为，无法通过地址得知对资源的何种操作
- 使请求路径变得更加简洁
- 传递、获取参数值更加方便，框架会自动进行类型转换
- 安全，请求路径中直接传递参数值，并用斜线/分隔，不会暴露传递给方法的参数变量名。

# 二、怎么用？

## 1.请求

GET (查询)
POST （新增/保存）
PUT （修改/更新）
DELETE （删除）

http请求方式还有很多(8种)，但在SpringMVC中目前只支持以上4种

## 2.行为

http://localhost/users--------------------查询全部用户信息----------GET (查询)

http://localhost/users/1------------------查询指定用户信息----------GET （查询）

http://localhost/users---------------------添加用户信息----------------POST （新增/保存）

http://localhost/users---------------------修改用户信息-----------------PUT （修改/更新）

http://localhost/users/1-------------------删除用户信息----------------DELETE （删除）

描述模块的名称通常使用复数，也就是加s的格式描述，表示此类资源

## 3.入门案例

通过 @PathVariable 可以将 URL 中占位符参数绑定到控制器处理方法的入参中:URL 中的 {xxx} 占位符可以通过

### (1)非简化

```java
package com.hewen.controller;

import com.hewen.domain.User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
public class UserController {

    //设置当前请求方法为POST，表示REST风格中的添加操作
    @RequestMapping(value = "/users",method = RequestMethod.POST)
    @ResponseBody
    public String save(){
        System.out.println("user save...");
        return "{'module':'user save'}";
    }

    //设置当前请求方法为DELETE，表示REST风格中的删除操作
    //@PathVariable注解用于设置路径变量（路径参数），要求路径上设置对应的占位符，并且占位符名称与方法形参名称相同
    @RequestMapping(value = "/users/{id}",method = RequestMethod.DELETE)
    @ResponseBody
    public String delete(@PathVariable Integer id){
        System.out.println("user delete..." + id);
        return "{'module':'user delete'}";
    }

    //设置当前请求方法为PUT，表示REST风格中的修改操作
    @RequestMapping(value = "/users",method = RequestMethod.PUT)
    @ResponseBody
    public String update(@RequestBody User user){
        System.out.println("user update..."+user);
        return "{'module':'user update'}";
    }

    //设置当前请求方法为GET，表示REST风格中的查询操作
    //@PathVariable注解用于设置路径变量（路径参数），要求路径上设置对应的占位符，并且占位符名称与方法形参名称相同
    @RequestMapping(value = "/users/{id}" ,method = RequestMethod.GET)
    @ResponseBody
    public String getById(@PathVariable Integer id){
        System.out.println("user getById..."+id);
        return "{'module':'user getById'}";
    }

    //设置当前请求方法为GET，表示REST风格中的查询操作
    @RequestMapping(value = "/users",method = RequestMethod.GET)
    @ResponseBody
    public String getAll(){
        System.out.println("user getAll...");
        return "{'module':'user getAll'}";
    }

}
```

### (2)简化

对于UserController类中每个API都有 @ResponseBody注解，我们不妨有一个大胆的想法，可不可以把它合并同类项，直接放在类名上面呢？答案是肯定的。

此时，在类上就有了两个注解，@Controller和 @ResponseBody，在Spring中，我们可以使用 @RestController
注解替换@Controller与@ResponseBody注解，简化书写。

当我们使用 @RequestMapping(value = "/users/{id}" ,method = RequestMethod.GET) 时，我们要在每个API前写上/users，可以使用
@RequestMapping("/users") 注解写在类名上

那对于 @RequestMapping() 我们是不是也可以想想办法呢

```text
@RequestMapping( method = RequestMethod.POST)
↓ 
@PostMapping

@RequestMapping(value = "/{id}" ,method = RequestMethod.DELETE) 
↓ 
@DeleteMapping("/{id}")

@RequestMapping(method = RequestMethod.PUT) 
↓ 
@PutMapping

@RequestMapping(value = "/{id}" ,method = RequestMethod.GET) 
↓ 
@GetMapping("/{id}")
```

```java
package com.hewen.controller;

import com.hewen.domain.Book;
import org.springframework.web.bind.annotation.*;

//@Controller
//@ResponseBody配置在类上可以简化配置，表示设置当前每个方法的返回值都作为响应体
//@ResponseBody
@RestController     //使用@RestController注解替换@Controller与@ResponseBody注解，简化书写
@RequestMapping("/books")
public class BookController {

//    @RequestMapping( method = RequestMethod.POST)
    @PostMapping        //使用@PostMapping简化Post请求方法对应的映射配置
    public String save(@RequestBody Book book){
        System.out.println("book save..." + book);
        return "{'module':'book save'}";
    }

//    @RequestMapping(value = "/{id}" ,method = RequestMethod.DELETE)
    @DeleteMapping("/{id}")     //使用@DeleteMapping简化DELETE请求方法对应的映射配置
    public String delete(@PathVariable Integer id){
        System.out.println("book delete..." + id);
        return "{'module':'book delete'}";
    }

//    @RequestMapping(method = RequestMethod.PUT)
    @PutMapping         //使用@PutMapping简化Put请求方法对应的映射配置
    public String update(@RequestBody Book book){
        System.out.println("book update..."+book);
        return "{'module':'book update'}";
    }

//    @RequestMapping(value = "/{id}" ,method = RequestMethod.GET)
    @GetMapping("/{id}")    //使用@GetMapping简化GET请求方法对应的映射配置
    public String getById(@PathVariable Integer id){
        System.out.println("book getById..."+id);
        return "{'module':'book getById'}";
    }

//    @RequestMapping(method = RequestMethod.GET)
    @GetMapping             //使用@GetMapping简化GET请求方法对应的映射配置
    public String getAll(){
        System.out.println("book getAll...");
        return "{'module':'book getAll'}";
    }
}
```

# 三、总结

文章注解汇总

- @PathVariable 注解用于设置路径变量（路径参数），要求路径上设置对应的占位符，并且占位符名称与方法形参名称相同
- @RestController 注解替换@Controller与@ResponseBody注解，简化书写
- @RequestMapping() 注解的作用就是将请求和处理请求的控制器方法关联起来,建立映射关系。
- @PostMapping 简化Post请求方法对应的映射配置
- @DeleteMapping简化DELETE请求方法对应的映射配置
- @PutMapping简化Put请求方法对应的映射配置
- @GetMapping简化GET请求方法对应的映射配置
