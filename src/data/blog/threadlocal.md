---
title: "ThreadLocal"
description: "前言： 再写博客时，遇到了如何处理保存用户的信息时出现混乱的问题（线程安全问题），在一番查找后，寻到了ThreadLocal用来保存登录的用户的信息的方法。 一、ThreadLocal是什么 在讲ThreadLocal前，先来看一下什么是线"
pubDatetime: 2022-12-27T06:43:28Z
tags:
  - java
draft: false
---

前言： 再写博客时，遇到了如何处理保存用户的信息时出现混乱的问题（线程安全问题），在一番查找后，寻到了ThreadLocal用来保存登录的用户的信息的方法。

# 一、ThreadLocal是什么

在讲ThreadLocal前，先来看一下什么是线程封闭

封闭对应的是开放，所谓线程开放就是类似共享数据、共享变量这些概念。
多线程访问共享可变数据时，涉及到线程间数据同步问题。并不是所有时候，都要用到共享数据，所以线程封闭的概念就提出来了。

当访问共享的可变数据时，通常需要使用同步。一种避免使用同步的方式就是不共享数据。如果仅在单线程内访问数据，就不需要同步。这种技术被称为线程封闭。它是实现线程安全最简单的方式之一。当某个对象封闭在一个线程中时，这种用法将自动实现线程安全性。即使被封闭的对象本身不是线程安全的。

那么,要如何维持线程封闭呢,这时我们就可以使用ThreadLocal来使线程中的某个值与保存值的对象关联起来。

ThreadLocal说简单点就是往一个线程存数据，这个数据只能由这个线程获取，其他线程无法获取这个数据
ThreadLocal就是用空间换时间，Synchronized就是时间换空间

此图对于理解ThreadLocal十分重要

# 二、ThreadLocal作用

```java
public class th {
    private String content;

    private String getContent() {
        return content;
    }

    private void setContent(String content) {
        this.content = content;
    }

    public static void main(String[] args) {
        th demo = new th();
        for (int i = 0; i < 5; i++) {
            Thread thread = new Thread(new Runnable() {
                @Override
                public void run() {
                    demo.setContent(Thread.currentThread().getName() + "的数据");
                    System.out.println("-----------------------");
                    System.out.println(Thread.currentThread().getName() + "--->" + demo.getContent());
                }
            });
            thread.setName("线程" + i);
            thread.start();
        }
    }
}
```


在实际运行后,便出现了如上的结果,线程之间不隔离,每个线程获取的数据出现了错误,使用ThreadLocal,便可以很好的解决此问题。

ThreadLocal作用便是提供线程内的局部变量，不同的线程之间不会相互干扰，这种变量在线程的生命周期内起作用，减少同一个线程内多个函数或组件之间一些公共变量传递的复杂度。

- 线程并发: 在多线程并发的场景下
- 传递数据: 我们可以通过ThreadLocal在同一线程，不同组件中传递公共变量
- 线程隔离: 每个线程的变量都是独立的，不会互相影响

# 三、ThreadLocal的设计结构


每个Thread维护一个ThreadLocalMap，这个Map的key是ThreadLocal实例本身，value才是真正要存储的值Object

每个Thread线程都有一个ThreadLocalMap(Map结构,但是不是直接使用的Map) ThreadLocalMap中储存了key(ThreadLocalMap对象)
和value(Object) ThreadLocalMap由ThreadLocal维护,意思就是由ThreadLocal负责获取和设置 每一个线程互不干扰,形成隔离

好处:

- 每个Map存储的Entry数量就会变少。因为之前的存储数量由Thread的数量决定，现在是由ThreadLocal的数量决定。在实际运用当中，往往ThreadLocal的数量要少于Thread的数量。
- 当Thread销毁之后，对应的ThreadLocalMap也会随之销毁，能减少内存的使用。

# 四、ThreadLocal核心方法

静下心来看源码

## 1. set方法

```java
public void set(T value) {
        Thread t = Thread.currentThread();  //获取当前线程对象
        ThreadLocalMap map = getMap(t);  //获取此线程对象中维护的ThreadLocalMap对象
        if (map != null) {
            map.set(this, value);
        } else {
            createMap(t, value);
        }
    }

    ThreadLocalMap getMap(Thread t) {
        return t.threadLocals;
    }

    void createMap(Thread t, T firstValue) {
         //  this是调用此方法的threadLocal
        t.threadLocals = new ThreadLocalMap(this, firstValue);
    }
```

