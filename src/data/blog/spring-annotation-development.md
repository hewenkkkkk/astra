---
title: "Spring纯注解开发"
description: "前言 项目结构： 一、Spring纯注解开发 1.定义bean 在上图中，需要定义bean，其名称，配置类。采用注解"
pubDatetime: 2022-12-27T06:49:45Z
tags:
  - Spring
draft: false
---

# 前言

# 一、Spring纯注解开发

## 1.定义bean


需要定义bean，其名称，配置类。采用注解开发模式，就需要代替上面三个步骤。

- 在要定义的类上加上注解@Component()
- 定义名称@Component("bookDao")
- 配置文件需要知道这个，就需要在配置文件中加入以下内容来进行扫描：



注：@Componet()在所以类中均可使用，在web开发中也可使用以下，和它没有区别

- @Controller() 表现层
- @Service() 业务层
- @Repository() 数据层

## 3.纯注解开发模式

上面我们依然使用了配置文件，在这次中，我们就将配置文件全部删除，真正做到纯注解。

### （1）创建配置类：

既然没有了配置文件，那么就需要有和配置文件一样效果的东西，这就是配置类 代码：

```java
package com.hewen.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**声明当前类为Spring配置类*/
@Configuration    //相当于配置文件中的外面那一圈
//设置bean扫描路径，多个路径书写为字符串数组格式
@ComponentScan("com.hewen.service")   // 多个用数组形式
public class SpringConfig {
}
```

- @Configuration的作用就是定义这个类为配置类
- @ComponentScan() 设置bean扫描路径


我们看@ComponentScan(）注解的源码就会发现它使用的是字符串数组，所以当设置多个时就要使用数组形式 {"com.hewen.service","com.hewen.dao"}

### （2）App类：

使用了注解开发后，就不需要加载配置文件

```java
import com.hewen.config.SpringConfig;
import com.hewen.dao.BookDao;
import com.hewen.service.BookService;

import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

public class AppForAnnotation {
    public static void main(String[] args) {
        //AnnotationConfigApplicationContext加载Spring配置类初始化Spring容器
        ApplicationContext ctx = new AnnotationConfigApplicationContext(SpringConfig.class);
        BookDao bookDao = (BookDao) ctx.getBean("bookDao");
        System.out.println(bookDao);
        //按类型获取bean
        BookService bookService = ctx.getBean(BookService.class);
        System.out.println(bookService);
    }
}
```

