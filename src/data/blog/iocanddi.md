---
title: "Ioc和DI"
description: "塑料大概需要200年降解， 人的平均寿命是76.34岁， 樱花一般在3—5月开放， 碘131的半衰期是8天， 快乐水开后要在24小时喝掉， 。。。。。。。。。。。 真是如此的规律和普通呢， 如果世界变得不普通呢？ 比如说我正躺在树下，结果掉"
pubDatetime: 2022-11-04T12:51:51Z
tags:
  - ioc
draft: false
---

塑料大概需要200年降解， 人的平均寿命是76.34岁， 樱花一般在3—5月开放， 碘131的半衰期是8天，
快乐水开后要在24小时喝掉， 。。。。。。。。。。。 真是如此的规律和普通呢， 如果世界变得不普通呢？ 比如说我正躺在树下，结果掉下来的不是苹果，不是椰子，不是榴莲，
而是你在我心里～

# 一、Ioc(Inversion of Control)--控制反转

业务层实现：

```java
public class BookServiceImpl implements BookService {
    private BookDao bookDao = new BookDaoImpl();

    @Override
    public void save() {
        System.out.println("book service save ...");
        bookDao.save();
    }
}
```

数据层实现：

```java
public class BookDaoImpl implements BookDao {
    @Override
    public void save() {
        System.out.println("book dao save ...");
    }
}
```

如图，当我们要想将数据层实现的代码重新实现时，我们可以直接书写，但是一旦代码上线，直接更改源码的操作会带来一系列的问题，花费等多的时间和money。原因是因为代码的耦合度非常高，此时就提出了一个思想——Ioc思想，此思想的核心是创建对象时就不需要我们直接创建了，将创建对象的控制转到外部，这样就可以实现代码的解耦，这就是控制反转。

# 二、Ioc的实现

通过提供Ioc容器（也叫Spring容器），Ioc实现了控制反转，用它来充当Ioc思想的外部。直接在Ioc容器中进行对象的创建和使用，Ioc容器负责对象的创建，初始化等一系列工作，被创建或被管理的对象在Ioc容器中统称为bean。

# 三、DI（dependency injection）——依赖注入

## 1.引入库

当在进行web开发时，service依赖dao运行，此时service和dao同时都在Ioc容器中，于是Ioc容器就把service和dao进行绑定，而绑关系的整个过程就叫依赖注入。

# 四、代码（xml的配置）

maven配置：

```xml

<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>5.2.10.RELEASE</version>
</dependency>
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
    <!--1.导入spring的坐标spring-context，对应版本是5.2.10.RELEASE-->

    <!--Ioc容器负责对象的创建，初始化等一系列工作，被创建或被管理的对象在Ioc容器中统称为bean-->
    <!--2.配置bean-->
    <!--bean标签标示配置bean
    id属性标示给bean起名字
    class属性表示给bean定义类型-->
    <bean id="bookDao1" class="com.hewen.dao.impl.BookDaoImpl"/>

    <!--    Dao放在service中，所以在bookService中修改-->
    <bean id="bookService" class="com.hewen.service.impl.BookServiceImpl">
        <!--7.配置server与dao的关系-->
        <!--property标签表示配置当前bean的属性
        name属性表示配置哪一个具体的属性
        ref属性表示参照哪一个bean-->
        <property name="bookDao" ref="bookDao1"/>
        <!--第一个bookDao为属性的名称，ref的bookDao为11行id属性的dao-->
    </bean>
</beans>
```

# 五、总结

在传统的java程序设计中，A需要B，我们就要在A中new一个B，这样大大提高了代码的耦合度，而spring会把资源存储到IoC容器中，当A依赖B的时候，IoC就会把B注入到A中。这样就完成了资源的控制的反转。

所以控制反转IoC(Inversion of Control)
是说创建对象的控制权进行转移，以前创建对象的主动权和创建时机是由自己把控的，而现在这种权力转移到第三方，比如转移交给了IoC容器，它就是一个专门用来创建对象的工厂（Ioc的设计模式就是工厂模式），你要什么对象，它就给你什么对象，有了
IoC容器，依赖关系就变了，原先的依赖关系就没了，它们都依赖IoC容器了，通过IoC容器来建立它们之间的关系。