## 2. get方法

```java
public T get() {
        Thread t = Thread.currentThread();
        ThreadLocalMap map = getMap(t);
        if (map != null) {
            // 以当前的ThreadLocal 为 key，调用getEntry获取对应的存储实体e
            ThreadLocalMap.Entry e = map.getEntry(this);
            if (e != null) {
                @SuppressWarnings("unchecked")
                T result = (T)e.value;   // 取值
                return result;
            }
        }
        return setInitialValue();   // 设置初始化值
    }
    private T setInitialValue() {
        T value = initialValue(); // 获取初始化值 初为null,可重写
        Thread t = Thread.currentThread();
        ThreadLocalMap map = getMap(t); // 获取此线程对象中维护的ThreadLocalMap对象
        if (map != null) {
            map.set(this, value);
        } else {
            createMap(t, value);
        }
        if (this instanceof TerminatingThreadLocal) {
            TerminatingThreadLocal.register((TerminatingThreadLocal<?>) this);
        }
        return value;
    }

    private Entry getEntry(ThreadLocal<?> key) {
         int i = key.threadLocalHashCode & (table.length - 1);
         Entry e = table[i];
         if (e != null && e.get() == key)
                return e;
            else
                return getEntryAfterMiss(key, i, e);
        }

     protected T initialValue() {
           return null;
        }
```

## 3. remove方法

```java
public void remove() {
         ThreadLocalMap m = getMap(Thread.currentThread());
         if (m != null) {
             m.remove(this);
         }
     }
```

# 五、ThreadLocal内存泄漏

强引用:
只要强引用存在，垃圾回收器将永远不会回收被引用的对象，哪怕内存不足时，JVM也会直接抛出OutOfMemoryError，不会去回收。如果想中断强引用与对象之间的联系，可以显示的将强引用赋值为null，这样一来，JVM就可以适时的回收对象了.
软引用:在内存足够的时候，软引用对象不会被回收，只有在内存不足时，系统则会回收软引用对象，如果回收了软引用对象之后仍然没有足够的内存，才会抛出内存溢出异常。
弱引用:无论内存是否足够，只要 JVM 开始进行垃圾回收，那些被弱引用关联的对象都会被回收。
虚引用:如果一个对象仅持有虚引用，那么它就和没有任何引用一样，它随时可能会被回收。
内存泄漏：指程序中已动态分配的堆内存由于某种原因程序未释放或无法释放，造成系统内存的浪费，导致程序运行速度减慢甚至系统崩溃等严重后果。

一个线程属于强引用，对于一整个生命周期
当key为强引用时，key和value会一直存在，Entry不会被回收，从而导致内存泄漏
当key为弱引用时，在线程的生命周期中进行了一次垃圾回收，此时key作为弱引用被干掉了，但是整个线程还是存在，此时在Map中只有value，便会永远存在于内存中，当有大量的此行为时，便可能会造成内存泄漏

我们得知两个引用都有风险，但是为什么选择了弱引用呢？
我们是通过ThreadLocal来对ThreadLocalMap进行操作的，假设使用ThreadLocal的对象被设置为null了，那ThreadLocalMap的强引用指向ThreadLocal也毫无意义。弱引用反而可以预防大多数内存泄漏的情况，毕竟被回收后，下一次调用set/get/remove时ThreadLocal内部会清除掉

# 六、使用场景

1.用于保存线程不安全的工具类，如SimpleDateFormat 2.每个线程需要独立保存信息，如个人博客中保存的用户信息

# 七、参考资料

[https://www.zhihu.com/question/399087116/answer/2763547159](https://www.zhihu.com/question/399087116/answer/2763547159) 

[https://www.bilibili.com/video/BV1QS4y1s7hi](https://www.bilibili.com/video/BV1QS4y1s7hi/?spm_id_from=333.337.search-card.all.click&vd_source=c20f4b23e174f6798039a2df37244c01) 

[https://blog.csdn.net/LemonSnm/article/details/122251312](https://blog.csdn.net/LemonSnm/article/details/122251312) 

[https://www.cnblogs.com/liyutian/p/9690974.html](https://www.cnblogs.com/liyutian/p/9690974.html)
