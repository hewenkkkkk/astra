---
title: "JMM内存模型"
description: "八大原子操作 public volatile Boolean isFlag = false; 上面的代码中，当我们在两个线程同时操作isFlag这个字段如果不加上volatile关键字就会出现数据不一致之问题。而volatile局势使用的缓"
pubDatetime: 2024-10-26T16:05:45Z
tags: 
   - jmm
draft: false
---

# 八大原子操作

```java
public volatile Boolean isFlag = false;
```

上面的代码中，当我们在两个线程同时操作isFlag这个字段如果不加上volatile关键字就会出现数据不一致之问题。而volatile局势使用的缓存一致性协议来保证数据的同步。

- Lock(锁定)：将变量标识为一条线程独占的状态。这时其他线程不能修改该变量，只有持有锁的线程可以执行相关的操作。
    - unLock(解锁)：将变量从锁定状态中释放，使其他线程可以访问该变量。必须是在同一线程上执行了lock操作后，才能执行unlock。
    - read(读取)：从主存中读取变量的值到线程的工作内存中，这一操作保证了线程获得最新的变量值。
    - Load(加载)：从工作内存中的变量副本读取值，放入线程的局部变量或寄存器中。read操作将值从主存读取到工作内存，而load则是在工作内存内的进一步操作。
    - use(使用)：从工作内存中获取变量的值并在执行引擎中使用（例如进行加法运算）。每次使用变量时，都必须先执行load操作。
    - assign(赋值)：将计算得到的值赋给工作内存中的变量。当线程执行一些运算操作后，将结果赋值给局部变量。
    - store(存储)：将工作内存中的变量值复制到主存中，准备将修改结果同步到主存。
    - write(写入)：将工作内存中准备好的变量值写入主存。store操作是将值从工作内存复制到主存，而write则是实际写入主存的操作。

