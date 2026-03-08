---
title: "Java多线程创建方式"
description: "定义一个子类sx继承线程类java.lang.Thread，重写run()方法 创建sx类的对象 调用线程对象的start()方法启动线程（启动后还是执行run方法的）"
pubDatetime: 2022-12-27T06:56:00Z
tags: 
  - java
draft: false
---

# 方式一：继承Thread类

定义一个子类sx继承线程类java.lang.Thread，重写run()方法 创建sx类的对象 调用线程对象的start()方法启动线程（启动后还是执行run方法的）

``` java
package create_Thread;

/**
 方式一：
 定义一个子类MyThread继承线程类java.lang.Thread，重写run()方法
 创建sx类的对象
 调用线程对象的start()方法启动线程（启动后还是执行run方法的）

  主线程任务应该放在子线程之后，不然优先执行主线程
 */
public class create_Thread1 {
    public static void main(String[] args) {

        //2.创建sx类的对象
        Thread sc = new sx1();
        //3.调用线程对象的start()方法启动线程
        sc.start();

        for (int i=0;i<10;i++){
            System.out.println("父类线程"+i);
        }
    }
}

//1.定义一个类继承线程类（Thread）
class sx1 extends Thread{

    //重写run方法，决定以后要干什么
    @Override
    public void run() {
        for(int i=0;i<10;i++){
            System.out.println("子类线程"+i);
        }
    }
}
```

ps.主线程任务应该放在子线程之后，不然优先执行主线程.

# 方式二：实现Runnable接口

定义一个线程任务类MyRunnable实现Runnable接口，重写run()方法 创建MyRunnable任务对象 把MyRunnable任务对象交给Thread处理。
调用线程对象的start()方法启动线程

```java
package create_Thread;

/**
 方式二：
 定义一个线程任务类MyRunnable实现Runnable接口，重写run()方法
 创建MyRunnable任务对象
 把MyRunnable任务对象交给Thread处理。
 调用线程对象的start()方法启动线程

 */
public class create_Thread2 {
    public static void main(String[] args) {
        //2.创建一个任务对象
        Runnable sx = new sx2();
        //3.把任务对象交给线程处理
        Thread jn = new Thread(sx);
        //4.启动线程
        jn.start();

        //主线程
        for (int i = 0; i < 5; i++) {
            System.out.println("主线程"+i);
        }
    }
}

//1.定义一个线程任务类sx2实现Runnable接口，重写run()方法
class sx2 implements Runnable{
    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println("子线程"+i);
        }
    }
}
```

# 方式三：实现Callable接口

利用Callable、FutureTask接口实现。 

1.得到任务对象 定义类实现Callable接口，重写call方法，封装要做的事情。 创建Callable任务对象用FutureTask把Callable对象封装成线程任务对象。 

2.把线程任务对象交给Thread处理。 

3.调用Thread的start方法启动线程，执行任务。

4.线程执行完毕后、通过FutureTask的get方法去获取任务执行的结果。

```java
package create_Thread;

import java.util.concurrent.Callable;
import java.util.concurrent.FutureTask;

/**
 利用Callable、FutureTask接口实现。
 1.得到任务对象
   定义类实现Callable接口，重写call方法，封装要做的事情。
   创建Callable任务对象
   用FutureTask把Callable对象封装成线程任务对象。
 2.把线程任务对象交给Thread处理。
 3.调用Thread的start方法启动线程，执行任务
 4.线程执行完毕后、通过FutureTask的get方法去获取任务执行的结果。

相比前两个方法可以执行返回结果
 */
public class create_Thread3 {
    public static void main(String[] args) {

        //1.2创建Callable任务对象
        Callable<String> gt = new getSun(10);
        //1.3用FutureTask把Callable对象封装成线程任务对象。
        //  FutureTask对象的作用1： 是Runnable的对象（实现了Runnable接口），可以交给Thread
        //  FutureTask对象的作用2： 可以在线程执行完毕之后通过调用其get方法得到线程执行完成的结果
        FutureTask<String> sc = new FutureTask<>(gt);
        //2.把线程任务对象交给Thread处理。
        Thread sl = new Thread(sc);
        //3.调用Thread的start方法启动线程，执行任务
        sl.start();
        //4.线程执行完毕后、通过FutureTask的get方法去获取任务执行的结果。
        try {
            String result = sc.get();
            System.out.println(result);
        } catch (Exception e) {
            e.printStackTrace();
        }

    }
}

//1.1定义类实现Callable接口，重写call方法，封装要做的事情。<>里面线程任务结束后要返回的泛型
class getSun implements Callable<String>{
    //功能实现：求1-n的和
    //传入n
    private int n;
    public getSun(int n) {
        this.n = n;
    }

    @Override
    public String call() throws Exception {
        //求和
        int sum=0;
        for (int i = 0; i < n; i++) {
            sum+=i;
        }
        return "结果为"+sum;
    }
}
```
