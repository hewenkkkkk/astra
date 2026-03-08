---
title: "Spring Bean生命周期"
description: "生命周期：从创建到销毁的完整过程"
pubDatetime: 2022-12-27T06:51:09Z
tags:
  - Spring
draft: false
---

# 前言

- 生命周期：从创建到销毁的完整过程
- bean的生命周期：bean从创建到销毁的整体过程
- bean生命周期控制：在bean创建后到销毁前做的一些事

代码结构：

![](https://images.xcnv.com/2022/11/02/63614c41a2bdf.png)

# 一、周期控制---配置模式

## 1.代码

BookDaoImpl类：

```java
package com.hewen.dao.impl;

import com.hewen.dao.BookDao;

/**
 * @author heWen
 */
public class BookDaoImpl implements BookDao {
    @Override
    public void save() {
        System.out.println("book dao save ...");
    }
    /**表示bean初始化对应的操作**/
    public void init(){
        System.out.println("(bean创建前)init...");
    }
    /**表示bean销毁前对应的操作*/
    public void destroy(){
        System.out.println("(bean销毁前)destroy...");
    }

}
```

AppForLifeCycle类：

```java
package com.hewen;

import com.hewen.dao.BookDao;
import org.springframework.context.support.ClassPathXmlApplicationContext;

/**
 * @author heWen
 */
public class AppForLifeCycle {
    public static void main( String[] args ) {

        /**为什么不用ApplicationContext呢？因为我们为了观察到java虚拟机执行了bean的销毁，需要使用.close()方法，
         但是此方法实现ClassPathXmlApplicationContext接口下的实现类*/
        ClassPathXmlApplicationContext ctx = new ClassPathXmlApplicationContext("applicationContext.xml");

        BookDao bookDao = (BookDao) ctx.getBean("bookDao");
        bookDao.save();

        /**注册关闭钩子函数，在虚拟机退出之前回调此函数，关闭容器（观察到java虚拟机执行了bean的销毁也可使用此方法）**/
        //ctx.registerShutdownHook();
        //关闭容器
        ctx.close();

        /**两种方法的区别：close()方法相对.registerShutdownHook()比较暴力*/
    }
}
```

xml配置：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

    <!--init-method：设置bean初始化生命周期回调函数（设置初始化方法）-->
    <!--destroy-method：设置bean销毁生命周期回调函数，仅适用于单例对象（设置销毁方法）-->
    <bean id="bookDao" class="com.hewen.dao.impl.BookDaoImpl" init-method="init" destroy-method="destroy"/>

</beans>
```

## 2.运行结果：

![](https://images.xcnv.com/2022/11/02/63614c4ef3d9b.png)

## 3.模式说明：

首先在BookDaoImpl类中创建了创建前和销毁前的方法，但是如何才能执行呢？就需要在xml配置文件中配置，使用init-method标签和destroy-method即可，但是在运行过程中会发现只执行了init()
方法，java虚拟机在运行后就直接退出。容器关闭前才会触发bean的销毁。

### 1.close()方法

此时需要在AppForLifeCycle类中使用ClassPathXmlApplicationContext接口，为什么不用ApplicationContext呢？因为我们为了观察到java虚拟机执行了bean的销毁，需要使用.close()
方法，但是此方法实现ClassPathXmlApplicationContext接口下的实现类。

### 2.registerShutdownHook()方法

.close()方法的使用相对来说比较暴力，一旦把此方法放在创建对象前执行，便会报错，于是我们可以使用.registerShutdownHook()
方法，无论放在那里都不会报异常。

# 二、周期控制---接口模式（了解）

## 1.代码

BookServiceImpl类：

```java
package com.hewen.service.impl;

import com.hewen.dao.BookDao;
import com.hewen.service.BookService;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;

/**
 * @author heWen
 */
/**使用接口的方法控制dean的创建和销毁*/
public class BookServiceImpl implements BookService, InitializingBean, DisposableBean {
    private BookDao bookDao;

    public void setBookDao(BookDao bookDao) {
        System.out.println("set .....");
        this.bookDao = bookDao;
    }

    @Override
    public void save() {
        System.out.println("book service save ...");
        bookDao.save();
    }

    @Override
    public void destroy() throws Exception {
        System.out.println("service destroy");
    }

    /**当属性运行完后才会运行此方法，通过setBookDao的输出set的先后就可以了解*/
    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("service init");
    }
}
```

xml配置：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

    <!--init-method：设置bean初始化生命周期回调函数（设置初始化方法）-->
    <!--destroy-method：设置bean销毁生命周期回调函数，仅适用于单例对象（设置销毁方法）-->
    <bean id="bookDao" class="com.hewen.dao.impl.BookDaoImpl" init-method="init" destroy-method="destroy"/>

    <bean id="bookService" class="com.hewen.service.impl.BookServiceImpl">
        <property name="bookDao" ref="bookDao"/>
    </bean>

</beans>
```

## 2.运行结果：

![](https://images.xcnv.com/2022/11/02/63614c5c36104.png)

## 3.模式说明：

此方法直接重写了InitializingBean, DisposableBean接口中的destroy()和afterPropertiesSet()
方法，即可不用进行xml的配置。注意观察afterPropertiesSet方法，属性设置之后，意味着当属性运行完后才会运行此方法，通过setBookDao的输出set的先后就可以了解，观察运行结果set…先于service
init….运行。

# 总结

个人对普通创建对象和Ioc容器创建对象的关联理解：

![](https://images.xcnv.com/2022/11/02/63614c68611ed.png)

- 创建对象------->new 在做的事
- 执行构造方法------->xxxx()
