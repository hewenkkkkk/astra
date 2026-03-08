---
title: "设计模式--策略模式"
description: "前言 需求： 一天，产品经理走过来对你说。猫啊（自称），帮我设计一个计算器，需要的功能有求最大值，最小值。应不难的吧ㄟ( ▔, ▔ )ㄏ 本文主要说明设计模式，具体算法实现不在涉及 一、未使用设计模式 小小经理，可笑可笑😏，看我一顿操作！"
pubDatetime: 2022-12-27T13:37:11Z
tags:
  - 设计模式
draft: false
---

# 前言

需求： 一天，产品经理走过来对你说。猫啊（自称），帮我设计一个计算器，需要的功能有求最大值，最小值。应不难的吧ㄟ( ▔, ▔ )ㄏ
本文主要说明设计模式，具体算法实现不在涉及

# 一、未使用设计模式

小小经理，可笑可笑😏，看我一顿操作！

```java
public class Calculation {
    public static void go(List<Integer> list, String type) throws Exception {
        if (type.equals("1")){
            // 最大值
            System.out.println("最大值");
        }else if (type.equals("2")){
            // 最小值
            System.out.println("最小值");
        }else {
            throw new Exception("error");
        }
    }

    public static void main(String[] args) throws Exception {
        List<Integer> list=new ArrayList<>();
        String type="6";
        go(list,type);
    }
}
```

这时，产品经理又来了，瞧我这记性，不止要实现最大最小的计算，还需要有求和，平均值，排序…….😵‍💫可能以后给还会在加如更多的算法。

此时，就可以看出上述设计出现的弊端，在代码中使用了大量的if--else，如果某天经理突然又想出来一些新的需求，就不得不对Calculation的代码进行修改，此时我们就违反了设计原则中的开闭原则，同时也会造成大量的代码在一个类中，难以阅读。我们的目标应该是允许类容易扩展，在不修改现有代码的情况下就可以增加新的行为。

开闭原则 ： 类应该对扩展开放，对修改关闭

# 二、策略模式

## 1.定义

该模式定义了一系列算法，并将每个算法封装起来，使它们可以相互替换，且算法的变化不会影响使用算法的客户。策略模式属于对象行为模式，它通过对算法进行封装，把使用算法的责任和算法的实现分割开来，并委派给不同的对象对这些算法进行管理。

## 2.结构

1、抽象策略角色（Strategy）：通常有一个接口或一个抽象类实现

2、具体策略角色（ConcreteStrategy）：包装了相关的算法和行为

3、环境角色（Context）：持有一个策略类的应用，最终供客户端调用


我们将计算方法抽象为一个策略接口

```java
public interface NumberGather {
    //调用集合方法的抽象方法
    public void calculation(List<Integer> list);
}
```

现在只需要为不同的算法建立对应的策略实现类

最小值：

```java
public class Min implements NumberGather {
    @Override
    public void calculation(List<Integer> list) {
        List<Integer> list1 = new ArrayList<Integer>();
        Integer min = Collections.min(list1);
        System.out.println("最小值为"+min);
    }
}
```

最大值：

```java
public class Max implements NumberGather{
    @Override
    public void calculation(List<Integer> list) {
        List<Integer> list1 = new ArrayList<Integer>();
        Integer max = Collections.max(list1);
        System.out.println("最大值为"+max);
    }
}
```

平均值：

```java
public class Average implements NumberGather {
    @Override
    public void calculation(List<Integer> list) {
        List<Integer> list1 = new ArrayList<Integer>();
        double sum =list1.stream().mapToDouble(Integer::doubleValue).sum();
        int size = list1.size();
        double avg = sum/size;
        System.out.println("平均值为"+avg);
    }
}
```

环境类：

```java
public class Context {
    private NumberGather numberGather;
    public Context(NumberGather numberGather){
        this.numberGather=numberGather;
    }
    public void go(List<Integer> list){
        numberGather.calculation(list);
    }
}
```

test：

```java
public class Demo {
    public static void main(String[] args) {
        List<Integer> list1 = new ArrayList<Integer>();
        list1.add(8);
        list1.add(7);
        list1.add(16);
        list1.add(12);
        list1.add(3);
        Context context=new Context(new Max());
        context.go(list1);

        Context context1=new Context(new Average());
        context1.go(list1);
    }
}
```

# 三、应用场景

1、 多个类只区别在表现行为不同，可以使用Strategy模式，在运行时动态选择具体要执行的行为。 2、 需要在不同情况下使用不同的策略(
算法)，或者策略还可能在未来用其它方式来实现。 3、 对客户隐藏具体策略(算法)的实现细节，彼此完全独立。

# 四、优缺点

## 优

- 策略类之间可以自由切换。由于策略类都实现同一个接口，所以使它们之间可以自由切换。 易于扩展。
- 增加一个新的策略只需要添加一个具体的策略类即可，基本不需要改变原有的代码。符合开闭原则
- 避免使用多重条件选择语句，充分体现面向对象设计思想。

## 缺

- 客户端必须知道所有的策略类，并自行决定使用哪一个策略类。这点可以考虑使用IOC容器和依赖注入的方式来解决
- 策略模式会造成很多的策略类，可能造成类爆炸。

# 参考资料

[百度](https://baike.baidu.com/item/%E7%AD%96%E7%95%A5%E6%A8%A1%E5%BC%8F/646307)

[https://juejin.cn/post/7006126086715113480](https://juejin.cn/post/7006126086715113480)