![](https://pic.lamper.top/wp/2024/10/image.png)

当某一个CPU修改了工作内存中的数据后会通过store写入缓存，然后通过write马上同步回主内存。这个时候总线嗅探机制就会监听总线里面的数据感知到数据的变化从而使自己CPU的数据失效，当CPU要使用数据后发现失效数据就会转而从主内存中获取最新的数据。

## volatile 缓存一致性实现原理

```java
0x000000003157e14: mov    r10, 76b740f8h   ; {oop(a 'java/lang/Class' = 'com/tuling/concurrent/VolatileVisibilityTest')}
0x000000003157e1e: mov    byte ptr [r10+68h], 1h
0x000000003157e25: lock   add dword ptr [rsp], 0h  ; *putstatic initFlag
                                                 ; - com.tuling.concurrent.VolatileVisibilityTest::prepareData@9 (line 29)
```

volatile主要通过汇编命令lock指令来锁定数据。执行的操作如下： 1.会将当前处理器缓存行的数据立刻写回到主存中
2.写回主存的操作会使其它CPU里面缓存的该内存地址的数据无效 3.提供内存屏障，使lock前后指令不能重排

# 指令重排序和内存屏障

## 指令重排

并发编程的三大特性：可见性、有序性、原子性 volatile可以保证有序性和可见性，但是不能保证原子性，如果要保证原子性需要借助于synchronized这样的锁机制。

指令重排序：在不影响单线程程序执行结果的前提下，计算机为了最大限度的发挥机器性能，会对机器指令重排序优化（重排序遵循as-if-serial和happens-before原则）

- as-if-serial就是不管怎么重排序，(单线程)程序的执行结果不能被改变，编译器和处理器不会对存在数据依赖关系的操作做重排序。
- happens-before有多个需要遵循的原则，对于其中的一个锁规则就是解锁操作必然发生在后续的同一个锁的加锁之前，也就是说，如果对于一个锁解锁后，再加锁，那么加锁的动作必须再解锁动作之后(
    对于同一个锁来说)

双重检测锁代码

```java
public class DoubleCheckLockSingleton {

    private static volatile DoubleCheckLockSingleton instance;

    private DoubleCheckLockSingleton() {}

    public static DoubleCheckLockSingleton getInstance() {
        if (instance == null) {
           /*
            * 10 monitorenter
            * 11 getstatic #2 <com/tuling/concurrent/DoubleCheckLockSingleton.instance>
            * 14 ifnonnull 27 (+13)
            * 17 new #3 <com/tuling/concurrent/DoubleCheckLockSingleton>
            * 20 dup
            * 21 invokespecial #4 <com/tuling/concurrent/DoubleCheckLockSingleton.<init>>
            * 24 putstatic #2 <com/tuling/concurrent/DoubleCheckLockSingleton.instance>
            * 28 monitorexit
            */
          synchronized (DoubleCheckLockSingleton.class) {
              if (instance == null) {
                  instance = new DoubleCheckLockSingleton();
              }
          }
      }
       return instance;
  }
}
```

上面的代码是典型的单例创建对象的写法，在阿里的开发手册中强烈建议加上volatile关键字，这是为什么呢？
可以看到代码中的21和24分别是<init>初始化和instance赋值给静态变量，但是在JVM编译的过程中是会对这两行的顺序进行重排序的，导致先执行赋值后执行初始化。这就会带来一个对象半初始化问题。

半初始化问题： 线程 A 执行 getInstance()，发现 instance == null，进入同步块，准备创建实例。 线程 A 在重排序的情况下，先执行
putstatic，将一个未初始化的对象赋值给 instance。 线程 B 调用 getInstance()，发现 instance 不再是 null，因此直接返回了这个未初始化的对象。
线程 B 获取到了一个尚未完成构造的对象，可能导致 NullPointerException 或其他逻辑错误。

解决方案就是加上volatile关键字，制造了一个内存屏障来禁止指令重排序。

## 内存屏障

LoadLoad Barrier：确保读取操作Load2不能重排到Load1之前，确保在读取Load2之前处理Invalidate Queue。

StoreStore Barrier：确保Store1及其之后的写入操作先于Store2完成，保证其他CPU先看到Store1的数据，再看到Store2的数据。这可以通过Store
Buffer的刷写或排序实现。

LoadStore Barrier：确保Load1读取的数据在Store2写出的数据被其他CPU看到之前，已先读入缓存。这种Barrier的使用场景与具体的Cache架构有关，可能涉及CPU在写入Store2时的重排策略。

StoreLoad Barrier：确保Store1写出的数据在其他CPU看到后才能读取Load2。如果Store1和Load2操作同一地址，则必须从内存中拉取被修改的值，而不是从Store
Buffer中读取。StoreLoad通常被视为最强的Barrier，能够实现其他所有Barrier的功能。

当我们深入volatile的代码中我们就会发现它实现内存屏障是cpp代码实现的，首先提供if (cache->is_volatile())
来判断是否添加了关键字，之后再使用OrderAccess::storeload();添加了内存屏障。

```java
int field_offset = cache->f2_as_index();
if (cache->is_volatile()) {
    if (tos_type == itos) {
        obj->release_int_field_put(field_offset, STACK_INT(-1));
    } else if (tos_type == atos) {
        VERIFY_OOP(STACK_OBJECT(-1));
        obj->release_obj_field_put(field_offset, STACK_OBJECT(-1));
        OrderAccess::release_store(&BYTE_MAP_BASE[(uintptr_t)obj >> CardTableModRefBS::card_shift], 0);
    } else if (tos_type == btos) {
        obj->release_byte_field_put(field_offset, STACK_INT(-1));
    } else if (tos_type == ltos) {
        obj->release_long_field_put(field_offset, STACK_LONG(-1));
    } else if (tos_type == ctos) {
        obj->release_char_field_put(field_offset, STACK_INT(-1));
    } else if (tos_type == stos) {
        obj->release_short_field_put(field_offset, STACK_INT(-1));
    } else if (tos_type == ftos) {
        obj->release_float_field_put(field_offset, STACK_FLOAT(-1));
    } else {
        obj->release_double_field_put(field_offset, STACK_DOUBLE(-1));
    }
    OrderAccess::storeload();
} else {
    if (tos_type == itos) {
        obj->int_field_put(field_offset, STACK_INT(-1));
    } else if (tos_type == atos) {
        VERIFY_OOP(STACK_OBJECT(-1));
    }
}
```

而在具体的屏障方法中我们又见到了熟悉的身影lock指令，正如上面写道lock除了能解决缓存可见性还可以实现内存屏障功能。

```java
inline void OrderAccess::loadstore() { acquire(); }
inline void OrderAccess::storeload() { fence(); }

inline void OrderAccess::acquire() {
    volatile intptr_t local_dummy;
#ifdef AMD64
#else
    __asm__ volatile ("movl 0(%%esp), %0" : (local_dummy) : : "memory");
#endif // AMD64
}

inline void OrderAccess::release() {
    // Avoid hitting the same cache-line from
    // different threads.
    volatile jint local_dummy = 0;
}

inline void OrderAccess::fence() {
    if (os::is_MP()) {
        // always use locked addl since mfence is sometimes expensive
#ifdef AMD64
        __asm__ volatile ("lock; addl $0,0(%%rsp)" : : : "cc", "memory");
#else
        __asm__ volatile ("lock; addl $0,0(%%esp)" : : : "cc", "memory");
#endif
    }
}
```
