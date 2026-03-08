---
title: "AOP入门案例"
description: "前言 一、AOP入门案例 案例简介：在执行输出语句前输出当前系统的时间戳 1、AOP使用步骤 （1）导入AOP相关坐标 <dependency> <groupId>org.springframework</groupId> <artifac"
pubDatetime: 2022-10-25T07:02:01Z
tags: 
  - spring
draft: false
---

# 前言

![1](https://images.xcnv.com/2022/11/02/6361468f76985.png)

# 一、AOP入门案例

案例简介：在执行输出语句前输出当前系统的时间戳

## 1、AOP使用步骤

### （1）导入AOP相关坐标

```xml
<dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-context</artifactId>
      <version>5.2.10.RELEASE</version>
</dependency>
    <!-- 此包也是aop开发所需要的包-->
<dependency>
      <groupId>org.aspectj</groupId>
      <artifactId>aspectjweaver</artifactId>
      <version>1.9.4</version>
</dependency>
```

提示：导入spring-context时默认导入了aop的包，依赖关系

### （2）定义接口与实现类

接口：

```java
package com.hewen.dao;

public interface BookDao {
    public void save();
    public void update();
}
```

实现类：

```java
package com.hewen.dao.impl;

import com.hewen.dao.BookDao;
import org.springframework.stereotype.Repository;

@Repository
public class BookDaoImpl implements BookDao {

    public void save() {
        System.out.println("book dao save ...");
    }

    public void update(){
        System.out.println("book dao update ...");
    }
```

### （3）定义通知类，创建通知

```java
package com.hewen.aop;

import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

public class MyAdvice {

    public void method(){
        System.out.println(System.currentTimeMillis());
    }
}
```

### （4）定义切入点

```java
package com.hewen.aop;

import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

public class MyAdvice {
    //切入点依托一个不具有实际意义的方法，即无参数，无返回值，方法体无实际逻辑
    //设置(定义)切入点，要求配置在方法上方
    //括号里面写执行到哪个方法(切入点)的具体方法   一个返回值为void的在com.hewen.dao.BookDao接口的update方法
    @Pointcut("execution(void com.hewen.dao.BookDao.update())")
    private void method2(){}
}
```

切入点依托一个不具有实际意义的方法，即无参数，无返回值，方法体无实际逻辑
括号里面写执行到哪个方法(切入点)的具体方法
设置(定义)切入点，要求配置在方法上方

### （5）绑定切入点与通知的关系并添加通知具体执行位置

使用@Before()注解绑定切入点与通知的关系

```java
@Before("method2()")
    public void method(){
        System.out.println(System.currentTimeMillis());
    }
```

- 前置通知：@Before 在目标业务方法执行之前执行
- 后置通知：@After 在目标业务方法执行之后执行
- 返回通知：@AfterReturning 在目标业务方法返回结果之后执行
- 异常通知：@AfterThrowing 在目标业务方法抛出异常之后
- 环绕通知：@Around 功能强大，可代替以上四种通知，还可以控制目标业务方法是否执行以及何时执行

### （6）定义通知类受spring管理

1.通知类前加@Component
2.通知类@Aspect

@Aspect设置当前类为切面类类，告诉spring当扫描到这个时把它当AOP处理，不然读到这个bean就会当成普通的bean处理

### （7）开启spring对通知类的管理

配置类(SpringConfig)前@EnableAspectJAutoProxy

@EnableAspectJAutoProxy 告诉spring这里有用注解开发的AOP

完整代码： MyAdvice类（通知类）：

```java
package com.hewen.aop;

import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;
//通知类必须配置成Spring管理的bean
@Component
/*设置当前类为切面类类*/
@Aspect   //此注释是告诉spring当扫描到这个时把它当AOP处理，不然读到这个bean就会当成普通的bean处理
public class MyAdvice {
    //切入点依托一个不具有实际意义的方法，即无参数，无返回值，方法体无实际逻辑
    //设置(定义)切入点，要求配置在方法上方
    //括号里面写执行到哪个方法(切入点)的具体方法   一个返回值为void的在com.hewen.dao.BookDao接口的update方法
    @Pointcut("execution(void com.hewen.dao.BookDao.update())")
    private void method2(){}

    //设置在切入点pt()的前面运行当前操作（前置通知）
    @Before("method2()")
    public void method(){
        System.out.println(System.currentTimeMillis());
    }
}
```

spring配置类：

```java
package com.hewen.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

@Configuration
@ComponentScan("com.hewen")
//开启注解开发AOP功能
@EnableAspectJAutoProxy  //告诉spring这里有用注解开发的AOP
public class SpringConfig {
}
```

# 二、AOP工作流程

此节需要知道动态代理，可看此篇文章 [java代理模式]

![](https://images.xcnv.com/2022/11/02/6361469b92823.png)

# 三、总结

使用注解：

- @Pointcut()
- @Before()
- @Component
- @Aspect 

