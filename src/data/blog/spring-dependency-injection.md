---
title: "Spring依赖注入"
description: "前言 本文仅限注解的具体使用，具体注解的是什么，为什么，原理等可以参考其它文章，本文也有其它文章的链接 本文承接我写的这篇文章 一、注解开发bean的生命周期与作用范围 项目结构： 1.作用范围 package com.hewen.dao."
pubDatetime: 2022-12-27T06:50:28Z
tags:
  - Spring
draft: false
---

# 前言

本文仅限注解的具体使用，具体注解的是什么，为什么，原理等可以参考其它文章，本文也有其它文章的链接

[本文承接我写的这篇文章](https://blog.csdn.net/weixin_63802890/article/details/126134574)

# 一、注解开发bean的生命周期与作用范围

## 1.作用范围

```java
package com.hewen.dao.impl;

import com.hewen.dao.BookDao;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Repository;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

@Repository   //数据层定义bean
//@Scope设置bean的作用范围
@Scope("singleton")  //调创建的对象是不是单例，默认为单例
public class BookDaoImpl implements BookDao {

    public void save() {
        System.out.println("book dao save ...");
    }
    //@PostConstruct设置bean的初始化方法
    @PostConstruct
    public void init() {
        System.out.println("init ...");
    }
    //@PreDestroy设置bean的销毁方法
    @PreDestroy
    public void destroy() {
        System.out.println("destroy ...");
    }
}
```

@Scope() 注解控制作用范围

- singleton表示这个bean在spring容器中是单例的，我们通过spring容器获取这个bean的时候，都是对一个对象进行操作。
- prototype表示这个bean在容器中不是单例的，每次通过spring容器获取到的实例都是一个新的实例。
- request表示按照HTTP Request返回一个单一的Bean实例。
- session表示按照HTTP Session返回一个单一的Bean实例。
- globalSession表示按照Global HTTP Session返回一个单一的Bean实例。

## 2.生命周期

```java
package com.hewen.dao.impl;

import com.hewen.dao.BookDao;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Repository;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

@Repository   //数据层定义bean
//@Scope设置bean的作用范围
@Scope("singleton")  //调创建的对象是不是单例，默认为单例
public class BookDaoImpl implements BookDao {

    public void save() {
        System.out.println("book dao save ...");
    }
    //@PostConstruct设置bean的初始化方法
    @PostConstruct
    public void init() {
        System.out.println("init ...");
    }
    //@PreDestroy设置bean的销毁方法
    @PreDestroy
    public void destroy() {
        System.out.println("destroy ...");
    }
}
```

- @PostConstruct设置bean的初始化方法
- @PreDestroy设置bean的销毁方法


# 二、依赖注入


## 1.注入简单类型：

```java
package com.hewen.dao.impl;

import com.hewen.dao.BookDao;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

@Repository("bookDao")
public class BookDaoImpl implements BookDao {
    //@Value：注入简单类型（无需提供set方法）
    @Value("${name}")
    private String name;
    /**本可以写成    private String name=“东方”;   但为了达到解耦的目的，就使用此写法*/

    public void save() {
        System.out.println("book dao save ..." + name);
    }
}
```

@Value() 可用来注入简单类型，括号里面可以直接填入需要注入的值，如@Value(451)
，但是这样就和直接赋值没有什么区别，达不到解耦的目的，于是可以在resourses目录中写好需要注入的值，


同时在配置类中加入 @PropertySource ({"jdbc.properties"})引入文件

```java
package com.hewen.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@ComponentScan("com.hewen")
//@PropertySource加载properties配置文件
@PropertySource({"jdbc.properties"})
public class SpringConfig {
}
```


## 1.注入引用类型：

### (1)按类型装配

```java
package com.hewen.service.impl;

import com.hewen.dao.BookDao;
import com.hewen.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service
public class BookServiceImpl implements BookService {
    //@Autowired：注入引用类型，自动装配模式，默认按类型装配
    @Autowired     //暴力反射，不需要使用set注入
    //@Qualifier：自动装配bean时按bean名称装配
    @Qualifier("bookDao")   //想注谁，就把谁的bean名称写上
    private BookDao bookDao;

    /**
    public void setBookDao(BookDao bookDao) {
        this.bookDao = bookDao;
    }
     */

    public void save() {
        System.out.println("book service save ...");
        bookDao.save();
    }
}
```

@Autowired注解用来引用注入，可以标注在属性上、方法上和构造器上，来完成自动装配。默认是根据属性类型装配，spring自动将匹配到的属性值进行注入。可以无需使用set方法，进行暴力反射。[@Autowired详解](https://blog.csdn.net/weixin_45755816/article/details/118654961)

### (2)按名称装配

但是当有多个相同类型的bean，此时应该如何指定呢？这是我们就需要按照名称装配。


分别在数据层的@Repository注解上命名(如上图所示)，使用 @Qualifier("bookDao")来指定想注入的名称


# 三、总结

本文提到的注解有：

- @Scope()
- @PostConstruct
- @PreDestroy
- @Value()
- @Autowired
- @Qualifier
